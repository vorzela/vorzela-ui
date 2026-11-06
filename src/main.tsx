import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '~/styles/global.scss'
import './docs/demo-globals.scss'
import App from './App'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element #root was not found.')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
