import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RotaProtegida from './components/auth/RotaProtegida'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ApenadoPage from './pages/ApenadoPage'
import ExecucaoPage from './pages/ExecucaoPage'
import ExecucoesPage from './pages/ExecucoesPage'
import EditarExecucaoPage from './pages/EditarExecucaoPage'
import PerfilPage from './pages/PerfilPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/home" element={<RotaProtegida><HomePage /></RotaProtegida>} />
        <Route path="/apenados" element={<RotaProtegida><ApenadoPage /></RotaProtegida>} />
        <Route path="/execucao" element={<RotaProtegida><ExecucaoPage /></RotaProtegida>} />
        <Route path="/execucoes" element={<RotaProtegida><ExecucoesPage /></RotaProtegida>} />
        <Route path="/execucoes/:id/editar" element={<RotaProtegida><EditarExecucaoPage /></RotaProtegida>} />
        <Route path="/perfil" element={<RotaProtegida><PerfilPage /></RotaProtegida>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
