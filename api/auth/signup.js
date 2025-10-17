// API Route: /api/auth/signup
import { createServerSupabaseClient } from '../../lib/supabase'
import { rateLimit } from '../../lib/rate-limit'

// Rate limiting: 5 signups per hour per IP
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500, // Max 500 unique IPs per hour
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Rate limiting
    await limiter.check(res, 5, req.ip) // 5 requests per hour per IP
  } catch {
    return res.status(429).json({ error: 'Rate limit exceeded' })
  }

  const { email, password, name, newsletter_opt_in = false } = req.body

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  const supabase = createServerSupabaseClient(req, res)

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          newsletter_opt_in
        }
      }
    })

    if (authError) {
      console.error('Signup error:', authError)
      return res.status(400).json({ error: authError.message })
    }

    // Update profile with additional data
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: name || email.split('@')[0],
          newsletter_opt_in,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
      }

      // Log signup
      console.log(`New user signup: ${email}`)
    }

    res.status(200).json({
      message: 'User created successfully',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        email_confirmed: authData.user?.email_confirmed_at ? true : false
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
