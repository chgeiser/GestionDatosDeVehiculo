import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { 
  Mail, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un email válido')
      return
    }
    
    setIsLoading(true)
    
    try {
      await api.post('/auth/forgot-password', { email })
      setIsSuccess(true)
      toast.success('Instrucciones enviadas a tu email')
    } catch (err) {
      // No mostrar error específico por seguridad
      setIsSuccess(true) // Mostrar éxito igual para no revelar existencia
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Revisa tu email!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Si existe una cuenta asociada a <strong>{email}</strong>, 
            recibirás instrucciones para recuperar tu contraseña en los próximos minutos.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-amber-800">
              <strong>⚠️ No olvides revisar:</strong>
            </p>
            <ul className="text-sm text-amber-700 mt-2 list-disc list-inside">
              <li>Carpeta de spam o correo no deseado</li>
              <li>Filtros de correo</li>
              <li>El enlace expira en 1 hora</li>
            </ul>
          </div>
          
          <Link 
            to="/login"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p className="text-gray-600 mt-1">
            Ingresa tu email y te enviaremos instrucciones
          </p>
        </div>
        
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl border p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar instrucciones'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}