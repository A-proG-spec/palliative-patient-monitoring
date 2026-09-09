/**
 * Application configuration
 * VITE_USE_MOCK=true → all API calls return fixture data from src/api/mocks/
 * Switching to real backend: set VITE_USE_MOCK=false in .env
 */
export const USE_MOCK = 'true';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Palliative Care System';
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';
