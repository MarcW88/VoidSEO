# 🔍 PAA Explorer - Real App

> Scrape and cluster People Also Ask questions with AI-powered analysis

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/voidseo/paa-explorer-app)

## 🚀 **Live Demo**

**App**: [paa-explorer.netlify.app](https://paa-explorer.netlify.app)  
**Marketing**: [voidseo.dev/apps/paa-explorer](https://voidseo.dev/apps/paa-explorer)

## ✨ **Features**

- 🔍 **Real Google PAA Scraping** with Playwright
- 🧠 **AI-Powered Clustering** using OpenAI embeddings  
- 📊 **Interactive Results** with modern UI
- 📱 **Mobile Responsive** design
- ⚡ **Serverless Architecture** on Netlify
- 🆓 **Free Tier** with quotas

## 🛠 **Tech Stack**

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python, Netlify Functions
- **AI**: OpenAI text-embedding-ada-002
- **Clustering**: scikit-learn (K-means, DBSCAN)
- **Scraping**: Playwright (headless Chrome)
- **Deployment**: Netlify (100% serverless)

## 🚀 **Quick Deploy**

### **1-Click Netlify Deploy**
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/voidseo/paa-explorer-app)

### **Manual Deploy**
1. Fork this repo
2. Connect to Netlify
3. Add environment variable: `OPENAI_API_KEY`
4. Deploy!

## ⚙️ **Environment Variables**

```bash
OPENAI_API_KEY=sk-your-openai-key-here
```

## 🧪 **Local Development**

```bash
# Clone repo
git clone https://github.com/voidseo/paa-explorer-app.git
cd paa-explorer-app

# Install dependencies
pip install -r requirements.txt

# Set environment variable
export OPENAI_API_KEY="sk-your-key"

# Serve locally
python -m http.server 8080
```

## 📊 **API Endpoints**

- `POST /.netlify/functions/jobs` - Create analysis job
- `GET /.netlify/functions/jobs` - Health check

## 💰 **Costs**

- **Netlify**: Free (100GB bandwidth)
- **OpenAI**: ~$0.001 per analysis
- **Total**: ~$1/month for 1000 analyses

## 🔒 **Security & Quotas**

- Rate limiting: 60 requests/minute
- Free tier: 3 analyses/day
- API key secured in environment variables
- CORS enabled for web access

## 📈 **Built with VOID Loop**

This app demonstrates the [VOID Loop methodology](https://voidseo.dev/framework):

- **V**ision: Solve PAA analysis complexity
- **O**bjective: Cluster questions semantically  
- **I**mplementation: Serverless + AI architecture
- **D**eep Dive: Real-world usage insights

## 🤝 **Contributing**

1. Fork the repo
2. Create feature branch
3. Make changes
4. Submit pull request

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file

## 🔗 **Links**

- **VoidSEO**: [voidseo.dev](https://voidseo.dev)
- **Framework**: [voidseo.dev/framework](https://voidseo.dev/framework)
- **Apps**: [voidseo.dev/apps](https://voidseo.dev/apps)

---

Built with ❤️ by [VoidSEO](https://voidseo.dev)
