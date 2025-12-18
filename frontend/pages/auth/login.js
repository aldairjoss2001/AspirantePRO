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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-blue-700 p-3 rounded-xl text-white shadow-lg">
              <span className="material-symbols-outlined text-4xl">menu_book</span>
            </div>
            <span className="text-3xl font-bold text-white tracking-tighter">
              Aspirante<span className="text-yellow-400">Pro</span>
            </span>
          </div>
          <p className="text-blue-200">Ingresa a tu cuenta</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-800 transition-all shine-effect disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/register" className="text-blue-700 font-semibold hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/landing.html" className="text-sm text-gray-500 hover:text-gray-700">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
