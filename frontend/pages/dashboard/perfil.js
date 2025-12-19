import { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/axios';

export default function Perfil() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    nombre_completo: user?.nombre_completo || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.put('/users/profile', {
        nombre_completo: formData.nombre_completo
      });
      
      updateUser(data.data);
      setMessage('Perfil actualizado exitosamente');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhoto = async (e) => {
    e.preventDefault();
    
    if (!photoFile) {
      setMessage('Por favor selecciona una foto');
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await api.put('/auth/update-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setMessage('Contraseña actualizada exitosamente');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al actualizar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-blue-700 dark:text-blue-400">account_circle</span>
            Mi Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Administra tu cuenta y preferencias</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.includes('exitosamente')
              ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Información de Cuenta */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700 dark:text-blue-400">badge</span>
            Información de Cuenta
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nombre Completo</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{user?.nombre_completo}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{user?.email}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estado de Pago</p>
              <p className="font-semibold">
                {user?.status_pago === 'activo' ? (
                  <span className="text-green-600 dark:text-green-400">✓ Activo</span>
                ) : user?.status_pago === 'validando' ? (
                  <span className="text-yellow-600 dark:text-yellow-400">⏳ Validando</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">⚠ Pendiente</span>
                )}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fecha de Registro</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {new Date(user?.fecha_registro).toLocaleDateString('es-BO')}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rol</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{user?.rol}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Materias Habilitadas</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {user?.materias_acceso && user?.materias_acceso.length > 0 ? (
                  user.materias_acceso.map((materia, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-semibold"
                    >
                      {materia}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">Sin materias asignadas</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actualizar Foto de Perfil */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700 dark:text-blue-400">photo_camera</span>
            Foto de Perfil
          </h2>

          <form onSubmit={handleUpdatePhoto} className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Formatos aceptados: JPG, PNG
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !photoFile}
              className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar Foto'}
            </button>
          </form>
        </div>

        {/* Cambiar Contraseña */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700 dark:text-blue-400">lock</span>
            Cambiar Contraseña
          </h2>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Contraseña Actual
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
