import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DataEditorPage from './components/manager/DataEditorPage.jsx'
import ErrorBoundary from './components/shared/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <DataEditorPage />
    </ErrorBoundary>
  </StrictMode>,
)
