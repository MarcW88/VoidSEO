#!/usr/bin/env python3
"""
VoidSEO Template PDF Generator
Converts markdown templates to styled PDFs with VoidSEO branding
"""

import markdown
from weasyprint import HTML, CSS
from pathlib import Path
import os

def create_pdf_style():
    """Create CSS styling for VoidSEO branded PDFs"""
    return """
    @page {
        size: A4;
        margin: 2cm 1.5cm;
        @top-center {
            content: "VoidSEO ▌ VOID Loop Templates";
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 10px;
            color: #666;
        }
        @bottom-center {
            content: counter(page) " / " counter(pages);
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 10px;
            color: #666;
        }
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        line-height: 1.6;
        color: #1a1a1a;
        background: white;
        max-width: none;
        margin: 0;
        padding: 0;
    }
    
    .header {
        background: #0a0a0a;
        color: #00ff99;
        padding: 20px;
        margin: -2cm -1.5cm 30px -1.5cm;
        text-align: center;
    }
    
    .header h1 {
        margin: 0;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 24px;
        font-weight: bold;
    }
    
    .header .subtitle {
        margin: 5px 0 0 0;
        font-size: 14px;
        color: #cccccc;
        font-family: 'Monaco', 'Menlo', monospace;
    }
    
    .void-symbol {
        color: #00ff99;
        font-family: 'Monaco', 'Menlo', monospace;
        font-weight: bold;
    }
    
    h1 {
        color: #0a0a0a;
        font-size: 28px;
        font-weight: 700;
        margin: 30px 0 20px 0;
        border-bottom: 2px solid #00ff99;
        padding-bottom: 10px;
    }
    
    h2 {
        color: #0a0a0a;
        font-size: 20px;
        font-weight: 600;
        margin: 25px 0 15px 0;
        padding-left: 10px;
        border-left: 4px solid #00ff99;
    }
    
    h3 {
        color: #333;
        font-size: 16px;
        font-weight: 600;
        margin: 20px 0 10px 0;
    }
    
    h4 {
        color: #555;
        font-size: 14px;
        font-weight: 600;
        margin: 15px 0 8px 0;
    }
    
    p {
        margin: 10px 0;
        text-align: justify;
    }
    
    blockquote {
        background: #f8f9fa;
        border-left: 4px solid #00ff99;
        margin: 20px 0;
        padding: 15px 20px;
        font-style: italic;
        color: #555;
    }
    
    blockquote p {
        margin: 0;
    }
    
    ul, ol {
        margin: 15px 0;
        padding-left: 25px;
    }
    
    li {
        margin: 8px 0;
    }
    
    code {
        background: #f1f3f4;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
        color: #d73a49;
    }
    
    pre {
        background: #0a0a0a;
        color: #00ff99;
        padding: 15px;
        border-radius: 5px;
        overflow-x: auto;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
        margin: 20px 0;
    }
    
    pre code {
        background: none;
        padding: 0;
        color: inherit;
    }
    
    .checkbox-list {
        list-style: none;
        padding-left: 0;
    }
    
    .checkbox-list li {
        position: relative;
        padding-left: 25px;
        margin: 10px 0;
    }
    
    .checkbox-list li:before {
        content: "☐";
        position: absolute;
        left: 0;
        color: #00ff99;
        font-weight: bold;
        font-size: 14px;
    }
    
    .fill-area {
        border: 1px dashed #ccc;
        background: #fafafa;
        padding: 15px;
        margin: 10px 0;
        min-height: 40px;
        border-radius: 3px;
    }
    
    .fill-area:before {
        content: "✏️ Fill this section:";
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 8px;
        font-weight: 600;
    }
    
    .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #eee;
        text-align: center;
        font-size: 12px;
        color: #666;
        font-family: 'Monaco', 'Menlo', monospace;
    }
    
    .page-break {
        page-break-before: always;
    }
    
    .no-break {
        page-break-inside: avoid;
    }
    
    strong {
        color: #0a0a0a;
        font-weight: 600;
    }
    
    em {
        color: #555;
        font-style: italic;
    }
    
    hr {
        border: none;
        border-top: 2px solid #eee;
        margin: 30px 0;
    }
    """

def markdown_to_html(md_content, template_name):
    """Convert markdown content to styled HTML"""
    
    # Convert markdown to HTML
    html_content = markdown.markdown(md_content, extensions=['extra', 'codehilite'])
    
    # Add fill areas for empty sections
    html_content = html_content.replace('- **Project/Module name:** ', 
        '- **Project/Module name:** <div class="fill-area"></div>')
    html_content = html_content.replace('- **Author / Team:** ', 
        '- **Author / Team:** <div class="fill-area"></div>')
    html_content = html_content.replace('- **Date:** ', 
        '- **Date:** <div class="fill-area"></div>')
    
    # Convert checkboxes
    html_content = html_content.replace('<li>[ ]', '<li class="checkbox-item">☐')
    html_content = html_content.replace('- [ ]', '<li class="checkbox-item">☐')
    
    # Create full HTML document
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{template_name} - VoidSEO</title>
    </head>
    <body>
        <div class="header">
            <h1>VoidSEO <span class="void-symbol">▌</span></h1>
            <div class="subtitle">{template_name}</div>
        </div>
        
        <div class="content">
            {html_content}
        </div>
        
        <div class="footer">
            <p>Generated by VoidSEO VOID Loop Templates • <strong>voidseo.dev</strong></p>
            <p>Build smarter. Dive deeper. <span class="void-symbol">▌</span></p>
        </div>
    </body>
    </html>
    """
    
    return full_html

def generate_pdf(md_file_path, output_dir):
    """Generate PDF from markdown file"""
    
    # Read markdown file
    with open(md_file_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Get template name
    template_name = Path(md_file_path).stem.replace('VOID_', '').replace('_', ' ')
    
    # Convert to HTML
    html_content = markdown_to_html(md_content, template_name)
    
    # Create CSS
    css_content = create_pdf_style()
    
    # Generate PDF
    output_path = output_dir / f"{Path(md_file_path).stem}.pdf"
    
    try:
        HTML(string=html_content).write_pdf(
            output_path,
            stylesheets=[CSS(string=css_content)]
        )
        print(f"✅ Generated: {output_path}")
        return True
    except Exception as e:
        print(f"❌ Error generating {output_path}: {e}")
        return False

def main():
    """Main function to generate all PDF templates"""
    
    # Setup paths
    base_dir = Path(__file__).parent
    output_dir = base_dir / "templates" / "pdf"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Template files to convert
    template_files = [
        "VOID_Vision_Template.md",
        "VOID_PRD_Template.md", 
        "VOID_Implementation_Checklist.md",
        "VOID_Deep_Dive_Template.md",
        "VOID_Quick_Start_Guide.md"
    ]
    
    print("🚀 Generating VoidSEO PDF Templates...")
    print("=" * 50)
    
    success_count = 0
    
    for template_file in template_files:
        file_path = base_dir / template_file
        if file_path.exists():
            if generate_pdf(file_path, output_dir):
                success_count += 1
        else:
            print(f"⚠️  File not found: {template_file}")
    
    print("=" * 50)
    print(f"✨ Generated {success_count}/{len(template_files)} PDF templates")
    print(f"📁 Output directory: {output_dir}")
    
    # Create a combined PDF index
    create_pdf_index(output_dir)

def create_pdf_index(output_dir):
    """Create an index HTML file for all PDFs"""
    
    index_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>VoidSEO PDF Templates</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
            .header { background: #0a0a0a; color: #00ff99; padding: 20px; text-align: center; margin-bottom: 30px; }
            .template-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .template-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
            .template-card h3 { margin-top: 0; color: #0a0a0a; }
            .download-btn { background: #00ff99; color: #0a0a0a; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>VoidSEO ▌ PDF Templates</h1>
            <p>Professional templates for the VOID Loop methodology</p>
        </div>
        
        <div class="template-list">
            <div class="template-card">
                <h3>Vision Template</h3>
                <p>1-page brief to capture context, pattern, and target impact</p>
                <a href="VOID_Vision_Template.pdf" class="download-btn">Download PDF</a>
            </div>
            
            <div class="template-card">
                <h3>PRD Template</h3>
                <p>Problem-Requirements-Data template for technical specs</p>
                <a href="VOID_PRD_Template.pdf" class="download-btn">Download PDF</a>
            </div>
            
            <div class="template-card">
                <h3>Implementation Checklist</h3>
                <p>Step-by-step checklist for building and documenting</p>
                <a href="VOID_Implementation_Checklist.pdf" class="download-btn">Download PDF</a>
            </div>
            
            <div class="template-card">
                <h3>Deep Dive Template</h3>
                <p>Structured template for analyzing results and learnings</p>
                <a href="VOID_Deep_Dive_Template.pdf" class="download-btn">Download PDF</a>
            </div>
            
            <div class="template-card">
                <h3>Quick Start Guide</h3>
                <p>Complete guide to your first VOID Loop in 7 hours</p>
                <a href="VOID_Quick_Start_Guide.pdf" class="download-btn">Download PDF</a>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px; color: #666;">
            <p>Generated by VoidSEO • <strong>voidseo.dev</strong></p>
        </div>
    </body>
    </html>
    """
    
    index_path = output_dir / "index.html"
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_html)
    
    print(f"📄 Created PDF index: {index_path}")

if __name__ == "__main__":
    main()
