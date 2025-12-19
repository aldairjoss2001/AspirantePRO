import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import NotificationBell from '../NotificationBell';

export default function DashboardLayout({ children, activeTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { name: 'Biblioteca', icon: 'auto_stories', href: '/dashboard/biblioteca' },
    { name: 'Exámenes', icon: 'task', href: '/dashboard/examenes' },
    { name: 'Simuladores', icon: 'quiz', href: '/dashboard/simuladores' },
    { name: 'Perfil', icon: 'account_circle', href: '/dashboard/perfil' },
  ];

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white shadow-md">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-gray-700 hover:text-blue-700 transition-colors lg:hidden"
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
            
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="bg-blue-700 p-2 rounded-xl text-white shadow-lg">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <span className="text-xl font-bold text-blue-900 tracking-tighter">
                Aspirante<span className="text-blue-500">Pro</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-800">{user.nombre_completo}</p>
              <p className="text-xs text-gray-500">
                {user.status_pago === 'activo' ? (
                  <span className="text-green-600">✓ Activo</span>
                ) : user.status_pago === 'validando' ? (
                  <span className="text-yellow-600">⏳ Validando</span>
                ) : (
                  <span className="text-red-600">⚠ Pendiente</span>
                )}
              </p>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-semibold text-sm"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        }`}
      >
        <div className={`p-4 h-full overflow-y-auto ${!sidebarOpen && 'hidden lg:block'}`}>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  router.pathname === item.href
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                <span className={`font-semibold ${!sidebarOpen && 'lg:hidden'}`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-20 transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/59178901234"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110 z-50"
        title="Contactar por WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  );
}
