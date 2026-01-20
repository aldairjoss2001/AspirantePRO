import { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import api from '../../lib/axios';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    whatsapp_number: '+59160572616'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings');
      if (data.data) {
        setFormData({
          whatsapp_number: data.data.whatsapp_number || '+59160572616'
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.put('/admin/settings', formData);
      setMessage('Configuración guardada exitosamente');
      fetchSettings();
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setMessage('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando configuración...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="settings">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-blue-900 dark:text-blue-400">settings</span>
            Configuración del Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Administra la configuración general de la plataforma</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* WhatsApp de Soporte */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">phone</span>
              WhatsApp de Soporte
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="whatsapp_number" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Número de WhatsApp
                </label>
                <input
                  type="text"
                  id="whatsapp_number"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  placeholder="+59160572616"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Este número aparecerá en el botón flotante de WhatsApp para soporte técnico
                </p>
              </div>
            </div>
          </div>

          {/* Botón de Guardar */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-900 dark:bg-blue-700 text-white rounded-xl hover:bg-blue-800 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Guardar Configuración
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
      fileFormData.append('qr', selectedFile);
      
      const { data } = await api.post('/admin/settings/qr', fileFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploading(false);
      return data.data.path;
    } catch (error) {
      console.error('Error al subir QR:', error);
      setUploading(false);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      let dataToSubmit = { ...formData };

      // Upload QR if file selected
      if (selectedFile) {
        const qrPath = await uploadQR();
        dataToSubmit.qr_code_url = qrPath;
      }

      await api.put('/admin/settings', dataToSubmit);
      setMessage('Configuración guardada exitosamente');
      setSelectedFile(null);
      fetchSettings();
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setMessage('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando configuración...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="settings">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-blue-900 dark:text-blue-400">settings</span>
            Configuración del Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Administra la configuración general de la plataforma</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Código QR de Pago */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-700 dark:text-purple-400">qr_code</span>
              Código QR de Pago
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  QR Actual
                </label>
                {formData.qr_code_url ? (
                  <div className="flex items-start gap-4">
                    <img
                      src={formData.qr_code_url}
                      alt="QR Code"
                      className="w-48 h-48 object-contain border-2 border-gray-200 dark:border-gray-600 rounded-xl"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Este código QR se muestra en la página de pago para los estudiantes
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No hay código QR configurado</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subir Nuevo QR
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Formatos aceptados: JPG, PNG. Tamaño recomendado: 500x500px
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Texto del QR
                </label>
                <textarea
                  name="qr_code_text"
                  value={formData.qr_code_text}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                  placeholder="Mensaje que aparece junto al código QR"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-700 dark:text-green-400">chat</span>
              WhatsApp de Soporte
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Número de WhatsApp
              </label>
              <input
                type="text"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="+591 60572616"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Este número aparece en el botón flotante de WhatsApp para los estudiantes
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving || uploading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  {uploading ? 'Subiendo...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Guardar Configuración
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
