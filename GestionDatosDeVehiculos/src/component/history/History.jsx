import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { consultaService } from '../../services/api'
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Car,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  ArrowUpDown,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { format, parseISO, isWithinInterval, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const TIPOS_CONSULTA = {
  'ROBO': { label: 'Estado Robo', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  'GRAVAMENES': { label: 'Gravámenes', color: 'bg-amber-100 text-amber-800', icon: FileText },
  'COMPLETA': { label: 'Completa', color: 'bg-blue-100 text-blue-800', icon: Car }
}

const RESULTADOS = {
  'ROBADO': { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Robado' },
  'LIMPIO': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Sin novedades' },
  'CON_GRAVAMEN': { color: 'bg-amber-100 text-amber-800', icon: FileText, label: 'Con cargas' }
}

export default function History() {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [filters, setFilters] = useState({
    search: '',
    tipo: '',
    fechaDesde: '',
    fechaHasta: '',
    resultado: ''
  })
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  const [selectedItem, setSelectedItem] = useState(null)
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['historial', page, size, filters],
    queryFn: () => consultaService.getHistorial(page, size),
    staleTime: 1000 * 60 * 2 // 2 minutos
  })
  
  // Filtrado local de datos
  const filteredData = data?.data?.content?.filter(item => {
    const matchesSearch = !filters.search || 
      item.patente?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.vin?.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesTipo = !filters.tipo || item.tipoConsulta === filters.tipo
    
    const matchesFecha = (!filters.fechaDesde && !filters.fechaHasta) || 
      isWithinInterval(parseISO(item.createdAt), {
        start: filters.fechaDesde ? parseISO(filters.fechaDesde) : subDays(new Date(), 365),
        end: filters.fechaHasta ? parseISO(filters.fechaHasta) : new Date()
      })
    
    return matchesSearch && matchesTipo && matchesFecha
  }) || []
  
  // Ordenamiento
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1
    }
    return aValue < bValue ? 1 : -1
  })
  
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }
  
  const handleExport = () => {
    // Exportar a CSV
    const headers = ['Fecha', 'Patente/VIN', 'Tipo', 'Créditos', 'Resultado']
    const csvContent = [
      headers.join(','),
      ...sortedData.map(item => [
        format(parseISO(item.createdAt), 'dd/MM/yyyy HH:mm'),
        item.patente || item.vin,
        TIPOS_CONSULTA[item.tipoConsulta]?.label || item.tipoConsulta,
        item.creditosConsumidos,
        'Ver detalle'
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `historial_consultas_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    
    toast.success('Historial exportado correctamente')
  }
  
  const handleReconsultar = (item) => {
    // Navegar a búsqueda con el identificador prellenado
    toast.success('Redirigiendo a nueva consulta...')
    // Implementar navegación con state
  }
  
  const clearFilters = () => {
    setFilters({
      search: '',
      tipo: '',
      fechaDesde: '',
      fechaHasta: '',
      resultado: ''
    })
    setPage(0)
  }
  
  const hasActiveFilters = Object.values(filters).some(v => v !== '')
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }
  
  if (isError) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Error al cargar el historial</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }
  
  const totalElements = data?.data?.totalElements || 0
  const totalPages = Math.ceil(totalElements / size)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Consultas</h1>
          <p className="text-gray-600">
            {totalElements} consultas realizadas
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={sortedData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
          <Filter className="w-5 h-5" />
          Filtros
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 ml-2"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar patente o VIN..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
          
          {/* Tipo de consulta */}
          <select
            value={filters.tipo}
            onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
          >
            <option value="">Todos los tipos</option>
            <option value="ROBO">Estado de Robo</option>
            <option value="GRAVAMENES">Gravámenes</option>
            <option value="COMPLETA">Completa</option>
          </select>
          
          {/* Fecha desde */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              placeholder="Desde"
              value={filters.fechaDesde}
              onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
          
          {/* Fecha hasta */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              placeholder="Hasta"
              value={filters.fechaHasta}
              onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
        </div>
      </div>
      
      {/* Tabla de resultados */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    Fecha
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Identificador
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('creditosConsumidos')}
                >
                  <div className="flex items-center gap-1">
                    Créditos
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resultado
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-gray-300" />
                      <p>No se encontraron consultas</p>
                      {hasActiveFilters && (
                        <button 
                          onClick={clearFilters}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((item) => {
                  const TipoIcon = TIPOS_CONSULTA[item.tipoConsulta]?.icon || Car
                  const tipoStyle = TIPOS_CONSULTA[item.tipoConsulta]?.color || 'bg-gray-100 text-gray-800'
                  
                  // Determinar resultado visual
                  let resultadoStyle = RESULTADOS['LIMPIO']
                  if (item.resultado?.estadoRobo?.estaRobado) {
                    resultadoStyle = RESULTADOS['ROBADO']
                  } else if (item.resultado?.tieneGravamenesActivos) {
                    resultadoStyle = RESULTADOS['CON_GRAVAMEN']
                  }
                  const ResultadoIcon = resultadoStyle.icon
                  
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(parseISO(item.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(parseISO(item.createdAt), 'HH:mm')}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm font-medium text-gray-900">
                          {item.patente || item.vin}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.patente ? 'Patente' : 'VIN'}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tipoStyle}`}>
                          <TipoIcon className="w-3 h-3" />
                          {TIPOS_CONSULTA[item.tipoConsulta]?.label || item.tipoConsulta}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900">
                            {item.creditosConsumidos}
                          </span>
                          <span className="text-xs text-gray-500">créditos</span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${resultadoStyle.color}`}>
                          <ResultadoIcon className="w-3 h-3" />
                          {resultadoStyle.label}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedItem(item)
                            }}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReconsultar(item)
                            }}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Reconsultar"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {page * size + 1} a {Math.min((page + 1) * size, totalElements)} de {totalElements}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-sm text-gray-600">
                Página {page + 1} de {totalPages}
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value))
                setPage(0)
              }}
              className="text-sm border rounded-lg px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Modal de detalle */}
      {selectedItem && (
        <DetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  )
}

// Componente modal de detalle
function DetailModal({ item, onClose }) {
  const resultado = item.resultado || {}
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            Detalle de Consulta
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Info general */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Fecha</p>
              <p className="font-medium">
                {format(parseISO(item.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Tipo</p>
              <p className="font-medium">{TIPOS_CONSULTA[item.tipoConsulta]?.label}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Identificador</p>
              <p className="font-mono font-medium">{item.patente || item.vin}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Créditos usados</p>
              <p className="font-medium">{item.creditosConsumidos}</p>
            </div>
          </div>
          
          {/* Resultado de la consulta */}
          {resultado.estadoRobo && (
            <div className={`p-4 rounded-lg border ${
              resultado.estadoRobo.estaRobado 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-3">
                {resultado.estadoRobo.estaRobado ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${
                    resultado.estadoRobo.estaRobado ? 'text-red-900' : 'text-green-900'
                  }`}>
                    {resultado.estadoRobo.estaRobado ? 'VEHÍCULO ROBADO' : 'Sin denuncias de robo'}
                  </p>
                  {resultado.estadoRobo.estaRobado && (
                    <div className="mt-2 text-sm text-red-700 space-y-1">
                      <p>Fecha denuncia: {resultado.estadoRobo.fechaDenuncia}</p>
                      <p>N° Denuncia: {resultado.estadoRobo.numeroDenuncia}</p>
                      <p>Comisaría: {resultado.estadoRobo.comisaria}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Gravámenes */}
          {resultado.gravamenes && resultado.gravamenes.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Gravámenes registrados</h4>
              <div className="space-y-2">
                {resultado.gravamenes.map((g, idx) => (
                  <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-amber-900">{g.tipo}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        g.activo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {g.activo ? 'Activo' : 'Cancelado'}
                      </span>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">Acreedor: {g.acreedor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* JSON raw (opcional, para debug) */}
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
              Ver datos completos (JSON)
            </summary>
            <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </details>
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
              // Navegar a nueva consulta con este identificador
            }}
            className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reconsultar ahora
          </button>
        </div>
      </div>
    </div>
  )
}