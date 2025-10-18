#!/usr/bin/env python3
"""
Test script for PAA Explorer
Tests the complete pipeline: scraping → embedding → clustering
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the lib to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'paa_explorer_lib'))
from paa_explorer import PAAExplorer

# Load environment variables
load_dotenv()

async def test_paa_explorer():
    """Test the complete PAA Explorer pipeline"""
    
    print("🚀 Testing PAA Explorer...")
    
    # Check for OpenAI API key
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        print("❌ OPENAI_API_KEY not found in environment")
        print("💡 Create a .env file with: OPENAI_API_KEY=your-key-here")
        return False
    
    try:
        # Initialize explorer
        print("📝 Initializing PAA Explorer...")
        explorer = PAAExplorer(
            openai_api_key=openai_key,
            locale="en-US",
            max_questions_per_keyword=3,  # Small number for testing
            delay_between_requests=1.0
        )
        
        # Test keywords
        test_keywords = ["seo tools", "keyword research"]
        
        print(f"🔍 Testing with keywords: {test_keywords}")
        
        # Run complete analysis
        result = await explorer.analyze(
            keywords=test_keywords,
            algorithm="kmeans"
        )
        
        # Print results
        print(f"\n✅ Analysis completed!")
        print(f"📊 Stats: {result.stats}")
        print(f"📝 Questions found: {len(result.questions)}")
        print(f"🎯 Clusters created: {len(result.clusters)}")
        
        # Show sample questions
        if result.questions:
            print(f"\n📋 Sample questions:")
            for i, q in enumerate(result.questions[:5]):
                print(f"  {i+1}. {q.text} (cluster: {q.cluster_label})")
        
        # Show clusters
        if result.clusters:
            print(f"\n🎯 Clusters:")
            for cluster in result.clusters:
                print(f"  • {cluster.label}: {cluster.size} questions (quality: {cluster.quality:.2f})")
        
        # Test exports
        print(f"\n💾 Testing exports...")
        csv_file = explorer.export_csv(result, "test_results.csv")
        json_file = explorer.export_json(result, "test_results.json")
        print(f"  ✅ CSV exported to: {csv_file}")
        print(f"  ✅ JSON exported to: {json_file}")
        
        print(f"\n🎉 All tests passed! PAA Explorer is working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_paa_explorer())
    sys.exit(0 if success else 1)
