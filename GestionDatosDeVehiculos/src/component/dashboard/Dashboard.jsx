import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../../services/api'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  Search, 
  Clock, 
  AlertCircle,
  Loader2
} from 'lucide-react'

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e']

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['estadisticas'],
    queryFn: dashboardService.getEstadisticas,
    staleTime: 1000 * 60 * 5 // 5 minutos
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }
  
  const stats = data?.data || {}
  
  // Datos de ejemplo para gráficos (en producción vendrían del backend)
  const consultasPorDia = [
    { dia: 'Lun', consultas: 12 },
    { dia: 'Mar', consultas: 19 },
    { dia: 'Mie', consultas: 15 },
    { dia: 'Jue', consultas: 25 },
    { dia: 'Vie', consultas: 32 },
    { dia: 'Sab', consultas: 8 },
    { dia: 'Dom', consultas: 5 },
  ]
  
  const tiposConsulta = [
    { name: 'Completa', value: 45, color: '#3b82f6' },
    { name: 'Robo', value: 30, color: '#ef4444' },
    { name: 'Gravámenes', value: 25, color: '#f59e0b' },
  ]
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Consultas este mes"
          value={stats.consultasMesActual || 0}
          icon={Search}
          trend="+12%"
          color="blue"
        />
        <StatCard 
          title="Tiempo promedio"
          value={`${stats.tiempoPromedioMs || 450}ms`}
          icon={Clock}
          trend="-5%"
          color="green"
        />
        <StatCard 
          title="Alertas de robo"
          value={stats.alertasRobo || 3}
          icon={AlertCircle}
          trend="+2"
          color="red"
        />
        <StatCard 
          title="Créditos usados"
          value={`${stats.creditosConsumidosMes || 0}`}
          icon={TrendingUp}
          trend="85% del plan"
          color="amber"
        />
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultas por día */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Consultas por día</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consultasPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="dia" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="consultas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Distribución por tipo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Tipos de consulta</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tiposConsulta}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tiposConsulta.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {tiposConsulta.map((tipo) => (
              <div key={tipo.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tipo.color }} />
                <span className="text-sm text-gray-600">{tipo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Top patentes consultadas */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Vehículos más consultados</h3>
        </div>
        <div className="divide-y">
          {(stats.topPatentesConsultadas || []).map((item, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{item.patente}</p>
                  <p className="text-sm text-gray-500">{item.marca} {item.modelo}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{item.totalConsultas} consultas</p>
                <p className="text-sm text-gray-500">Última: {item.ultimaConsulta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600'
  }
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-400 mt-1">{trend}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}