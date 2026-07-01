import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'
import { createClientAdapter } from './lib/adapter'

const clientAdapter = createClientAdapter()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App adapter={clientAdapter} />
  </React.StrictMode>,
)
