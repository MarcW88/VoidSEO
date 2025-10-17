#!/usr/bin/env python3
"""
VoidSEO Template HTML Generator
Converts markdown templates to styled HTML with VoidSEO branding
"""

import markdown
from pathlib import Path
import os

def create_html_style():
    """Create CSS styling for VoidSEO branded HTML"""
    return """
    <style>
        @media print {
            .no-print { display: none; }
            body { -webkit-print-color-adjust: exact; }
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: white;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: #0a0a0a;
            color: #00ff99;
            padding: 30px;
            margin: -20px -20px 40px -20px;
            text-align: center;
            border-radius: 0;
        }
        
        .header h1 {
            margin: 0;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 32px;
            font-weight: bold;
        }
        
        .header .subtitle {
            margin: 10px 0 0 0;
            font-size: 16px;
            color: #cccccc;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        
        .void-symbol {
            color: #00ff99;
            font-family: 'Monaco', 'Menlo', monospace;
            font-weight: bold;
        }
        
        .actions {
            background: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
            border: 2px solid #00ff99;
        }
        
        .btn {
            background: #00ff99;
            color: #0a0a0a;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 0 10px;
            display: inline-block;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        
        .btn:hover {
            background: #00cc7a;
        }
        
        h1 {
            color: #0a0a0a;
            font-size: 28px;
            font-weight: 700;
            margin: 40px 0 20px 0;
            border-bottom: 3px solid #00ff99;
            padding-bottom: 10px;
        }
        
        h2 {
            color: #0a0a0a;
            font-size: 22px;
            font-weight: 600;
            margin: 30px 0 15px 0;
            padding-left: 15px;
            border-left: 5px solid #00ff99;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 0 8px 8px 0;
        }
        
        h3 {
            color: #333;
            font-size: 18px;
            font-weight: 600;
            margin: 25px 0 12px 0;
        }
        
        h4 {
            color: #555;
            font-size: 16px;
            font-weight: 600;
            margin: 20px 0 10px 0;
        }
        
        p {
            margin: 12px 0;
            text-align: justify;
        }
        
        blockquote {
            background: #e8f5e8;
            border-left: 5px solid #00ff99;
            margin: 25px 0;
            padding: 20px 25px;
            font-style: italic;
            color: #2d5a2d;
            border-radius: 0 8px 8px 0;
        }
        
        blockquote p {
            margin: 0;
            font-weight: 500;
        }
        
        ul, ol {
            margin: 18px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 10px 0;
        }
        
        code {
            background: #f1f3f4;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            color: #d73a49;
            font-weight: 600;
        }
        
        pre {
            background: #0a0a0a;
            color: #00ff99;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            margin: 25px 0;
            border: 1px solid #333;
        }
        
        pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
        
        .fill-section {
            background: #fff9e6;
            border: 2px dashed #ffb84d;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            position: relative;
        }
        
        .fill-section::before {
            content: "✏️ FILL THIS SECTION";
            position: absolute;
            top: -12px;
            left: 15px;
            background: #fff9e6;
            padding: 0 10px;
            font-size: 12px;
            font-weight: bold;
            color: #cc8800;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        
        .fill-section p {
            margin: 0;
            color: #cc8800;
            font-style: italic;
        }
        
        .checkbox-list {
            list-style: none;
            padding-left: 0;
        }
        
        .checkbox-list li {
            position: relative;
            padding-left: 35px;
            margin: 12px 0;
            background: #f8f9fa;
            padding: 12px 12px 12px 35px;
            border-radius: 6px;
            border-left: 4px solid #00ff99;
        }
        
        .checkbox-list li::before {
            content: "☐";
            position: absolute;
            left: 12px;
            top: 12px;
            color: #00ff99;
            font-weight: bold;
            font-size: 16px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #eee;
            text-align: center;
            font-size: 14px;
            color: #666;
            font-family: 'Monaco', 'Menlo', monospace;
            background: #f8f9fa;
            padding: 30px;
            margin-left: -20px;
            margin-right: -20px;
        }
        
        strong {
            color: #0a0a0a;
            font-weight: 700;
        }
        
        em {
            color: #555;
            font-style: italic;
        }
        
        hr {
            border: none;
            border-top: 3px solid #00ff99;
            margin: 40px 0;
            opacity: 0.3;
        }
        
        .template-meta {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 5px solid #00ff99;
        }
        
        .template-meta h4 {
            margin-top: 0;
            color: #2d5a2d;
        }
        
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 5px solid #ffc107;
        }
        
        .tip {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 5px solid #17a2b8;
        }
    </style>
    """

def process_markdown_content(content):
    """Process markdown content to add special styling"""
    
    # Add fill sections for empty fields
    content = content.replace('- **Project/Module name:** ', 
        '- **Project/Module name:** \n<div class="fill-section"><p>Enter your project name here</p></div>\n')
    content = content.replace('- **Author / Team:** ', 
        '- **Author / Team:** \n<div class="fill-section"><p>Enter author/team name here</p></div>\n')
    content = content.replace('- **Date:** ', 
        '- **Date:** \n<div class="fill-section"><p>Enter date here</p></div>\n')
    content = content.replace('- **Owner:** ', 
        '- **Owner:** \n<div class="fill-section"><p>Enter owner name here</p></div>\n')
    
    # Process sections that need filling
    lines = content.split('\n')
    processed_lines = []
    
    for line in lines:
        # Convert empty sections to fill areas
        if line.strip() in ['What\'s happening? Where does this come from (GSC, SERP, CRM, support, logs…)?',
                           'State the pattern crisply.',
                           'What makes this worth solving? Impact on biz/users/process?',
                           'Who benefits? Persona / team / use case.',
                           'Short description + why now.']:
            processed_lines.append('<div class="fill-section"><p>' + line + '</p></div>')
        else:
            processed_lines.append(line)
    
    return '\n'.join(processed_lines)

def markdown_to_html(md_content, template_name, template_description):
    """Convert markdown content to styled HTML"""
    
    # Process content
    processed_content = process_markdown_content(md_content)
    
    # Convert markdown to HTML
    html_content = markdown.markdown(processed_content, extensions=['extra', 'codehilite'])
    
    # Convert checkboxes to styled version
    html_content = html_content.replace('<li>[ ]', '<li class="checkbox-item">☐')
    html_content = html_content.replace('- [ ]', '☐')
    
    # Add warning/tip styling
    html_content = html_content.replace('<strong>Pitfall to avoid:</strong>', 
        '<div class="warning"><strong>⚠️ Pitfall to avoid:</strong>')
    html_content = html_content.replace('Starting from a tool, not a problem.', 
        'Starting from a tool, not a problem.</div>')
    
    # Create full HTML document
    full_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{template_name} - VoidSEO</title>
        {create_html_style()}
    </head>
    <body>
        <div class="header">
            <h1>VoidSEO <span class="void-symbol">▌</span></h1>
            <div class="subtitle">{template_name}</div>
        </div>
        
        <div class="actions no-print">
            <p><strong>💡 Pro tip:</strong> Use Cmd+P to print or save as PDF</p>
            <a href="#" onclick="window.print()" class="btn">🖨️ Print Template</a>
            <a href="../VOID_Loop_Templates_v1.zip" class="btn">📦 Download All Templates</a>
        </div>
        
        <div class="template-meta">
            <h4>About this template</h4>
            <p>{template_description}</p>
        </div>
        
        <div class="content">
            {html_content}
        </div>
        
        <div class="footer">
            <p><strong>VoidSEO VOID Loop Templates</strong> • <span class="void-symbol">▌</span></p>
            <p>Build smarter. Dive deeper. • <strong>voidseo.dev</strong></p>
            <p>This template is part of the VOID Loop methodology for systematic SEO automation.</p>
        </div>
    </body>
    </html>
    """
    
    return full_html

def generate_html_template(md_file_path, output_dir):
    """Generate HTML from markdown file"""
    
    # Read markdown file
    with open(md_file_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Get template info
    file_stem = Path(md_file_path).stem
    template_name = file_stem.replace('VOID_', '').replace('_', ' ')
    
    # Template descriptions
    descriptions = {
        'Vision Template': 'A 1-page brief to capture context, patterns, and target impact. Use this to clearly define your problem before starting any development work.',
        'PRD Template': 'Problem-Requirements-Data template for defining inputs, outputs, constraints, and success metrics before coding.',
        'Implementation Checklist': 'Step-by-step checklist for building, testing, and documenting your v0.1 module with proper observability.',
        'Deep Dive Template': 'Structured template for analyzing results, documenting learnings, and making keep/kill/iterate decisions.',
        'Quick Start Guide': 'Complete guide to your first VOID Loop project. Shows how to go from idea to working automation in 7 hours.'
    }
    
    template_description = descriptions.get(template_name, 'VOID Loop methodology template')
    
    # Convert to HTML
    html_content = markdown_to_html(md_content, template_name, template_description)
    
    # Save HTML file
    output_path = output_dir / f"{file_stem}.html"
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"✅ Generated: {output_path}")
        return True
    except Exception as e:
        print(f"❌ Error generating {output_path}: {e}")
        return False

def main():
    """Main function to generate all HTML templates"""
    
    # Setup paths
    base_dir = Path(__file__).parent
    output_dir = base_dir / "templates" / "html"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Template files to convert
    template_files = [
        "VOID_Vision_Template.md",
        "VOID_PRD_Template.md", 
        "VOID_Implementation_Checklist.md",
        "VOID_Deep_Dive_Template.md",
        "VOID_Quick_Start_Guide.md"
    ]
    
    print("🚀 Generating VoidSEO HTML Templates...")
    print("=" * 50)
    
    success_count = 0
    
    for template_file in template_files:
        file_path = base_dir / template_file
        if file_path.exists():
            if generate_html_template(file_path, output_dir):
                success_count += 1
        else:
            print(f"⚠️  File not found: {template_file}")
    
    print("=" * 50)
    print(f"✨ Generated {success_count}/{len(template_files)} HTML templates")
    print(f"📁 Output directory: {output_dir}")
    
    # Create index
    create_html_index(output_dir)

def create_html_index(output_dir):
    """Create an index HTML file for all templates"""
    
    index_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VoidSEO HTML Templates</title>
        {create_html_style()}
    </head>
    <body>
        <div class="header">
            <h1>VoidSEO <span class="void-symbol">▌</span> HTML Templates</h1>
            <div class="subtitle">Professional templates for the VOID Loop methodology</div>
        </div>
        
        <div class="actions">
            <a href="../../index.html" class="btn">🏠 Back to Site</a>
            <a href="../../VOID_Loop_Templates_v1.zip" class="btn">📦 Download ZIP</a>
        </div>
        
        <h2>Available Templates</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0;">
            <div style="border: 2px solid #00ff99; padding: 20px; border-radius: 8px; background: #f8f9fa;">
                <h3>Vision Template</h3>
                <p>1-page brief to capture context, pattern, and target impact</p>
                <a href="VOID_Vision_Template.html" class="btn">📄 Open Template</a>
            </div>
            
            <div style="border: 2px solid #00ff99; padding: 20px; border-radius: 8px; background: #f8f9fa;">
                <h3>PRD Template</h3>
                <p>Problem-Requirements-Data template for technical specs</p>
                <a href="VOID_PRD_Template.html" class="btn">📄 Open Template</a>
            </div>
            
            <div style="border: 2px solid #00ff99; padding: 20px; border-radius: 8px; background: #f8f9fa;">
                <h3>Implementation Checklist</h3>
                <p>Step-by-step checklist for building and documenting</p>
                <a href="VOID_Implementation_Checklist.html" class="btn">📄 Open Template</a>
            </div>
            
            <div style="border: 2px solid #00ff99; padding: 20px; border-radius: 8px; background: #f8f9fa;">
                <h3>Deep Dive Template</h3>
                <p>Structured template for analyzing results and learnings</p>
                <a href="VOID_Deep_Dive_Template.html" class="btn">📄 Open Template</a>
            </div>
            
            <div style="border: 2px solid #00ff99; padding: 20px; border-radius: 8px; background: #f8f9fa;">
                <h3>Quick Start Guide</h3>
                <p>Complete guide to your first VOID Loop in 7 hours</p>
                <a href="VOID_Quick_Start_Guide.html" class="btn">📄 Open Template</a>
            </div>
        </div>
        
        <div class="tip">
            <h4>💡 How to use these templates:</h4>
            <ol>
                <li><strong>Click on any template</strong> to open it in your browser</li>
                <li><strong>Use Cmd+P (Mac) or Ctrl+P (PC)</strong> to print or save as PDF</li>
                <li><strong>Fill out the sections</strong> directly in the printed/PDF version</li>
                <li><strong>Follow the VOID Loop</strong>: Vision → Objective → Implementation → Deep Dive</li>
            </ol>
        </div>
        
        <div class="footer">
            <p><strong>VoidSEO VOID Loop Templates</strong> • <span class="void-symbol">▌</span></p>
            <p>Build smarter. Dive deeper. • <strong>voidseo.dev</strong></p>
        </div>
    </body>
    </html>
    """
    
    index_path = output_dir / "index.html"
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_html)
    
    print(f"📄 Created HTML index: {index_path}")

if __name__ == "__main__":
    main()
    
