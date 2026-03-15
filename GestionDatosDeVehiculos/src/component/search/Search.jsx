import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { consultaService } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { 
  Search as SearchIcon, 
  Car, 
  FileText, 
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

const TIPOS_CONSULTA = [
  { 
    id: 'ROBO', 
    label: 'Estado de Robo', 
    descripcion: 'Verifica si el vehículo tiene denuncia de robo activa',
    creditos: 1,
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-50 border-red-200'
  },
  { 
    id: 'GRAVAMENES', 
    label: 'Gravámenes', 
    descripcion: 'Consulta prendas, embargos y prohibiciones',
    creditos: 2,
    icon: FileText,
    color: 'text-amber-600 bg-amber-50 border-amber-200'
  },
  { 
    id: 'COMPLETA', 
    label: 'Consulta Completa', 
    descripcion: 'Robo + gravámenes + multas + revisión técnica',
    creditos: 3,
    icon: Car,
    color: 'text-primary-600 bg-primary-50 border-primary-200'
  }
]

export default function Search() {
  const [identificador, setIdentificador] = useState('')
  const [tipoId, setTipoId] = useState('PATENTE') // PATENTE o VIN
  const [tipoConsulta, setTipoConsulta] = useState('COMPLETA')
  const navigate = useNavigate()
  const { cliente, updateCreditos } = useAuthStore()
  
  const consultaMutation = useMutation({
    mutationFn: async () => {
      const esPatente = tipoId === 'PATENTE'
      
      if (esPatente) {
        return consultaService.consultarPatente(identificador, tipoConsulta)
      } else {
        return consultaService.consultarVin(identificador, tipoConsulta)
      }
    },
    onSuccess: (data) => {
      // Actualizar créditos en store
      updateCreditos(data.data.creditosRestantes)
      
      // Navegar a resultados
      const id = tipoId === 'PATENTE' 
        ? data.data.datos.patente 
        : data.data.datos.vin
      
      navigate(`/resultados/${tipoId.toLowerCase()}/${encodeURIComponent(id)}`, {
        state: { resultado: data.data }
      })
    },
    onError: (error) => {
      // Error ya manejado por interceptor
    }
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!identificador.trim()) {
      toast.error('Ingresa una patente o VIN')
      return
    }
    
    // Validar formato
    if (tipoId === 'PATENTE') {
      const patenteLimpia = identificador.replace(/[-\s]/g, '').toUpperCase()
      if (!/^[A-Z0-9]{6,8}$/.test(patenteLimpia)) {
        toast.error('Formato de patente inválido')
        return
      }
    } else {
      if (identificador.length !== 17) {
        toast.error('El VIN debe tener 17 caracteres')
        return
      }
    }
    
    consultaMutation.mutate()
  }
  
  const selectedTipo = TIPOS_CONSULTA.find(t => t.id === tipoConsulta)
  const creditosSuficientes = (cliente?.creditosRestantes || 0) >= selectedTipo.creditos
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Consulta de Trazabilidad Vehicular
        </h1>
        <p className="text-gray-600">
          Verifica el historial, estado de robo y gravámenes de cualquier vehículo en Chile
        </p>
      </div>
      
      {/* Selector de tipo de identificador */}
      <div className="bg-white rounded-xl shadow-sm border p-1 mb-6 flex">
        <button
          onClick={() => setTipoId('PATENTE')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            tipoId === 'PATENTE'
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Car className="w-5 h-5" />
            Por Patente
          </div>
        </button>
        <button
          onClick={() => setTipoId('VIN')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            tipoId === 'VIN'
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-5 h-5" />
            Por VIN (NIV)
          </div>
        </button>
      </div>
      
      {/* Formulario de búsqueda */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border p-6 mb-6">
        <div className="relative mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tipoId === 'PATENTE' ? 'Número de Patente' : 'Número VIN (NIV)'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value.toUpperCase())}
              placeholder={tipoId === 'PATENTE' ? 'Ej: BB-CL-34' : 'Ej: 3GNDA13D8S1234567'}
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all uppercase"
              maxLength={tipoId === 'PATENTE' ? 10 : 17}
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {tipoId === 'PATENTE' 
              ? 'Formatos válidos: BB-XX-12 (antiguo) o BB-CL-34 (Mercosur)'
              : '17 caracteres alfanuméricos. No incluye I, O ni Q.'
            }
          </p>
        </div>
        
        {/* Selector de tipo de consulta */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Consulta
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIPOS_CONSULTA.map((tipo) => {
              const Icon = tipo.icon
              const isSelected = tipoConsulta === tipo.id
              
              return (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() => setTipoConsulta(tipo.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  } ${!creditosSuficientes && isSelected ? 'opacity-75' : ''}`}
                >
                  <div className={`inline-flex p-2 rounded-lg mb-3 ${tipo.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-medium text-gray-900 mb-1">{tipo.label}</div>
                  <div className="text-sm text-gray-500 mb-2">{tipo.descripcion}</div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <span className={tipo.creditos > (cliente?.creditosRestantes || 0) ? 'text-red-600' : 'text-primary-600'}>
                      {tipo.creditos} créditos
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Alerta de créditos insuficientes */}
        {!creditosSuficientes && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Créditos insuficientes</p>
              <p className="text-sm text-red-600">
                Necesitas {selectedTipo.creditos} créditos pero solo tienes {cliente?.creditosRestantes || 0}.
                <a href="/facturacion" className="underline font-medium ml-1">Recarga aquí</a>.
              </p>
            </div>
          </div>
        )}
        
        {/* Botón de consulta */}
        <button
          type="submit"
          disabled={consultaMutation.isPending || !creditosSuficientes}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
        >
          {consultaMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Consultando...
            </>
          ) : (
            <>
              <SearchIcon className="w-5 h-5" />
              Realizar Consulta ({selectedTipo.creditos} créditos)
            </>
          )}
        </button>
      </form>
      
      {/* Información legal */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Información importante</p>
          <p>
            Esta consulta utiliza información de registros públicos y bases de datos oficiales de Chile.
            Los datos se actualizan periódicamente. Para casos legales, solicite certificados oficiales
            en el Registro Civil o tribunales competentes.
          </p>
        </div>
      </div>
    </div>
  )
}