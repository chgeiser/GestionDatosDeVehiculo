import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../services/api'
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Settings, 
  Plus,
  Trash2,
  Car,
  Mail,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const TIPOS_ALERTA = {
  'CAMBIO_ROBO': { 
    label: 'Cambio en estado de robo', 
    icon: AlertTriangle, 
    color: 'text-red-600',
    desc: 'Notifícame si el vehículo es reportado como robado'
  },
  'NUEVO_GRAVAMEN': { 
    label: 'Nuevo gravamen detectado', 
    icon: CheckCircle, 
    color: 'text-amber-600',
    desc: 'Alerta cuando se registren nuevas cargas o prendas'
  },
  'CAMBIO_PROPIETARIO': { 
    label: 'Cambio de propietario', 
    icon: Car, 
    color: 'text-blue-600',
    desc: 'Aviso si el vehículo cambia de dueño'
  },
  'REVISION_TECNICA_VENC': { 
    label: 'Revisión técnica por vencer',
    icon:  AlertTriangle,
    color: 'text-red-600',
    desc: 'Aviso de notificación por Revisión Vencida'
  },
}