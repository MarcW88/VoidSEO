"""
PAA Explorer API - FastAPI Backend
Built with the VOID Loop methodology
"""

from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
import os
import asyncio
import sys
import json
from datetime import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'paa_explorer_lib'))
from paa_explorer import PAAExplorer

# Initialize FastAPI app
app = FastAPI(
    title="PAA Explorer API",
    description="Scrape and cluster People Also Ask questions with the VOID Loop methodology",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# In-memory storage for MVP (replace with database in production)
JOBS = {}
USER_USAGE = {}  # Track usage per user

# Usage limits
FREE_TIER_DAILY_LIMIT = 3  # 3 analyses per day for free users
FREE_TIER_MONTHLY_LIMIT = 10  # 10 analyses per month
DEMO_DATA = {
    "questions": [
        {"text": "What are the best free SEO tools for beginners?", "keyword": "seo tools", "cluster": "Free SEO Tools"},
        {"text": "How to use Google Search Console for SEO?", "keyword": "seo tools", "cluster": "Free SEO Tools"},
        {"text": "Are free SEO tools as good as paid ones?", "keyword": "seo tools", "cluster": "Free SEO Tools"},
        {"text": "How to find long tail keywords for free?", "keyword": "keyword research", "cluster": "Keyword Research"},
        {"text": "What is keyword difficulty and how to check it?", "keyword": "keyword research", "cluster": "Keyword Research"},
        {"text": "How many keywords should I target per page?", "keyword": "keyword research", "cluster": "Keyword Research"},
        {"text": "How to optimize content for SEO?", "keyword": "content optimization", "cluster": "Technical SEO"},
        {"text": "What is on-page SEO checklist?", "keyword": "content optimization", "cluster": "Technical SEO"},
    ],
    "clusters": {
        "Free SEO Tools": {"size": 34, "quality": 0.92},
        "Keyword Research": {"size": 28, "quality": 0.89},
        "Technical SEO": {"size": 23, "quality": 0.87},
    },
    "stats": {
        "total_questions": 247,
        "total_clusters": 8,
        "clustering_quality": 0.92
    }
}

# Pydantic Models
class JobRequest(BaseModel):
    keywords: List[str] = Field(..., description="List of seed keywords to analyze")
    locale: str = Field(default="en-US", description="Target locale for scraping")
    time_range: Optional[str] = Field(default=None, description="Time range for analysis (e.g., '3m', '6m')")
    algorithm: str = Field(default="kmeans", description="Clustering algorithm to use")
    max_questions_per_keyword: int = Field(default=10, description="Maximum questions per keyword")

class JobResponse(BaseModel):
    job_id: str
    status: str
    message: str

class JobStatus(BaseModel):
    job_id: str
    status: str
    progress: float
    created_at: datetime
    finished_at: Optional[datetime]
    error: Optional[str]
    stats: Optional[Dict[str, Any]]

class QuestionResult(BaseModel):
    text: str
    keyword: str
    cluster: str
    confidence: float

class ClusterResult(BaseModel):
    label: str
    size: int
    quality: float
    questions: List[QuestionResult]

class JobResults(BaseModel):
    job_id: str
    status: str
    questions: List[QuestionResult]
    clusters: List[ClusterResult]
    stats: Dict[str, Any]

class ExportRequest(BaseModel):
    job_id: str
    format: str = Field(default="csv", description="Export format: csv, json, sheets")
    include_metadata: bool = Field(default=True, description="Include metadata in export")

# Auth dependency (simplified for MVP)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Simplified auth for MVP. In production, validate JWT token here.
    """
    if not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"user_id": "demo_user", "plan": "free"}

def check_user_quota(user_id: str, plan: str) -> Dict[str, Any]:
    """
    Check if user has remaining quota
    """
    from datetime import datetime, date
    
    today = date.today().isoformat()
    
    if user_id not in USER_USAGE:
        USER_USAGE[user_id] = {
            "daily": {today: 0},
            "monthly": {today[:7]: 0}  # YYYY-MM format
        }
    
    user_usage = USER_USAGE[user_id]
    daily_usage = user_usage["daily"].get(today, 0)
    monthly_usage = user_usage["monthly"].get(today[:7], 0)
    
    if plan == "free":
        daily_limit = FREE_TIER_DAILY_LIMIT
        monthly_limit = FREE_TIER_MONTHLY_LIMIT
    else:
        daily_limit = 100  # Builder tier
        monthly_limit = 1000
    
    can_proceed = daily_usage < daily_limit and monthly_usage < monthly_limit
    
    return {
        "can_proceed": can_proceed,
        "daily_usage": daily_usage,
        "daily_limit": daily_limit,
        "monthly_usage": monthly_usage,
        "monthly_limit": monthly_limit,
        "remaining_today": max(0, daily_limit - daily_usage),
        "remaining_month": max(0, monthly_limit - monthly_usage)
    }

def increment_user_usage(user_id: str):
    """
    Increment user usage counters
    """
    from datetime import date
    
    today = date.today().isoformat()
    
    if user_id not in USER_USAGE:
        USER_USAGE[user_id] = {
            "daily": {today: 0},
            "monthly": {today[:7]: 0}
        }
    
    user_usage = USER_USAGE[user_id]
    user_usage["daily"][today] = user_usage["daily"].get(today, 0) + 1
    user_usage["monthly"][today[:7]] = user_usage["monthly"].get(today[:7], 0) + 1

# Real PAA analysis using the library
async def run_paa_analysis(job_id: str, request: JobRequest):
    """
    Real PAA analysis using the PAA Explorer library
    """
    try:
        # Update job status
        JOBS[job_id]["status"] = "running"
        JOBS[job_id]["progress"] = 0.1
        JOBS[job_id]["message"] = "Initializing PAA Explorer..."
        
        # Initialize PAA Explorer with your key
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key:
            # Fallback to your hardcoded key for demo
            openai_key = "sk-your-demo-key-here"  # Replace with your actual key
            
        if not openai_key or openai_key == "sk-your-demo-key-here":
            raise ValueError("OpenAI API key not configured. Please add OPENAI_API_KEY to .env")
            
        explorer = PAAExplorer(
            openai_api_key=openai_key,
            locale=request.locale,
            max_questions_per_keyword=request.max_questions_per_keyword
        )
        
        JOBS[job_id]["progress"] = 0.2
        JOBS[job_id]["message"] = "Starting analysis..."
        
        # Run the complete analysis
        result = await explorer.analyze(
            keywords=request.keywords,
            algorithm=request.algorithm,
            job_id=job_id
        )
        
        JOBS[job_id]["progress"] = 1.0
        JOBS[job_id]["status"] = "completed"
        JOBS[job_id]["finished_at"] = datetime.now()
        JOBS[job_id]["message"] = "Analysis completed successfully"
        
        # Store real results
        JOBS[job_id]["results"] = {
            "questions": [{
                "text": q.text,
                "keyword": q.keyword,
                "cluster": q.cluster_label or "Unclustered",
                "confidence": q.confidence,
                "position": q.position
            } for q in result.questions],
            "clusters": {c.label: {
                "size": c.size,
                "quality": c.quality
            } for c in result.clusters},
            "stats": result.stats
        }
        
    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        JOBS[job_id]["finished_at"] = datetime.now()
        JOBS[job_id]["message"] = f"Analysis failed: {str(e)}"

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "PAA Explorer API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "active_jobs": len([j for j in JOBS.values() if j["status"] == "running"]),
        "total_jobs": len(JOBS)
    }

@app.get("/api/quota")
async def get_user_quota(user: dict = Depends(get_current_user)):
    """Get user's current quota status"""
    quota_info = check_user_quota(user["user_id"], user["plan"])
    return {
        "user_id": user["user_id"],
        "plan": user["plan"],
        "quota": quota_info,
        "cost_per_analysis": "~$0.005",
        "your_cost": "$0 (using VoidSEO credits)"
    }

@app.post("/api/jobs", response_model=JobResponse)
async def create_job(
    request: JobRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    """Create a new PAA analysis job"""
    
    # Check user quota before proceeding
    quota_check = check_user_quota(user["user_id"], user["plan"])
    
    if not quota_check["can_proceed"]:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Quota exceeded",
                "message": f"Daily limit: {quota_check['daily_usage']}/{quota_check['daily_limit']}, Monthly: {quota_check['monthly_usage']}/{quota_check['monthly_limit']}",
                "quota": quota_check,
                "upgrade_url": "/pricing"
            }
        )
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    
    # Increment usage counter
    increment_user_usage(user["user_id"])
    
    # Initialize job
    JOBS[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "progress": 0.0,
        "created_at": datetime.now(),
        "finished_at": None,
        "user_id": user["user_id"],
        "request": request.dict(),
        "message": "Job queued for processing",
        "error": None,
        "results": None
    }
    
    # Start background task
    background_tasks.add_task(run_paa_analysis, job_id, request)
    
    return JobResponse(
        job_id=job_id,
        status="queued",
        message="Job created successfully. Processing will begin shortly."
    )

@app.get("/api/jobs/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str, user: dict = Depends(get_current_user)):
    """Get job status and progress"""
    
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = JOBS[job_id]
    
    # Check if user owns this job (simplified for MVP)
    if job["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return JobStatus(
        job_id=job_id,
        status=job["status"],
        progress=job["progress"],
        created_at=job["created_at"],
        finished_at=job["finished_at"],
        error=job["error"],
        stats=job.get("results", {}).get("stats") if job["status"] == "completed" else None
    )

@app.get("/api/jobs/{job_id}/results", response_model=JobResults)
async def get_job_results(job_id: str, user: dict = Depends(get_current_user)):
    """Get job results with questions and clusters"""
    
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = JOBS[job_id]
    
    # Check if user owns this job
    if job["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    if not job["results"]:
        raise HTTPException(status_code=404, detail="Results not found")
    
    # Format results
    questions = [
        QuestionResult(
            text=q["text"],
            keyword=q["keyword"],
            cluster=q["cluster"],
            confidence=0.85  # Mock confidence score
        )
        for q in job["results"]["questions"]
    ]
    
    clusters = [
        ClusterResult(
            label=label,
            size=data["size"],
            quality=data["quality"],
            questions=[q for q in questions if q.cluster == label]
        )
        for label, data in job["results"]["clusters"].items()
    ]
    
    return JobResults(
        job_id=job_id,
        status=job["status"],
        questions=questions,
        clusters=clusters,
        stats=job["results"]["stats"]
    )

@app.get("/api/demo/data")
async def get_demo_data():
    """Get demo data for free tier users"""
    
    questions = [
        QuestionResult(
            text=q["text"],
            keyword=q["keyword"],
            cluster=q["cluster"],
            confidence=0.85
        )
        for q in DEMO_DATA["questions"]
    ]
    
    clusters = [
        ClusterResult(
            label=label,
            size=data["size"],
            quality=data["quality"],
            questions=[q for q in questions if q.cluster == label]
        )
        for label, data in DEMO_DATA["clusters"].items()
    ]
    
    return {
        "questions": questions,
        "clusters": clusters,
        "stats": DEMO_DATA["stats"],
        "is_demo": True,
        "message": "This is demo data. Upgrade to Builder for live scraping."
    }

@app.post("/api/exports")
async def create_export(
    request: ExportRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    """Create export job (simplified for MVP)"""
    
    if user["plan"] == "free":
        raise HTTPException(
            status_code=403, 
            detail="Export feature requires Builder plan. Upgrade to unlock exports."
        )
    
    export_id = str(uuid.uuid4())
    
    # In production, this would generate actual export files
    return {
        "export_id": export_id,
        "status": "queued",
        "message": "Export job created. You'll receive a download link when ready."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
