import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App.jsx'
import { OSProvider } from './context/OSContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <OSProvider>
            <App />
            <Analytics />
            <SpeedInsights />
        </OSProvider>
    </React.StrictMode>,
)