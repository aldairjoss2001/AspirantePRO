import { useState, useEffect } from 'react';
import api from '../lib/axios';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data.data || []);
      setUnreadCount(data.data?.length || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'success':
        return { icon: 'check_circle', color: 'text-green-600' };
      case 'warning':
        return { icon: 'warning', color: 'text-yellow-600' };
      case 'error':
        return { icon: 'error', color: 'text-red-600' };
      default:
        return { icon: 'info', color: 'text-blue-600' };
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-700 hover:text-blue-700 transition-colors rounded-xl hover:bg-gray-100"
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          ></div>
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl z-50 max-h-[500px] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined">notifications</span>
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-auto text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => {
                  const { icon, color } = getIconByType(notif.tipo);
                  return (
                    <div key={notif._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className={`material-symbols-outlined text-2xl ${color} flex-shrink-0`}>
                          {icon}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {notif.titulo}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {notif.mensaje}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(notif.fecha_creacion).toLocaleDateString('es-BO', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">
                  notifications_off
                </span>
                <p className="text-sm">No hay notificaciones</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
