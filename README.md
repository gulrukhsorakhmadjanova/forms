# Form Builder

A modern React application for creating, sharing, and analyzing custom forms and surveys.

## Features

- **Theme Toggle**: Professional light/dark mode with system preference detection
- **Multi-language Support**: English, Uzbek, and Russian
- **Form Creation**: Create custom forms with various question types
- **User Management**: Admin panel for user management
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Instant theme and language switching

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env

```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with your Appwrite configuration
3. Start the development server:
   ```bash
   npm run dev
   ```

## Theme Features

- **Automatic Detection**: Detects system dark/light mode preference
- **Manual Toggle**: Click the theme button in the header to switch themes
- **Persistent Storage**: Your theme preference is saved locally
- **Smooth Transitions**: All theme changes include smooth animations
- **Accessibility**: Full keyboard navigation and screen reader support

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

If you're having issues with login or data fetching:

1. Check that all environment variables are set correctly
2. Verify your Appwrite project configuration
3. Ensure your database collections exist and have proper permissions
4. Check the browser console for detailed error messages
5. Use the debug section on the login page (development mode only)

---
