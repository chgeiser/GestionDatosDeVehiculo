import { useState } from 'react'
import { 
  SlidersHorizontal, 
  X, 
  ChevronDown,
  CreditCard,
  Calendar,
  Car,
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react'

const FILTROS_PRESETS = [
  { id: 'hoy', label: 'Hoy', dias: 0 },
  { id: 'semana', label: 'Última semana', dias: 7 },
  { id: 'mes', label: 'Último mes', dias: 30 },
  { id: 'trimestre', label: 'Último trimestre', dias: 90 }
]

const RANGOS_CREDITOS = [
  { id: '1', label: '1 crédito', min: 1, max: 1 },
  { id: '2', label: '2 créditos', min: 2, max: 2 },
  { id: '3', label: '3 créditos', min: 3, max: 3 },
  { id: '1-2', label: '1-2 créditos', min: 1, max: 2 },
  { id: '3+', label: '3+ créditos', min: 3, max: null }
]

const RESULTADOS = [
  { id: 'robado', label: 'Con denuncia de robo', icon: AlertTriangle, color: 'text-red-600' },
  { id: 'gravamen', label: 'Con gravámenes', icon: FileText, color: 'text-amber-600' },
  { id: 'limpio', label: 'Sin novedades', icon: CheckCircle, color: 'text-green-600' }
]

export default function AdvancedFilters({ filters, onChange, onApply, onClear, totalResults }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  
  const hasActiveFilters = Object.values(filters).some(v => 
    v !== '' && v !== null && v !== undefined && 
    (Array.isArray(v) ? v.length > 0 : true)
  )
  
  const handlePresetFecha = (dias) => {
    const hasta = new Date()
    const desde = new Date()
    desde.setDate(desde.getDate() - dias)
    
    onChange({
      ...filters,
      fechaDesde: desde.toISOString().split('T')[0],
      fechaHasta: hasta.toISOString().split('T')[0]
    })
  }
  
  const handleRangoCreditos = (rango) => {
    onChange({
      ...filters,
      creditosMin: rango.min,
      creditosMax: rango.max
    })
  }
  
  const toggleResultado = (resultadoId) => {
    const current = filters.resultados || []
    const updated = current.includes(resultadoId)
      ? current.filter(r => r !== resultadoId)
      : [...current, resultadoId]
    
    onChange({ ...filters, resultados: updated })
  }
  
  const toggleTipoVehiculo = (tipo) => {
    const current = filters.tiposVehiculo || []
    const updated = current.includes(tipo)
      ? current.filter(t => t !== tipo)
      : [...current, tipo]
    
    onChange({ ...filters, tiposVehiculo: updated })
  }
  
  const contarFiltrosActivos = () => {
    let count = 0
    if (filters.search) count++
    if (filters.tipo) count++
    if (filters.fechaDesde || filters.fechaHasta) count++
    if (filters.creditosMin || filters.creditosMax) count++
    if (filters.resultados?.length) count += filters.resultados.length
    if (filters.tiposVehiculo?.length) count += filters.tiposVehiculo.length
    if (filters.cacheHit !== undefined && filters.cacheHit !== '') count++
    return count
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header del filtro */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filtros avanzados
          {contarFiltrosActivos() > 0 && (
            <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
              {contarFiltrosActivos()}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
          <span className="text-sm text-gray-500">
            {totalResults} resultados
          </span>
        </div>
      </div>
      
      {/* Contenido expandible */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Tabs */}
          <div className="flex border-b">
            {[
              { id: 'general', label: 'General', icon: SlidersHorizontal },
              { id: 'fecha', label: 'Fecha', icon: Calendar },
              { id: 'resultado', label: 'Resultado', icon: CheckCircle },
              { id: 'vehiculo', label: 'Vehículo', icon: Car }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab: General */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por identificador
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Patente, VIN o parte del número..."
                    value={filters.search || ''}
                    onChange={(e) => onChange({ ...filters, search: e.target.value })}
                    className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                </div>
              </div>
              
              {/* Tipo de consulta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de consulta
                </label>
                <div className="flex flex-wrap gap-2">
                  {['ROBO', 'GRAVAMENES', 'COMPLETA'].map(tipo => (
                    <button
                      key={tipo}
                      onClick={() => onChange({ 
                        ...filters, 
                        tipo: filters.tipo === tipo ? '' : tipo 
                      })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.tipo === tipo
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tipo === 'ROBO' && 'Estado Robo'}
                      {tipo === 'GRAVAMENES' && 'Gravámenes'}
                      {tipo === 'COMPLETA' && 'Completa'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Rango de créditos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Créditos consumidos
                </label>
                <div className="flex flex-wrap gap-2">
                  {RANGOS_CREDITOS.map(rango => (
                    <button
                      key={rango.id}
                      onClick={() => handleRangoCreditos(
                        filters.creditosMin === rango.min && filters.creditosMax === rango.max
                          ? { min: null, max: null }
                          : rango
                      )}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.creditosMin === rango.min && filters.creditosMax === rango.max
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rango.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Cache hit/miss */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origen de datos
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onChange({ 
                      ...filters, 
                      cacheHit: filters.cacheHit === true ? '' : true 
                    })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filters.cacheHit === true
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Desde caché
                  </button>
                  <button
                    onClick={() => onChange({ 
                      ...filters, 
                      cacheHit: filters.cacheHit === false ? '' : false 
                    })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filters.cacheHit === false
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Consulta en vivo
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Tab: Fecha */}
          {activeTab === 'fecha' && (
            <div className="space-y-4">
              {/* Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Períodos rápidos
                </label>
                <div className="flex flex-wrap gap-2">
                  {FILTROS_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetFecha(preset.dias)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Rango personalizado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={filters.fechaDesde || ''}
                    onChange={(e) => onChange({ ...filters, fechaDesde: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={filters.fechaHasta || ''}
                    onChange={(e) => onChange({ ...filters, fechaHasta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
              
              {/* Hora del día */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora del día
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'manana', label: 'Mañana (6-12)' },
                    { id: 'tarde', label: 'Tarde (12-18)' },
                    { id: 'noche', label: 'Noche (18-24)' }
                  ].map(hora => (
                    <button
                      key={hora.id}
                      onClick={() => onChange({
                        ...filters,
                        horaDia: filters.horaDia === hora.id ? '' : hora.id
                      })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.horaDia === hora.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {hora.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Tab: Resultado */}
          {activeTab === 'resultado' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Estado del vehículo consultado
              </label>
              <div className="space-y-2">
                {RESULTADOS.map(resultado => {
                  const Icon = resultado.icon
                  const isSelected = filters.resultados?.includes(resultado.id)
                  
                  return (
                    <button
                      key={resultado.id}
                      onClick={() => toggleResultado(resultado.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${resultado.color}`} />
                      <span className="flex-1 text-left font-medium text-gray-700">
                        {resultado.label}
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      )}
                    </button>
                  )
                })}
              </div>
              
              {/* Fuentes de datos */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuentes consultadas
                </label>
                <div className="flex flex-wrap gap-2">
                  {['AUTODATA', 'CHECK_AUTOMOTRIZ', 'CACHE', 'REGISTRO_CIVIL'].map(fuente => (
                    <button
                      key={fuente}
                      onClick={() => {
                        const current = filters.fuentes || []
                        const updated = current.includes(fuente)
                          ? current.filter(f => f !== fuente)
                          : [...current, fuente]
                        onChange({ ...filters, fuentes: updated })
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.fuentes?.includes(fuente)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {fuente.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Tab: Vehículo */}
          {activeTab === 'vehiculo' && (
            <div className="space-y-4">
              {/* Tipo de vehículo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de vehículo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['AUTOMOVIL', 'CAMION', 'MOTO', 'CAMIONETA', 'BUS'].map(tipo => (
                    <button
                      key={tipo}
                      onClick={() => toggleTipoVehiculo(tipo)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        filters.tiposVehiculo?.includes(tipo)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {tipo === 'AUTOMOVIL' && '🚗 Automóvil'}
                      {tipo === 'CAMION' && '🚛 Camión'}
                      {tipo === 'MOTO' && '🏍️ Moto'}
                      {tipo === 'CAMIONETA' && '🚐 Camioneta'}
                      {tipo === 'BUS' && '🚌 Bus'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Año del vehículo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año del vehículo
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Desde"
                      value={filters.anioDesde || ''}
                      onChange={(e) => onChange({ ...filters, anioDesde: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Hasta"
                      value={filters.anioHasta || ''}
                      onChange={(e) => onChange({ ...filters, anioHasta: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              
              {/* Marca/Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca o modelo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Toyota, Chevrolet, etc."
                  value={filters.marca || ''}
                  onChange={(e) => onChange({ ...filters, marca: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none"
                />
              </div>
            </div>
          )}
          
          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                onApply()
                setIsOpen(false)
              }}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Aplicar filtros
            </button>
            <button
              onClick={() => {
                onClear()
                setIsOpen(false)
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}