import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { CreditCard, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const PLANES = [
  {
    id: 'basico',
    nombre: 'Básico',
    precio: 10000,
    creditos: 50,
    popular: false,
    features: ['50 consultas', 'Soporte email', 'Reportes básicos']
  },
  {
    id: 'profesional',
    nombre: 'Profesional',
    precio: 35000,
    creditos: 200,
    popular: true,
    features: ['200 consultas', 'Soporte prioritario', 'API access', 'Reportes avanzados', 'Alertas automáticas']
  },
  {
    id: 'enterprise',
    nombre: 'Enterprise',
    precio: 99000,
    creditos: 1000,
    popular: false,
    features: ['1000 consultas', 'Soporte 24/7', 'API dedicada', 'White label', 'SLA garantizado']
  }
]

const RECARGAS = [
  { creditos: 10, precio: 5000 },
  { creditos: 25, precio: 10000 },
  { creditos: 50, precio: 18000 },
  { creditos: 100, precio: 30000 }
]

export default function Billing() {
  const { cliente } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  
  const handleComprar = async (tipo, item) => {
    setLoading(true)
    
    // Aquí integrarías Webpay/Fpay
    try {
      // Simulación de pago
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`¡Compra exitosa! Se agregaron ${item.creditos} créditos a tu cuenta`)
      // Recargar datos del cliente...
    } catch (error) {
      toast.error('Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Créditos y Facturación</h1>
        <p className="text-gray-600">Gestiona tu plan y recarga créditos</p>
      </div>
      
      {/* Créditos actuales */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 mb-1">Créditos disponibles</p>
            <p className="text-4xl font-bold">{cliente?.creditosRestantes || 0}</p>
            <p className="text-sm text-primary-200 mt-2">Plan actual: {cliente?.plan}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-200">Consumidos este mes</p>
            <p className="text-2xl font-semibold">{cliente?.creditosConsumidosMes || 0}</p>
          </div>
        </div>
      </div>
      
      {/* Planes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANES.map((plan) => (
            <div 
              key={plan.id}
              className={`relative rounded-xl border-2 p-6 transition-all ${
                cliente?.plan === plan.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 bg-white'
              } ${plan.popular ? 'shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MÁS POPULAR
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="font-bold text-lg text-gray-900">{plan.nombre}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ${plan.precio.toLocaleString('es-CL')}
                  </span>
                  <span className="text-gray-500">/mes</span>
                </div>
                <p className="text-sm text-primary-600 font-medium mt-1">
                  {plan.creditos} créditos incluidos
                </p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleComprar('plan', plan)}
                disabled={loading || cliente?.plan === plan.id}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  cliente?.plan === plan.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {cliente?.plan === plan.id ? 'Plan Actual' : 'Seleccionar Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recarga rápida */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recarga Rápida de Créditos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {RECARGAS.map((recarga) => (
            <button
              key={recarga.creditos}
              onClick={() => handleComprar('recarga', recarga)}
              disabled={loading}
              className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all text-center group"
            >
              <div className="text-2xl font-bold text-gray-900 group-hover:text-primary-600">
                {recarga.creditos}
              </div>
              <div className="text-sm text-gray-500">créditos</div>
              <div className="mt-2 font-medium text-primary-600">
                ${recarga.precio.toLocaleString('es-CL')}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Métodos de pago */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Métodos de Pago Aceptados
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-700">
            Webpay Plus
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-700">
            OnePay
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-700">
            Transferencia
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Los pagos se procesan de forma segura a través de Transbank. 
          Las facturas se emiten automáticamente al RUT registrado.
        </p>
      </div>
    </div>
  )
}