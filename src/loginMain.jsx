import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoginPage from './components/auth/LoginPage.jsx'
import ErrorBoundary from './components/shared/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <LoginPage />
    </ErrorBoundary>
  </StrictMode>,
)
