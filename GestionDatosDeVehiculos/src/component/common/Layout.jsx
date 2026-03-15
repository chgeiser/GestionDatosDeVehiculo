import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { 
  Search, 
  LayoutDashboard, 
  History, 
  CreditCard, 
  LogOut, 
  Shield,
  AlertCircle
} from 'lucide-react'

export default function Layout() {
  const { user, cliente, logout } = useAuthStore()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  const navItems = [
    { to: '/', icon: Search, label: 'Buscar' },
    { to: '/historial', icon: History, label: 'Historial' },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/facturacion', icon: CreditCard, label: 'Créditos' },
  ]
  
  const getPlanColor = (plan) => {
    switch(plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      case 'profesional': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 text-primary-700">
            <Shield className="w-8 h-8" />
            <span className="font-bold text-xl">TrazApp</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t space-y-4">
          {/* Info de créditos */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90">Créditos disponibles</div>
            <div className="text-2xl font-bold">{cliente?.creditosRestantes || 0}</div>
            <div className="text-xs opacity-75 mt-1">Plan {cliente?.plan}</div>
          </div>
          
          {/* Info de usuario */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-medium">
                {user?.nombre?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nombre}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {cliente?.nombre}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm w-full px-2 py-2 rounded hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}