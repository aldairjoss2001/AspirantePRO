import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/axios';

export default function Dashboard() {
  const { user, hasActiveAccess } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/users/stats');
      setStats(data.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  return (
    <DashboardLayout activeTab="dashboard">
      {/* Header de Bienvenida */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-blue-700 dark:text-blue-400">waving_hand</span>
          ¡Bienvenido, {user?.nombre_completo?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Prepárate para tu ingreso a la ESFM</p>
      </div>

      {/* Alerta de Estado de Pago */}
      {!hasActiveAccess && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded-lg animate-slide-in-left">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-3xl mr-3">
              warning
            </span>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Acceso Restringido</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {user?.status_pago === 'validando'
                  ? 'Estamos validando tu pago. Recibirás acceso completo pronto.'
                  : 'Completa tu pago para acceder a todo el contenido.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas Rápidas */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-5xl opacity-80">folder_open</span>
            <div className="text-right">
              <p className="text-3xl font-bold">100+</p>
              <p className="text-sm opacity-90">Contenidos</p>
            </div>
          </div>
          <p className="text-sm opacity-90">Libros, tips y exámenes</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-5xl opacity-80">quiz</span>
            <div className="text-right">
              <p className="text-3xl font-bold">20+</p>
              <p className="text-sm opacity-90">Simulacros</p>
            </div>
          </div>
          <p className="text-sm opacity-90">Exámenes de práctica</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-5xl opacity-80">school</span>
            <div className="text-right">
              <p className="text-3xl font-bold">{user?.materias_acceso?.length || 0}</p>
              <p className="text-sm opacity-90">Materias</p>
            </div>
          </div>
          <p className="text-sm opacity-90">Asignadas a ti</p>
        </div>
      </div>

      {/* Notificaciones y Accesos Rápidos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notificaciones */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700">notifications</span>
            Anuncios Importantes
          </h2>
          
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 rounded-xl border-l-4 ${
                    notif.tipo === 'info'
                      ? 'bg-blue-50 border-blue-500'
                      : notif.tipo === 'success'
                      ? 'bg-green-50 border-green-500'
                      : notif.tipo === 'warning'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <h3 className="font-bold text-gray-800 mb-1">{notif.titulo}</h3>
                  <p className="text-sm text-gray-600">{notif.mensaje}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notif.fecha_creacion).toLocaleDateString('es-BO')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay anuncios en este momento</p>
          )}
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700">rocket_launch</span>
            Accesos Rápidos
          </h2>
          
          <div className="space-y-3">
            <a
              href="/dashboard/material"
              className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">folder_open</span>
              </div>
              <div>
                <p className="font-bold text-gray-800">Contenido</p>
                <p className="text-sm text-gray-600">Libros, tips y exámenes</p>
              </div>
            </a>

            <a
              href="/dashboard/simulacros"
              className="flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">quiz</span>
              </div>
              <div>
                <p className="font-bold text-gray-800">Simulacros</p>
                <p className="text-sm text-gray-600">Exámenes de práctica</p>
              </div>
            </a>

            <a
              href="/dashboard/perfil"
              className="flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">account_circle</span>
              </div>
              <div>
                <p className="font-bold text-gray-800">Mi Perfil</p>
                <p className="text-sm text-gray-600">Ver información personal</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
