import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { 
  GitCompare, 
  ArrowRight, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function VehicleComparison({ patente, onClose }) {
  const [selectedConsultas, setSelectedConsultas] = useState([])
  
  const { data: historial, isLoading } = useQuery({
    queryKey: ['historial-vehiculo', patente],
    queryFn: async () => {
      const response = await api.get(`/historial/vehiculo/${patente}`)
      return response.data.data
    }
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }
  
  const consultas = historial?.consultas || []
  
  if (consultas.length < 2) {
    return (
      <div className="text-center py-8">
        <GitCompare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">
          Se necesitan al menos 2 consultas para comparar la evolución
        </p>
      </div>
    )
  }
  
  // Preparar datos para gráfico de "score de riesgo"
  const riskScoreData = consultas.map((c, idx) => {
    let score = 100 // Base
    if (c.resultado?.estadoRobo?.estaRobado) score -= 50
    if (c.resultado?.tieneGravamenesActivos) score -= 30
    if (c.resultado?.tieneMultasPendientes) score -= 20
    
    return {
      fecha: format(parseISO(c.createdAt), 'dd/MM'),
      score,
      fullDate: c.createdAt,
      index: idx
    }
  })
  
  const compareTwo = (a, b) => {
    const changes = []
    
    // Cambio en estado de robo
    const roboA = a.resultado?.estadoRobo?.estaRobado || false
    const roboB = b.resultado?.estadoRobo?.estaRobado || false
    
    if (roboA !== roboB) {
      changes.push({
        tipo: 'CRITICO',
        campo: 'Estado de Robo',
        anterior: roboA ? 'ROBADO' : 'LIMPIO',
        actual: roboB ? 'ROBADO' : 'LIMPIO',
        impacto: roboB && !roboA ? 'negative' : 'positive'
      })
    }
    
    // Cambio en gravámenes
    const gravA = a.resultado?.gravamenes?.filter(g => g.activo).length || 0
    const gravB = b.resultado?.gravámenes?.filter(g => g.activo).length || 0
    
    if (gravA !== gravB) {
      changes.push({
        tipo: 'ADVERTENCIA',
        campo: 'Gravámenes activos',
        anterior: `${gravA} cargas`,
        actual: `${gravB} cargas`,
        impacto: gravB > gravA ? 'negative' : 'positive'
      })
    }
    
    // Cambio en multas
    const multasA = a.resultado?.multasSoap?.filter(m => !m.pagada).length || 0
    const multasB = b.resultado?.multasSoap?.filter(m => !m.pagada).length || 0
    
    if (multasA !== multasB) {
      changes.push({
        tipo: 'INFO',
        campo: 'Multas pendientes',
        anterior: `${multasA} multas`,
        actual: `${multasB} multas`,
        impacto: multasB > multasA ? 'negative' : 'positive'
      })
    }
    
    return changes
  }
  
  const latest = consultas[0]
  const previous = consultas[1]
  const changes = compareTwo(previous, latest)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Evolución del vehículo
          </h3>
          <p className="text-sm text-gray-500">
            Comparando {consultas.length} consultas de <span className="font-mono font-medium">{patente}</span>
          </p>
        </div>
        
        <select
          value={selectedConsultas.join(',')}
          onChange={(e) => {
            const indices = e.target.value.split(',').map(Number)
            setSelectedConsultas(indices)
          }}
          className="text-sm border rounded-lg px-3 py-2"
        >
          <option value="">Comparar consultas específicas...</option>
          {consultas.map((c, idx) => (
            <option key={c.id} value={`${idx},${Math.min(idx + 1, consultas.length - 1)}`}>
              {format(parseISO(c.createdAt), 'dd/MM/yyyy')} vs anterior
            </option>
          ))}
        </select>
      </div>
      
      {/* Gráfico de score de riesgo */}
      <div className="bg-white p-4 rounded-xl border">
        <h4 className="font-medium text-gray-900 mb-4">Índice de Riesgo en el tiempo</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={riskScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="fecha" stroke="#6b7280" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={12} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{format(parseISO(data.fullDate), 'dd/MM/yyyy HH:mm')}</p>
                        <p className="text-sm text-gray-600">Score: {data.score}/100</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0 = Máximo riesgo</span>
          <span>100 = Sin riesgo</span>
        </div>
      </div>
      
      {/* Cambios recientes */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Cambios desde la última consulta ({format(parseISO(previous.createdAt), 'dd/MM/yyyy')})
        </h4>
        
        {changes.length === 0 ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">Sin cambios significativos detectados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {changes.map((change, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-lg border flex items-start gap-3 ${
                  change.tipo === 'CRITICO' 
                    ? 'bg-red-50 border-red-200' 
                    : change.tipo === 'ADVERTENCIA'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                {change.impacto === 'negative' ? (
                  <TrendingDown className={`w-5 h-5 flex-shrink-0 ${
                    change.tipo === 'CRITICO' ? 'text-red-600' : 'text-amber-600'
                  }`} />
                ) : change.impacto === 'positive' ? (
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Minus className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      change.tipo === 'CRITICO' 
                        ? 'bg-red-200 text-red-800' 
                        : change.tipo === 'ADVERTENCIA'
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}>
                      {change.tipo}
                    </span>
                    <span className="font-medium text-gray-900">{change.campo}</span>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-gray-500 line-through">{change.anterior}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className={`font-medium ${
                      change.impacto === 'negative' ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {change.actual}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Timeline de consultas */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Timeline de consultas</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {consultas.map((consulta, idx) => (
            <div 
              key={consulta.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                {consultas.length - idx}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">
                    {format(parseISO(consulta.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                  <span className="text-xs text-gray-500">
                    {consulta.creditosConsumidos} créditos
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {consulta.tipoConsulta} • 
                  {consulta.resultado?.estadoRobo?.estaRobado ? ' Con robo' : ' Sin robo'} • 
                  {consulta.resultado?.tieneGravamenesActivos ? ' Con gravámenes' : ' Sin gravámenes'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}