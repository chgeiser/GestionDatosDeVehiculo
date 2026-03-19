// src/components/auth/ResetPassword.jsx
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Shield,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  
  useEffect(() => {
    if (!token) {
      setIsValidating(false)
      return
    }
    
    api.get(`/auth/validate-reset-token?token=${token}`)
      .then(response => {
        setIsTokenValid(response.data.data)
      })
      .catch(() => {
        setIsTokenValid(false)
      })
      .finally(() => {
        setIsValidating(false)
      })
  }, [token])
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!password || password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres'
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: password
      })
      
      setIsSuccess(true)
      toast.success('Contraseña actualizada correctamente')
      
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setErrors({ general: 'Error al actualizar la contraseña. El enlace puede haber expirado.' })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }
  
  if (!token || !isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido</h1>
          <p className="text-gray-600 mb-6">
            Este enlace de recuperación ha expirado o ya fue utilizado.
            Solicita uno nuevo.
          </p>
          <Link 
            to="/recuperar-password"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    )
  }
  
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h1>
          <p className="text-gray-600 mb-6">
            Tu contraseña ha sido cambiada exitosamente. 
            Serás redirigido al inicio de sesión...
          </p>
          <Link 
            to="/login"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            Ir al login ahora
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva contraseña</h1>
          <p className="text-gray-600 mt-1">Crea una contraseña segura</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl outline-none transition-all ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl outline-none transition-all ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar contraseña'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}