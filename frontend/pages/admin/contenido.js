import { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import api from '../../lib/axios';

const MATERIAS_DISPONIBLES = ['Matemáticas', 'Lenguaje', 'Ciencias Sociales', 'Ciencias Naturales', 'Realidad Nacional'];

export default function Contenido() {
  const [contenidos, setContenidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'libro',
    titulo: '',
    url_archivo: '',
    archivo_local: '',
    categoria: '',
    materia: '',
    descripcion: '',
    visible: true
  });

  useEffect(() => {
    fetchContenidos();
  }, []);

  const fetchContenidos = async () => {
    try {
      // Fetch all content types
      const { data } = await api.get('/content');
      setContenidos(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar contenido:', error);
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;
    
    setUploading(true);
    try {
      const fileFormData = new FormData();
      fileFormData.append('archivo', selectedFile);
      
      const { data } = await api.post('/admin/content/upload', fileFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploading(false);
      return data.data.path;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setUploading(false);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let dataToSubmit = { ...formData };
      
      // Handle file upload if selected
      if (uploadMethod === 'file' && selectedFile) {
        const filePath = await uploadFile();
        dataToSubmit.archivo_local = filePath;
        dataToSubmit.url_archivo = '';
      } else if (uploadMethod === 'url') {
        dataToSubmit.archivo_local = '';
      }
      
      if (editingId) {
        await api.put(`/admin/content/${editingId}`, dataToSubmit);
      } else {
        await api.post('/admin/content', dataToSubmit);
      }
      
      setShowModal(false);
      resetForm();
      fetchContenidos();
    } catch (error) {
      console.error('Error al guardar contenido:', error);
      alert('Error al guardar el contenido');
    }
  };

  const handleEdit = (contenido) => {
    setEditingId(contenido._id);
    setFormData({
      tipo: contenido.tipo,
      titulo: contenido.titulo,
      url_archivo: contenido.url_archivo || '',
      archivo_local: contenido.archivo_local || '',
      categoria: contenido.categoria,
      materia: contenido.materia || '',
      descripcion: contenido.descripcion || '',
      visible: contenido.visible
    });
    setUploadMethod(contenido.archivo_local ? 'file' : 'url');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este contenido?')) return;
    
    try {
      await api.delete(`/admin/content/${id}`);
      fetchContenidos();
    } catch (error) {
      console.error('Error al eliminar contenido:', error);
      alert('Error al eliminar el contenido');
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'libro',
      titulo: '',
      url_archivo: '',
      archivo_local: '',
      categoria: '',
      materia: '',
      descripcion: '',
      visible: true
    });
    setEditingId(null);
    setUploadMethod('url');
    setSelectedFile(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Cargando contenido...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="contenido">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-purple-700">folder</span>
            Gestión de Contenido
          </h1>
          <p className="text-gray-600">Administra libros, exámenes y material educativo</p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-colors shadow-lg"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo Contenido
        </button>
      </div>

      {/* Lista de Contenido */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contenidos.length > 0 ? (
          contenidos.map((contenido) => (
            <div
              key={contenido._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  contenido.tipo === 'libro'
                    ? 'bg-blue-100'
                    : contenido.tipo === 'examen_pasado'
                    ? 'bg-green-100'
                    : 'bg-yellow-100'
                }`}>
                  <span className={`material-symbols-outlined text-3xl ${
                    contenido.tipo === 'libro'
                      ? 'text-blue-700'
                      : contenido.tipo === 'examen_pasado'
                      ? 'text-green-700'
                      : 'text-yellow-700'
                  }`}>
                    {contenido.tipo === 'libro'
                      ? 'auto_stories'
                      : contenido.tipo === 'examen_pasado'
                      ? 'task'
                      : 'tips_and_updates'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-2">{contenido.titulo}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                      {contenido.categoria}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${
                      contenido.visible
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <span className="material-symbols-outlined text-xs">
                        {contenido.visible ? 'visibility' : 'visibility_off'}
                      </span>
                      {contenido.visible ? 'Visible' : 'Oculto'}
                    </span>
                  </div>
                </div>
              </div>

              {contenido.descripcion && (
                <p className="text-sm text-gray-600 mb-4">{contenido.descripcion}</p>
              )}

              <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                {new Date(contenido.fecha_subida).toLocaleDateString('es-BO')}
              </div>

              <div className="flex gap-2">
                <a
                  href={contenido.url_archivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">visibility</span>
                  Ver
                </a>
                <button
                  onClick={() => handleEdit(contenido)}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors"
                  title="Editar"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(contenido._id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                  title="Eliminar"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <span className="material-symbols-outlined text-gray-300 text-6xl mb-4 block">
              folder_off
            </span>
            <p className="text-gray-500">No hay contenido disponible</p>
          </div>
        )}
      </div>

      {/* Modal para Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700">
                  {editingId ? 'edit' : 'add'}
                </span>
                {editingId ? 'Editar Contenido' : 'Nuevo Contenido'}
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
                  <span className="material-symbols-outlined text-lg">category</span>
                  Tipo de Contenido
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                >
                  <option value="libro">Libro</option>
                  <option value="examen_pasado">Examen Pasado</option>
                  <option value="tip">Tip/Consejo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">title</span>
                  Título
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                  placeholder="Ej: Matemáticas Gestión 2024"
                />
              </div>

              {/* Upload Method Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">upload_file</span>
                  Método de Carga
                </label>
                <div className="flex gap-4 mb-3">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    uploadMethod === 'url'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="uploadMethod"
                      value="url"
                      checked={uploadMethod === 'url'}
                      onChange={() => setUploadMethod('url')}
                      className="w-4 h-4 text-purple-700"
                    />
                    <span className="material-symbols-outlined text-purple-700">link</span>
                    <span className="font-semibold">URL Externa</span>
                  </label>
                  
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    uploadMethod === 'file'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="uploadMethod"
                      value="file"
                      checked={uploadMethod === 'file'}
                      onChange={() => setUploadMethod('file')}
                      className="w-4 h-4 text-purple-700"
                    />
                    <span className="material-symbols-outlined text-purple-700">upload</span>
                    <span className="font-semibold">Archivo Local</span>
                  </label>
                </div>
              </div>

              {uploadMethod === 'url' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">link</span>
                    URL del Archivo
                  </label>
                  <input
                    type="url"
                    name="url_archivo"
                    value={formData.url_archivo}
                    onChange={handleChange}
                    required={uploadMethod === 'url'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                    placeholder="https://ejemplo.com/archivo.pdf"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">upload</span>
                    Subir Archivo
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required={uploadMethod === 'file' && !editingId}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos aceptados: PDF, DOC, DOCX, JPG, PNG
                  </p>
                </div>
              )}

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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                >
                  <option value="">Selecciona una materia</option>
                  {MATERIAS_DISPONIBLES.map((materia) => (
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                  placeholder="Ej: Álgebra, Geometría, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">description</span>
                  Descripción (Opcional)
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                  placeholder="Breve descripción del contenido"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="visible"
                  id="visible"
                  checked={formData.visible}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-700 rounded focus:ring-purple-500"
                />
                <label htmlFor="visible" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">visibility</span>
                  Visible para estudiantes
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Subiendo...
                    </>
                  ) : (
                    editingId ? 'Guardar Cambios' : 'Crear Contenido'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
