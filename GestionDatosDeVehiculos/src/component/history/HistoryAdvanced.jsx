// src/components/history/HistoryAdvanced.jsx
import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { historyService } from '../../services/api'
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  CreditCard,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

const PRESETS_FECHA = [
  { label: 'Hoy', desde: subDays(new Date(), 0), hasta: new Date() },
  { label: 'Últimos 7 días', desde: subDays(new Date(), 7), hasta: new Date() },
  { label: 'Este mes', desde: startOfMonth(new Date()), hasta: endOfMonth(new Date()) },
  { label: 'Últimos 30 días', desde: subDays(new Date(), 30), hasta: new Date() },
  { label: 'Últimos 90 días', desde: subDays(new Date(), 90), hasta: new Date() },
]

const RANGOS_CREDITOS = [
  { label: 'Cualquiera', min: null, max: null },
  { label: '1 crédito', min: 1, max: 1 },
  { label: '2-3 créditos', min: 2, max: 3 },
  { label: 'Más de 3', min: 4, max: null },
]

export default function HistoryAdvancedFilters({ filters, onChange, onApply, onClear }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)
  
  const updateLocalFilter = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }
  
  const handleApply = () => {
    onChange(localFilters)
    onApply?.()
  }
  
  const handleClear = () => {
    const cleared = {
      search: '',
      tipo: '',
      fechaDesde: '',
      fechaHasta: '',
      creditosRange: null,
      resultado: '',
      cacheHit: ''
    }
    setLocalFilters(cleared)
    onChange(cleared)
    onClear?.()
  }
  
  const activeFiltersCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'search') return value !== ''
    if (key === 'creditosRange') return value !== null
    return value !== ''
  }).length
  
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header básico siempre visible */}
      <div className="p-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por patente, VIN o marca..."
            value={localFilters.search}
            onChange={(e) => updateLocalFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
          />
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
            isExpanded || activeFiltersCount > 0
              ? 'border-primary-500 text-primary-700 bg-primary-50'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros avanzados</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {(isExpanded || activeFiltersCount > 0) && (
          <button
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Limpiar filtros"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Panel expandible con filtros avanzados */}
      {isExpanded && (
        <div className="border-t px-4 py-4 space-y-4 animate-slide-in">
          {/* Fila 1: Tipo y Resultado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de consulta
              </label>
              <select
                value={localFilters.tipo}
                onChange={(e) => updateLocalFilter('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none bg-white"
              >
                <option value="">Todos los tipos</option>
                <option value="ROBO">Estado de Robo</option>
                <option value="GRAVAMENES">Gravámenes</option>
                <option value="COMPLETA">Consulta Completa</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultado obtenido
              </label>
              <select
                value={localFilters.resultado}
                onChange={(e) => updateLocalFilter('resultado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none bg-white"
              >
                <option value="">Cualquier resultado</option>
                <option value="ROBADO">Vehículo robado</option>
                <option value="CON_GRAVAMEN">Con gravámenes</option>
                <option value="LIMPIO">Sin novedades</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origen de datos
              </label>
              <select
                value={localFilters.cacheHit}
                onChange={(e) => updateLocalFilter('cacheHit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none bg-white"
              >
                <option value="">Todos</option>
                <option value="true">Cache (datos en memoria)</option>
                <option value="false">API en vivo</option>
              </select>
            </div>
          </div>
          
          {/* Fila 2: Fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESETS_FECHA.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    updateLocalFilter('fechaDesde', format(preset.desde, 'yyyy-MM-dd'))
                    updateLocalFilter('fechaHasta', format(preset.hasta, 'yyyy-MM-dd'))
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={localFilters.fechaDesde}
                  onChange={(e) => updateLocalFilter('fechaDesde', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={localFilters.fechaHasta}
                  onChange={(e) => updateLocalFilter('fechaHasta', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Fila 3: Créditos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Créditos consumidos
            </label>
            <div className="flex flex-wrap gap-2">
              {RANGOS_CREDITOS.map((rango) => (
                <button
                  key={rango.label}
                  onClick={() => updateLocalFilter('creditosRange', rango)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    localFilters.creditosRange?.label === rango.label
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {rango.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  )
}