import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import NotificationBell from '../NotificationBell';
import DarkModeToggle from '../DarkModeToggle';
import LoadingSpinner from '../LoadingSpinner';

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
    { name: 'Dashboard', icon: 'dashboard', href: '/dashboard', requiresAccess: false },
    { name: 'Contenido', icon: 'folder_open', href: '/dashboard/material', requiresAccess: true },
    { name: 'Simulacros', icon: 'quiz', href: '/dashboard/simulacros', requiresAccess: true },
    { name: 'Perfil', icon: 'account_circle', href: '/dashboard/perfil', requiresAccess: false },
  ];

  const isAccessBlocked = (item) => {
    if (!item.requiresAccess) return false;
    return user?.status_pago !== 'activo';
  };

  if (!user) {
    return <LoadingSpinner fullScreen message="Cargando panel..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white dark:bg-gray-800 shadow-md animate-slide-in-up">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110 lg:hidden"
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
            
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="bg-blue-700 dark:bg-blue-600 p-2 rounded-xl text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <span className="text-xl font-bold text-blue-900 dark:text-blue-400 tracking-tighter">
                Aspirante<span className="text-blue-500 dark:text-blue-300">Pro</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <NotificationBell />
            
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.nombre_completo}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.status_pago === 'activo' ? (
                  <span className="text-green-600 dark:text-green-400">✓ Activo</span>
                ) : user.status_pago === 'validando' ? (
                  <span className="text-yellow-600 dark:text-yellow-400">⏳ Validando</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">⚠ Pendiente</span>
                )}
              </p>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-300 hover:scale-105 font-semibold text-sm"
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
            {menuItems.map((item, index) => {
              const blocked = isAccessBlocked(item);
              return blocked ? (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl opacity-50 cursor-not-allowed stagger-item text-gray-500 dark:text-gray-500"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  title="Acceso bloqueado - Esperando aprobación del administrador"
                >
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  <span className={`font-semibold ${!sidebarOpen && 'lg:hidden'} flex-1`}>
                    {item.name}
                  </span>
                  <span className="material-symbols-outlined text-red-500">lock</span>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover-lift stagger-item ${
                    router.pathname === item.href
                      ? 'bg-blue-700 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  <span className={`font-semibold ${!sidebarOpen && 'lg:hidden'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
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
