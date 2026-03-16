import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// StrictMode removed — @react-three/fiber (drei/Canvas) is not StrictMode-safe
// in Vite 5 production builds. Causes "r is not a function" at MessagePort.
// See: https://github.com/pmndrs/react-three-fiber/issues/2790
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
