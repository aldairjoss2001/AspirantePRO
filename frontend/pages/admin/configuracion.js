import { useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/axios';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleUpdatePhoto = async (e) => {
    e.preventDefault();
    
    if (!photoFile) {
      setMessage('Por favor selecciona una foto');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const formDataPhoto = new FormData();
      formDataPhoto.append('foto', photoFile);

      const { data } = await api.put('/users/photo', formDataPhoto, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      updateUser(data.data);
      setMessage('Foto actualizada exitosamente');
      setPhotoFile(null);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al actualizar foto');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (formData.new_password !== formData.confirm_password) {
      setMessage('Las contraseñas no coinciden');
      setSaving(false);
      return;
    }

    if (formData.new_password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      setSaving(false);
      return;
    }

    try {
      await api.put('/admin/profile/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      setMessage('Contraseña actualizada exitosamente');
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setMessage(error.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeTab="settings">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8 animate-slide-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-blue-900 dark:text-blue-400">account_circle</span>
            Mi Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Administra tu perfil y seguridad</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl animate-slide-in-up ${
            message.includes('exitosamente')
              ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Información de Cuenta */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6 animate-scale-in transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-900 dark:text-blue-400">badge</span>
            Información de Cuenta
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nombre Completo</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{user?.nombre_completo}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{user?.email}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rol</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg text-purple-600 dark:text-purple-400">admin_panel_settings</span>
                  Administrador
                </span>
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fecha de Registro</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {user?.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString('es-BO') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Actualizar Foto de Perfil */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6 animate-scale-in transition-all duration-300 hover:shadow-xl" style={{animationDelay: '0.1s'}}>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-900 dark:text-blue-400">photo_camera</span>
            Foto de Perfil
          </h2>

          <form onSubmit={handleUpdatePhoto} className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {user?.foto_perfil ? (
                  <img
                    src={user.foto_perfil}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-400 text-5xl">
                      account_circle
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 outline-none transition"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Formatos aceptados: JPG, PNG
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !photoFile}
              className="px-6 py-3 bg-blue-900 dark:bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 dark:hover:bg-blue-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Actualizando...' : 'Actualizar Foto'}
            </button>
          </form>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cambiar Contraseña */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 animate-scale-in transition-all duration-300 hover:shadow-xl" style={{animationDelay: '0.2s'}}>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-900 dark:text-blue-400">lock</span>
              Cambiar Contraseña
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="current_password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña actual"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="Ingresa tu nueva contraseña"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Mínimo 6 caracteres
                </p>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirma tu nueva contraseña"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Botón de Guardar */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-900 dark:bg-blue-700 text-white rounded-xl hover:bg-blue-800 dark:hover:bg-blue-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Actualizar Contraseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
