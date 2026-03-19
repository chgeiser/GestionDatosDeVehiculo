// src/components/alertas/AlertasConfiguracion.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertasService } from '../../services/api'
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit2, 
  Car, 
  Mail, 
  Webhook,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

const TIPOS_ALERTA = [
  { 
    id: 'CAMBIO_ROBO', 
    label: 'Cambio en estado de robo', 
    descripcion: 'Notificar si el vehículo es denunciado como robado o recuperado',
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-50'
  },
  { 
    id: 'NUEVO_GRAVAMEN', 
    label: 'Nuevos gravámenes', 
    descripcion: 'Alertar cuando se registren nuevas prendas o embargos',
    icon: Car,
    color: 'text-amber-600 bg-amber-50'
  },
  { 
    id: 'CAMBIO_PROPIETARIO', 
    label: 'Cambio de propietario', 
    descripcion: 'Notificar transferencias de dominio',
    icon: Car,
    color: 'text-blue-600 bg-blue-50'
  },
  { 
    id: 'RT_VENCIMIENTO', 
    label: 'Vencimiento de Revisión Técnica', 
    descripcion: 'Alertar 30, 15 y 5 días antes del vencimiento',
    icon: Clock,
    color: 'text-purple-600 bg-purple-50'
  }
]

const FRECUENCIAS = [
  { value: 6, label: 'Cada 6 horas' },
  { value: 12, label: 'Cada 12 horas' },
  { value: 24, label: 'Una vez al día' },
  { value: 168, label: 'Una vez a la semana' }
]

export default function AlertasConfiguracion() {
  const [showModal, setShowModal] = useState(false)
  const [editingAlerta, setEditingAlerta] = useState(null)
  const queryClient = useQueryClient()
  
  const { data: alertas, isLoading } = useQuery({
    queryKey: ['alertas-config'],
    queryFn: alertasService.getConfiguraciones
  })
  
  const crearMutation = useMutation({
    mutationFn: alertasService.crearAlerta,
    onSuccess: () => {
      queryClient.invalidateQueries(['alertas-config'])
      setShowModal(false)
      toast.success('Alerta configurada correctamente')
    }
  })
  
  const eliminarMutation = useMutation({
    mutationFn: alertasService.eliminarAlerta,
    onSuccess: () => {
      queryClient.invalidateQueries(['alertas-config'])
      toast.success('Alerta eliminada')
    }
  })
  
  const toggleMutation = useMutation({
    mutationFn: ({ id, activa }) => alertasService.toggleAlerta(id, activa),
    onSuccess: () => queryClient.invalidateQueries(['alertas-config'])
  })
  
  if (isLoading) return <div>Cargando...</div>
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Alertas</h1>
          <p className="text-gray-600">Recibe notificaciones cuando cambie el estado de un vehículo</p>
        </div>
        
        <button
          onClick={() => {
            setEditingAlerta(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva alerta
        </button>
      </div>
      
      {/* Lista de alertas */}
      <div className="grid gap-4">
        {alertas?.data?.map((alerta) => {
          const tipoConfig = TIPOS_ALERTA.find(t => t.id === alerta.tipo)
          const Icon = tipoConfig?.icon || Bell
          
          return (
            <div 
              key={alerta.id} 
              className={`p-4 bg-white rounded-xl border transition-all ${
                alerta.activa ? 'border-gray-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${tipoConfig?.color || 'bg-gray-100'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{tipoConfig?.label}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        alerta.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {alerta.activa ? 'Activa' : 'Pausada'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1">{tipoConfig?.descripcion}</p>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {alerta.patente}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {FRECUENCIAS.find(f => f.value === alerta.frecuenciaHoras)?.label}
                      </span>
                      {alerta.emailNotificacion && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          Email
                        </span>
                      )}
                      {alerta.webhookUrl && (
                        <span className="flex items-center gap-1">
                          <Webhook className="w-4 h-4" />
                          Webhook
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMutation.mutate({ id: alerta.id, activa: !alerta.activa })}
                    className={`p-2 rounded-lg transition-colors ${
                      alerta.activa 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={alerta.activa ? 'Desactivar' : 'Activar'}
                  >
                    {alerta.activa ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingAlerta(alerta)
                      setShowModal(true)
                    }}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar esta alerta?')) {
                        eliminarMutation.mutate(