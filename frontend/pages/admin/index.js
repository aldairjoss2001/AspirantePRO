import { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import api from '../../lib/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="dashboard">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          📊 Panel de Administración
        </h1>
        <p className="text-gray-600">Gestiona AspirantePro desde aquí</p>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-5xl opacity-80">group</span>
            <div className="text-right">
              <p className="text-4xl font-bold">{stats?.usuarios?.total || 0}</p>
              <p className="text-sm opacity-90">Total Usuarios</p>
            </div>
          </div>
          <div className="flex justify-between text-sm opacity-90">
            <span>Activos: {stats?.usuarios?.activos || 0}</span>
            <span>Pendientes: {stats?.usuarios?.pendientes || 0}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-5xl opacity-80">payments</span>
            <div className="text-right">
              <p className="text-4xl font-bold">{stats?.ingresos?.total || 0}</p>
              <p className="text-sm opacity-90">Bolivianos</p>
            </div>
          </div>
          <p className="text-sm opacity-90">Ingresos totales</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-5xl opacity-80">folder</span>
            <div className="text-right">
              <p className="text-4xl font-bold">{stats?.contenido?.total || 0}</p>
              <p className="text-sm opacity-90">Contenidos</p>
            </div>
          </div>
          <p className="text-sm opacity-90">Libros y exámenes</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-5xl opacity-80">quiz</span>
            <div className="text-right">
              <p className="text-4xl font-bold">{stats?.quizzes?.total || 0}</p>
              <p className="text-sm opacity-90">Preguntas</p>
            </div>
          </div>
          <p className="text-sm opacity-90">En simuladores</p>
        </div>
      </div>

      {/* Validaciones Pendientes */}
      {stats?.usuarios?.validando > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-yellow-600 text-4xl">
              hourglass_empty
            </span>
            <div>
              <h3 className="text-lg font-bold text-yellow-800">
                {stats.usuarios.validando} pago(s) por validar
              </h3>
              <p className="text-sm text-yellow-700">
                Hay usuarios esperando que valides su comprobante de pago
              </p>
            </div>
            <a
              href="/admin/usuarios"
              className="ml-auto px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition-colors"
            >
              Revisar
            </a>
          </div>
        </div>
      )}

      {/* Accesos Rápidos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          href="/admin/usuarios"
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-blue-700 text-3xl">group</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Gestionar Usuarios</h3>
          <p className="text-gray-600 text-sm">Aprobar pagos y gestionar accesos</p>
        </a>

        <a
          href="/admin/contenido"
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
        >
          <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-purple-700 text-3xl">folder</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Gestionar Contenido</h3>
          <p className="text-gray-600 text-sm">Subir libros y exámenes</p>
        </a>

        <a
          href="/admin/quizzes"
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
        >
          <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-green-700 text-3xl">quiz</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Gestionar Quizzes</h3>
          <p className="text-gray-600 text-sm">Crear y editar preguntas</p>
        </a>

        <a
          href="/admin/notificaciones"
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
        >
          <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-yellow-700 text-3xl">notifications</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Notificaciones</h3>
          <p className="text-gray-600 text-sm">Enviar anuncios globales</p>
        </a>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-red-700 text-3xl">trending_up</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Registros Recientes</h3>
          <p className="text-gray-600 text-sm">
            {stats?.registrosRecientes || 0} nuevos usuarios en 30 días
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
