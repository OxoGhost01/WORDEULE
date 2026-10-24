import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/home.jsx'
import { BrowserRouter } from 'react-router'
import LanguageProvider from './i18n/LanguageProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <LanguageProvider>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </LanguageProvider>
    </>
  </StrictMode>,
)
