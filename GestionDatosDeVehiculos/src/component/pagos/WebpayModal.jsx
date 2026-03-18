// src/components/pagos/WebpayModal.jsx
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../services/api'
import { X, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WebpayModal({ isOpen, onClose, tipo, plan, creditos, monto }) {
  const [step, setStep] = useState('confirm') // confirm, processing, success, error
  
  const iniciarPago = useMutation({
    mutationFn: async () => {
      const response = await api.post('/pagos/iniciar', {
        tipo,
        planId: plan?.id,
        creditos
      })
      return response.data.data
    },
    onSuccess: (data) => {
      // Redirigir a Webpay
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.url
      
      const tokenInput = document.createElement('input')
      tokenInput.type = 'hidden'
      tokenInput.name = 'token_ws'
      tokenInput.value = data.token
      
      form.appendChild(tokenInput)
      document.body.appendChild(form)
      form.submit()
    },
    onError: (error) => {
      toast.error('Error al iniciar el pago')
      setStep('error')
    }
  })
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {step === 'confirm' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Compra</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Producto:</span>
                <span className="font-medium">
                  {tipo === 'PLAN' ? `Plan ${plan.nombre}` : `${creditos} créditos`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary-600">
                  ${monto.toLocaleString('es-CL')}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => iniciarPago.mutate()}
                disabled={iniciarPago.isPending}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {iniciarPago.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Pagar con Webpay'
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Serás redirigido a la pasarela de pago segura de Transbank
            </p>
          </>
        )}
      </div>
    </div>
  )
}