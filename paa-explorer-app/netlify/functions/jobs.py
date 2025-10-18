import json
import os
import asyncio
import uuid
from datetime import datetime
import sys

# Add the PAA Explorer lib to path
sys.path.append('/opt/build/repo/paa_explorer_lib')

try:
    from paa_explorer import PAAExplorer
except ImportError:
    # Fallback if import fails
    PAAExplorer = None

def handler(event, context):
    """
    Netlify Function for PAA Explorer API
    """
    
    # Handle CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    }
    
    # Handle preflight requests
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        # Parse request
        if event['httpMethod'] == 'POST':
            body = json.loads(event['body'])
            keywords = body.get('keywords', [])
            locale = body.get('locale', 'en-US')
            algorithm = body.get('algorithm', 'kmeans')
            
            # Generate job ID
            job_id = str(uuid.uuid4())
            
            # For Netlify, we'll return demo data immediately
            # Real implementation would use background processing
            demo_result = generate_demo_result(keywords, job_id)
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'job_id': job_id,
                    'status': 'completed',
                    'results': demo_result
                })
            }
        
        elif event['httpMethod'] == 'GET':
            # Health check
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'message': 'PAA Explorer API',
                    'status': 'healthy',
                    'platform': 'netlify'
                })
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': str(e),
                'message': 'Internal server error'
            })
        }

def generate_demo_result(keywords, job_id):
    """Generate demo results for given keywords"""
    
    questions = []
    clusters = {}
    
    for i, keyword in enumerate(keywords):
        # Generate demo questions for each keyword
        demo_questions = [
            f"What are the best {keyword} for beginners?",
            f"How to use {keyword} effectively?",
            f"Are free {keyword} good enough?",
            f"What is the difference between {keyword}?",
            f"How much do {keyword} cost?"
        ]
        
        cluster_name = keyword.title().replace(' ', ' ')
        
        for j, question_text in enumerate(demo_questions):
            questions.append({
                'text': question_text,
                'keyword': keyword,
                'cluster': cluster_name,
                'confidence': 0.85,
                'position': j + 1
            })
        
        clusters[cluster_name] = {
            'size': len(demo_questions),
            'quality': 0.85
        }
    
    return {
        'questions': questions,
        'clusters': clusters,
        'stats': {
            'total_questions': len(questions),
            'total_clusters': len(clusters),
            'processing_time': '2.1s',
            'clustering_quality': 0.85,
            'success_rate': 1.0,
            'keywords_processed': len(keywords),
            'algorithm_used': 'demo',
            'platform': 'netlify'
        }
    }
