import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'

// Enable React DevTools in development
if (import.meta.env.DEV) {
  const script = document.createElement('script')
  script.src = 'http://localhost:8097'
  document.head.appendChild(script)
}

// Use requestIdleCallback for better performance
const rootElement = document.getElementById("root")
if (rootElement) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
