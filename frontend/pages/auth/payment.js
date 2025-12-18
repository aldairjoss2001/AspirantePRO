import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/axios';

export default function Payment() {
  const [selectedMethod, setSelectedMethod] = useState('qr');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const { user, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.status_pago === 'activo') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Por favor selecciona un comprobante');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('comprobante', file);

      const { data } = await api.post('/auth/upload-comprobante', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      updateUser(data.data);
      setMessage('Comprobante enviado exitosamente. Estamos validando tu pago.');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al subir el comprobante');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-blue-700 p-3 rounded-xl text-white shadow-lg">
              <span className="material-symbols-outlined text-4xl">menu_book</span>
            </div>
            <span className="text-3xl font-bold text-white tracking-tighter">
              Aspirante<span className="text-yellow-400">Pro</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Completa tu Pago</h1>
          <p className="text-blue-200">Acceso total por solo 15 Bs.</p>
        </div>

        {/* Contenido Principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 grid lg:grid-cols-2 gap-8">
          {/* Información de Pago */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalles del Pago</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold">Monto:</span>
                <span className="text-2xl font-bold text-blue-700">15 Bs.</span>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl">
                <h3 className="font-bold text-blue-900 mb-2">Lo que obtienes:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                    Acceso de por vida
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                    Biblioteca completa de libros
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                    Exámenes pasados resueltos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                    Simulacros interactivos Pro
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                    Soporte vía WhatsApp
                  </li>
                </ul>
              </div>
            </div>

            {/* Métodos de Pago */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Método de Pago
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('qr')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === 'qr'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-blue-600 text-3xl">qr_code_2</span>
                  <p className="text-sm font-bold mt-2">QR Bancario</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedMethod('tarjeta')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === 'tarjeta'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-gray-700 text-3xl">credit_card</span>
                  <p className="text-sm font-bold mt-2">Tarjeta</p>
                </button>
              </div>
            </div>
          </div>

          {/* QR y Formulario */}
          <div>
            {selectedMethod === 'qr' && (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center mb-6">
                  <h3 className="font-bold text-gray-800 mb-4">Escanea el código QR</h3>
                  {/* QR Code Placeholder - En producción, aquí iría el QR real */}
                  <div className="bg-white p-8 rounded-xl inline-block shadow-lg">
                    <div className="w-48 h-48 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-700" style={{ fontSize: '100px' }}>
                        qr_code_2
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Usa tu app bancaria para escanear el QR
                  </p>
                </div>

                {/* Formulario de Comprobante */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Subir Comprobante de Pago
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Formatos aceptados: JPG, PNG, PDF
                    </p>
                  </div>

                  {message && (
                    <div className={`px-4 py-3 rounded-xl ${
                      message.includes('exitosamente')
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-4 bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-800 transition-all shine-effect disabled:opacity-50"
                  >
                    {uploading ? 'Enviando...' : 'Validar Pago'}
                  </button>
                </form>
              </>
            )}

            {selectedMethod === 'tarjeta' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-yellow-600 text-5xl mb-4">
                  construction
                </span>
                <h3 className="font-bold text-gray-800 mb-2">Próximamente</h3>
                <p className="text-gray-600 text-sm">
                  El pago con tarjeta estará disponible pronto. Por favor usa el método QR.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botón para Continuar sin Pagar (Demo) */}
        {user?.status_pago === 'pendiente' && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-white hover:text-yellow-400 text-sm underline"
            >
              Continuar al dashboard (sin validar pago)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
