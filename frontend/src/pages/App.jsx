import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ApenadoPage from './pages/ApenadoPage'
import ExecucaoPage from './pages/ExecucaoPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/apenados" element={<ApenadoPage />} />
        <Route path="/execucao" element={<ExecucaoPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
