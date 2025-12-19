const Content = require('../models/Content');
const Quiz = require('../models/Quiz');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Obtener todos los contenidos visibles (filtrado por materias de acceso)
// @route   GET /api/content
// @access  Private (requiere acceso activo)
exports.getAllContent = async (req, res, next) => {
  try {
    const { tipo, categoria, materia } = req.query;
    
    let query = { visible: true };
    
    if (tipo) {
      query.tipo = tipo;
    }
    
    if (categoria) {
      query.categoria = categoria;
    }
    
    if (materia) {
      query.materia = materia;
    }
    
    // Filter by user's subject access
    const user = await User.findById(req.user.id);
    if (user && user.materias_acceso && user.materias_acceso.length > 0) {
      query.materia = { $in: user.materias_acceso };
    }

    const content = await Content.find(query).sort('-fecha_subida');

    res.status(200).json({
      success: true,
      count: content.length,
      data: content
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener un contenido específico
// @route   GET /api/content/:id
// @access  Private (requiere acceso activo)
exports.getContent = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Contenido no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener quizzes para simulacro (filtrado por materias de acceso)
// @route   GET /api/quizzes
// @access  Private (requiere acceso activo)
exports.getQuizzes = async (req, res, next) => {
  try {
    const { categoria, materia, limite } = req.query;
    
    let query = { activo: true };
    
    if (categoria) {
      query.categoria = categoria;
    }
    
    if (materia) {
      query.materia = materia;
    }
    
    // Filter by user's subject access
    const user = await User.findById(req.user.id);
    if (user && user.materias_acceso && user.materias_acceso.length > 0) {
      query.materia = { $in: user.materias_acceso };
    }

    let quizzesQuery = Quiz.find(query).select('-respuesta_correcta -explicacion');
    
    if (limite) {
      quizzesQuery = quizzesQuery.limit(parseInt(limite));
    }

    const quizzes = await quizzesQuery;

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verificar respuestas de quiz
// @route   POST /api/quizzes/check
// @access  Private (requiere acceso activo)
exports.checkQuizAnswers = async (req, res, next) => {
  try {
    const { respuestas } = req.body; // Array de { quizId, respuesta }

    if (!respuestas || !Array.isArray(respuestas)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de respuestas inválido'
      });
    }

    const resultados = [];
    let correctas = 0;

    for (const item of respuestas) {
      const quiz = await Quiz.findById(item.quizId);
      
      if (quiz) {
        const esCorrecta = quiz.respuesta_correcta === item.respuesta;
        if (esCorrecta) correctas++;

        resultados.push({
          quizId: quiz._id,
          pregunta: quiz.pregunta,
          respuestaUsuario: item.respuesta,
          respuestaCorrecta: quiz.respuesta_correcta,
          esCorrecta,
          explicacion: quiz.explicacion
        });
      }
    }

    const puntuacion = (correctas / respuestas.length) * 100;

    res.status(200).json({
      success: true,
      data: {
        totalPreguntas: respuestas.length,
        respuestasCorrectas: correctas,
        puntuacion: puntuacion.toFixed(2),
        resultados
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener notificaciones activas
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ activo: true })
      .sort('-fecha_creacion')
      .limit(10);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener categorías disponibles
// @route   GET /api/content/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Content.distinct('categoria');

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener materias disponibles para el usuario
// @route   GET /api/content/materias
// @access  Private
exports.getMaterias = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const materiasUsuario = user.materias_acceso || [];
    
    // Get all available materias
    const todasMaterias = await Content.distinct('materia');

    res.status(200).json({
      success: true,
      data: {
        materias_disponibles: todasMaterias,
        materias_usuario: materiasUsuario
      }
    });
  } catch (error) {
    next(error);
  }
};
