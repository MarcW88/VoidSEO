// API Route: /api/admin/users
// Admin-only user management endpoint
import { createServerSupabaseClient, adminHelpers } from '../../lib/supabase'

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient(req, res)

  try {
    // Verify authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    switch (req.method) {
      case 'GET':
        return await handleGetUsers(req, res, supabase)
      case 'PUT':
        return await handleUpdateUser(req, res, supabase, session.user.id)
      case 'DELETE':
        return await handleDeleteUser(req, res, supabase, session.user.id)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Admin users API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetUsers(req, res, supabase) {
  const { 
    page = 1, 
    limit = 50, 
    search = '', 
    role = 'all',
    sort = 'created_at',
    order = 'desc'
  } = req.query

  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply role filter
    if (role !== 'all') {
      query = query.eq('role', role)
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' })

    // Apply pagination
    const from = (parseInt(page) - 1) * parseInt(limit)
    const to = from + parseInt(limit) - 1
    query = query.range(from, to)

    const { data: users, error, count } = await query

    if (error) {
      console.error('Get users error:', error)
      return res.status(500).json({ error: 'Failed to fetch users' })
    }

    // Get summary stats
    const { data: stats, error: statsError } = await supabase
      .from('admin_stats')
      .select('*')
      .single()

    res.status(200).json({
      success: true,
      users: users || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / parseInt(limit))
      },
      stats: stats || {},
      filters: { search, role, sort, order }
    })

  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

async function handleUpdateUser(req, res, supabase, adminId) {
  const { userId, updates } = req.body

  if (!userId || !updates) {
    return res.status(400).json({ error: 'User ID and updates are required' })
  }

  // Validate allowed updates
  const allowedUpdates = ['role', 'is_approved', 'newsletter_opt_in']
  const filteredUpdates = {}
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = value
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    return res.status(400).json({ error: 'No valid updates provided' })
  }

  try {
    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({
        ...filteredUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Update user error:', updateError)
      return res.status(500).json({ error: 'Failed to update user' })
    }

    // Log admin action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminId,
        action: 'user_update',
        target_user_id: userId,
        details: filteredUpdates,
        ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress
      })

    if (logError) {
      console.error('Admin log error:', logError)
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
}

async function handleDeleteUser(req, res, supabase, adminId) {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  // Prevent admin from deleting themselves
  if (userId === adminId) {
    return res.status(400).json({ error: 'Cannot delete your own account' })
  }

  try {
    // Get user info before deletion for logging
    const { data: userToDelete } = await supabase
      .from('profiles')
      .select('email, role')
      .eq('id', userId)
      .single()

    // Delete user (this will cascade to profiles table)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Delete user error:', deleteError)
      return res.status(500).json({ error: 'Failed to delete user' })
    }

    // Log admin action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminId,
        action: 'user_delete',
        target_user_id: userId,
        details: { 
          deleted_user_email: userToDelete?.email,
          deleted_user_role: userToDelete?.role
        },
        ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress
      })

    if (logError) {
      console.error('Admin log error:', logError)
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
}
