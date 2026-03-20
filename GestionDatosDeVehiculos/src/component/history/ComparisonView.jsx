import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { 
  GitCompare, 
  X, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import toast from 'react-hot-toast'

export default function ComparisonView({ patente, onClose }) {
  const [selectedConsultas, setSelectedConsultas] = useState([])
  
  const { data: historial, isLoading } = useQuery({
    queryKey: ['historial-patente', patente],
    queryFn: () => api.get(`/historial/patente/${patente}`).then(r => r.data.data),
    enabled: !!patente
  })
  
  const toggleSeleccion = (consulta) => {
    const exists = selectedConsultas.find(c => c.id === consulta.id)
    if (exists) {
      setSelectedConsultas(prev => prev.filter(c => c.id !== consulta.id))
    } else {
      if (selectedConsultas.length >= 2) {
        toast.error('Solo puedes comparar 2 consultas a la vez')
        return
      }
      setSelectedConsultas(prev => [...prev, consulta])
    }
  }
  
  const getDiferencias = () => {
    if (selectedConsultas.length !== 2) return null
    
    const [antigua, reciente] = [...selectedConsultas].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )
    
    const diffs = []
    
    // Estado de robo
    if (antigua.resultado?.estadoRobo?.estaRobado !== reciente.resultado?.estadoRobo?.estaRobado) {
      diffs.push({
        campo: 'Estado de Robo',
        antes: antigua.resultado?.estadoRobo?.estaRobado ? 'ROBADO' : 'LIMPIO',
        despues: reciente.resultado?.estadoRobo?.estaRobado ? 'ROBADO' : 'LIMPIO',
        tipo: reciente.resultado?.estadoRobo?.estaRobado ? 'peor' : 'mejor'
      })
    }
    
    // Gravámenes
    const gravAntes = antigua.resultado?.gravamenes?.filter(g => g.activo).length || 0
    const gravDespues = reciente.resultado?.gravamenes?.filter(g => g.activo).length || 0
    
    if (gravAntes !== gravDespues) {
      diffs.push({
        campo: 'Gravámenes activos',
        antes: gravAntes,
        despues: gravDespues,
        tipo: gravDespues > gravAntes ? 'peor' : 'mejor'
      })
    }
    
    // Multas
    const multasAntes = antigua.resultado?.multasSoap?.filter(m => !m.pagada).length || 0
    const multasDespues = reciente.resultado?.multasSoap?.filter(m => !m.pagada).length || 0
    
    if (multasAntes !== multasDespues) {
      diffs.push({
        campo: 'Multas pendientes',
        antes: multasAntes,
        despues: multasDespues,
        tipo: multasDespues > multasAntes ? 'peor' : 'mejor'
      })
    }
    
    // Revisión técnica
    if (antigua.resultado?.revisionTecnica?.aprobada !== reciente.resultado?.revisionTecnica?.aprobada) {
      diffs.push({
        campo: 'Revisión Técnica',
        antes: antigua.resultado?.revisionTecnica?.aprobada ? 'VIGENTE' : 'VENCIDA',
        despues: reciente.resultado?.revisionTecnica?.aprobada ? 'VIGENTE' : 'VENCIDA',
        tipo: reciente.resultado?.revisionTecnica?.aprobada ? 'mejor' : 'peor'
      })
    }
    
    return diffs
  }
  
  const getTimelineData = () => {
    if (!historial) return []
    
    return historial.map(h => ({
      fecha: format(parseISO(h.createdAt), 'dd/MM/yy'),
      timestamp: h.createdAt,
      riesgo: calcularNivelRiesgo(h.resultado),
      robado: h.resultado?.estadoRobo?.estaRobado ? 100 : 0,
      gravamenes: (h.resultado?.gravamenes?.filter(g => g.activo).length || 0) * 20,
      multas: (h.resultado?.multasSoap?.filter(m => !m.pagada).length || 0) * 15
    }))
  }
  
  const calcularNivelRiesgo = (resultado) => {
    let riesgo = 0
    if (resultado?.estadoRobo?.estaRobado) riesgo += 100
    riesgo += (resultado?.gravamenes?.filter(g => g.activo).length || 0) * 25
    riesgo += (resultado?.multasSoap?.filter(m => !m.pagada).length || 0) * 10
    return Math.min(riesgo, 100)
  }
  
  const diferencias = getDiferencias()
  const timelineData = getTimelineData()
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <GitCompare className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Comparación: {patente}
              </h3>
              <p className="text-sm text-gray-500">
                {historial?.length} consultas en historial
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Timeline de riesgo */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Evolución del nivel de riesgo
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fecha" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{data.fecha}</p>
                          <p className="text-sm text-gray-600">
                            Nivel de riesgo: {data.riesgo}%
                          </p>
                        </div>
                      )
                    }}
                  />
                  <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" />
                  <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="riesgo" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Bajo riesgo (&lt;50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span>Moderado (50-75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>Alto riesgo (&gt;75%)</span>
              </div>
            </div>
          </div>
          
          {/* Selector de consultas para comparar */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Selecciona 2 consultas para comparar
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {historial?.map(consulta => {
                const isSelected = selectedConsultas.find(c => c.id === consulta.id)
                const riesgo = calcularNivelRiesgo(consulta.resultado)
                
                return (
                  <button
                    key={consulta.id}
                    onClick={() => toggleSeleccion(consulta)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {format(parseISO(consulta.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {consulta.resultado?.estadoRobo?.estaRobado ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm">
                          {consulta.resultado?.estadoRobo?.estaRobado ? 'Robado' : 'Sin robo'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {consulta.resultado?.gravamenes?.filter(g => g.activo).length || 0} gravámenes
                        </span>
                      </div>
                    </div>
                    
                    {/* Indicador de riesgo */}
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            riesgo > 75 ? 'bg-red-500' : riesgo > 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${riesgo}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Riesgo: {riesgo}%
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Tabla de diferencias */}
          {diferencias && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <GitCompare className="w-5 h-5" />
                Cambios detectados entre consultas
              </h4>
              
              {diferencias.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No se detectaron cambios significativos entre las consultas seleccionadas
                </p>
              ) : (
                <div className="space-y-3">
                  {diferencias.map((diff, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg border ${
                        diff.tipo === 'peor' 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{diff.campo}</span>
                        {diff.tipo === 'peor' ? (
                          <TrendingUp className="w-5 h-5 text-red-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex-1">
                          <span className="text-gray-500">Antes: </span>
                          <span className="font-medium">{diff.antes}</span>
                        </div>
                        <div className="text-gray-400">→</div>
                        <div className="flex-1">
                          <span className="text-gray-500">Después: </span>
                          <span className={`font-medium ${
                            diff.tipo === 'peor' ? 'text-red-700' : 'text-green-700'
                          }`}>
                            {diff.despues}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Alerta si hay cambios negativos */}
          {diferencias?.some(d => d.tipo === 'peor') && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">¡Atención!</p>
                <p className="text-sm text-red-700">
                  Se detectaron cambios que aumentan el riesgo de este vehículo desde la última consulta.
                  Recomendamos verificar la información directamente con las fuentes oficiales antes de
                  cualquier transacción.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}