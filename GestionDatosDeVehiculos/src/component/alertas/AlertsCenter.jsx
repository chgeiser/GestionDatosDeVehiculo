// src/components/alerts/AlertsCenter.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../services/api'
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  X,
  Clock,
  Settings,
  Loader2,
  Filter,
  Trash2,
  Eye
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const TIPOS_ALERTA = {
  'CAMBIO_ROBO': { label: 'Cambio estado robo', color: 'text-red-600', icon: AlertTriangle, bg: 'bg-red-50' },
  'NUEVO_GRAVAMEN': { label: 'Nuevo gravamen', color: 'text-amber-600', icon: Info, bg: 'bg-amber-50' },
  'CAMBIO_PROPIETARIO': { label: 'Cambio propietario', color: 'text-blue-600', icon: Info, bg: 'bg-blue-50' },
  'TODOS': { label: 'Todos los cambios', color: 'text-purple-600', icon: Bell, bg: 'bg-purple-50' }
}

export default function AlertsCenter() {
  const queryClient = useQueryClient()
  const [showConfig, setShowConfig] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [patenteBusqueda, setPatenteBusqueda] = useState('')
  
  const { data: alertas, isLoading } = useQuery({
    queryKey: ['alertas'],
    queryFn: async () => {
      const response = await api.get('/alertas')
      return response.data.data
    }
  })
  
  const { data: notificaciones } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: async () => {
      const response = await api.get('/alertas/notificaciones')
      return response.data.data
    },
    refetchInterval: 60000 // Cada minuto
  })
  
  const marcarLeidaMutation = useMutation({
    mutationFn: (id) => api.post(`/alertas/notificaciones/${id}/leer`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notificaciones'])
      toast.success('Notificación marcada como leída')
    }
  })
  
  const marcarTodasLeidasMutation = useMutation({
    mutationFn: () => api.post('/alertas/notificaciones/marcar-todas-leidas'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notificaciones'])
      toast.success('Todas las notificaciones marcadas como leídas')
    }
  })
  
  const crearAlertaMutation = useMutation({
    mutationFn: (data) => api.post('/alertas', data),
    onSuccess: () => {
      toast.success('Alerta creada correctamente')
      setShowConfig(false)
      queryClient.invalidateQueries(['alertas'])
    }
  })
  
  const eliminarAlertaMutation = useMutation({
    mutationFn: (id) => api.delete(`/alertas/${id}`),
    onSuccess: () => {
      toast.success('Alerta eliminada')
      queryClient.invalidateQueries(['alertas'])
    }
  })
  
  const noLeidas = notificaciones?.filter(n => !n.leida) || []
  
  // Filtrar alertas
  const alertasFiltradas = alertas?.filter(alerta => {
    const matchTipo = filtroTipo === 'TODOS' || alerta.tipo === filtroTipo
    const matchPatente = !patenteBusqueda || 
      alerta.patente?.toLowerCase().includes(patenteBusqueda.toLowerCase())
    return matchTipo && matchPatente
  }) || []
  
  const getTipoConfig = (tipo) => TIPOS_ALERTA[tipo] || TIPOS_ALERTA['TODOS']
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Alertas</h1>
          <p className="text-gray-500 mt-1">Gestiona alertas y notificaciones de tus vehículos</p>
        </div>
        
        <div className="flex items-center gap-3">
          {noLeidas.length > 0 && (
            <button
              onClick={() => marcarTodasLeidasMutation.mutate()}
              disabled={marcarTodasLeidasMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <CheckCircle className="w-4 h-4" />
              Marcar todas leídas
            </button>
          )}
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configurar alerta
          </button>
        </div>
      </div>
      
      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total alertas</p>
              <p className="text-2xl font-bold text-gray-900">{alertas?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">No leídas</p>
              <p className="text-2xl font-bold text-gray-900">{noLeidas.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Info className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Activas</p>
              <p className="text-2xl font-bold text-gray-900">
                {alertas?.filter(a => a.activa)?.length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                {notificaciones?.filter(n => {
                  const hoy = new Date()
                  const fechaNotif = parseISO(n.fecha)
                  return format(fechaNotif, 'yyyy-MM-dd') === format(hoy, 'yyyy-MM-dd')
                })?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
            <div className="flex gap-2">
              {Object.entries(TIPOS_ALERTA).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setFiltroTipo(key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filtroTipo === key 
                      ? `${config.bg} ${config.color}` 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por patente..."
              value={patenteBusqueda}
              onChange={(e) => setPatenteBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
            />
            <Bell className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
      
      {/* Lista de alertas configuradas */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Alertas Configuradas</h2>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : alertasFiltradas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay alertas configuradas</p>
          </div>
        ) : (
          <div className="divide-y">
            {alertasFiltradas.map((alerta) => {
              const config = getTipoConfig(alerta.tipo)
              const Icon = config.icon
              
              return (
                <div key={alerta.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{config.label}</h3>
                          {alerta.activa && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              Activa
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Patente: <span className="font-medium">{alerta.patente}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Notificar a: {alerta.emailNotificacion}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Creada {format(parseISO(alerta.createdAt), 'dd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {/* Ver detalle */}}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminarAlertaMutation.mutate(alerta.id)}
                        disabled={eliminarAlertaMutation.isPending}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Notificaciones recientes */}
      {notificaciones && notificaciones.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Notificaciones Recientes</h2>
            {noLeidas.length > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                {noLeidas.length} nuevas
              </span>
            )}
          </div>
          
          <div className="divide-y max-h-96 overflow-y-auto">
            {notificaciones.slice(0, 10).map((notif) => {
              const config = getTipoConfig(notif.tipoAlerta)
              const Icon = config.icon
              
              return (
                <div 
                  key={notif.id} 
                  className={`p-4 hover:bg-gray-50 transition-colors ${!notif.leida ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notif.mensaje}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(parseISO(notif.fecha), 'dd MMM yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    {!notif.leida && (
                      <button
                        onClick={() => marcarLeidaMutation.mutate(notif.id)}
                        disabled={marcarLeidaMutation.isPending}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="Marcar como leída"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Modal de configuración */}
      {showConfig && (
        <ConfigurarAlertaModal 
          onClose={() => setShowConfig(false)}
          onSubmit={crearAlertaMutation.mutate}
          isLoading={crearAlertaMutation.isPending}
        />
      )}
    </div>
  )
}

// Componente modal para configurar alerta (simplificado)
function ConfigurarAlertaModal({ onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    patente: '',
    tipo: 'TODOS',
    emailNotificacion: '',
    activa: true
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Configurar Nueva Alerta</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patente
            </label>
            <input
              type="text"
              required
              value={formData.patente}
              onChange={(e) => setFormData({...formData, patente: e.target.value.toUpperCase()})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="ABC123"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Alerta
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {Object.entries(TIPOS_ALERTA).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email de Notificación
            </label>
            <input
              type="email"
              required
              value={formData.emailNotificacion}
              onChange={(e) => setFormData({...formData, emailNotificacion: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="usuario@email.com"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activa"
              checked={formData.activa}
              onChange={(e) => setFormData({...formData, activa: e.target.checked})}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="activa" className="text-sm text-gray-700">
              Alerta activa
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear Alerta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}