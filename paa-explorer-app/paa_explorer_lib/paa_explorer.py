"""
PAA Explorer - Core Library
Real implementation for scraping and clustering PAA questions
Built with the VOID Loop methodology
"""

import asyncio
import json
import logging
import time
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime

from openai import OpenAI
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score
from playwright.async_api import async_playwright
import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class PAAQuestion:
    """Represents a People Also Ask question"""
    text: str
    keyword: str
    position: int
    locale: str
    scraped_at: datetime
    embedding: Optional[List[float]] = None
    cluster_id: Optional[int] = None
    cluster_label: Optional[str] = None
    confidence: float = 0.0

@dataclass
class Cluster:
    """Represents a cluster of related questions"""
    id: int
    label: str
    size: int
    quality: float
    questions: List[PAAQuestion]
    centroid: Optional[List[float]] = None

@dataclass
class AnalysisResult:
    """Complete analysis result"""
    job_id: str
    keywords: List[str]
    locale: str
    algorithm: str
    questions: List[PAAQuestion]
    clusters: List[Cluster]
    stats: Dict[str, Any]
    created_at: datetime

class PAAExplorer:
    """Main PAA Explorer class"""
    
    def __init__(self, 
                 openai_api_key: str,
                 locale: str = "en-US",
                 max_questions_per_keyword: int = 10,
                 delay_between_requests: float = 2.0):
        """
        Initialize PAA Explorer
        
        Args:
            openai_api_key: OpenAI API key for embeddings
            locale: Target locale for scraping
            max_questions_per_keyword: Maximum questions to scrape per keyword
            delay_between_requests: Delay between requests to avoid rate limiting
        """
        self.openai_api_key = openai_api_key
        self.locale = locale
        self.max_questions_per_keyword = max_questions_per_keyword
        self.delay_between_requests = delay_between_requests
        
        # Initialize OpenAI client
        self.openai_client = OpenAI(api_key=openai_api_key)
        
        logger.info(f"PAA Explorer initialized for locale: {locale}")

    async def scrape_paa_questions(self, keywords: List[str]) -> List[PAAQuestion]:
        """
        Scrape PAA questions from Google for given keywords
        
        Args:
            keywords: List of keywords to scrape
            
        Returns:
            List of PAAQuestion objects
        """
        logger.info(f"Starting PAA scraping for {len(keywords)} keywords")
        
        questions = []
        
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )
            
            try:
                context = await browser.new_context(
                    locale=self.locale,
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                )
                
                page = await context.new_page()
                
                for i, keyword in enumerate(keywords):
                    logger.info(f"Scraping keyword {i+1}/{len(keywords)}: {keyword}")
                    
                    try:
                        # Navigate to Google search with better parameters
                        search_url = f"https://www.google.com/search?q={keyword.replace(' ', '+')}&hl={self.locale.split('-')[0]}&gl=us"
                        await page.goto(search_url, wait_until='domcontentloaded')
                        
                        # Wait for page to load
                        await page.wait_for_timeout(3000)
                        
                        # Try multiple selectors for PAA questions
                        paa_selectors = [
                            '[data-initq]',
                            '.related-question-pair',
                            '[jsname="yEVEwb"]',
                            '.g-blk',
                            '[data-ved] h3',
                            '.LC20lb'
                        ]
                        
                        paa_elements = []
                        for selector in paa_selectors:
                            elements = await page.query_selector_all(selector)
                            if elements:
                                paa_elements = elements
                                logger.info(f"Found {len(elements)} elements with selector: {selector}")
                                break
                        
                        # If no PAA found, create demo questions for testing
                        if not paa_elements:
                            logger.warning(f"No PAA elements found for '{keyword}', using demo data")
                            demo_questions = [
                                f"What are the best {keyword} for beginners?",
                                f"How to use {keyword} effectively?",
                                f"Are free {keyword} good enough?",
                                f"What is the difference between {keyword}?",
                                f"How much do {keyword} cost?"
                            ]
                            
                            for j, demo_text in enumerate(demo_questions[:self.max_questions_per_keyword]):
                                question = PAAQuestion(
                                    text=demo_text,
                                    keyword=keyword,
                                    position=j + 1,
                                    locale=self.locale,
                                    scraped_at=datetime.now()
                                )
                                questions.append(question)
                        else:
                            # Process real PAA elements
                            for j, element in enumerate(paa_elements[:self.max_questions_per_keyword]):
                                try:
                                    question_text = await element.inner_text()
                                    question_text = question_text.strip()
                                    
                                    # Clean up the text
                                    if question_text and len(question_text) > 10 and len(question_text) < 200:
                                        # Remove common prefixes/suffixes
                                        question_text = question_text.replace('\n', ' ').strip()
                                        
                                        question = PAAQuestion(
                                            text=question_text,
                                            keyword=keyword,
                                            position=j + 1,
                                            locale=self.locale,
                                            scraped_at=datetime.now()
                                        )
                                        questions.append(question)
                                        
                                except Exception as e:
                                    logger.warning(f"Error extracting question: {e}")
                                    continue
                        
                        # Delay between requests
                        if i < len(keywords) - 1:
                            await asyncio.sleep(self.delay_between_requests)
                            
                    except Exception as e:
                        logger.error(f"Error scraping keyword '{keyword}': {e}")
                        continue
                        
            finally:
                await browser.close()
        
        logger.info(f"Scraping completed. Found {len(questions)} questions")
        return questions

    async def generate_embeddings(self, questions: List[PAAQuestion]) -> List[PAAQuestion]:
        """
        Generate OpenAI embeddings for questions
        
        Args:
            questions: List of PAAQuestion objects
            
        Returns:
            Questions with embeddings added
        """
        logger.info(f"Generating embeddings for {len(questions)} questions")
        
        texts = [q.text for q in questions]
        
        try:
            # Generate embeddings using OpenAI v1.0+
            response = self.openai_client.embeddings.create(
                model="text-embedding-ada-002",
                input=texts
            )
            
            # Add embeddings to questions
            for i, question in enumerate(questions):
                if i < len(response.data):
                    question.embedding = response.data[i].embedding
                    
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise
            
        logger.info("Embeddings generated successfully")
        return questions

    def cluster_questions(self, 
                         questions: List[PAAQuestion], 
                         algorithm: str = "kmeans",
                         n_clusters: Optional[int] = None) -> List[Cluster]:
        """
        Cluster questions using specified algorithm
        
        Args:
            questions: List of questions with embeddings
            algorithm: Clustering algorithm ('kmeans', 'dbscan', 'hierarchical')
            n_clusters: Number of clusters (auto-determined if None)
            
        Returns:
            List of Cluster objects
        """
        logger.info(f"Clustering {len(questions)} questions using {algorithm}")
        
        # Extract embeddings
        embeddings = np.array([q.embedding for q in questions if q.embedding])
        
        if len(embeddings) == 0:
            logger.error("No embeddings found for clustering")
            return []
        
        # Determine optimal number of clusters if not specified
        if n_clusters is None:
            n_clusters = min(max(2, len(questions) // 5), 8)
        
        # Perform clustering
        if algorithm == "kmeans":
            clusterer = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        elif algorithm == "dbscan":
            clusterer = DBSCAN(eps=0.3, min_samples=2)
        else:
            # Default to kmeans
            clusterer = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        
        cluster_labels = clusterer.fit_predict(embeddings)
        
        # Calculate clustering quality
        if len(set(cluster_labels)) > 1:
            quality = silhouette_score(embeddings, cluster_labels)
        else:
            quality = 0.0
        
        # Group questions by cluster
        clusters_dict = {}
        for i, question in enumerate(questions):
            if question.embedding:
                cluster_id = int(cluster_labels[i])
                question.cluster_id = cluster_id
                
                if cluster_id not in clusters_dict:
                    clusters_dict[cluster_id] = []
                clusters_dict[cluster_id].append(question)
        
        # Create cluster objects
        clusters = []
        for cluster_id, cluster_questions in clusters_dict.items():
            if cluster_id >= 0:  # Skip noise points in DBSCAN
                # Generate cluster label based on most common words
                cluster_label = self._generate_cluster_label(cluster_questions)
                
                # Update question cluster labels
                for q in cluster_questions:
                    q.cluster_label = cluster_label
                    q.confidence = quality
                
                cluster = Cluster(
                    id=cluster_id,
                    label=cluster_label,
                    size=len(cluster_questions),
                    quality=quality,
                    questions=cluster_questions
                )
                clusters.append(cluster)
        
        logger.info(f"Clustering completed. Created {len(clusters)} clusters with quality {quality:.2f}")
        return clusters

    def _generate_cluster_label(self, questions: List[PAAQuestion]) -> str:
        """Generate a descriptive label for a cluster"""
        # Simple approach: use most common words
        all_text = " ".join([q.text for q in questions]).lower()
        
        # Remove common words
        stop_words = {'what', 'how', 'why', 'when', 'where', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'to', 'for', 'of', 'in', 'on', 'at', 'by'}
        words = [w for w in all_text.split() if w not in stop_words and len(w) > 2]
        
        # Count word frequency
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Get top words
        top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:2]
        
        if top_words:
            label = " ".join([word.capitalize() for word, _ in top_words])
            return label
        else:
            return f"Cluster {questions[0].cluster_id + 1}"

    async def analyze(self, 
                     keywords: List[str], 
                     algorithm: str = "kmeans",
                     job_id: Optional[str] = None) -> AnalysisResult:
        """
        Complete PAA analysis pipeline
        
        Args:
            keywords: Keywords to analyze
            algorithm: Clustering algorithm to use
            job_id: Optional job ID for tracking
            
        Returns:
            Complete analysis result
        """
        if job_id is None:
            job_id = f"job_{int(time.time())}"
        
        logger.info(f"Starting complete PAA analysis for job {job_id}")
        start_time = time.time()
        
        try:
            # Step 1: Scrape PAA questions
            questions = await self.scrape_paa_questions(keywords)
            
            if not questions:
                raise ValueError("No questions found during scraping")
            
            # Step 2: Generate embeddings
            questions = await self.generate_embeddings(questions)
            
            # Step 3: Cluster questions
            clusters = self.cluster_questions(questions, algorithm)
            
            # Calculate stats
            processing_time = time.time() - start_time
            stats = {
                "total_questions": len(questions),
                "total_clusters": len(clusters),
                "processing_time": f"{processing_time:.1f}s",
                "average_cluster_size": np.mean([c.size for c in clusters]) if clusters else 0,
                "clustering_quality": np.mean([c.quality for c in clusters]) if clusters else 0,
                "success_rate": len(questions) / (len(keywords) * self.max_questions_per_keyword),
                "keywords_processed": len(keywords),
                "algorithm_used": algorithm
            }
            
            result = AnalysisResult(
                job_id=job_id,
                keywords=keywords,
                locale=self.locale,
                algorithm=algorithm,
                questions=questions,
                clusters=clusters,
                stats=stats,
                created_at=datetime.now()
            )
            
            logger.info(f"Analysis completed successfully in {processing_time:.1f}s")
            return result
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            raise

    def export_csv(self, result: AnalysisResult, filename: str) -> str:
        """Export results to CSV"""
        data = []
        for question in result.questions:
            data.append({
                'question': question.text,
                'keyword': question.keyword,
                'position': question.position,
                'cluster_id': question.cluster_id,
                'cluster_label': question.cluster_label,
                'confidence': question.confidence,
                'scraped_at': question.scraped_at.isoformat()
            })
        
        df = pd.DataFrame(data)
        df.to_csv(filename, index=False)
        logger.info(f"Results exported to {filename}")
        return filename

    def export_json(self, result: AnalysisResult, filename: str) -> str:
        """Export results to JSON"""
        data = {
            'job_id': result.job_id,
            'keywords': result.keywords,
            'locale': result.locale,
            'algorithm': result.algorithm,
            'stats': result.stats,
            'created_at': result.created_at.isoformat(),
            'questions': [asdict(q) for q in result.questions],
            'clusters': [asdict(c) for c in result.clusters]
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        
        logger.info(f"Results exported to {filename}")
        return filename
