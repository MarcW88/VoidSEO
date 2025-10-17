// API Route: /api/protected/download/[file]
// Secure file downloads with signed URLs
import { createServerSupabaseClient } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { file } = req.query
  const supabase = createServerSupabaseClient(req, res)

  try {
    // Verify authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Define file access rules
    const fileAccessRules = {
      // Free tier files
      'void-loop-guide.pdf': ['free', 'builder', 'admin'],
      'quickstart-checklist.pdf': ['free', 'builder', 'admin'],
      
      // Builder tier files
      'templates-pack.zip': ['builder', 'admin'],
      'prd-framework.pdf': ['builder', 'admin'],
      'vision-brief-template.docx': ['builder', 'admin'],
      'implementation-checklist.xlsx': ['builder', 'admin'],
      'deep-dive-template.md': ['builder', 'admin'],
      
      // Admin files
      'admin-guide.pdf': ['admin'],
      'user-data-export.csv': ['admin']
    }

    // Check if file exists in our rules
    if (!fileAccessRules[file]) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Check if user has access to this file
    const allowedRoles = fileAccessRules[file]
    if (!allowedRoles.includes(profile.role)) {
      return res.status(403).json({ 
        error: 'Upgrade required',
        required_tier: allowedRoles.includes('builder') ? 'builder' : 'admin',
        current_tier: profile.role
      })
    }

    // Generate signed URL (valid for 10 minutes)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('downloads')
      .createSignedUrl(file, 600) // 10 minutes

    if (urlError) {
      console.error('Signed URL error:', urlError)
      
      // If file doesn't exist in storage, return appropriate error
      if (urlError.message?.includes('not found')) {
        return res.status(404).json({ error: 'File not found' })
      }
      
      return res.status(500).json({ error: 'Unable to generate download link' })
    }

    // Log the download
    const { error: logError } = await supabase
      .from('download_logs')
      .insert({
        user_id: session.user.id,
        file_name: file,
        file_type: file.split('.').pop(),
        ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent']
      })

    if (logError) {
      console.error('Download log error:', logError)
    }

    // Return signed URL for client-side redirect
    res.status(200).json({
      success: true,
      download_url: signedUrlData.signedUrl,
      file_name: file,
      expires_in: 600, // 10 minutes
      message: 'Download link generated successfully'
    })

  } catch (error) {
    console.error('Download API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Alternative: Direct redirect approach
export async function handleDirectDownload(req, res) {
  // ... same auth and permission checks ...
  
  // Instead of returning JSON, redirect directly
  if (signedUrlData?.signedUrl) {
    res.redirect(302, signedUrlData.signedUrl)
  } else {
    res.status(404).json({ error: 'File not found' })
  }
}
