// src/components/history/ComparisonModal.jsx
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../services/api'
import { 
  X, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function ComparisonModal({ consultas, onClose }) {
  const [selectedIds, setSelectedIds] = useState([])
  
  const comparacionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/historial/comparar', {
        consultaIds: selectedIds
      })
      return response.data.data
    },
    onSuccess: () => {
      toast.success('Comparación realizada')
    },
    onError: () => {
      toast.error('Error al comparar consultas')
    }
  })
  
  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : prev.length < 5 ? [...prev, id] : prev
    )
  }
  
  const getEstadoIcon = (estado) => {
    if (estado.robado) return <AlertTriangle className="w-5 h-5 text-red-500" />
    if (estado.cantidadGravamenes > 0) return <AlertTriangle className="w-5 h-5 text-amber-500" />
    return <CheckCircle className="w-5 h-5 text-green-500" />
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold">Comparar consultas</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {!comparacionMutation.data ? (
            <>
              {/* Selección de consultas */}
              <p className="text-gray-600 mb-4">
                Selecciona 2 a 5 consultas del mismo vehículo para comparar su evolución:
              </p>
              
              <div className="space-y-2 mb-6">
                {consultas.map((consulta) => (
                  <label 
                    key={consulta.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedIds.includes(consulta.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(consulta.id)}
                      onChange={() => toggleSelection(consulta.id)}
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{consulta.patente || consulta.vin}</span>
                        <span className="text-sm text-gray-500">
                          {format(parseISO(consulta.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {consulta.tipoConsulta} • {consulta.creditosConsumidos} créditos
                      </div>
                    </div>
                    
                    {getEstadoIcon(consulta.resultado || {})}
                  </label>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {selectedIds.length} de 5 seleccionados
                </span>
                
                <button
                  onClick={() => comparacionMutation.mutate()}
                  disabled={selectedIds.length < 2 || comparacionMutation.isPending}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {comparacionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Comparando...
                    </>
                  ) : (
                    <>
                      Comparar seleccionados
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Resultado de comparación */}
              <ComparisonResult data={comparacionMutation.data} />
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => comparacionMutation.reset()}
                  className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  Nueva comparación
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ComparisonResult({ data }) {
  return (
    <div className="space-y-6">
      {/* Info del vehículo */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-lg mb-1">{data.patente || data.vin}</h4>
        <p className="text-gray-600">{data.conclusion}</p>
      </div>
      
      {/* Timeline de consultas */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        <div className="space-y-6">
          {data.consultas.map((consulta, idx) => (
            <div key={consulta.id} className="relative flex items-start gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 z-10 ${
                consulta.estado.robado 
                  ? 'bg-red-100 border-red-500 text-red-600'
                  : consulta.estado.cantidadGravamenes > 0
                    ? 'bg-amber-100 border-amber-500 text-amber-600'
                    : 'bg-green-100 border-green-500 text-green-600'
              }`}>
                {idx + 1}
              </div>
              
              <div className="flex-1 bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {format(parseISO(consulta.fecha), 'dd MMMM yyyy, HH:mm', { locale: es })}
                  </span>
                  <span className="text-sm text-gray-500">{consulta.tipoConsulta}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    <span className={`ml-1 font-medium ${
                      consulta.estado.robado ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {consulta.estado.robado ? 'Robado' : 'Limpio'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gravámenes:</span>
                    <span className="ml-1 font-medium">{consulta.estado.cantidadGravamenes}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Multas:</span>
                    <span className="ml-1 font-medium">
                      {consulta.estado.tieneMultas ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Cambios detectados */}
      {data.cambios?.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Cambios detectados</h4>
          <div className="space-y-2">
            {data.cambios.map((cambio, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${
                  cambio.severidad === 'ALTA' 
                    ? 'bg-red-50 border-red-500'
                    : cambio.severidad === 'MEDIA'
                      ? 'bg-amber-50 border-amber-500'
                      : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  {cambio.severidad === 'ALTA' ? (
                    <TrendingUp className="w-5 h-5 text-red-500" />
                  ) : cambio.severidad === 'BAJA' ? (
                    <TrendingDown className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Minus className="w-5 h-5 text-amber-500" />
                  )}
                  <span className="font-medium">{cambio.tipo}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    cambio.severidad === 'ALTA' ? 'bg-red-200 text-red-800' : ''
                  }`}>
                    {cambio.severidad}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{cambio.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}