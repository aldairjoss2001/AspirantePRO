export default function LoadingSpinner({ fullScreen = false, size = 'md', message = 'Cargando...' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center z-50">
        <div className="relative">
          {/* Spinner circular animado */}
          <div className={`${sizeClasses.lg} border-4 border-blue-200 dark:border-blue-900 rounded-full animate-spin`}></div>
          <div className={`${sizeClasses.lg} border-4 border-transparent border-t-blue-700 dark:border-t-blue-500 rounded-full animate-spin absolute top-0 left-0`}></div>
        </div>
        <p className="mt-6 text-gray-700 dark:text-gray-300 text-lg font-medium animate-pulse">{message}</p>
        
        {/* Logo o icono animado */}
        <div className="mt-4 text-blue-700 dark:text-blue-500 animate-bounce">
          <span className="material-symbols-outlined text-5xl">menu_book</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-900 rounded-full animate-spin`}></div>
        <div className={`${sizeClasses[size]} border-4 border-transparent border-t-blue-700 dark:border-t-blue-500 rounded-full animate-spin absolute top-0 left-0`}></div>
      </div>
      {message && (
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
}
