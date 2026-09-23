/**
 * apiConfig.js
 * Automatically resolves the backend API URL.
 * - In local development: uses http://localhost:3001 or REACT_APP_BACKEND_URL
 * - In production on Vercel: uses same-origin ("") so requests go to /api directly,
 *   completely eliminating cross-origin CORS preflight overhead and failures.
 */
export const getBackendUrl = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname
    if (host === "localhost" || host === "127.0.0.1") {
      return process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"
    }
    // In production on Vercel, API is served directly at /api on the same host
    return ""
  }
  return process.env.REACT_APP_BACKEND_URL || ""
}

export default getBackendUrl
