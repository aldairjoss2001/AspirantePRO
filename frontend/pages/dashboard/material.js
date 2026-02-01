import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/axios';

export default function Material() {
  const { hasActiveAccess, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMateria, setSelectedMateria] = useState('all');
  const [selectedTab, setSelectedTab] = useState('libros'); // libros, tips, examenes
  const [searchQuery, setSearchQuery] = useState('');
  const [materias, setMaterias] = useState([]);

  useEffect(() => {
    fetchItems();
    fetchMaterias();
  }, [selectedTab]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      let tipo = 'libro';
      if (selectedTab === 'tips') tipo = 'tip';
      if (selectedTab === 'examenes') tipo = 'examen';
      
      const { data } = await api.get('/content', {
        params: { tipo }
      });
      setItems(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar contenido:', error);
      setLoading(false);
    }
  };

  const fetchMaterias = async () => {
    try {
      const { data } = await api.get('/content/materias');
      setMaterias(data.data.materias_usuario || []);
    } catch (error) {
      console.error('Error al cargar materias:', error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesMateria = selectedMateria === 'all' || item.materia === selectedMateria;
    const matchesSearch = searchQuery === '' || 
      item.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMateria && matchesSearch;
  });

  const handleDownload = (url) => {
    window.open(url, '_blank');
  };

  const handleView = (url) => {
    window.open(url, '_blank');
  };

  const tabs = [
    { key: 'libros', label: 'Libros', icon: 'auto_stories' },
    { key: 'tips', label: 'Tips', icon: 'lightbulb' },
    { key: 'examenes', label: 'Exámenes Pasados', icon: 'task' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-5xl text-blue-700 dark:text-blue-400">
              folder_open
            </span>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                Material de Estudio
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Accede a libros, tips y exámenes pasados para tu preparación
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                  selectedTab === tab.key
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título o descripción..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-white dark:text-black"
                />
              </div>
            </div>

            {/* Materia Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtrar por Materia
              </label>
              <select
                value={selectedMateria}
                onChange={(e) => setSelectedMateria(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-white dark:text-black"
              >
                <option value="all">Todas las materias</option>
                {materias.map((materia) => (
                  <option key={materia} value={materia}>
                    {materia}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedMateria !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  <span>Búsqueda: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-blue-600">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}
              {selectedMateria !== 'all' && (
                <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
                  <span>Materia: {selectedMateria}</span>
                  <button onClick={() => setSelectedMateria('all')} className="hover:text-purple-600">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando contenido...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">
              inbox
            </span>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {searchQuery || selectedMateria !== 'all' 
                ? 'No se encontraron resultados con los filtros aplicados'
                : `No hay ${tabs.find(t => t.key === selectedTab)?.label.toLowerCase()} disponibles`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 hover-lift"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">
                      {item.titulo}
                    </h3>
                    {item.descripcion && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {item.descripcion}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-lg text-xs font-semibold">
                        <span className="material-symbols-outlined text-sm">school</span>
                        {item.materia}
                      </span>
                      {item.categoria && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-xs font-semibold">
                          <span className="material-symbols-outlined text-sm">category</span>
                          {item.categoria}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(item.url_archivo || item.archivo_local)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-300 hover:scale-105 font-semibold text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">visibility</span>
                    Ver
                  </button>
                  <button
                    onClick={() => handleDownload(item.url_archivo || item.archivo_local)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 font-semibold text-sm ${
                      selectedTab === 'libros'
                        ? 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-800'
                        : 'bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
