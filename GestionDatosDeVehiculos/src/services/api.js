import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 segundos máximo
})

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
    ? JSON.parse(localStorage.getItem('auth-storage')).state?.token
    : null
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 402) {
      toast.error('Sin créditos disponibles. Recarga tu cuenta.')
    } else if (error.response?.status === 401) {
      toast.error('Sesión expirada. Por favor inicia sesión nuevamente.')
      window.location.href = '/login'
    } else if (error.response?.status === 429) {
      toast.error('Demasiadas consultas. Por favor espera un momento.')
    } else {
      const mensaje = error.response?.data?.mensaje || 'Error en la consulta'
      toast.error(mensaje)
    }
    
    return Promise.reject(error)
  }
)

// Servicios específicos
export const consultaService = {
  async consultarPatente(patente, tipo = 'COMPLETA') {
    const response = await api.post('/consultas/patente', {
      patente,
      tipoConsulta: tipo
    })
    return response.data
  },
  
  async consultarVin(vin, tipo = 'COMPLETA') {
    const response = await api.post('/consultas/vin', {
      vin,
      tipoConsulta: tipo
    })
    return response.data
  },
  
  async getCreditos() {
    const response = await api.get('/consultas/creditos')
    return response.data
  },
  
  async getHistorial(page = 0, size = 20) {
    const response = await api.get(`/historial?page=${page}&size=${size}`)
    return response.data
  }
}

export const dashboardService = {
  async getEstadisticas() {
    const response = await api.get('/estadisticas')
    return response.data
  }
}

export const historyService = {
  async getEstadisticasPeriodo(fechaDesde, fechaHasta) {
    const params = new URLSearchParams()
    if (fechaDesde) params.append('desde', fechaDesde)
    if (fechaHasta) params.append('hasta', fechaHasta)
    
    const response = await api.get(`/estadisticas/periodo?${params}`)
    return response.data
  },
  
  async getConsultasFrecuentes() {
    const response = await api.get('/historial/frecuentes')
    return response.data
  },
  
  async eliminarConsulta(id) {
    const response = await api.delete(`/historial/${id}`)
    return response.data
  }
}