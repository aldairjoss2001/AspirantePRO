import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/axios';

export default function Simuladores() {
  const { hasActiveAccess } = useAuth();
  const [mode, setMode] = useState('start'); // start, quiz, results
  const [quizzes, setQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'quiz' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (mode === 'quiz' && timeLeft === 0 && quizzes.length > 0) {
      handleFinish();
    }
  }, [timeLeft, mode]);

  const startQuiz = async (numPreguntas = 20) => {
    setLoading(true);
    try {
      const { data } = await api.get('/quizzes', {
        params: { limite: numPreguntas }
      });
      
      if (data.data.length === 0) {
        alert('No hay preguntas disponibles en este momento');
        setLoading(false);
        return;
      }

      setQuizzes(data.data);
      setMode('quiz');
      setTimeLeft(numPreguntas * 60); // 1 minuto por pregunta
      setCurrentIndex(0);
      setRespuestas({});
    } catch (error) {
      console.error('Error al cargar preguntas:', error);
      alert('Error al cargar las preguntas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (respuesta) => {
    setRespuestas({
      ...respuestas,
      [quizzes[currentIndex]._id]: respuesta
    });
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    
    const respuestasArray = quizzes.map(quiz => ({
      quizId: quiz._id,
      respuesta: respuestas[quiz._id] !== undefined ? respuestas[quiz._id] : -1
    }));

    try {
      const { data } = await api.post('/quizzes/check', {
        respuestas: respuestasArray
      });
      
      setResults(data.data);
      setMode('results');
    } catch (error) {
      console.error('Error al verificar respuestas:', error);
      alert('Error al verificar las respuestas');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!hasActiveAccess) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
            <span className="material-symbols-outlined text-yellow-600 text-6xl mb-4">lock</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
            <p className="text-gray-600 mb-6">
              Necesitas completar tu pago para acceder a los simuladores.
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

  // Pantalla de Inicio
  if (mode === 'start') {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              🎯 Simuladores Pro
            </h1>
            <p className="text-gray-600">Practica con exámenes cronometrados</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-purple-700 text-5xl">quiz</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Comienza un Simulacro
              </h2>
              <p className="text-gray-600">
                Responde las preguntas en el tiempo establecido y obtén tu puntuación al finalizar.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => startQuiz(10)}
                disabled={loading}
                className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                <h3 className="text-xl font-bold mb-2">Simulacro Corto</h3>
                <p className="text-sm opacity-90">10 preguntas • 10 minutos</p>
              </button>

              <button
                onClick={() => startQuiz(20)}
                disabled={loading}
                className="p-6 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                <h3 className="text-xl font-bold mb-2">Simulacro Largo</h3>
                <p className="text-sm opacity-90">20 preguntas • 20 minutos</p>
              </button>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                <p className="mt-2 text-gray-600">Cargando preguntas...</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Pantalla de Quiz
  if (mode === 'quiz' && quizzes.length > 0) {
    const currentQuiz = quizzes[currentIndex];
    const selectedAnswer = respuestas[currentQuiz._id];

    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Barra de Progreso y Tiempo */}
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-semibold">
                  Pregunta {currentIndex + 1} de {quizzes.length}
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-700 transition-all"
                    style={{ width: `${((currentIndex + 1) / quizzes.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 font-bold text-lg ${
                timeLeft < 60 ? 'text-red-600' : 'text-gray-700'
              }`}>
                <span className="material-symbols-outlined">schedule</span>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Pregunta */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {currentQuiz.pregunta}
            </h2>

            <div className="space-y-3">
              {currentQuiz.opciones.map((opcion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full p-4 rounded-xl text-left transition-all font-semibold ${
                    selectedAnswer === index
                      ? 'bg-purple-700 text-white'
                      : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{String.fromCharCode(65 + index)})</span>
                  {opcion}
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className="flex justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              ← Anterior
            </button>

            {currentIndex === quizzes.length - 1 ? (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="px-8 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Finalizar'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-colors"
              >
                Siguiente →
              </button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Pantalla de Resultados
  if (mode === 'results' && results) {
    const aprobado = parseFloat(results.puntuacion) >= 51;

    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Puntuación */}
          <div className={`rounded-2xl shadow-xl p-8 mb-6 text-center ${
            aprobado ? 'bg-gradient-to-br from-green-500 to-green-700' : 'bg-gradient-to-br from-red-500 to-red-700'
          } text-white`}>
            <h2 className="text-3xl font-bold mb-4">
              {aprobado ? '¡Felicitaciones! 🎉' : '¡Sigue Practicando! 💪'}
            </h2>
            <div className="text-6xl font-bold mb-4">{results.puntuacion}%</div>
            <p className="text-xl opacity-90">
              {results.respuestasCorrectas} de {results.totalPreguntas} correctas
            </p>
          </div>

          {/* Detalles de Respuestas */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Revisión de Respuestas</h3>
            
            <div className="space-y-6">
              {results.resultados.map((resultado, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border-l-4 ${
                    resultado.esCorrecta
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`material-symbols-outlined text-2xl ${
                      resultado.esCorrecta ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {resultado.esCorrecta ? 'check_circle' : 'cancel'}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-2">
                        Pregunta {index + 1}: {resultado.pregunta}
                      </h4>
                      
                      {!resultado.esCorrecta && (
                        <div className="text-sm mb-2">
                          <p className="text-red-700">
                            Tu respuesta: <span className="font-semibold">
                              {String.fromCharCode(65 + resultado.respuestaUsuario)}
                            </span>
                          </p>
                          <p className="text-green-700">
                            Correcta: <span className="font-semibold">
                              {String.fromCharCode(65 + resultado.respuestaCorrecta)}
                            </span>
                          </p>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-700 bg-white p-3 rounded-lg">
                        💡 {resultado.explicacion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setMode('start');
                setQuizzes([]);
                setRespuestas({});
                setResults(null);
              }}
              className="px-8 py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-colors"
            >
              Nuevo Simulacro
            </button>
            
            <a
              href="/dashboard"
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Volver al Dashboard
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return null;
}
