# 📚 DocuHub Admin Dashboard

> A modern Next.js admin dashboard for managing academic papers, students, advisers, and research proposals deployed on Google Cloud Platform.

![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.13-38B2AC?logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

---

## 🚀 Features

- 📊 **Dashboard Analytics** - Real-time statistics and charts
- 📄 **Paper Management** - Upload, review, and approve research papers
- 👨‍🎓 **Student Management** - Track student progress and submissions
- 👨‍🏫 **Adviser Management** - Manage academic advisers and assignments
- 📝 **Proposal System** - Review and approve research proposals
- 🔐 **Authentication** - Secure NextAuth.js authentication
- 🌐 **Internationalization** - Multi-language support (English & Khmer)
- 🌙 **Dark Mode** - Built-in theme switching
- 📱 **Responsive Design** - Mobile-first approach

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 15.5.0 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 19.1.0
- **Styling:** TailwindCSS 4.1.13
- **Components:** Radix UI, Shadcn/ui
- **State Management:** Redux Toolkit
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **PDF Handling:** React-PDF, PDF.js, PDF-lib

### Backend Integration

- **Authentication:** NextAuth.js
- **API Client:** Custom fetch utilities
- **Real-time:** STOMP.js, SockJS

### DevOps

- **Containerization:** Docker (Multi-stage build)
- **Cloud Platform:** Google Cloud Platform (GCE VM)
- **CI/CD:** GitHub Actions
- **Deployment:** Automated with health checks & rollback

---

## 📦 Installation

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **Docker** (for containerized deployment)

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/FSWD-GEN-01/ipub-admin-frontend.git
cd ipub-admin-frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

4. **Run development server**

```bash
npm run dev
```

5. **Open in browser**

```
http://localhost:3000
```

---

## 🐳 Docker Deployment

### Build and Run Locally

```bash
# Build the Docker image
docker build -t docuhub-frontend .

# Run the container
docker run -d -p 3000:3000 --name docuhub-admin docuhub-frontend
```

### Using Docker Compose (Recommended for Local Dev)

```bash
docker-compose up -d
```

---

## 🚀 Production Deployment (GCP)

This project uses **GitHub Actions** for automated deployment to Google Cloud Platform.

### Setup GitHub Secrets

Add these secrets to your repository:

- `GCE_VM_IP` - Your GCP VM IP address
- `GCE_VM_USER` - SSH username
- `GCE_SSH_PRIVATE_KEY` - SSH private key
- `PAT_TOKEN` - GitHub Personal Access Token
- `NEXTAUTH_SECRET` - NextAuth secret key
- `API_URL` - Your backend API URL

### Deployment Process

1. Push to `main` branch
2. GitHub Actions automatically:
   - Builds optimized Docker image
   - Tests the new container
   - Performs health checks
   - Switches traffic (zero-downtime)
   - Rolls back on failure

---

## 📁 Project Structure

```
ipub-admin-frontend/
├── .github/
│   └── workflows/
│       └── frontend.yml        # CI/CD pipeline
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # Admin routes
│   │   ├── (auth)/            # Auth routes
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn components
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── papers/           # Paper management
│   │   └── ...
│   ├── lib/                   # Utilities & API clients
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Auth middleware
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Local development setup
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS config
└── package.json              # Dependencies

```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
```

---

## 🌐 Environment Variables

Required environment variables (see `.env.example`):

```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# API Configuration
NEXT_PUBLIC_API_URL=https://api.example.com

# Optional: Database (if using NextAuth with DB)
# DATABASE_URL=postgresql://...
```

---

## 🔐 Security Features

- ✅ **HTTPS Only** (in production)
- ✅ **Security Headers** (CSP, HSTS, X-Frame-Options)
- ✅ **Authentication Middleware**
- ✅ **Non-root Docker User**
- ✅ **Environment Variable Protection**
- ✅ **API Route Protection**

---

## 📊 Performance Optimizations

- ⚡ **Multi-stage Docker Build** - 60% smaller images
- ⚡ **Docker BuildKit Caching** - 3x faster builds
- ⚡ **Next.js Image Optimization**
- ⚡ **CSS Optimization**
- ⚡ **Code Splitting** - Automatic route-based splitting
- ⚡ **Tree Shaking** - Remove unused code

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👥 Team

### Development Team

- Pho Hongleap
- Peng Seang Sim
- Sorn Sophamarinet
- Khim Sokha
- Butsea Vthong
- Kry Sobothty
- Vannarith Vr
- Chim Theara

### Mentors

- Eung Lyzhia
- Kim Chansokpheng

---

## 📄 License

This project is licensed under the ISC License.

---

## 🆘 Support

For support, please contact the development team or open an issue on GitHub.

---

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] PDF annotation system
- [ ] Email notification system
- [ ] Mobile app integration
- [ ] Multi-tenant support

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- CSTAD Pre-University Training Program

---

**Built with ❤️ by the DocuHub Team**
