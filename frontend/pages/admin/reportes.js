import { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import api from '../../lib/axios';

export default function Reportes() {
  const [tipoReporte, setTipoReporte] = useState('registros');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setFechaInicio(start.toISOString().split('T')[0]);
    setFechaFin(end.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      fetchReport();
    }
  }, [tipoReporte, fechaInicio, fechaFin]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (tipoReporte) {
        case 'registros':
          endpoint = '/admin/reports/users';
          break;
        case 'pagos':
          endpoint = '/admin/reports/payments';
          break;
        case 'contenido':
          endpoint = '/admin/reports/content';
          break;
        case 'quizzes':
          endpoint = '/admin/reports/quizzes';
          break;
        case 'accesos':
          endpoint = '/admin/reports/access';
          break;
        default:
          endpoint = '/admin/reports/users';
      }

      const params = tipoReporte !== 'accesos' ? `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}` : '';
      const response = await api.get(endpoint + params);
      
      if (response.data.success) {
        setReportData(response.data.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;
    
    let csv = '';
    let filename = `reporte_${tipoReporte}_${Date.now()}.csv`;
    
    if (Array.isArray(reportData)) {
      // Get headers
      if (reportData.length > 0) {
        const headers = Object.keys(reportData[0]);
        csv = headers.join(',') + '\n';
        
        // Add rows
        reportData.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          });
          csv += values.join(',') + '\n';
        });
      }
    } else {
      // For access report (object format)
      csv = 'Materia,Cantidad de Usuarios\n';
      Object.entries(reportData).forEach(([materia, count]) => {
        csv += `"${materia}",${count}\n`;
      });
    }
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {tipoReporte === 'registros' && (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                </div>
                <span className="material-symbols-outlined text-5xl text-blue-600 dark:text-blue-400 opacity-20">group</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.byStatus?.activo || 0}</p>
                </div>
                <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400 opacity-20">check_circle</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Validando</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.byStatus?.validando || 0}</p>
                </div>
                <span className="material-symbols-outlined text-5xl text-yellow-600 dark:text-yellow-400 opacity-20">hourglass_empty</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                  <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.byStatus?.pendiente || 0}</p>
                </div>
                <span className="material-symbols-outlined text-5xl text-gray-600 dark:text-gray-400 opacity-20">pending</span>
              </div>
            </div>
          </>
        )}

        {tipoReporte === 'pagos' && (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Pagos</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                </div>
                <span className="material-symbols-outlined text-5xl text-blue-600 dark:text-blue-400 opacity-20">payments</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos (Bs.)</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.ingresos_bs}</p>
                </div>
                <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400 opacity-20">attach_money</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.activos}</p>
                </div>
                <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400 opacity-20">verified</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Validando</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.validando}</p>
                </div>
                <span className="material-symbols-outlined text-5xl text-yellow-600 dark:text-yellow-400 opacity-20">sync</span>
              </div>
            </div>
          </>
        )}

        {(tipoReporte === 'contenido' || tipoReporte === 'quizzes') && (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                </div>
                <span className="material-symbols-outlined text-5xl text-blue-600 dark:text-blue-400 opacity-20">
                  {tipoReporte === 'contenido' ? 'folder' : 'quiz'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <AdminLayout activeTab="Reportes">
      <div className="p-6 animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-4xl text-blue-600 dark:text-blue-400">assessment</span>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reportes y Analíticas</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Análisis y estadísticas del sistema</p>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                Tipo de Reporte
              </label>
              <select
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition bg-white dark:bg-white text-gray-800"
              >
                <option value="registros">Registros de Usuarios</option>
                <option value="pagos">Pagos y Revenue</option>
                <option value="contenido">Contenido</option>
                <option value="quizzes">Quizzes</option>
                <option value="accesos">Accesos por Materia</option>
              </select>
            </div>

            {tipoReporte !== 'accesos' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition bg-white dark:bg-white text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition bg-white dark:bg-white text-gray-800"
                  />
                </div>
              </>
            )}

            <div className="flex items-end">
              <button
                onClick={exportToCSV}
                disabled={!reportData || loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-800 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <span className="material-symbols-outlined">download</span>
                Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="spinner"></div>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && renderStats()}

        {/* Data Table */}
        {!loading && reportData && Array.isArray(reportData) && reportData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {tipoReporte === 'registros' && (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Nombre</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Estado</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Fecha Registro</th>
                      </>
                    )}
                    {tipoReporte === 'pagos' && (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Nombre</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Estado Pago</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Materias</th>
                      </>
                    )}
                    {tipoReporte === 'contenido' && (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Título</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Tipo</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Materia</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Fecha</th>
                      </>
                    )}
                    {tipoReporte === 'quizzes' && (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Pregunta</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Materia</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Dificultad</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Fecha</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.slice(0, 50).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      {tipoReporte === 'registros' && (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{item.nombre_completo}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{item.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status_pago === 'activo' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              item.status_pago === 'validando' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {item.status_pago}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            {new Date(item.fecha_registro).toLocaleDateString()}
                          </td>
                        </>
                      )}
                      {tipoReporte === 'pagos' && (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{item.nombre_completo}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{item.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status_pago === 'activo' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {item.status_pago}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            {item.materias_acceso?.join(', ') || 'Ninguna'}
                          </td>
                        </>
                      )}
                      {tipoReporte === 'contenido' && (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{item.titulo}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{item.tipo}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{item.materia}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                        </>
                      )}
                      {tipoReporte === 'quizzes' && (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{item.pregunta.substring(0, 60)}...</td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{item.materia}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{item.dificultad}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reportData.length > 50 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 text-center">
                Mostrando 50 de {reportData.length} resultados
              </div>
            )}
          </div>
        )}

        {/* Access Report (Different Layout) */}
        {!loading && reportData && !Array.isArray(reportData) && tipoReporte === 'accesos' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Distribución de Accesos por Materia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(reportData).sort(([,a], [,b]) => b - a).map(([materia, count]) => (
                <div key={materia} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{materia}</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && reportData && Array.isArray(reportData) && reportData.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">inbox</span>
            <p className="text-gray-600 dark:text-gray-400">No hay datos para este rango de fechas</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
