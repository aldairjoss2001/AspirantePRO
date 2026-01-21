import { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import api from '../../lib/axios';

export default function Simulacros() {
  const [simulacros, setSimulacros] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMateria, setFilterMateria] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    materia: '',
    numero_preguntas: 10,
    duracion_minutos: 60,
    publicado: false,
    fecha_inicio: '',
    fecha_expiracion: ''
  });

  const [questionFormData, setQuestionFormData] = useState({
    pregunta: '',
    opciones: ['', '', '', ''],
    respuesta_correcta: 0,
    explicacion: '',
    materia: '',
    dificultad: 'media',
    publicado: true
  });

  useEffect(() => {
    fetchSimulacros();
    fetchMaterias();
    fetchQuizzes();
  }, []);

  const fetchMaterias = async () => {
    try {
      const { data } = await api.get('/admin/materias');
      setMateriasDisponibles(data.data);
    } catch (error) {
      console.error('Error al cargar materias:', error);
    }
  };

  const fetchSimulacros = async () => {
    try {
      const { data } = await api.get('/simulacros/admin/all');
      setSimulacros(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar simulacros:', error);
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get('/quizzes');
      setQuizzes(data.data.filter(q => q.activo && q.publicado));
    } catch (error) {
      console.error('Error al cargar preguntas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (selectedQuestions.length !== parseInt(formData.numero_preguntas)) {
      alert(`Debes seleccionar exactamente ${formData.numero_preguntas} preguntas`);
      return;
    }

    const payload = {
      ...formData,
      preguntas: selectedQuestions
    };
    
    try {
      if (editingId) {
        await api.put(`/simulacros/admin/${editingId}`, payload);
      } else {
        await api.post('/simulacros/admin/create', payload);
      }
      
      setShowModal(false);
      resetForm();
      fetchSimulacros();
    } catch (error) {
      console.error('Error al guardar simulacro:', error);
      alert(error.response?.data?.message || 'Error al guardar el simulacro');
    }
  };

  const handleEdit = async (simulacroId) => {
    try {
      const { data } = await api.get(`/simulacros/admin/${simulacroId}`);
      const simulacro = data.data;
      
      setEditingId(simulacro._id);
      setFormData({
        titulo: simulacro.titulo,
        descripcion: simulacro.descripcion,
        materia: simulacro.materia,
        numero_preguntas: simulacro.numero_preguntas,
        duracion_minutos: simulacro.duracion_minutos,
        publicado: simulacro.publicado,
        fecha_inicio: simulacro.fecha_inicio ? new Date(simulacro.fecha_inicio).toISOString().slice(0, 16) : '',
        fecha_expiracion: simulacro.fecha_expiracion ? new Date(simulacro.fecha_expiracion).toISOString().slice(0, 16) : ''
      });
      setSelectedQuestions(simulacro.preguntas.map(p => p._id));
      setShowModal(true);
    } catch (error) {
      console.error('Error al cargar simulacro:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este simulacro?')) return;
    
    try {
      await api.delete(`/simulacros/admin/${id}`);
      fetchSimulacros();
    } catch (error) {
      console.error('Error al eliminar simulacro:', error);
      alert('Error al eliminar el simulacro');
    }
  };

  const togglePublish = async (id, currentStatus) => {
    try {
      const simulacro = simulacros.find(s => s._id === id);
      await api.put(`/simulacros/admin/${id}`, {
        ...simulacro,
        publicado: !currentStatus
      });
      fetchSimulacros();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      materia: '',
      numero_preguntas: 10,
      duracion_minutos: 60,
      publicado: false,
      fecha_inicio: '',
      fecha_expiracion: ''
    });
    setSelectedQuestions([]);
    setEditingId(null);
  };

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        if (prev.length < formData.numero_preguntas) {
          return [...prev, questionId];
        } else {
          alert(`Solo puedes seleccionar ${formData.numero_preguntas} preguntas`);
          return prev;
        }
      }
    });
  };

  const getAvailableQuestions = () => {
    let filtered = quizzes;
    
    if (formData.materia) {
      filtered = filtered.filter(q => 
        q.materia === formData.materia || q.materia === 'Todas las materias'
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.pregunta.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/admin/quizzes', questionFormData);
      setShowCreateQuestionModal(false);
      fetchQuizzes();
      setSuccessMessage('Pregunta creada exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error al crear pregunta:', error);
      setErrorMessage(error.response?.data?.message || 'Error al crear la pregunta');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleQuestionFormChange = (field, value) => {
    setQuestionFormData({ ...questionFormData, [field]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOpciones = [...questionFormData.opciones];
    newOpciones[index] = value;
    setQuestionFormData({ ...questionFormData, opciones: newOpciones });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-2 animate-bounce-in">
            <span className="material-symbols-outlined">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2 animate-bounce-in">
            <span className="material-symbols-outlined">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-900 dark:text-blue-400">quiz</span>
              Gestión de Simulacros
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Crea y administra simulacros de examen con preguntas configurables
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setQuestionFormData({
                  pregunta: '',
                  opciones: ['', '', '', ''],
                  respuesta_correcta: 0,
                  explicacion: '',
                  materia: '',
                  dificultad: 'media',
                  publicado: true
                });
                setShowCreateQuestionModal(true);
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 hover:scale-105"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Crear Pregunta
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all flex items-center gap-2 hover:scale-105"
            >
              <span className="material-symbols-outlined">add</span>
              Crear Simulacro
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Simulacros</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{simulacros.length}</p>
              </div>
              <span className="material-symbols-outlined text-blue-900 text-4xl">quiz</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Publicados</p>
                <p className="text-2xl font-bold text-green-600">{simulacros.filter(s => s.publicado).length}</p>
              </div>
              <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Borradores</p>
                <p className="text-2xl font-bold text-yellow-600">{simulacros.filter(s => !s.publicado).length}</p>
              </div>
              <span className="material-symbols-outlined text-yellow-600 text-4xl">edit_note</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Banco Preguntas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{quizzes.length}</p>
              </div>
              <span className="material-symbols-outlined text-purple-600 text-4xl">help</span>
            </div>
          </div>
        </div>

        {/* Simulacros List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Materia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Preguntas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {simulacros.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-6xl mb-4 block">quiz</span>
                      <p>No hay simulacros creados</p>
                      <p className="text-sm mt-2">Crea tu primer simulacro haciendo clic en "Crear Simulacro"</p>
                    </td>
                  </tr>
                ) : (
                  simulacros.map((simulacro) => (
                    <tr key={simulacro._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {simulacro.titulo}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {simulacro.descripcion?.substring(0, 50)}{simulacro.descripcion?.length > 50 ? '...' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {simulacro.materia}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {simulacro.preguntas?.length || 0} preguntas
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {simulacro.duracion_minutos} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePublish(simulacro._id, simulacro.publicado)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                            simulacro.publicado
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {simulacro.publicado ? 'Publicado' : 'Borrador'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(simulacro._id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(simulacro._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {editingId ? 'Editar Simulacro' : 'Crear Nuevo Simulacro'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título del Simulacro *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: Simulacro de Matemática - Nivel 1"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Describe el contenido y objetivo del simulacro..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Materia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Materia *
                    </label>
                    <select
                      value={formData.materia}
                      onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Seleccionar materia</option>
                      {materiasDisponibles.map((materia) => (
                        <option key={materia} value={materia}>
                          {materia}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Número de Preguntas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Número de Preguntas *
                    </label>
                    <input
                      type="number"
                      value={formData.numero_preguntas}
                      onChange={(e) => {
                        const num = parseInt(e.target.value);
                        setFormData({ ...formData, numero_preguntas: num });
                        // Adjust selected questions if needed
                        if (selectedQuestions.length > num) {
                          setSelectedQuestions(selectedQuestions.slice(0, num));
                        }
                      }}
                      min="5"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  {/* Duración */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duración (minutos) *
                    </label>
                    <input
                      type="number"
                      value={formData.duracion_minutos}
                      onChange={(e) => setFormData({ ...formData, duracion_minutos: parseInt(e.target.value) })}
                      min="10"
                      max="240"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  {/* Publicado */}
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.publicado}
                        onChange={(e) => setFormData({ ...formData, publicado: e.target.checked })}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Publicar inmediatamente
                      </span>
                    </label>
                  </div>
                </div>

                {/* Fechas Opcionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fecha Inicio (opcional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.fecha_inicio}
                      onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fecha Expiración (opcional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.fecha_expiracion}
                      onChange={(e) => setFormData({ ...formData, fecha_expiracion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Questions Selection */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Seleccionar Preguntas ({selectedQuestions.length}/{formData.numero_preguntas})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowQuestionModal(true)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm flex items-center gap-1"
                      disabled={!formData.materia}
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Seleccionar Preguntas
                    </button>
                  </div>
                  
                  {!formData.materia && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Primero selecciona una materia
                    </p>
                  )}
                  
                  {selectedQuestions.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {selectedQuestions.length} pregunta(s) seleccionada(s)
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={selectedQuestions.length !== parseInt(formData.numero_preguntas)}
                    className="flex-1 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                  >
                    {editingId ? 'Actualizar' : 'Crear'} Simulacro
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Question Modal */}
      {showCreateQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Crear Nueva Pregunta
              </h2>
              
              <form onSubmit={handleCreateQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pregunta *
                  </label>
                  <textarea
                    value={questionFormData.pregunta}
                    onChange={(e) => handleQuestionFormChange('pregunta', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Escribe la pregunta..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Opciones *
                  </label>
                  {questionFormData.opciones.map((opcion, index) => (
                    <input
                      key={index}
                      type="text"
                      value={opcion}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-2"
                      placeholder={`Opción ${index + 1}`}
                      required
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Respuesta Correcta *
                    </label>
                    <select
                      value={questionFormData.respuesta_correcta}
                      onChange={(e) => handleQuestionFormChange('respuesta_correcta', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value={0}>Opción 1</option>
                      <option value={1}>Opción 2</option>
                      <option value={2}>Opción 3</option>
                      <option value={3}>Opción 4</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Materia *
                    </label>
                    <select
                      value={questionFormData.materia}
                      onChange={(e) => handleQuestionFormChange('materia', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Seleccionar materia</option>
                      {materiasDisponibles.map((materia) => (
                        <option key={materia} value={materia}>
                          {materia}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dificultad *
                    </label>
                    <select
                      value={questionFormData.dificultad}
                      onChange={(e) => handleQuestionFormChange('dificultad', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="fácil">Fácil</option>
                      <option value="media">Media</option>
                      <option value="difícil">Difícil</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={questionFormData.publicado}
                        onChange={(e) => handleQuestionFormChange('publicado', e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Publicar pregunta
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Explicación
                  </label>
                  <textarea
                    value={questionFormData.explicacion}
                    onChange={(e) => handleQuestionFormChange('explicacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Explicación de la respuesta correcta..."
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
                  >
                    Crear Pregunta
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateQuestionModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Question Selection Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Seleccionar Preguntas ({selectedQuestions.length}/{formData.numero_preguntas})
              </h3>
              
              {/* Search */}
              <div className="mt-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar preguntas..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {getAvailableQuestions().map((question) => (
                  <div
                    key={question._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedQuestions.includes(question._id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                    onClick={() => handleQuestionToggle(question._id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question._id)}
                        onChange={() => {}}
                        className="mt-1 h-5 w-5"
                      />
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {question.pregunta}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            {question.materia}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            {question.dificultad}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getAvailableQuestions().length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No hay preguntas disponibles para esta materia
                  </p>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="w-full bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all"
              >
                Confirmar Selección
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
