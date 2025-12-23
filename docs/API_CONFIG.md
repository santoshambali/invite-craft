# API Configuration Setup

This document explains how to configure the API service URLs for the application.

## Configuration Files

### 1. API Config (`app/config/api.js`)
This is the centralized configuration file that manages all API endpoints. It reads the base URL from environment variables and provides helper functions for building API URLs.

**Key Features:**
- Centralized endpoint management
- Environment-based configuration
- Helper functions for URL building
- Organized endpoint groups (AUTH, USERS, INVITATIONS, TEMPLATES)

### 2. Environment Variables

The application uses environment variables to configure the API base URL. This allows you to easily switch between different environments (development, staging, production).

#### Setting Up Environment Variables

1. **Create `.env.local` file** in the root directory:
   ```bash
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://192.168.29.200:8080
   ```

2. **For different environments**, you can create:
   - `.env.development` - for development
   - `.env.production` - for production
   - `.env.test` - for testing

#### Environment Variable Reference

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the backend API | `http://192.168.29.200:8080` |

> **Note:** The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

## Usage Examples

### Basic Usage

```javascript
import { buildApiUrl, AUTH, USERS } from '../config/api';

// Login endpoint
const loginUrl = buildApiUrl(AUTH.LOGIN);
// Result: http://192.168.29.200:8080/api/auth/login

// Register endpoint
const registerUrl = buildApiUrl(USERS.REGISTER);
// Result: http://192.168.29.200:8080/api/users/register
```

### Using in Fetch Requests

```javascript
import { buildApiUrl, AUTH } from '../config/api';

const response = await fetch(buildApiUrl(AUTH.LOGIN), {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
});
```

### Dynamic Endpoints

For endpoints that require parameters (like IDs):

```javascript
import { INVITATIONS } from '../config/api';

// Get specific invitation
const invitationId = '123';
const endpoint = INVITATIONS.GET(invitationId);
// Result: /api/invitations/123
```

## Available Endpoint Groups

### AUTH Endpoints
- `AUTH.LOGIN` - `/api/auth/login`
- `AUTH.LOGOUT` - `/api/auth/logout`
- `AUTH.REFRESH` - `/api/auth/refresh`

### USERS Endpoints
- `USERS.REGISTER` - `/api/users/register`
- `USERS.PROFILE` - `/api/users/profile`
- `USERS.UPDATE` - `/api/users/update`

### INVITATIONS Endpoints
- `INVITATIONS.CREATE` - `/api/invitations`
- `INVITATIONS.LIST` - `/api/invitations`
- `INVITATIONS.GET(id)` - `/api/invitations/{id}`
- `INVITATIONS.UPDATE(id)` - `/api/invitations/{id}`
- `INVITATIONS.DELETE(id)` - `/api/invitations/{id}`

### TEMPLATES Endpoints
- `TEMPLATES.LIST` - `/api/templates`
- `TEMPLATES.GET(id)` - `/api/templates/{id}`

## Adding New Endpoints

To add new endpoints, edit `app/config/api.js`:

```javascript
const API_ENDPOINTS = {
    // ... existing endpoints
    
    // Add new endpoint group
    NEW_FEATURE: {
        LIST: '/api/new-feature',
        CREATE: '/api/new-feature',
        GET: (id) => `/api/new-feature/${id}`,
    },
};

// Export the new group
export const { AUTH, USERS, INVITATIONS, TEMPLATES, NEW_FEATURE } = API_ENDPOINTS;
```

## Changing the API Base URL

### For Development
Edit `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### For Production
Set the environment variable in your deployment platform:
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### Restart Required
After changing environment variables, restart the development server:
```bash
npm run dev
```

## Best Practices

1. **Never hardcode URLs** - Always use the config file
2. **Use environment variables** - For different environments
3. **Group related endpoints** - Keep endpoints organized by feature
4. **Document new endpoints** - Update this README when adding endpoints
5. **Validate URLs** - Ensure the base URL doesn't have a trailing slash

## Troubleshooting

### Environment variables not working?
- Ensure the variable starts with `NEXT_PUBLIC_`
- Restart the development server after changes
- Check that `.env.local` is in the root directory (not in `/app`)

### API calls failing?
- Verify the base URL is correct
- Check network connectivity to the API server
- Ensure CORS is properly configured on the backend
- Check browser console for detailed error messages

## Migration Notes

The following files have been updated to use the centralized config:
- ✅ `app/register/page.js`
- ✅ `app/login/page.js`
- ✅ `app/utils/auth.js`

All hardcoded URLs (`http://192.168.29.200:8080`) have been replaced with config-based URLs.
