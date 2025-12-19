import { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import api from '../../lib/axios';

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, activo, validando, pendiente
  const [showMateriasModal, setShowMateriasModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMaterias, setSelectedMaterias] = useState([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);

  useEffect(() => {
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/payment-status`, {
        status_pago: newStatus
      });
      fetchUsers();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado de pago');
    }
  };

  const toggleAccess = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-access`);
      fetchUsers();
    } catch (error) {
      console.error('Error al cambiar acceso:', error);
      alert('Error al cambiar el acceso del usuario');
    }
  };

  const openMateriasModal = (user) => {
    setSelectedUser(user);
    setSelectedMaterias(user.materias_acceso || []);
    setShowMateriasModal(true);
  };

  const toggleMateria = (materia) => {
    if (selectedMaterias.includes(materia)) {
      setSelectedMaterias(selectedMaterias.filter(m => m !== materia));
    } else {
      setSelectedMaterias([...selectedMaterias, materia]);
    }
  };

  const saveMaterias = async () => {
    try {
      await api.put(`/admin/users/${selectedUser._id}/payment-status`, {
        status_pago: selectedUser.status_pago,
        materias_acceso: selectedMaterias
      });
      setShowMateriasModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error al actualizar materias:', error);
      alert('Error al actualizar las materias de acceso');
    }
  };

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(user => user.status_pago === filter);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="usuarios">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-blue-900">group</span>
          Gestión de Usuarios
        </h1>
        <p className="text-gray-600">Administra los accesos y pagos de los estudiantes</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-blue-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-xl">list</span>
            Todos ({users.length})
          </button>
          <button
            onClick={() => setFilter('activo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'activo'
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-xl">check_circle</span>
            Activos ({users.filter(u => u.status_pago === 'activo').length})
          </button>
          <button
            onClick={() => setFilter('validando')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'validando'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-xl">hourglass_empty</span>
            Validando ({users.filter(u => u.status_pago === 'validando').length})
          </button>
          <button
            onClick={() => setFilter('pendiente')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'pendiente'
                ? 'bg-red-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-xl">pending</span>
            Pendientes ({users.filter(u => u.status_pago === 'pendiente').length})
          </button>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">person</span>
                    Usuario
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">email</span>
                    Email
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">badge</span>
                    Rol
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">payments</span>
                    Estado
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">school</span>
                    Materias
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">calendar_today</span>
                    Registro
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">settings</span>
                    Acciones
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.foto_perfil ? (
                          <img
                            src={user.foto_perfil}
                            alt={user.nombre_completo}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-700">
                              account_circle
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-gray-800">
                          {user.nombre_completo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        user.rol === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        <span className="material-symbols-outlined text-sm">
                          {user.rol === 'admin' ? 'admin_panel_settings' : 'school'}
                        </span>
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status_pago === 'activo'
                          ? 'bg-green-100 text-green-700'
                          : user.status_pago === 'validando'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span className="material-symbols-outlined text-sm">
                          {user.status_pago === 'activo' 
                            ? 'check_circle' 
                            : user.status_pago === 'validando' 
                            ? 'hourglass_empty' 
                            : 'cancel'}
                        </span>
                        {user.status_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.materias_acceso && user.materias_acceso.length > 0 ? (
                          user.materias_acceso.map((materia, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold"
                            >
                              {materia}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Sin materias</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.fecha_registro).toLocaleDateString('es-BO')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.rol !== 'admin' && (
                          <button
                            onClick={() => openMateriasModal(user)}
                            className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            title="Gestionar materias"
                          >
                            <span className="material-symbols-outlined text-xl">school</span>
                          </button>
                        )}
                        
                        {user.status_pago === 'validando' && user.comprobante_url && (
                          <a
                            href={user.comprobante_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Ver comprobante"
                          >
                            <span className="material-symbols-outlined text-xl">image</span>
                          </a>
                        )}
                        
                        {user.status_pago === 'validando' && (
                          <button
                            onClick={() => updatePaymentStatus(user._id, 'activo')}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            title="Aprobar pago"
                          >
                            <span className="material-symbols-outlined text-xl">check</span>
                          </button>
                        )}
                        
                        {user.status_pago === 'validando' && (
                          <button
                            onClick={() => updatePaymentStatus(user._id, 'pendiente')}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Rechazar pago"
                          >
                            <span className="material-symbols-outlined text-xl">close</span>
                          </button>
                        )}
                        
                        {user.rol !== 'admin' && (
                          <button
                            onClick={() => toggleAccess(user._id)}
                            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            title={user.status_pago === 'activo' ? 'Desactivar' : 'Activar'}
                          >
                            <span className="material-symbols-outlined text-xl">
                              {user.status_pago === 'activo' ? 'lock' : 'lock_open'}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">
                      person_off
                    </span>
                    No hay usuarios con este filtro
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Gestión de Materias */}
      {showMateriasModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700">school</span>
                Gestionar Materias - {selectedUser.nombre_completo}
              </h2>
              <button
                onClick={() => setShowMateriasModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Selecciona las materias a las que el estudiante tendrá acceso:
              </p>
              
              <div className="grid md:grid-cols-2 gap-3">
                {materiasDisponibles.map((materia) => (
                  <label
                    key={materia}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedMaterias.includes(materia)
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterias.includes(materia)}
                      onChange={() => toggleMateria(materia)}
                      className="w-5 h-5 text-purple-700 rounded focus:ring-purple-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="material-symbols-outlined text-purple-700">
                        {['Matemática', 'Física', 'Química'].includes(materia) ? 'calculate' :
                         ['Lenguaje', 'Inglés'].includes(materia) ? 'menu_book' :
                         ['Ciencias Sociales', 'Geografía', 'Religión', 'Psicología Filosofía'].includes(materia) ? 'public' :
                         ['Biología'].includes(materia) ? 'science' :
                         ['Música'].includes(materia) ? 'music_note' :
                         ['Artes Plásticas'].includes(materia) ? 'palette' :
                         ['Educación Física'].includes(materia) ? 'sports_soccer' :
                         ['Inicial', 'Primaria'].includes(materia) ? 'child_care' :
                         'school'}
                      </span>
                      <span className="font-semibold text-gray-800">{materia}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setShowMateriasModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveMaterias}
                  className="flex-1 px-6 py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-colors"
                >
                  Guardar Materias
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
