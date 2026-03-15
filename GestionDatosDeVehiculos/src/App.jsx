import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/common/Layout'
import Login from './components/auth/Login'
import Search from './components/search/Search'
import Results from './components/results/Results'
import Dashboard from './components/dashboard/Dashboard'
import History from './components/history/History'
import Billing from './components/billing/Billing'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Search />} />
        <Route path="resultados/:tipo/:id" element={<Results />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="historial" element={<History />} />
        <Route path="facturacion" element={<Billing />} />
      </Route>
    </Routes>
  )
}

export default App