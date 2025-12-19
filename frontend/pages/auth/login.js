import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.rol === 'admin') {
        router.push('/admin');
      } else if (user.status_pago === 'pendiente') {
        router.push('/auth/payment');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (result.data.rol === 'admin') {
        router.push('/admin');
      } else if (result.data.status_pago === 'pendiente') {
        router.push('/auth/payment');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Information */}
          <div className="hidden md:block text-white space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-700 p-4 rounded-2xl shadow-2xl">
                <span className="material-symbols-outlined text-5xl">menu_book</span>
              </div>
              <div>
                <span className="text-4xl font-bold tracking-tighter block">
                  Aspirante<span className="text-yellow-400">Pro</span>
                </span>
                <p className="text-blue-200 text-sm">Preparación ESFM</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold mb-6">Tu camino al éxito comienza aquí</h2>
              
              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all">
                <div className="bg-yellow-400 p-3 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-900 text-2xl">school</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Material Actualizado</h3>
                  <p className="text-blue-200 text-sm">Accede a libros, exámenes pasados y simuladores</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all">
                <div className="bg-yellow-400 p-3 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-900 text-2xl">quiz</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Simuladores Interactivos</h3>
                  <p className="text-blue-200 text-sm">Practica con exámenes cronometrados y obtén resultados inmediatos</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all">
                <div className="bg-yellow-400 p-3 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-900 text-2xl">workspace_premium</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Acceso por Materia</h3>
                  <p className="text-blue-200 text-sm">Contenido especializado según tu carrera de interés</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all">
                <div className="bg-yellow-400 p-3 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-900 text-2xl">support_agent</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Soporte 24/7</h3>
                  <p className="text-blue-200 text-sm">Ayuda inmediata vía WhatsApp cuando lo necesites</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">500+</div>
                <div className="text-sm text-blue-200">Estudiantes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">15</div>
                <div className="text-sm text-blue-200">Especialidades</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">95%</div>
                <div className="text-sm text-blue-200">Satisfacción</div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div>
            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="bg-blue-700 p-3 rounded-xl shadow-lg">
                  <span className="material-symbols-outlined text-4xl text-white">menu_book</span>
                </div>
                <span className="text-3xl font-bold text-white tracking-tighter">
                  Aspirante<span className="text-yellow-400">Pro</span>
                </span>
              </div>
              <p className="text-blue-200">Prepárate para tu examen ESFM</p>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 animate-scale-in">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">¡Bienvenido de vuelta!</h2>
                <p className="text-gray-600 dark:text-gray-300">Ingresa a tu cuenta para continuar</p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 animate-bounce-in">
                  <span className="material-symbols-outlined">error</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">email</span>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition bg-white dark:bg-white text-gray-800"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">lock</span>
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition bg-white dark:bg-white text-gray-800"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-700 to-blue-800 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 shine-effect disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Ingresando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">login</span>
                      <span>Ingresar</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">¿No tienes cuenta?</span>
                  </div>
                </div>

                <Link 
                  href="/auth/register" 
                  className="block w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105 text-center flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">person_add</span>
                  <span>Crear cuenta nueva</span>
                </Link>

                <div className="text-center pt-2">
                  <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Volver al inicio
                  </Link>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-green-600 text-sm">verified_user</span>
                    <span>Datos Seguros</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-blue-600 text-sm">support</span>
                    <span>Soporte 24/7</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-yellow-600 text-sm">star</span>
                    <span>Garantizado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
