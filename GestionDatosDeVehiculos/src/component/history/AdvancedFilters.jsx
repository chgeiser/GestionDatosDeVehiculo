// src/components/history/AdvancedFilters.jsx
import { useState } from 'react'
import { 
  X, 
  Save, 
  Filter, 
  ChevronDown,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react'

const RESULTADOS = [
  { id: 'ROBADO', label: 'Con denuncia de robo', icon: AlertTriangle, color: 'text-red-600' },
  { id: 'LIMPIO', label: 'Sin novedades', icon: CheckCircle, color: 'text-green-600' },
  { id: 'CON_GRAVAMEN', label: 'Con gravámenes', icon: FileText, color: 'text-amber-600' }
]

export default function AdvancedFilters({ 
  filters, 
  setFilters, 
  onSaveFilter,
  savedFilters,
  onApplySavedFilter,
  onDeleteSavedFilter
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [filterName, setFilterName] = useState('')
  
  const hasAdvancedFilters = filters.creditosMin || filters.creditosMax || filters.resultado
  
  const handleSave = () => {
    if (!filterName.trim()) return
    onSaveFilter(filterName, filters)
    setShowSaveModal(false)
    setFilterName('')
  }
  
  const clearAdvancedFilters = () => {
    setFilters(prev => ({
      ...prev,
      creditosMin: '',
      creditosMax: '',
      resultado: ''
    }))
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header básico siempre visible */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Buscar patente o VIN..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          
          {/* Filtros guardados rápidos */}
          {savedFilters?.length > 0 && (
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Filtros guardados
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {savedFilters.map((filtro) => (
                  <div 
                    key={filtro.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer group/item"
                  >
                    <span 
                      className="text-sm flex-1"
                      onClick={() => onApplySavedFilter(filtro)}
                    >
                      {filtro.nombre}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSavedFilter(filtro.id)
                      }}
                      className="opacity-0 group-hover/item:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasAdvancedFilters && (
            <button
              onClick={clearAdvancedFilters}
              className="text-sm text-red-600 hover:text-red-700 px-3 py-2"
            >
              Limpiar avanzados
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isExpanded || hasAdvancedFilters
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Filtros avanzados
            {hasAdvancedFilters && (
              <span className="w-2 h-2 bg-primary-500 rounded-full" />
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Panel expandido */}
      {isExpanded && (
        <div className="border-t px-4 py-4 space-y-4 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rango de créditos */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CreditCard className="w-4 h-4" />
                Rango de créditos
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters.creditosMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, creditosMin: e.target.value }))}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters.creditosMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, creditosMax: e.target.value }))}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none"
                />
              </div>
            </div>
            
            {/* Resultado */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Resultado</label>
              <select
                value={filters.resultado}
                onChange={(e) => setFilters(prev => ({ ...prev, resultado: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none bg-white"
              >
                <option value="">Todos los resultados</option>
                {RESULTADOS.map((res) => {
                  const Icon = res.icon
                  return (
                    <option key={res.id} value={res.id}>
                      {res.label}
                    </option>
                  )
                })}
              </select>
            </div>
            
            {/* Fechas */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Período</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar filtro
            </button>
          </div>
        </div>
      )}
      
      {/* Modal guardar filtro */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Guardar filtro</h3>
            <input
              type="text"
              placeholder="Nombre del filtro (ej: Consultas robos este mes)"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 outline-none mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!filterName.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}