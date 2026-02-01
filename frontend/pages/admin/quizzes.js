import { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import api from '../../lib/axios';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [formData, setFormData] = useState({
    pregunta: '',
    opciones: ['', '', '', ''],
    respuesta_correcta: 0,
    explicacion: '',
    categoria: '',
    materia: '',
    dificultad: 'media',
    activo: true,
    fecha_inicio: '',
    fecha_expiracion: '',
    publicado: true
  });

  useEffect(() => {
    fetchQuizzes();
    fetchMaterias();
  }, []);

  const fetchMaterias = async () => {
    try {
      const { data } = await api.get('/admin/materias');
      setMateriasDisponibles(data.data);
    } catch (error) {
      console.error('Error al cargar materias:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get('/quizzes');
      setQuizzes(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar quizzes:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await api.put(`/admin/quizzes/${editingId}`, formData);
      } else {
        await api.post('/admin/quizzes', formData);
      }
      
      setShowModal(false);
      resetForm();
      fetchQuizzes();
    } catch (error) {
      console.error('Error al guardar pregunta:', error);
      alert('Error al guardar la pregunta');
    }
  };

  const handleEdit = async (quizId) => {
    try {
      // Fetch the full quiz with answer
      const { data } = await api.get(`/admin/quizzes/${quizId}`);
      const quiz = data.data;
      
      setEditingId(quiz._id);
      setFormData({
        pregunta: quiz.pregunta,
        opciones: quiz.opciones,
        respuesta_correcta: quiz.respuesta_correcta,
        explicacion: quiz.explicacion,
        categoria: quiz.categoria,
        materia: quiz.materia || '',
        dificultad: quiz.dificultad || 'media',
        activo: quiz.activo !== undefined ? quiz.activo : true,
        fecha_inicio: quiz.fecha_inicio ? new Date(quiz.fecha_inicio).toISOString().slice(0, 16) : '',
        fecha_expiracion: quiz.fecha_expiracion ? new Date(quiz.fecha_expiracion).toISOString().slice(0, 16) : '',
        publicado: quiz.publicado !== undefined ? quiz.publicado : true
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error al cargar pregunta:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return;
    
    try {
      await api.delete(`/admin/quizzes/${id}`);
      fetchQuizzes();
    } catch (error) {
      console.error('Error al eliminar pregunta:', error);
      alert('Error al eliminar la pregunta');
    }
  };

  const resetForm = () => {
    setFormData({
      pregunta: '',
      opciones: ['', '', '', ''],
      respuesta_correcta: 0,
      explicacion: '',
      categoria: '',
      materia: '',
      dificultad: 'media',
      activo: true,
      fecha_inicio: '',
      fecha_expiracion: '',
      publicado: true
    });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOpciones = [...formData.opciones];
    newOpciones[index] = value;
    setFormData({
      ...formData,
      opciones: newOpciones
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Cargando preguntas...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="quizzes">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-green-700">quiz</span>
            Gestión de Preguntas
          </h1>
          <p className="text-gray-600">Administra las preguntas de los simuladores</p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors shadow-lg"
        >
          <span className="material-symbols-outlined">add</span>
          Nueva Pregunta
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-800">{quizzes.length}</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-blue-700">quiz</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fácil</p>
              <p className="text-2xl font-bold text-green-700">
                {quizzes.filter(q => q.dificultad === 'fácil').length}
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl text-green-700">sentiment_satisfied</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Media</p>
              <p className="text-2xl font-bold text-yellow-700">
                {quizzes.filter(q => q.dificultad === 'media').length}
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl text-yellow-700">sentiment_neutral</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Difícil</p>
              <p className="text-2xl font-bold text-red-700">
                {quizzes.filter(q => q.dificultad === 'difícil').length}
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl text-red-700">sentiment_dissatisfied</span>
          </div>
        </div>
      </div>

      {/* Lista de Preguntas */}
      <div className="space-y-4">
        {quizzes.length > 0 ? (
          quizzes.map((quiz, index) => (
            <div
              key={quiz._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full font-bold">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800">{quiz.pregunta}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">label</span>
                      {quiz.categoria}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${
                      quiz.dificultad === 'fácil'
                        ? 'bg-green-100 text-green-700'
                        : quiz.dificultad === 'media'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <span className="material-symbols-outlined text-xs">
                        {quiz.dificultad === 'fácil' ? 'sentiment_satisfied' : quiz.dificultad === 'media' ? 'sentiment_neutral' : 'sentiment_dissatisfied'}
                      </span>
                      {quiz.dificultad}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${
                      quiz.activo
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <span className="material-symbols-outlined text-xs">
                        {quiz.activo ? 'check_circle' : 'cancel'}
                      </span>
                      {quiz.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {quiz.opciones.map((opcion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg text-sm"
                      >
                        <span className="font-bold text-gray-700 flex-shrink-0">
                          {String.fromCharCode(65 + idx)})
                        </span>
                        <span className="text-gray-700">{opcion}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">lightbulb</span>
                      Explicación:
                    </p>
                    <p className="text-blue-800">{quiz.explicacion}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(quiz._id)}
                    className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(quiz._id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-gray-300 text-6xl mb-4 block">
              quiz
            </span>
            <p className="text-gray-500">No hay preguntas disponibles</p>
          </div>
        )}
      </div>

      {/* Modal para Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">
                  {editingId ? 'edit' : 'add'}
                </span>
                {editingId ? 'Editar Pregunta' : 'Nueva Pregunta'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">help</span>
                  Pregunta
                </label>
                <textarea
                  name="pregunta"
                  value={formData.pregunta}
                  onChange={handleChange}
                  required
                  rows="2"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                  placeholder="Escribe la pregunta..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">list</span>
                  Opciones de Respuesta
                </label>
                {formData.opciones.map((opcion, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-700">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <input
                        type="text"
                        value={opcion}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        required
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                        placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Respuesta Correcta
                </label>
                <select
                  name="respuesta_correcta"
                  value={formData.respuesta_correcta}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                >
                  {formData.opciones.map((_, index) => (
                    <option key={index} value={index}>
                      {String.fromCharCode(65 + index)} - {formData.opciones[index] || 'Vacío'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">lightbulb</span>
                  Explicación
                </label>
                <textarea
                  name="explicacion"
                  value={formData.explicacion}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                  placeholder="Explica por qué esta es la respuesta correcta..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">school</span>
                    Materia
                  </label>
                  <select
                    name="materia"
                    value={formData.materia}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                  >
                    <option value="">Selecciona una materia</option>
                    {materiasDisponibles.map((materia) => (
                      <option key={materia} value={materia}>{materia}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">label</span>
                    Categoría
                  </label>
                  <input
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                    placeholder="Ej: Álgebra, Geometría"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">speed</span>
                  Dificultad
                </label>
                <select
                  name="dificultad"
                  value={formData.dificultad}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                >
                  <option value="fácil">Fácil</option>
                  <option value="media">Media</option>
                  <option value="difícil">Difícil</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">event</span>
                    Fecha de Inicio (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition bg-white text-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">Cuándo estará disponible el examen</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">event_busy</span>
                    Fecha de Expiración (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    name="fecha_expiracion"
                    value={formData.fecha_expiracion}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition bg-white text-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">Cuándo dejará de estar disponible</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="activo"
                    id="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    className="w-5 h-5 text-green-700 rounded focus:ring-green-500"
                />
                <label htmlFor="activo" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Pregunta activa
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="publicado"
                  id="publicado"
                  checked={formData.publicado}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-700 rounded focus:ring-green-500"
                />
                <label htmlFor="publicado" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">visibility</span>
                  Publicado (visible para estudiantes)
                </label>
              </div>
            </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors"
                >
                  {editingId ? 'Guardar Cambios' : 'Crear Pregunta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
