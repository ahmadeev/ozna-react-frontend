import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
/*  <StrictMode>
    <App />
  </StrictMode>,*/

    // StrictMode вызывает двойной рендер, из-за чего на сервере кидает ошибку в сокетах
    <App />
)
