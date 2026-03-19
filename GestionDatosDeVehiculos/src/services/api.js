// Agregar al final del archivo

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