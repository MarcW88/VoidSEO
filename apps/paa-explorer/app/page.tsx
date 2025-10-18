'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Search, Download, TrendingUp, Users } from 'lucide-react'
import { toast } from 'sonner'

interface Question {
  text: string
  keyword: string
  cluster: string
  confidence: number
}

interface Cluster {
  label: string
  size: number
  quality: number
  questions: Question[]
}

interface JobStatus {
  job_id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  error?: string
  stats?: {
    total_questions: number
    total_clusters: number
    clustering_quality: number
  }
}

interface JobResults {
  job_id: string
  status: string
  questions: Question[]
  clusters: Cluster[]
  stats: {
    total_questions: number
    total_clusters: number
    clustering_quality: number
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function PAAExplorerApp() {
  const [mode, setMode] = useState<'demo' | 'builder'>('demo')
  const [keywords, setKeywords] = useState('seo tools, keyword research, content optimization')
  const [locale, setLocale] = useState('en-US')
  const [algorithm, setAlgorithm] = useState('kmeans')
  const [isLoading, setIsLoading] = useState(false)
  const [currentJob, setCurrentJob] = useState<JobStatus | null>(null)
  const [results, setResults] = useState<JobResults | null>(null)
  const [demoData, setDemoData] = useState<any>(null)

  // Load demo data on component mount
  useEffect(() => {
    loadDemoData()
  }, [])

  // Poll job status when job is running
  useEffect(() => {
    if (currentJob && (currentJob.status === 'queued' || currentJob.status === 'running')) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/jobs/${currentJob.job_id}`, {
            headers: {
              'Authorization': `Bearer demo-token` // Replace with real auth
            }
          })
          
          if (response.ok) {
            const status: JobStatus = await response.json()
            setCurrentJob(status)
            
            if (status.status === 'completed') {
              loadJobResults(status.job_id)
              clearInterval(interval)
            } else if (status.status === 'failed') {
              toast.error(`Job failed: ${status.error}`)
              clearInterval(interval)
            }
          }
        } catch (error) {
          console.error('Error polling job status:', error)
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [currentJob])

  const loadDemoData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/demo/data`)
      if (response.ok) {
        const data = await response.json()
        setDemoData(data)
      }
    } catch (error) {
      console.error('Error loading demo data:', error)
    }
  }

  const loadJobResults = async (jobId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/results`, {
        headers: {
          'Authorization': `Bearer demo-token` // Replace with real auth
        }
      })
      
      if (response.ok) {
        const results: JobResults = await response.json()
        setResults(results)
        setIsLoading(false)
        toast.success('Analysis completed successfully!')
      }
    } catch (error) {
      console.error('Error loading results:', error)
      toast.error('Failed to load results')
    }
  }

  const startAnalysis = async () => {
    if (mode === 'demo') {
      // Show demo data
      setResults(demoData)
      return
    }

    setIsLoading(true)
    setCurrentJob(null)
    setResults(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer demo-token` // Replace with real auth
        },
        body: JSON.stringify({
          keywords: keywords.split(',').map(k => k.trim()),
          locale,
          algorithm,
          max_questions_per_keyword: 10
        })
      })

      if (response.ok) {
        const job = await response.json()
        setCurrentJob({
          job_id: job.job_id,
          status: 'queued',
          progress: 0
        })
        toast.success('Analysis started! This may take a few minutes.')
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to start analysis')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
      toast.error('Failed to start analysis')
      setIsLoading(false)
    }
  }

  const exportResults = async (format: 'csv' | 'json') => {
    if (mode === 'demo') {
      toast.error('Export is disabled in demo mode. Upgrade to Builder to unlock exports.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/exports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer demo-token`
        },
        body: JSON.stringify({
          job_id: results?.job_id,
          format,
          include_metadata: true
        })
      })

      if (response.ok) {
        toast.success('Export started! You\'ll receive a download link when ready.')
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Export failed')
      }
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Export failed')
    }
  }

  const displayData = results || demoData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            PAA Explorer
          </h1>
          <p className="text-slate-300 text-lg mb-6">
            Scrape and cluster People Also Ask questions to identify content gaps and seasonal trends
          </p>
          
          {/* Mode Toggle */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant={mode === 'demo' ? 'default' : 'outline'}
              onClick={() => setMode('demo')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              🆓 Demo Mode
            </Button>
            <Button
              variant={mode === 'builder' ? 'default' : 'outline'}
              onClick={() => setMode('builder')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🚀 Builder Mode
            </Button>
          </div>

          {mode === 'demo' && (
            <Alert className="max-w-2xl mx-auto mb-6">
              <AlertDescription>
                📊 Demo mode uses sample data from "SEO Tools" analysis (Oct 2024). 
                Upgrade to Builder for live scraping and exports.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Controls */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Analysis Configuration</CardTitle>
            <CardDescription>
              Configure your PAA analysis parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="keywords" className="text-white">Seed Keywords</Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="seo tools, keyword research, content optimization"
                  disabled={mode === 'demo'}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="locale" className="text-white">Locale</Label>
                <select
                  id="locale"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  disabled={mode === 'demo'}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="fr-FR">French (France)</option>
                  <option value="de-DE">German (Germany)</option>
                  <option value="es-ES">Spanish (Spain)</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="algorithm" className="text-white">Clustering Algorithm</Label>
              <select
                id="algorithm"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={mode === 'demo'}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              >
                <option value="kmeans">K-means (Auto)</option>
                <option value="dbscan">DBSCAN</option>
                <option value="hierarchical">Hierarchical</option>
              </select>
            </div>

            <Button
              onClick={startAnalysis}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'demo' ? 'Loading Demo...' : 'Analyzing...'}
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  {mode === 'demo' ? 'Load Demo Data' : 'Start Analysis'}
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {currentJob && (currentJob.status === 'queued' || currentJob.status === 'running') && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Status: {currentJob.status}</span>
                  <span>{Math.round(currentJob.progress * 100)}%</span>
                </div>
                <Progress value={currentJob.progress * 100} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {displayData && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="clusters">Clusters</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Total Questions</CardTitle>
                    <Search className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{displayData.stats?.total_questions}</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Clusters Found</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{displayData.stats?.total_clusters}</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Clustering Quality</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {Math.round((displayData.stats?.clustering_quality || 0) * 100)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Clusters */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Clusters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.clusters?.slice(0, 5).map((cluster: Cluster, index: number) => (
                      <div key={cluster.label} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-white">{cluster.label}</h4>
                          <p className="text-sm text-slate-300">{cluster.size} questions</p>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-600">
                          {Math.round(cluster.quality * 100)}% quality
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clusters" className="space-y-6">
              <div className="grid gap-6">
                {displayData.clusters?.map((cluster: Cluster) => (
                  <Card key={cluster.label} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{cluster.label}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline">{cluster.size} questions</Badge>
                          <Badge className="bg-emerald-600">
                            {Math.round(cluster.quality * 100)}% quality
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {cluster.questions?.slice(0, 5).map((question: Question, index: number) => (
                          <div key={index} className="p-3 bg-slate-700 rounded border-l-4 border-emerald-500">
                            <p className="text-white">{question.text}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm text-slate-400">Keyword: {question.keyword}</span>
                              <Badge variant="secondary">
                                {Math.round(question.confidence * 100)}% confidence
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {cluster.questions && cluster.questions.length > 5 && (
                          <p className="text-sm text-slate-400 text-center">
                            ... and {cluster.questions.length - 5} more questions
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">All Questions</CardTitle>
                  <CardDescription>
                    Complete list of PAA questions found during analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {displayData.questions?.map((question: Question, index: number) => (
                      <div key={index} className="p-3 bg-slate-700 rounded">
                        <p className="text-white mb-2">{question.text}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Badge variant="outline">{question.keyword}</Badge>
                            <Badge className="bg-blue-600">{question.cluster}</Badge>
                          </div>
                          <Badge variant="secondary">
                            {Math.round(question.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Export Results</CardTitle>
                  <CardDescription>
                    Download your analysis results in various formats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mode === 'demo' && (
                    <Alert>
                      <AlertDescription>
                        🔒 Export is disabled in demo mode. Upgrade to Builder to unlock CSV, JSON, and Google Sheets exports.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => exportResults('csv')}
                      disabled={mode === 'demo'}
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      onClick={() => exportResults('json')}
                      disabled={mode === 'demo'}
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export JSON
                    </Button>
                    <Button
                      disabled={true}
                      variant="outline"
                      className="border-slate-600 text-slate-400"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Google Sheets (Soon)
                    </Button>
                  </div>

                  {mode === 'demo' && (
                    <div className="text-center p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                      <h3 className="text-white font-semibold mb-2">Ready for Live Data?</h3>
                      <p className="text-blue-100 mb-4">
                        Unlock real-time PAA scraping, unlimited keywords, and export capabilities
                      </p>
                      <Button className="bg-white text-blue-600 hover:bg-blue-50">
                        🚀 Upgrade to Builder
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
