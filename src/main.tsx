import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'
import type { SorokitClient } from './lib/client.ts'
import { createMockClient } from './lib/mock-client'

// Initialize mock client for development
const client = createMockClient() as SorokitClient

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App client={client} />
  </React.StrictMode>,
)
