import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../lib/axios';
import { useAuth } from '../../lib/AuthContext';

export default function Simulacros() {
  const router = useRouter();
  const { user } = useAuth();
  const [view, setView] = useState('list'); // list, preview, taking, results, review, history
  const [simulacros, setSimulacros] = useState([]);
  const [selectedSimulacro, setSelectedSimulacro] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [results, setResults] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulacroStats, setSimulacroStats] = useState({});

  // Fetch available simulacros
  useEffect(() => {
    fetchSimulacros();
    fetchHistory();
  }, []);

  // Timer effect
  useEffect(() => {
    if (view === 'taking' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (view === 'taking' && timeLeft === 0 && startTime) {
      handleAutoSubmit();
    }
  }, [timeLeft, view]);

  const fetchSimulacros = async () => {
    try {
      setLoading(true);
      const response = await api.get('/simulacros');
      setSimulacros(response.data);
    } catch (error) {
      console.error('Error al cargar simulacros:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/simulacros/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const fetchSimulacroStats = async (simulacroId) => {
    try {
      const response = await api.get(`/simulacros/${simulacroId}/preview`);
      setSimulacroStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handlePreview = async (simulacro) => {
    setSelectedSimulacro(simulacro);
    await fetchSimulacroStats(simulacro._id);
    setView('preview');
  };

  const handleStartSimulacro = async () => {
    try {
      const response = await api.get(`/simulacros/${selectedSimulacro._id}/start`);
      setQuestions(response.data.preguntas);
      setStartTime(new Date(response.data.fecha_inicio));
      setTimeLeft(selectedSimulacro.duracion_minutos * 60);
      setAnswers({});
      setView('taking');
    } catch (error) {
      console.error('Error al iniciar simulacro:', error);
      alert('Error al iniciar el simulacro. Por favor intenta nuevamente.');
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!confirm('¿Estás seguro de enviar tus respuestas? No podrás cambiarlas después.')) {
      return;
    }

    try {
      const respuestas = questions.map(q => ({
        pregunta_id: q._id,
        respuesta_seleccionada: answers[q._id] || -1
      }));

      const tiempoTomado = selectedSimulacro.duracion_minutos - Math.floor(timeLeft / 60);

      const response = await api.post(`/simulacros/${selectedSimulacro._id}/submit`, {
        respuestas,
        tiempo_tomado_minutos: tiempoTomado,
        fecha_inicio: startTime.toISOString()
      });

      setResults(response.data);
      setCurrentAttempt(response.data.attempt_id);
      setView('results');
      fetchHistory(); // Refresh history
    } catch (error) {
      console.error('Error al enviar respuestas:', error);
      alert('Error al enviar las respuestas. Por favor intenta nuevamente.');
    }
  };

  const handleAutoSubmit = async () => {
    // Auto-submit when time runs out
    try {
      const respuestas = questions.map(q => ({
        pregunta_id: q._id,
        respuesta_seleccionada: answers[q._id] || -1
      }));

      const response = await api.post(`/simulacros/${selectedSimulacro._id}/submit`, {
        respuestas,
        tiempo_tomado_minutos: selectedSimulacro.duracion_minutos,
        fecha_inicio: startTime.toISOString()
      });

      setResults(response.data);
      setCurrentAttempt(response.data.attempt_id);
      setView('results');
      fetchHistory();
    } catch (error) {
      console.error('Error al enviar respuestas automáticamente:', error);
    }
  };

  const handleViewCorrectAnswers = async () => {
    try {
      const response = await api.get(`/simulacros/attempts/${currentAttempt}`);
      setResults(response.data);
      setView('review');
    } catch (error) {
      console.error('Error al cargar respuestas correctas:', error);
    }
  };

  const handleViewAttemptDetails = async (attemptId) => {
    try {
      const response = await api.get(`/simulacros/attempts/${attemptId}`);
      setResults(response.data);
      setSelectedSimulacro(response.data.simulacro);
      setCurrentAttempt(attemptId);
      setView('review');
    } catch (error) {
      console.error('Error al cargar detalles del intento:', error);
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedSimulacro(null);
    setQuestions([]);
    setAnswers({});
    setResults(null);
    setCurrentAttempt(null);
  };

  const handleRepeat = () => {
    handleStartSimulacro();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // LIST VIEW
  if (view === 'list') {
    return (
      <DashboardLayout activeTab="simulacros">
        <div className="p-4 md:p-6 lg:p-8 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-700">quiz</span>
                Simulacros
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Practica con exámenes simulados
              </p>
            </div>
            <button
              onClick={() => setView('history')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 hover:scale-105"
            >
              <span className="material-symbols-outlined">history</span>
              <span className="hidden md:inline">Mi Historial</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando simulacros...</p>
            </div>
          ) : simulacros.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <span className="material-symbols-outlined text-6xl text-gray-400">quiz</span>
              <p className="text-gray-600 dark:text-gray-400 mt-4">No hay simulacros disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulacros.map((simulacro) => (
                <div
                  key={simulacro._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                      {simulacro.titulo}
                    </h3>
                    <span className="material-symbols-outlined text-blue-700">quiz</span>
                  </div>
                  
                  {simulacro.descripcion && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {simulacro.descripcion}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="material-symbols-outlined text-lg">school</span>
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                        {simulacro.materia}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="material-symbols-outlined text-lg">help</span>
                      <span>{simulacro.numero_preguntas} preguntas</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      <span>{simulacro.duracion_minutos} minutos</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePreview(simulacro)}
                    className="w-full px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                    Ver Detalles
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // PREVIEW VIEW
  if (view === 'preview') {
    return (
      <DashboardLayout activeTab="simulacros">
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in-up">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-800 mb-6 transition-all duration-300 hover:scale-105"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Volver a la lista
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="material-symbols-outlined text-5xl text-blue-700">quiz</span>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedSimulacro.titulo}
                </h1>
                {selectedSimulacro.descripcion && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedSimulacro.descripcion}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <span className="material-symbols-outlined">school</span>
                  <span className="text-sm">Materia</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedSimulacro.materia}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <span className="material-symbols-outlined">help</span>
                  <span className="text-sm">Número de Preguntas</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedSimulacro.numero_preguntas} preguntas
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <span className="material-symbols-outlined">schedule</span>
                  <span className="text-sm">Duración</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedSimulacro.duracion_minutos} minutos
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <span className="material-symbols-outlined">history</span>
                  <span className="text-sm">Intentos Realizados</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {simulacroStats.intentos || 0}
                </p>
              </div>
            </div>

            {simulacroStats.mejor_puntaje !== undefined && simulacroStats.intentos > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-blue-700">emoji_events</span>
                  <span className="font-semibold text-gray-900 dark:text-white">Tu Mejor Puntaje</span>
                </div>
                <p className={`text-3xl font-bold ${getScoreColor(simulacroStats.mejor_puntaje)}`}>
                  {simulacroStats.mejor_puntaje}%
                </p>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-yellow-700">info</span>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold mb-2">Instrucciones:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>El simulacro tiene un tiempo límite de {selectedSimulacro.duracion_minutos} minutos</li>
                    <li>Una vez iniciado, debes completarlo en una sola sesión</li>
                    <li>Puedes cambiar tus respuestas antes de enviar</li>
                    <li>Al finalizar el tiempo, las respuestas se enviarán automáticamente</li>
                    <li>Después de enviar, podrás ver tus resultados y las respuestas correctas</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStartSimulacro}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <span className="material-symbols-outlined">play_arrow</span>
                Iniciar Simulacro
              </button>
              <button
                onClick={handleBackToList}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // TAKING SIMULACRO VIEW
  if (view === 'taking') {
    const progress = ((Object.keys(answers).length / questions.length) * 100).toFixed(0);
    const timeWarning = timeLeft < 300; // Less than 5 minutes

    return (
      <DashboardLayout activeTab="simulacros">
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Fixed Header with Timer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6 sticky top-20 z-40">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedSimulacro.titulo}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Progreso: {Object.keys(answers).length}/{questions.length} preguntas
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-xs">
                    <div
                      className="bg-blue-700 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeWarning ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 animate-pulse' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}>
                <span className="material-symbols-outlined">schedule</span>
                <span className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6 mb-6">
            {questions.map((question, index) => (
              <div
                key={question._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fade-in"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium mb-4">
                      {question.pregunta}
                    </p>
                    <div className="space-y-2">
                      {question.opciones.map((opcion, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            answers[question._id] === optIndex
                              ? 'border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question._id}`}
                            checked={answers[question._id] === optIndex}
                            onChange={() => handleAnswerChange(question._id, optIndex)}
                            className="mt-1"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{opcion}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky bottom-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 text-center md:text-left">
                <p className="text-gray-600 dark:text-gray-400">
                  Has respondido {Object.keys(answers).length} de {questions.length} preguntas
                </p>
                {Object.keys(answers).length < questions.length && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                    Hay preguntas sin responder
                  </p>
                )}
              </div>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-lg font-semibold"
              >
                <span className="material-symbols-outlined">send</span>
                Enviar Respuestas
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // RESULTS VIEW
  if (view === 'results') {
    const scoreColor = getScoreColor(results.puntaje);
    
    return (
      <DashboardLayout activeTab="simulacros">
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in-up">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <span className="material-symbols-outlined text-6xl text-blue-700">
                  {results.puntaje >= 80 ? 'emoji_events' : results.puntaje >= 60 ? 'thumb_up' : 'psychology'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Simulacro Completado!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedSimulacro.titulo}
              </p>
            </div>

            {/* Score Display */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8 mb-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Tu Puntaje</p>
              <p className={`text-6xl font-bold ${scoreColor} mb-4`}>
                {results.puntaje}%
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {results.respuestas_correctas} de {results.total_preguntas} correctas
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {results.respuestas_correctas}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Correctas</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <span className="material-symbols-outlined text-red-600 text-3xl">cancel</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {results.respuestas_incorrectas}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Incorrectas</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center col-span-2 md:col-span-1">
                <span className="material-symbols-outlined text-blue-600 text-3xl">schedule</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {results.tiempo_tomado} min
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo usado</p>
              </div>
            </div>

            {/* Message based on score */}
            <div className={`rounded-lg p-4 mb-6 ${
              results.puntaje >= 80 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : results.puntaje >= 60
                ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              <p className="font-semibold">
                {results.puntaje >= 80 
                  ? '¡Excelente trabajo! Tienes un muy buen dominio del tema.'
                  : results.puntaje >= 60
                  ? 'Buen intento. Sigue practicando para mejorar tu puntaje.'
                  : 'Sigue estudiando. Revisa las respuestas correctas para aprender más.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={handleViewCorrectAnswers}
                className="flex-1 px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">visibility</span>
                Ver Respuestas Correctas
              </button>
              <button
                onClick={handleRepeat}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">replay</span>
                Repetir Simulacro
              </button>
              <button
                onClick={handleBackToList}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">home</span>
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // REVIEW VIEW (Correct Answers)
  if (view === 'review') {
    return (
      <DashboardLayout activeTab="simulacros">
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-700">school</span>
                Revisión de Respuestas
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {results.simulacro?.titulo || selectedSimulacro.titulo}
              </p>
            </div>
            <button
              onClick={() => setView('results')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
            >
              Volver a Resultados
            </button>
          </div>

          {/* Score Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Puntaje Final</p>
                  <p className={`text-3xl font-bold ${getScoreColor(results.puntaje)}`}>
                    {results.puntaje}%
                  </p>
                </div>
                <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Correctas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {results.respuestas_correctas}/{results.total_preguntas}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-6">
            {results.preguntas_detalle?.map((detail, index) => {
              const isCorrect = detail.correcta;
              
              return (
                <div
                  key={index}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${
                    isCorrect ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-gray-900 dark:text-white font-medium flex-1">
                          {detail.pregunta.pregunta}
                        </p>
                        <span className={`material-symbols-outlined ${
                          isCorrect ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {isCorrect ? 'check_circle' : 'cancel'}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="space-y-2 mb-4">
                        {detail.pregunta.opciones.map((opcion, optIndex) => {
                          const isUserAnswer = detail.respuesta_usuario === optIndex;
                          const isCorrectAnswer = detail.pregunta.respuesta_correcta === optIndex;
                          
                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border-2 ${
                                isCorrectAnswer
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : isUserAnswer && !isCorrect
                                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {isCorrectAnswer && (
                                  <span className="material-symbols-outlined text-green-500 text-sm">check</span>
                                )}
                                {isUserAnswer && !isCorrect && (
                                  <span className="material-symbols-outlined text-red-500 text-sm">close</span>
                                )}
                                <span className={`flex-1 ${
                                  isCorrectAnswer || (isUserAnswer && !isCorrect)
                                    ? 'font-semibold'
                                    : ''
                                } text-gray-700 dark:text-gray-300`}>
                                  {opcion}
                                  {isUserAnswer && ' (Tu respuesta)'}
                                  {isCorrectAnswer && ' (Respuesta correcta)'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {detail.pregunta.explicacion && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-blue-700 text-sm mt-0.5">info</span>
                            <div>
                              <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Explicación:</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {detail.pregunta.explicacion}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <button
              onClick={handleRepeat}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">replay</span>
              Repetir Simulacro
            </button>
            <button
              onClick={handleBackToList}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">home</span>
              Volver al Inicio
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // HISTORY VIEW
  if (view === 'history') {
    return (
      <DashboardLayout activeTab="simulacros">
        <div className="p-4 md:p-6 lg:p-8 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700">history</span>
                Historial de Simulacros
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Revisa tus intentos anteriores
              </p>
            </div>
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 hover:scale-105"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Volver
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <span className="material-symbols-outlined text-6xl text-gray-400">history</span>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Aún no has completado ningún simulacro</p>
              <button
                onClick={handleBackToList}
                className="mt-4 px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300"
              >
                Ver Simulacros Disponibles
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Simulacro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Puntaje
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tiempo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {history.map((attempt) => (
                      <tr key={attempt._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {attempt.simulacro?.titulo || 'Simulacro eliminado'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {attempt.simulacro?.materia}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(attempt.fecha_finalizacion).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(attempt.fecha_finalizacion).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-2xl font-bold ${getScoreColor(attempt.puntaje)}`}>
                            {attempt.puntaje}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {attempt.tiempo_tomado_minutos} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewAttemptDetails(attempt._id)}
                            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return null;
}
