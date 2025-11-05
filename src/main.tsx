/**
 * APPLICATION ENTRY POINT
 *
 * Purpose:
 * - Main entry point for the React application
 * - Mounts the root App component to the DOM
 *
 * Dependencies:
 * - React DOM for rendering
 * - App.tsx (main application router)
 * - index.css (global styles)
 *
 * Database Interactions:
 * - None (this file only handles initial app mounting)
 *
 * Flow Position:
 * - First file loaded when application starts
 * - Renders App.tsx which manages all routing
 */

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <App />
);