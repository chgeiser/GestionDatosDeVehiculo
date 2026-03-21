/* eslint-disable react-hooks/static-components */
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react'

export default function ComparisonDetailView() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const { consultaId1, consultaId2 } = state || {}

  const { data, isLoading } = useQuery({
    queryKey: ['comparacion-detalle', consultaId1, consultaId2],
    queryFn: () =>
      api.post('/comparacion/comparar', {
        consultaId1,
        consultaId2
      }).then(r => r.data.data),
    enabled: !!consultaId1 && !!consultaId2
  })

  if (!consultaId1 || !consultaId2) {
    return <p className="p-6">Faltan datos para comparar</p>
  }

  if (isLoading) {
    return <p className="p-6">Cargando comparación...</p>
  }

  const { consulta1, consulta2 } = data

  const comparar = (a, b) => {
    if (a > b) return 'up'
    if (a < b) return 'down'
    return 'equal'
  }

  const IconoCambio = ({ tipo }) => {
    if (tipo === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />
    if (tipo === 'down') return <TrendingDown className="w-4 h-4 text-green-500" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const Row = ({ label, v1, v2 }) => {
    const cambio = comparar(v1, v2)

    return (
      <div className="grid grid-cols-3 items-center py-3 border-b">
        <div className="text-gray-600">{label}</div>

        <div className="font-medium text-center">{v1}</div>

        <div className="flex items-center justify-center gap-2">
          <span className="font-medium">{v2}</span>
          <IconoCambio tipo={cambio} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <h1 className="text-2xl font-bold">Comparación de Consultas</h1>
      </div>

      {/* Alertas críticas */}
      {(consulta1.resumen.estaRobado || consulta2.resumen.estaRobado) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-center">
          <AlertTriangle className="text-red-600 w-5 h-5" />
          <span className="text-red-800 font-medium">
            Este vehículo registra estado de robo en al menos una consulta
          </span>
        </div>
      )}

      {/* Tabla comparación */}
      <div className="bg-white border rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-3 font-semibold border-b pb-2 mb-2">
          <div>Campo</div>
          <div className="text-center">Consulta 1</div>
          <div className="text-center">Consulta 2</div>
        </div>

        <Row 
          label="Gravámenes" 
          v1={consulta1.resumen.cantidadGravamenes} 
          v2={consulta2.resumen.cantidadGravamenes} 
        />

        <Row 
          label="Créditos" 
          v1={consulta1.resumen.cantidadCreditos} 
          v2={consulta2.resumen.cantidadCreditos} 
        />

        <Row 
          label="Multas" 
          v1={consulta1.resumen.cantidadMultas} 
          v2={consulta2.resumen.cantidadMultas} 
        />

        <Row 
          label="Prendas" 
          v1={consulta1.resumen.cantidadPrendas} 
          v2={consulta2.resumen.cantidadPrendas} 
        />
      </div>

      {/* Estado general */}
      <div className="grid grid-cols-2 gap-4">
        <EstadoCard titulo="Consulta 1" data={consulta1} />
        <EstadoCard titulo="Consulta 2" data={consulta2} />
      </div>
    </div>
  )
}

function EstadoCard({ titulo, data }) {
  const limpio =
    !data.resumen.estaRobado &&
    data.resumen.cantidadGravamenes === 0

  return (
    <div className="border rounded-xl p-4 bg-white">
      <h4 className="font-semibold mb-3">{titulo}</h4>

      <div className={`flex items-center gap-2 font-medium ${
        limpio ? 'text-green-600' : 'text-red-600'
      }`}>
        {limpio ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Vehículo limpio
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4" />
            Con observaciones
          </>
        )}
      </div>
    </div>
  )
}
