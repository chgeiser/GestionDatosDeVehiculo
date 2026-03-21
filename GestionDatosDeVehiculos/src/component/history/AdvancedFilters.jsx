import { useState } from 'react'
import { X, SlidersHorizontal, Calendar, Coins, Database, Filter } from 'lucide-react'

const TIPOS_CONSULTA = [
  { value: '', label: 'Todos los tipos' },
  { value: 'ROBO', label: 'Estado de Robo' },
  { value: 'GRAVAMENES', label: 'Gravámenes' },
  { value: 'COMPLETA', label: 'Consulta Completa' }
]

const RESULTADOS = [
  { value: '', label: 'Todos los resultados' },
  { value: 'ROBADO', label: 'Vehículo robado' },
  { value: 'LIMPIO', label: 'Sin novedades' },
  { value: 'CON_GRAVAMEN', label: 'Con gravámenes' }
]

const FUENTES = [
  { value: '', label: 'Todas las fuentes' },
  { value: 'AUTODATA', label: 'Autodata' },
  { value: 'CHECK_AUTOMOTRIZ', label: 'Check Automotriz' },
  { value: 'CACHE', label: 'Caché local' }
]

export default function AdvancedFilters({ filters, onChange, onApply, onClear, isOpen, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters)
  
  const handleChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }))
  }
  
  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }
  
  const handleClear = () => {
    const empty = {
      search: '',
      tipo: '',
      fechaDesde: '',
      fechaHasta: '',
      resultado: '',
      creditosMin: '',
      creditosMax: '',
      cacheHit: '',
      fuente: ''
    }
    setLocalFilters(empty)
    onClear()
  }
  
  const activeFiltersCount = Object.values(localFilters).filter(v => v !== '').length
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Filtros Avanzados</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar patente o VIN
            </label>
            <input
              type="text"
              value={localFilters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Ej: BBCL34 o 3GNDA13D8S1234567"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
          
          {/* Dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de consulta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de consulta
              </label>
              <select
                value={localFilters.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
              >
                {TIPOS_CONSULTA.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            
            {/* Resultado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultado obtenido
              </label>
              <select
                value={localFilters.resultado}
                onChange={(e) => handleChange('resultado', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
              >
                {RESULTADOS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Rango de fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Rango de fechas
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  value={localFilters.fechaDesde}
                  onChange={(e) => handleChange('fechaDesde', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Desde</p>
              </div>
              <div>
                <input
                  type="date"
                  value={localFilters.fechaHasta}
                  onChange={(e) => handleChange('fechaHasta', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Hasta</p>
              </div>
            </div>
          </div>
          
          {/* Rango de créditos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Créditos consumidos
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localFilters.creditosMin}
                  onChange={(e) => handleChange('creditosMin', e.target.value)}
                  placeholder="Mín"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localFilters.creditosMax}
                  onChange={(e) => handleChange('creditosMax', e.target.value)}
                  placeholder="Máx"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Fuentes y caché */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Fuente de datos
              </label>
              <select
                value={localFilters.fuente}
                onChange={(e) => handleChange('fuente', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
              >
                {FUENTES.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de respuesta
              </label>
              <select
                value={localFilters.cacheHit}
                onChange={(e) => handleChange('cacheHit', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
              >
                <option value="">Todas</option>
                <option value="true">Desde caché</option>
                <option value="false">Consulta en vivo</option>
              </select>
            </div>
          </div>
          
          {/* Filtros guardados */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Filtros guardados</p>
            <div className="flex flex-wrap gap-2">
              <SavedFilterChip name="Última semana" onClick={() => {
                const hoy = new Date().toISOString().split('T')[0]
                const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                setLocalFilters(prev => ({
                  ...prev,
                  fechaDesde: semanaAtras,
                  fechaHasta: hoy
                }))
              }} />
              <SavedFilterChip name="Solo robos" onClick={() => {
                setLocalFilters(prev => ({
                  ...prev,
                  tipo: 'ROBO',
                  resultado: 'ROBADO'
                }))
              }} />
              <SavedFilterChip name="Consultas caras (3+ créditos)" onClick={() => {
                setLocalFilters(prev => ({
                  ...prev,
                  creditosMin: '3'
                }))
              }} />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Limpiar todo
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SavedFilterChip({ name, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
    >
      {name}
    </button>
  )
}