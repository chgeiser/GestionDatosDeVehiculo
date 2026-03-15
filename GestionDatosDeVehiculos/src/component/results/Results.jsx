import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  FileText,
  Car,
  User,
  Clock,
  MapPin,
  Printer,
  Download
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS_CONFIG = {
  robado: {
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-800 border-red-200',
    title: 'VEHÍCULO CON DENUNCIA DE ROBO',
    description: 'Este vehículo tiene una denuncia de robo activa. No proceda con la compra.'
  },
  limpio: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    title: 'SIN DENUNCIAS DE ROBO',
    description: 'No se encontraron denuncias de robo activas para este vehículo.'
  },
  gravamen: {
    icon: FileText,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    title: 'CON GRAVÁMENES',
    description: 'Este vehículo tiene cargas o gravámenes registrados.'
  }
}

export default function Results() {
  const { state } = useLocation()
  const { tipo, id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')
  
  // Si no hay estado, redirigir a búsqueda
  if (!state?.resultado) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No hay resultados para mostrar</p>
        <button 
          onClick={() => navigate('/')}
          className="text-primary-600 hover:underline"
        >
          Volver a buscar
        </button>
      </div>
    )
  }
  
  const { datos, creditosRestantes, tiempoRespuestaMs } = state.resultado
  
  // Determinar estado general
  const getEstadoGeneral = () => {
    if (datos.estadoRobo?.estaRobado) return 'robado'
    if (datos.tieneGravamenesActivos) return 'gravamen'
    return 'limpio'
  }
  
  const estadoGeneral = getEstadoGeneral()
  const statusConfig = STATUS_CONFIG[estadoGeneral]
  const StatusIcon = statusConfig.icon
  
  const tabs = [
    { id: 'general', label: 'Información General' },
    { id: 'historial', label: 'Historial de Robos' },
    { id: 'gravamenes', label: 'Gravámenes' },
    { id: 'multas', label: 'Multas y RT' }
  ]
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Nueva consulta
        </button>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>
      
      {/* Banner de estado */}
      <div className={`rounded-xl p-6 border-2 ${statusConfig.color}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full bg-white bg-opacity-50`}>
            <StatusIcon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{statusConfig.title}</h2>
            <p className="opacity-90 mb-3">{statusConfig.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Consultado: {format(new Date(datos.fechaConsulta), 'dd/MM/yyyy HH:mm', { locale: es })}
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Fuente: {datos.fuente}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Tiempo respuesta:</span> {tiempoRespuestaMs}ms
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          {/* Tab: Información General */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary-500" />
                  Datos del Vehículo
                </h3>
                
                <InfoRow label="Patente" value={datos.patente} highlight />
                <InfoRow label="VIN (NIV)" value={datos.vin} monospace />
                <InfoRow label="Marca" value={datos.marca} />
                <InfoRow label="Modelo" value={datos.modelo} />
                <InfoRow label="Año" value={datos.anio} />
                <InfoRow label="Tipo" value={datos.tipoVehiculo} />
                <InfoRow label="Color" value={datos.color} />
                <InfoRow label="N° Motor" value={datos.motor} monospace />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" />
                  Resumen de Riesgo
                </h3>
                
                <div className="space-y-3">
                  <RiskIndicator 
                    label="Estado de Robo" 
                    status={datos.estadoRobo?.estaRobado ? 'danger' : 'success'}
                    detail={datos.estadoRobo?.estaRobado ? 'Con denuncia activa' : 'Sin denuncias'}
                  />
                  <RiskIndicator 
                    label="Gravámenes" 
                    status={datos.tieneGravamenesActivos ? 'warning' : 'success'}
                    detail={datos.tieneGravamenesActivos ? `${datos.gravamenes?.length} cargas activas` : 'Sin cargas'}
                  />
                  <RiskIndicator 
                    label="Multas SOAPA" 
                    status={datos.tieneMultasPendientes ? 'warning' : 'success'}
                    detail={datos.tieneMultasPendientes ? 'Con multas pendientes' : 'Sin multas'}
                  />
                  <RiskIndicator 
                    label="Revisión Técnica" 
                    status={datos.revisionTecnica?.aprobada ? 'success' : 'neutral'}
                    detail={datos.revisionTecnica?.aprobada ? 'Vigente' : 'No encontrada'}
                  />
                </div>
                
                {datos.propietarioRutHash && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      Información de Propietario
                    </h4>
                    <p className="text-sm text-gray-500">
                      Los datos del propietario están encriptados y solo pueden ser 
                      desencriptados con autorización judicial según Ley 19.628.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Tab: Historial de Robos */}
          {activeTab === 'historial' && (
            <div>
              {datos.historialRobos?.length > 0 ? (
                <div className="space-y-4">
                  {datos.historialRobos.map((robo, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-red-50 border-red-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-red-900">
                            Denuncia {robo.estado}
                          </div>
                          <div className="text-sm text-red-700 mt-1">
                            <p>Fecha denuncia: {format(new Date(robo.fechaDenuncia), 'dd/MM/yyyy', { locale: es })}</p>
                            {robo.fechaRecupero && (
                              <p>Fecha recupero: {format(new Date(robo.fechaRecupero), 'dd/MM/yyyy', { locale: es })}</p>
                            )}
                            <p>Comisaría: {robo.comisaria}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">No se encontraron denuncias de robo para este vehículo</p>
                </div>
              )}
            </div>
          )}
          
          {/* Tab: Gravámenes */}
          {activeTab === 'gravamenes' && (
            <div>
              {datos.gravamenes?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acreedor</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha Inscripción</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {datos.gravamenes.map((gravamen, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{gravamen.tipo}</td>
                          <td className="px-4 py-3 text-sm">{gravamen.acreedor}</td>
                          <td className="px-4 py-3 text-sm">
                            {format(new Date(gravamen.fechaInscripcion), 'dd/MM/yyyy', { locale: es })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              gravamen.activo 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {gravamen.activo ? 'Activo' : 'Cancelado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">No se encontraron gravámenes para este vehículo</p>
                </div>
              )}
            </div>
          )}
          
          {/* Tab: Multas */}
          {activeTab === 'multas' && (
            <div className="space-y-6">
              {/* Multas SOAPA */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Multas SOAPA</h4>
                {datos.multasSoap?.length > 0 ? (
                  <div className="space-y-2">
                    {datos.multasSoap.map((multa, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{multa.motivo}</p>
                          <p className="text-xs text-gray-500">Folio: {multa.folio}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-amber-700">${multa.monto?.toLocaleString('es-CL')}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            multa.pagada ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {multa.pagada ? 'Pagada' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No se encontraron multas</p>
                )}
              </div>
              
              {/* Revisión Técnica */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Revisión Técnica</h4>
                {datos.revisionTecnica ? (
                  <div className={`p-4 rounded-lg border ${
                    datos.revisionTecnica.aprobada 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Estado: {datos.revisionTecnica.resultado}
                        </p>
                        <p className="text-sm text-gray-600">
                          Vencimiento: {datos.revisionTecnica.fechaVencimiento 
                            ? format(new Date(datos.revisionTecnica.fechaVencimiento), 'dd/MM/yyyy', { locale: es })
                            : 'No disponible'
                          }
                        </p>
                      </div>
                      {datos.revisionTecnica.aprobada ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No se encontró información de revisión técnica</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Disclaimer legal */}
      <div className="text-xs text-gray-400 text-center">
        <p>
          La información proporcionada tiene carácter informativo y no constituye certificación oficial.
          Última actualización: {format(new Date(datos.fechaConsulta), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
        </p>
      </div>
    </div>
  )
}

// Componentes auxiliares
function InfoRow({ label, value, highlight, monospace }) {
  if (!value) return null
  
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className={`font-medium ${highlight ? 'text-lg text-primary-700' : 'text-gray-900'} ${monospace ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function RiskIndicator({ label, status, detail }) {
  const colors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800'
  }
  
  const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    danger: XCircle,
    neutral: FileText
  }
  
  const Icon = icons[status]
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-full ${colors[status]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="font-medium text-sm text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{detail}</p>
        </div>
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors[status]}`}>
        {status === 'success' ? 'OK' : status === 'danger' ? 'ALERTA' : 'REVISAR'}
      </span>
    </div>
  )
}