import { useDarkMode } from '../lib/DarkModeContext';

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 text-gray-700 hover:text-blue-700 dark:text-gray-300 dark:hover:text-yellow-400 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
      title={darkMode ? 'Modo claro' : 'Modo oscuro'}
    >
      <span className="material-symbols-outlined text-2xl">
        {darkMode ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
