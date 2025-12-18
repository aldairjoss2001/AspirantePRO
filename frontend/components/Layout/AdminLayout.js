import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';

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
  ];

  if (!user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-yellow-400 transition-colors lg:hidden"
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
            
            <Link href="/admin" className="flex items-center gap-2">
              <div className="bg-yellow-400 p-2 rounded-xl text-blue-900 shadow-lg">
                <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tighter">
                Admin <span className="text-yellow-400">Panel</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-white">{user.nombre_completo}</p>
              <p className="text-xs text-blue-200">Administrador</p>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-sm"
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
                    ? 'bg-blue-900 text-white'
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
    </div>
  );
}
