import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import DarkModeToggle from '../DarkModeToggle';
import LoadingSpinner from '../LoadingSpinner';

export default function AdminLayout({ children, activeTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/admin' },
    { name: 'Usuarios', icon: 'group', href: '/admin/usuarios' },
    { name: 'Contenido', icon: 'folder', href: '/admin/contenido' },
    { name: 'Quizzes', icon: 'quiz', href: '/admin/quizzes' },
    { name: 'Notificaciones', icon: 'notifications', href: '/admin/notificaciones' },
    { name: 'Configuración', icon: 'settings', href: '/admin/configuracion' },
  ];

  if (!user || !isAdmin) {
    return <LoadingSpinner fullScreen message="Cargando panel de administración..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-gradient-to-r from-blue-900 to-blue-800 dark:from-gray-800 dark:to-gray-900 shadow-lg animate-slide-in-up">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-yellow-400 transition-all duration-300 hover:scale-110 lg:hidden"
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
            
            <Link href="/admin" className="flex items-center gap-2 group">
              <div className="bg-yellow-400 p-2 rounded-xl text-blue-900 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tighter">
                Admin <span className="text-yellow-400">Panel</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <DarkModeToggle />
            
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-white dark:text-gray-200">{user.nombre_completo}</p>
              <p className="text-xs text-blue-200 dark:text-gray-400">Administrador</p>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-800 transition-all duration-300 hover:scale-105 font-semibold text-sm"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg transition-all duration-500 ease-in-out z-40 ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        }`}
      >
        <div className={`p-4 h-full overflow-y-auto ${!sidebarOpen && 'hidden lg:block'}`}>
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover-lift stagger-item ${
                  router.pathname === item.href
                    ? 'bg-blue-900 dark:bg-blue-700 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
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
        className={`pt-20 transition-all duration-500 ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
