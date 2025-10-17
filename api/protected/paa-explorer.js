// API Route: /api/protected/paa-explorer
// Secure proxy for PAA Explorer functionality
import { createServerSupabaseClient, rateLimitHelpers } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = createServerSupabaseClient(req, res)

  try {
    // Verify authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check rate limiting for free tier users
    const { allowed, remaining, used, limit, error: rateLimitError } = 
      await rateLimitHelpers.checkUsage('paa-explorer', 30, 24)

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
      return res.status(500).json({ error: 'Internal server error' })
    }

    if (!allowed) {
      return res.status(429).json({ 
        error: 'Daily quota exceeded',
        quota: { used, limit, remaining: 0 }
      })
    }

    const { query, location = 'United States', language = 'en' } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    // Get user profile to determine access level
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // For free tier, return demo data
    if (profile?.role === 'free') {
      const demoData = {
        query,
        location,
        language,
        questions: [
          {
            question: "What is SEO automation?",
            position: 1,
            cluster: "Basics",
            related_queries: ["SEO tools", "automated SEO", "SEO software"]
          },
          {
            question: "How to automate SEO tasks?",
            position: 2,
            cluster: "Implementation",
            related_queries: ["SEO workflow", "automation tools", "SEO process"]
          },
          {
            question: "Best SEO automation tools?",
            position: 3,
            cluster: "Tools",
            related_queries: ["SEO platforms", "automation software", "SEO suite"]
          },
          {
            question: "Is SEO automation worth it?",
            position: 4,
            cluster: "Benefits",
            related_queries: ["SEO ROI", "automation benefits", "SEO efficiency"]
          }
        ],
        clusters: [
          { name: "Basics", count: 1, questions: ["What is SEO automation?"] },
          { name: "Implementation", count: 1, questions: ["How to automate SEO tasks?"] },
          { name: "Tools", count: 1, questions: ["Best SEO automation tools?"] },
          { name: "Benefits", count: 1, questions: ["Is SEO automation worth it?"] }
        ],
        metadata: {
          total_questions: 4,
          total_clusters: 4,
          processing_time: "0.5s",
          data_source: "demo",
          tier: "free"
        }
      }

      // Log usage for free tier
      await rateLimitHelpers.logUsage('paa-explorer', {
        query,
        location,
        language,
        demo_mode: true
      })

      return res.status(200).json({
        success: true,
        data: demoData,
        quota: { used: used + 1, limit, remaining: remaining - 1 },
        demo_mode: true
      })
    }

    // For builder/admin tier, make real API call
    if (profile?.role === 'builder' || profile?.role === 'admin') {
      try {
        // Make actual API call to SerpAPI or similar service
        const serpApiResponse = await fetch('https://serpapi.com/search.json', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.SERPAPI_KEY}`
          },
          body: new URLSearchParams({
            engine: 'google',
            q: query,
            location: location,
            hl: language,
            google_domain: 'google.com',
            gl: 'us',
            device: 'desktop'
          })
        })

        if (!serpApiResponse.ok) {
          throw new Error('External API error')
        }

        const serpData = await serpApiResponse.json()
        
        // Process and structure the data
        const processedData = {
          query,
          location,
          language,
          questions: serpData.related_questions?.map((q, index) => ({
            question: q.question,
            position: index + 1,
            cluster: "Auto-generated", // You'd implement clustering logic here
            related_queries: q.related_queries || []
          })) || [],
          metadata: {
            total_questions: serpData.related_questions?.length || 0,
            processing_time: "1.2s",
            data_source: "live",
            tier: profile.role
          }
        }

        // Log usage
        await rateLimitHelpers.logUsage('paa-explorer', {
          query,
          location,
          language,
          live_mode: true,
          questions_found: processedData.questions.length
        })

        return res.status(200).json({
          success: true,
          data: processedData,
          demo_mode: false
        })

      } catch (apiError) {
        console.error('External API error:', apiError)
        return res.status(503).json({ 
          error: 'External service unavailable. Please try again later.' 
        })
      }
    }

    // Fallback
    return res.status(403).json({ error: 'Access denied' })

  } catch (error) {
    console.error('PAA Explorer API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
