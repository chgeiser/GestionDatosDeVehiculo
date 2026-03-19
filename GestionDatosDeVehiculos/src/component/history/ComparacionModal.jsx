// src/components/history/ComparacionModal.jsx
import { useQuery } from '@tanstack/react-query'
import { historyService } from '../../services/api'
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

const SEVERIDAD_CONFIG = {
  'CRITICA': { 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: ShieldAlert,
    label: 'Crítico'
  },
  'ADVERTENCIA': { 
    color: 'bg-amber-100 text-amber-800 border-amber-200', 
    icon: AlertTriangle,
    label: 'Advertencia'
  },
  'POSITIVA': { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: ShieldCheck,
    label: 'Positivo'
  },
  'INFORMATIVA': { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Info,
    label: 'Informativo'
  }
}

const TIPO_CONFIG = {
  'ESTADO_ROBO': { label: 'Estado de Robo', descripcion: 'Cambio en denuncias de robo' },
  'GRAVAMENES': { label: 'Gravámenes', descripcion: 'Nuevas cargas o liberaciones' },
  'REVISION_TECNICA': { label: 'Revisión Técnica', descripcion: 'Cambio en estado de RT' },
  'CAMBIO_PROPIETARIO': { label: 'Propietario', descripcion: 'Transferencia de dominio' }
}

export default function ComparacionModal({ identificador, tipoId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['comparacion', identificador, tipoId],
    queryFn: () => historyService.getComparacion(identificador, tipoId),
    staleTime: 1000 * 60 * 5
  })
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    )
  }
  
  const resultado = data?.data
  
  if (!resultado?.tieneHistorial) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin historial previo</h3>
          <p className="text-gray-600 mb-4">{resultado?.mensaje}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Entendido
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b sticky top-0 bg-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Evolución del Vehículo
            </h3>
            <p className="text-sm text-gray-500 font-mono">{identificador}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Timeline */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-500">Consulta anterior</div>
              <div className="font-medium">
                {format(new Date(resultado.fechaConsultaAnterior), 'dd/MM/yyyy', { locale: es })}
              </div>
              <div className="text-xs text-gray-400">
                {format(new Date(resultado.fechaConsultaAnterior), 'HH:mm')}
              </div>
            </div>
            
            <div className="flex-1 flex items-center gap-2">
              <div className="h-0.5 flex-1 bg-gray-300" />
              <div className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                {resultado.diasEntreConsultas} días después
              </div>
              <div className="h-0.5 flex-1 bg-gray-300" />
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">Consulta actual</div>
              <div className="font-medium text-primary-600">
                {format(new Date(resultado.fechaConsultaActual), 'dd/MM/yyyy', { locale: es })}
              </div>
              <div className="text-xs text-gray-400">
                {format(new Date(resultado.fechaConsultaActual), 'HH:mm')}
              </div>
            </div>
          </div>
          
          {/* Resumen de cambios */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Cambios detectados ({resultado.totalCambios})
            </h4>
            
            {resultado.cambiosDetectados.length === 0 ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800">
                  No se detectaron cambios. El estado del vehículo se mantiene igual.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {resultado.cambiosDetectados.map((cambio, idx) => {
                  const config = SEVERIDAD_CONFIG[cambio.severidad]
                  const tipoConfig = TIPO_CONFIG[cambio.tipo]
                  const Icon = config.icon
                  
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg border ${config.color}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{tipoConfig?.label || cambio.tipo}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-50`}>
                              {config.label}
                            </span>
                          </div>
                          
                          <p className="text-sm opacity-90 mb-2">{cambio.descripcion}</p>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <span className="opacity-75 line-through">{cambio.valorAnterior}</span>
                            <ArrowRight className="w-4 h-4 opacity-50" />
                            <span className="font-medium">{cambio.valorActual}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          
          {/* Recomendación */}
          {resultado.cambiosDetectados.some(c => c.severidad === 'CRITICA') && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h5 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                ¡Atención! Se detectó un cambio crítico
              </h5>
              <p className="text-sm text-red-700">
                Este vehículo ha cambiado su estado de manera significativa desde la última consulta.
                Se recomienda verificar la información directamente con las autoridades antes de 
                cualquier transacción.
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose()
              // Navegar a nueva consulta
            }}
            className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
          >
            Nueva consulta
          </button>
        </div>
      </div>
    </div>
  )
}