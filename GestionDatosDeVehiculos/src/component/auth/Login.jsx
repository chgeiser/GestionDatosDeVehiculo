import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido'
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        toast.success('¡Bienvenido de vuelta!', {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
        })
        navigate('/', { replace: true })
      } else {
        toast.error(result.error || 'Error al iniciar sesión', {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />
        })
        setErrors({ general: result.error })
      }
    } catch (error) {
      toast.error('Error de conexión. Intenta nuevamente.')
      setErrors({ general: 'Error de conexión' })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo y branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TrazApp Chile</h1>
          <p className="text-gray-600 mt-1">Sistema de Trazabilidad Vehicular</p>
        </div>
        
        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Iniciar sesión</h2>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa tus credenciales para acceder
            </p>
          </div>
          
          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Error general */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}
            
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all outline-none ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>
            
            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all outline-none ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>
            
            {/* Opciones adicionales */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Recordarme</span>
              </label>
              
              <Link 
                to="/recuperar-password" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            
            {/* Botón submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
          
          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-primary-600 hover:text-primary-700 font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
        
        {/* Info legal */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2026 TrazApp Chile. Todos los derechos reservados.
          </p>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
            <Link to="/privacidad" className="hover:text-gray-600">Política de Privacidad</Link>
            <span>•</span>
            <Link to="/terminos" className="hover:text-gray-600">Términos de Servicio</Link>
          </div>
        </div>
      </div>
    </div>
  )
}