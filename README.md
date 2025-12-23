# InviteCraft - Digital Invitation Platform

A modern Next.js application for creating, customizing, and managing digital invitations with AI-powered generation and beautiful templates.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend Invitation Service running on `http://localhost:8080`
- Environment variables configured

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_BASE_URL
```

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📚 Documentation

- **[Quick Start Guide](./docs/QUICK_START.md)** - Get up and running quickly
- **[Invitation Service Integration](./docs/INVITATION_SERVICE_INTEGRATION.md)** - Detailed API integration docs
- **[Example Code](./app/examples/InvitationExample.js)** - Code examples and patterns

## 🏗️ Project Structure

```
app/
├── components/          # Reusable UI components
├── config/             # Configuration files (API endpoints, etc.)
├── create/             # Invitation creation pages
│   ├── ai/            # AI-powered generation
│   └── templates/     # Template selection
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── utils/              # Utility functions
├── preview/            # Invitation preview/editor
└── examples/           # Example code and patterns

docs/                   # Documentation
public/                 # Static assets
```

## ✨ Features

- 🎨 **Template Library** - Browse and customize professional templates
- ✨ **AI Generation** - Generate invitations with AI
- 🖼️ **Image Upload** - Automatic upload to Google Cloud Storage
- 💾 **Auto-Save** - Invitations saved to backend API
- 📱 **Responsive Design** - Works on all devices
- 🎯 **Real-time Preview** - See changes instantly
- 📥 **Download** - Export invitations as images

## 🔧 Technology Stack

- **Frontend**: Next.js 15, React 19
- **Styling**: CSS Modules
- **Image Processing**: html-to-image
- **Backend Integration**: REST API with JWT authentication
- **Storage**: Google Cloud Storage (via signed URLs)

## 🔌 API Integration

The application integrates with the Invitation Service backend API:

- **Base URL**: Configured via `NEXT_PUBLIC_API_BASE_URL`
- **Authentication**: JWT tokens stored in localStorage
- **Endpoints**: `/api/v1/invitations/*`
- **Documentation**: [Swagger UI](http://localhost:8080/swagger-ui/index.html)

### Key Services

- `invitationService.js` - Handles all invitation API operations
- `useInvitation` hook - React hook for invitation management
- API configuration in `app/config/api.js`

## 🧪 Testing

### Test the Integration

1. Ensure backend is running on `http://localhost:8080`
2. Start the frontend: `npm run dev`
3. Create an invitation via UI
4. Check browser console for API calls
5. Verify in Swagger UI

### Debug Mode

Check browser console for detailed logs of:
- API requests/responses
- Error messages
- State changes

## 🐛 Troubleshooting

Common issues and solutions:

- **"Failed to save invitation"** - Check backend is running and API URL is correct
- **"Unable to generate image"** - Verify html-to-image is installed
- **CORS errors** - Ensure backend allows frontend origin

See [Quick Start Guide](./docs/QUICK_START.md) for detailed troubleshooting.

## 📖 Learn More

To learn more about Next.js:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub repository](https://github.com/vercel/next.js)

## 🚀 Deployment

### Environment Variables

Set these in your deployment platform:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

### Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

---

**Version:** 1.0.0  
**Last Updated:** December 23, 2025

