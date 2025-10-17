// API Route: /api/admin/stats
// Admin dashboard statistics
import { createServerSupabaseClient } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = createServerSupabaseClient(req, res)

  try {
    // Verify authentication and admin role
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    // Get comprehensive stats
    const stats = await Promise.all([
      // Basic user stats
      supabase.from('admin_stats').select('*').single(),
      
      // Recent signups (last 7 days)
      supabase
        .from('profiles')
        .select('created_at, role')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false }),
      
      // API usage stats
      supabase
        .from('api_usage')
        .select('endpoint, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Download stats
      supabase
        .from('download_logs')
        .select('file_name, downloaded_at, user_id')
        .gte('downloaded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Recent admin actions
      supabase
        .from('admin_logs')
        .select('action, created_at, details')
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    const [
      { data: basicStats, error: basicStatsError },
      { data: recentSignups, error: signupsError },
      { data: apiUsage, error: apiError },
      { data: downloads, error: downloadsError },
      { data: adminLogs, error: logsError }
    ] = stats

    if (basicStatsError || signupsError || apiError || downloadsError || logsError) {
      console.error('Stats query errors:', { basicStatsError, signupsError, apiError, downloadsError, logsError })
    }

    // Process signup trends (daily for last 7 days)
    const signupTrends = {}
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      return date.toISOString().split('T')[0]
    }).reverse()

    last7Days.forEach(date => {
      signupTrends[date] = 0
    })

    recentSignups?.forEach(signup => {
      const date = signup.created_at.split('T')[0]
      if (signupTrends[date] !== undefined) {
        signupTrends[date]++
      }
    })

    // Process API usage by endpoint
    const apiUsageByEndpoint = {}
    apiUsage?.forEach(usage => {
      apiUsageByEndpoint[usage.endpoint] = (apiUsageByEndpoint[usage.endpoint] || 0) + 1
    })

    // Process popular downloads
    const downloadStats = {}
    downloads?.forEach(download => {
      downloadStats[download.file_name] = (downloadStats[download.file_name] || 0) + 1
    })

    // Calculate conversion funnel (mock data for now - you'd implement real tracking)
    const conversionFunnel = {
      visitors: Math.floor((basicStats?.total_users || 0) * 8.5), // Estimate
      signup_page_views: Math.floor((basicStats?.total_users || 0) * 2.1),
      signups: basicStats?.total_users || 0,
      dashboard_visits: Math.floor((basicStats?.active_users_7d || 0) * 1.2)
    }

    // Response
    res.status(200).json({
      success: true,
      stats: {
        // Basic metrics
        total_users: basicStats?.total_users || 0,
        daily_signups: basicStats?.daily_signups || 0,
        weekly_signups: basicStats?.weekly_signups || 0,
        active_users_7d: basicStats?.active_users_7d || 0,
        newsletter_subscribers: basicStats?.newsletter_subscribers || 0,
        
        // User distribution
        user_distribution: {
          free: basicStats?.free_users || 0,
          builder: basicStats?.builder_users || 0,
          admin: basicStats?.admin_users || 0
        },
        
        // Trends
        signup_trends: signupTrends,
        
        // Usage stats
        api_usage_by_endpoint: apiUsageByEndpoint,
        total_api_calls_7d: apiUsage?.length || 0,
        
        // Downloads
        popular_downloads: Object.entries(downloadStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([file, count]) => ({ file, count })),
        total_downloads_7d: downloads?.length || 0,
        
        // Conversion funnel
        conversion_funnel: conversionFunnel,
        
        // Recent activity
        recent_signups: recentSignups?.slice(0, 5) || [],
        recent_admin_actions: adminLogs || [],
        
        // Calculated metrics
        signup_conversion_rate: conversionFunnel.visitors > 0 
          ? ((conversionFunnel.signups / conversionFunnel.signup_page_views) * 100).toFixed(1)
          : 0,
        user_retention_7d: basicStats?.total_users > 0
          ? ((basicStats.active_users_7d / basicStats.total_users) * 100).toFixed(1)
          : 0,
        newsletter_opt_in_rate: basicStats?.total_users > 0
          ? ((basicStats.newsletter_subscribers / basicStats.total_users) * 100).toFixed(1)
          : 0
      },
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
}
