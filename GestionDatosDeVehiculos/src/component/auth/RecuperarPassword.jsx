// src/components/auth/RecuperarPassword.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { 
  Mail, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function RecuperarPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await api.post('/auth/forgot-password', { email })
      setIsSuccess(true)
      toast.success('Revisa tu correo electrónico')
    } catch (err) {
      setError('Error al procesar la solicitud. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Email enviado!</h1>
          <p className="text-gray-600 mb-6">
            Hemos enviado instrucciones para restablecer tu contraseña a <strong>{email}</strong>.
            Revisa tu bandeja de entrada y carpeta de spam.
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al login
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
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
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
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