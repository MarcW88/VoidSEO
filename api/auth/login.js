// API Route: /api/auth/login
import { createServerSupabaseClient } from '../../lib/supabase'
import { rateLimit } from '../../lib/rate-limit'

// Rate limiting: 10 login attempts per 15 minutes per IP
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await limiter.check(res, 10, req.ip) // 10 requests per 15 minutes per IP
  } catch {
    return res.status(429).json({ error: 'Too many login attempts. Please try again later.' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const supabase = createServerSupabaseClient(req, res)

  try {
    // Attempt login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    })

    if (authError) {
      console.error('Login error:', authError)
      
      // Generic error message to prevent user enumeration
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (!authData.user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Update last login timestamp
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)

    if (updateError) {
      console.error('Last login update error:', updateError)
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    // Check if user is approved (if manual approval is enabled)
    if (profile && !profile.is_approved) {
      return res.status(403).json({ 
        error: 'Account pending approval. Please contact support.' 
      })
    }

    console.log(`User login: ${email}`)

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: profile?.role || 'free',
        name: profile?.name,
        newsletter_opt_in: profile?.newsletter_opt_in
      },
      session: authData.session
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
