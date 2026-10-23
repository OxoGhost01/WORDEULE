import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/home.jsx'
import { BrowserRouter } from 'react-router'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <BrowserRouter>
      <Home />
      </BrowserRouter>
    </>
  </StrictMode>,
)
