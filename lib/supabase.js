// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Server-side Supabase client (for API routes)
export const createServerSupabaseClient = (req, res) => {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${req?.headers?.authorization?.replace('Bearer ', '') || ''}`
        }
      }
    }
  )
}

// Auth helpers
export const authHelpers = {
  // Sign up new user
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  // Sign in user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Get current user profile
  async getProfile() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { profile: null, error: 'No session' }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    return { profile, error }
  },

  // Update user profile
  async updateProfile(updates) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { error: 'No session' }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', session.user.id)
      .select()
      .single()

    return { data, error }
  },

  // Check if user has role
  async hasRole(requiredRole) {
    const { profile, error } = await this.getProfile()
    if (error || !profile) return false
    
    const roleHierarchy = { 'free': 1, 'builder': 2, 'admin': 3 }
    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole]
  },

  // Update last login
  async updateLastLogin() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await supabase
      .from('profiles')
      .update({ last_login: new Date() })
      .eq('id', session.user.id)
  }
}

// Rate limiting helpers
export const rateLimitHelpers = {
  // Check API usage for user
  async checkUsage(endpoint, limit = 30, timeWindow = 24) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { allowed: false, error: 'No session' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Admins and builders have unlimited usage
    if (profile?.role === 'admin' || profile?.role === 'builder') {
      return { allowed: true, remaining: 999 }
    }

    // Check usage for free tier
    const { count, error } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .eq('endpoint', endpoint)
      .gte('created_at', new Date(Date.now() - timeWindow * 60 * 60 * 1000).toISOString())

    if (error) return { allowed: false, error }

    const remaining = Math.max(0, limit - (count || 0))
    return { 
      allowed: remaining > 0, 
      remaining,
      used: count || 0,
      limit 
    }
  },

  // Log API usage
  async logUsage(endpoint, metadata = {}) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase
      .from('api_usage')
      .insert({
        user_id: session.user.id,
        endpoint,
        metadata
      })

    return { error }
  }
}

// Admin helpers
export const adminHelpers = {
  // Get all users (admin only)
  async getAllUsers(page = 1, limit = 50) {
    const { data: users, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    return { users, error, count }
  },

  // Get admin stats
  async getStats() {
    const { data: stats, error } = await supabase
      .from('admin_stats')
      .select('*')
      .single()

    return { stats, error }
  },

  // Update user role (admin only)
  async updateUserRole(userId, newRole) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date() })
      .eq('id', userId)
      .select()
      .single()

    // Log admin action
    if (!error) {
      await this.logAdminAction('role_change', userId, { new_role: newRole })
    }

    return { data, error }
  },

  // Log admin action
  async logAdminAction(action, targetUserId = null, details = {}) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: session.user.id,
        action,
        target_user_id: targetUserId,
        details
      })

    return { error }
  }
}

export default supabase
