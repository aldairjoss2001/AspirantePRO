import { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import api from '../../lib/axios';

export default function Notificaciones() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
    tipo: 'info',
    activo: true
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await api.put(`/admin/notifications/${editingId}`, formData);
      } else {
        await api.post('/admin/notifications', formData);
      }
      
      setShowModal(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Error al guardar notificación:', error);
      alert('Error al guardar la notificación');
    }
  };

  const handleEdit = (notification) => {
    setEditingId(notification._id);
    setFormData({
      titulo: notification.titulo,
      mensaje: notification.mensaje,
      tipo: notification.tipo,
      activo: notification.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta notificación?')) return;
    
    try {
      await api.delete(`/admin/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      alert('Error al eliminar la notificación');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/admin/notifications/${id}`, { activo: !currentStatus });
      fetchNotifications();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      mensaje: '',
      tipo: 'info',
      activo: true
    });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const getNotificationColor = (tipo) => {
    switch (tipo) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-800',
          icon: 'check_circle',
          iconColor: 'text-green-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-800',
          icon: 'warning',
          iconColor: 'text-yellow-600'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-800',
          icon: 'error',
          iconColor: 'text-red-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-800',
          icon: 'info',
          iconColor: 'text-blue-600'
        };
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Cargando notificaciones...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="notificaciones">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-yellow-600">notifications</span>
            Gestión de Notificaciones
          </h1>
          <p className="text-gray-600">Envía anuncios globales a todos los estudiantes</p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition-colors shadow-lg"
        >
          <span className="material-symbols-outlined">add</span>
          Nueva Notificación
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-800">{notifications.length}</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-gray-700">notifications</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-green-700">
                {notifications.filter(n => n.activo).length}
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl text-green-700">check_circle</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactivas</p>
              <p className="text-2xl font-bold text-gray-700">
                {notifications.filter(n => !n.activo).length}
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl text-gray-400">notifications_off</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertas</p>
              <p className="text-2xl font-bold text-red-700">
                {notifications.filter(n => n.tipo === 'warning' || n.tipo === 'error').length}
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl text-red-700">warning</span>
          </div>
        </div>
      </div>

      {/* Lista de Notificaciones */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const colorScheme = getNotificationColor(notification.tipo);
            
            return (
              <div
                key={notification._id}
                className={`rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-l-4 ${colorScheme.bg} ${colorScheme.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`material-symbols-outlined text-3xl ${colorScheme.iconColor}`}>
                        {colorScheme.icon}
                      </span>
                      <h3 className={`text-xl font-bold ${colorScheme.text}`}>
                        {notification.titulo}
                      </h3>
                    </div>
                    
                    <p className={`mb-4 ${colorScheme.text}`}>
                      {notification.mensaje}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${
                        notification.tipo === 'info'
                          ? 'bg-blue-100 text-blue-700'
                          : notification.tipo === 'success'
                          ? 'bg-green-100 text-green-700'
                          : notification.tipo === 'warning'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span className="material-symbols-outlined text-xs">label</span>
                        {notification.tipo}
                      </span>
                      
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${
                        notification.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <span className="material-symbols-outlined text-xs">
                          {notification.activo ? 'visibility' : 'visibility_off'}
                        </span>
                        {notification.activo ? 'Visible' : 'Oculto'}
                      </span>
                      
                      <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        {new Date(notification.fecha_creacion).toLocaleDateString('es-BO')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => toggleActive(notification._id, notification.activo)}
                      className={`p-2 rounded-lg transition-colors ${
                        notification.activo
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={notification.activo ? 'Ocultar' : 'Mostrar'}
                    >
                      <span className="material-symbols-outlined">
                        {notification.activo ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleEdit(notification)}
                      className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-gray-300 text-6xl mb-4 block">
              notifications_off
            </span>
            <p className="text-gray-500">No hay notificaciones disponibles</p>
          </div>
        )}
      </div>

      {/* Modal para Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-600">
                  {editingId ? 'edit' : 'add'}
                </span>
                {editingId ? 'Editar Notificación' : 'Nueva Notificación'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">title</span>
                  Título
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition"
                  placeholder="Ej: Nuevo contenido disponible"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">description</span>
                  Mensaje
                </label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition"
                  placeholder="Escribe el mensaje de la notificación..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">category</span>
                  Tipo de Notificación
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition"
                >
                  <option value="info">Información</option>
                  <option value="success">Éxito</option>
                  <option value="warning">Advertencia</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="activo"
                  id="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                />
                <label htmlFor="activo" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">visibility</span>
                  Notificación activa (visible para estudiantes)
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition-colors"
                >
                  {editingId ? 'Guardar Cambios' : 'Crear Notificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
