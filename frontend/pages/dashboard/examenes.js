import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/axios';

export default function Examenes() {
  const { hasActiveAccess } = useAuth();
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMateria, setSelectedMateria] = useState('all');
  const [selectedCategoria, setSelectedCategoria] = useState('all');
  const [materias, setMaterias] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetchExamenes();
    fetchMaterias();
    fetchCategorias();
  }, []);

  const fetchExamenes = async () => {
    try {
      const { data } = await api.get('/content', {
        params: { tipo: 'examen_pasado' }
      });
      setExamenes(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar exámenes:', error);
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

  const fetchCategorias = async () => {
    try {
      const { data } = await api.get('/content/categories');
      setCategorias(data.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const filteredExamenes = examenes.filter(examen => {
    const matchesMateria = selectedMateria === 'all' || examen.materia === selectedMateria;
    const matchesCategoria = selectedCategoria === 'all' || examen.categoria === selectedCategoria;
    return matchesMateria && matchesCategoria;
  });

  const getFileUrl = (examen) => {
    return examen.archivo_local || examen.url_archivo;
  };

  if (!hasActiveAccess) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
            <span className="material-symbols-outlined text-yellow-600 text-6xl mb-4">lock</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
            <p className="text-gray-600 mb-6">
              Necesitas completar tu pago para acceder al banco de exámenes.
            </p>
            <a
              href="/auth/payment"
              className="inline-block px-8 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors"
            >
              Completar Pago
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-green-700">task</span>
          Banco de Exámenes
        </h1>
        <p className="text-gray-600">Exámenes pasados con respuestas explicadas</p>
      </div>

      {/* Filtros por Materia */}
      {materias.length > 0 && (
        <div className="mb-6 bg-white rounded-xl shadow-md p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">school</span>
            Filtrar por Materia
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedMateria('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedMateria === 'all'
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {materias.map((materia) => (
              <button
                key={materia}
                onClick={() => setSelectedMateria(materia)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedMateria === materia
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {materia}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtros por Categoría */}
      <div className="mb-6 bg-white rounded-xl shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">filter_list</span>
          Filtrar por Categoría
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategoria('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedCategoria === 'all'
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoria(cat)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategoria === cat
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Exámenes */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          <p className="mt-4 text-gray-600">Cargando exámenes...</p>
        </div>
      ) : filteredExamenes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExamenes.map((examen) => (
            <div
              key={examen._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-green-700 text-3xl">
                    task
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-2">{examen.titulo}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                      {examen.materia}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                      {examen.categoria}
                    </span>
                  </div>
                </div>
              </div>

              {examen.descripcion && (
                <p className="text-sm text-gray-600 mb-4">{examen.descripcion}</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>
                  {new Date(examen.fecha_subida).toLocaleDateString('es-BO')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Resuelto
                </span>
              </div>

              <div className="flex gap-2">
                <a
                  href={getFileUrl(examen)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">visibility</span>
                  Ver
                </a>
                <a
                  href={getFileUrl(examen)}
                  download
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1"
                  title="Descargar"
                >
                  <span className="material-symbols-outlined">download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-gray-300 text-6xl mb-4 block">
            assignment
          </span>
          <p className="text-gray-500">
            {selectedMateria !== 'all' 
              ? `No hay exámenes para la materia de ${selectedMateria}` 
              : 'No hay exámenes disponibles'}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
