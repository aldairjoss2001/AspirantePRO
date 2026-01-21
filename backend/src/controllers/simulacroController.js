const Simulacro = require('../models/Simulacro');
const SimulacroAttempt = require('../models/SimulacroAttempt');
const Quiz = require('../models/Quiz');

// ============ ADMIN ENDPOINTS ============

// @desc    Obtener todos los simulacros (Admin)
// @route   GET /api/admin/simulacros
// @access  Private/Admin
exports.getAllSimulacros = async (req, res, next) => {
  try {
    const simulacros = await Simulacro.find()
      .populate('preguntas', 'pregunta categoria dificultad')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: simulacros.length,
      data: simulacros
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Crear nuevo simulacro
// @route   POST /api/admin/simulacros
// @access  Private/Admin
exports.createSimulacro = async (req, res, next) => {
  try {
    const { titulo, descripcion, materia, numero_preguntas, duracion_minutos, preguntas, publicado, fecha_inicio, fecha_expiracion } = req.body;

    // Validar que haya suficientes preguntas
    if (preguntas && preguntas.length !== numero_preguntas) {
      return res.status(400).json({
        success: false,
        message: `Debe seleccionar exactamente ${numero_preguntas} preguntas`
      });
    }

    // Verificar que todas las preguntas existen
    if (preguntas && preguntas.length > 0) {
      const preguntasExistentes = await Quiz.find({ _id: { $in: preguntas } });
      if (preguntasExistentes.length !== preguntas.length) {
        return res.status(400).json({
          success: false,
          message: 'Algunas preguntas seleccionadas no existen'
        });
      }
    }

    const simulacro = await Simulacro.create({
      titulo,
      descripcion,
      materia,
      numero_preguntas,
      duracion_minutos,
      preguntas: preguntas || [],
      publicado: publicado || false,
      fecha_inicio,
      fecha_expiracion
    });

    const simulacroPopulado = await Simulacro.findById(simulacro._id)
      .populate('preguntas', 'pregunta categoria dificultad');

    res.status(201).json({
      success: true,
      data: simulacroPopulado
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener simulacro por ID (Admin)
// @route   GET /api/admin/simulacros/:id
// @access  Private/Admin
exports.getSimulacroById = async (req, res, next) => {
  try {
    const simulacro = await Simulacro.findById(req.params.id)
      .populate('preguntas');

    if (!simulacro) {
      return res.status(404).json({
        success: false,
        message: 'Simulacro no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: simulacro
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar simulacro
// @route   PUT /api/admin/simulacros/:id
// @access  Private/Admin
exports.updateSimulacro = async (req, res, next) => {
  try {
    const { titulo, descripcion, materia, numero_preguntas, duracion_minutos, preguntas, publicado, fecha_inicio, fecha_expiracion } = req.body;

    const simulacro = await Simulacro.findById(req.params.id);

    if (!simulacro) {
      return res.status(404).json({
        success: false,
        message: 'Simulacro no encontrado'
      });
    }

    // Validar preguntas si se proporcionan
    if (preguntas && numero_preguntas && preguntas.length !== numero_preguntas) {
      return res.status(400).json({
        success: false,
        message: `Debe seleccionar exactamente ${numero_preguntas} preguntas`
      });
    }

    if (preguntas && preguntas.length > 0) {
      const preguntasExistentes = await Quiz.find({ _id: { $in: preguntas } });
      if (preguntasExistentes.length !== preguntas.length) {
        return res.status(400).json({
          success: false,
          message: 'Algunas preguntas seleccionadas no existen'
        });
      }
    }

    // Actualizar campos
    if (titulo) simulacro.titulo = titulo;
    if (descripcion !== undefined) simulacro.descripcion = descripcion;
    if (materia) simulacro.materia = materia;
    if (numero_preguntas) simulacro.numero_preguntas = numero_preguntas;
    if (duracion_minutos) simulacro.duracion_minutos = duracion_minutos;
    if (preguntas) simulacro.preguntas = preguntas;
    if (publicado !== undefined) simulacro.publicado = publicado;
    if (fecha_inicio !== undefined) simulacro.fecha_inicio = fecha_inicio;
    if (fecha_expiracion !== undefined) simulacro.fecha_expiracion = fecha_expiracion;

    await simulacro.save();

    const simulacroPopulado = await Simulacro.findById(simulacro._id)
      .populate('preguntas', 'pregunta categoria dificultad');

    res.status(200).json({
      success: true,
      data: simulacroPopulado
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar simulacro
// @route   DELETE /api/admin/simulacros/:id
// @access  Private/Admin
exports.deleteSimulacro = async (req, res, next) => {
  try {
    const simulacro = await Simulacro.findById(req.params.id);

    if (!simulacro) {
      return res.status(404).json({
        success: false,
        message: 'Simulacro no encontrado'
      });
    }

    await simulacro.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Simulacro eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

// ============ STUDENT ENDPOINTS ============

// @desc    Obtener simulacros disponibles para estudiante
// @route   GET /api/simulacros
// @access  Private/Student
exports.getAvailableSimulacros = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userMaterias = req.user.materias_acceso || [];

    // Buscar simulacros publicados
    const now = new Date();
    
    const query = {
      publicado: true
    };

    // Agregar filtro de fecha de inicio y expiración
    // Solo mostrar simulacros que:
    // 1. No tienen fecha_inicio O ya pasó la fecha_inicio
    // 2. No tienen fecha_expiracion O todavía no expiró
    const dateFilters = {
      $and: [
        {
          $or: [
            { fecha_inicio: null },
            { fecha_inicio: { $exists: false } },
            { fecha_inicio: { $lte: now } }
          ]
        },
        {
          $or: [
            { fecha_expiracion: null },
            { fecha_expiracion: { $exists: false } },
            { fecha_expiracion: { $gte: now } }
          ]
        }
      ]
    };
    
    Object.assign(query, dateFilters);

    // Filtrar por materias del usuario o "Todas las materias"
    // Si el usuario no tiene materias asignadas, mostrar contenido general
    if (userMaterias && userMaterias.length > 0) {
      query.materia = { $in: [...userMaterias, 'Todas las materias'] };
    } else {
      // Si no tiene materias asignadas, solo mostrar contenido general
      query.materia = 'Todas las materias';
    }

    const simulacros = await Simulacro.find(query)
      .select('titulo descripcion materia numero_preguntas duracion_minutos publicado')
      .sort('-createdAt');

    // Obtener intentos previos del usuario para cada simulacro
    const simulacrosConIntentos = await Promise.all(
      simulacros.map(async (simulacro) => {
        const intentos = await SimulacroAttempt.countDocuments({
          usuario: userId,
          simulacro: simulacro._id
        });
        
        const mejorIntento = await SimulacroAttempt.findOne({
          usuario: userId,
          simulacro: simulacro._id
        }).sort('-puntaje');

        return {
          ...simulacro.toObject(),
          intentos_realizados: intentos,
          mejor_puntaje: mejorIntento ? mejorIntento.puntaje : null
        };
      })
    );

    res.status(200).json({
      success: true,
      count: simulacrosConIntentos.length,
      data: simulacrosConIntentos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener detalles de simulacro para estudiante (preview)
// @route   GET /api/simulacros/:id/preview
// @access  Private/Student
exports.getSimulacroPreview = async (req, res, next) => {
  try {
    const simulacro = await Simulacro.findById(req.params.id)
      .select('titulo descripcion materia numero_preguntas duracion_minutos publicado');

    if (!simulacro) {
      return res.status(404).json({
        success: false,
        message: 'Simulacro no encontrado'
      });
    }

    if (!simulacro.publicado) {
      return res.status(403).json({
        success: false,
        message: 'Este simulacro no está disponible'
      });
    }

    // Verificar permisos de materia
    const userMaterias = req.user.materias_acceso || [];
    if (simulacro.materia !== 'Todas las materias' && !userMaterias.includes(simulacro.materia)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este simulacro'
      });
    }

    // Obtener estadísticas del usuario para este simulacro
    const intentos = await SimulacroAttempt.countDocuments({
      usuario: req.user.id,
      simulacro: simulacro._id
    });

    const mejorIntento = await SimulacroAttempt.findOne({
      usuario: req.user.id,
      simulacro: simulacro._id
    }).sort('-puntaje');

    res.status(200).json({
      success: true,
      data: {
        ...simulacro.toObject(),
        intentos_realizados: intentos,
        mejor_puntaje: mejorIntento ? mejorIntento.puntaje : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Iniciar simulacro (obtener preguntas)
// @route   GET /api/simulacros/:id/start
// @access  Private/Student
exports.startSimulacro = async (req, res, next) => {
  try {
    const simulacro = await Simulacro.findById(req.params.id)
      .populate('preguntas', 'pregunta opciones categoria dificultad');

    if (!simulacro) {
      return res.status(404).json({
        success: false,
        message: 'Simulacro no encontrado'
      });
    }

    if (!simulacro.publicado) {
      return res.status(403).json({
        success: false,
        message: 'Este simulacro no está disponible'
      });
    }

    // Verificar permisos de materia
    const userMaterias = req.user.materias_acceso || [];
    if (simulacro.materia !== 'Todas las materias' && !userMaterias.includes(simulacro.materia)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este simulacro'
      });
    }

    // Verificar que el simulacro tenga preguntas
    if (!simulacro.preguntas || simulacro.preguntas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Este simulacro no tiene preguntas asignadas'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        simulacro_id: simulacro._id,
        titulo: simulacro.titulo,
        duracion_minutos: simulacro.duracion_minutos,
        numero_preguntas: simulacro.numero_preguntas,
        preguntas: simulacro.preguntas,
        fecha_inicio: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enviar respuestas y obtener resultados
// @route   POST /api/simulacros/:id/submit
// @access  Private/Student
exports.submitSimulacro = async (req, res, next) => {
  try {
    const { respuestas, tiempo_tomado_minutos, fecha_inicio } = req.body;

    const simulacro = await Simulacro.findById(req.params.id)
      .populate('preguntas');

    if (!simulacro) {
      return res.status(404).json({
        success: false,
        message: 'Simulacro no encontrado'
      });
    }

    // Validar respuestas
    if (!respuestas || respuestas.length !== simulacro.numero_preguntas) {
      return res.status(400).json({
        success: false,
        message: 'Número de respuestas inválido'
      });
    }

    // Calcular puntaje
    let respuestasCorrectas = 0;
    const respuestasDetalladas = respuestas.map((respuesta) => {
      const pregunta = simulacro.preguntas.find(p => p._id.toString() === respuesta.pregunta_id);
      
      if (!pregunta) {
        throw new Error('Pregunta no encontrada');
      }

      const esCorrecta = pregunta.respuesta_correcta === respuesta.respuesta_seleccionada;
      if (esCorrecta) respuestasCorrectas++;

      return {
        pregunta: pregunta._id,
        respuesta_seleccionada: respuesta.respuesta_seleccionada,
        es_correcta: esCorrecta
      };
    });

    const puntaje = Math.round((respuestasCorrectas / simulacro.numero_preguntas) * 100);

    // Guardar intento
    const attempt = await SimulacroAttempt.create({
      usuario: req.user.id,
      simulacro: simulacro._id,
      respuestas: respuestasDetalladas,
      puntaje,
      tiempo_tomado_minutos,
      fecha_inicio: fecha_inicio || new Date(),
      fecha_finalizacion: new Date()
    });

    res.status(201).json({
      success: true,
      data: {
        attempt_id: attempt._id,
        puntaje,
        respuestas_correctas: respuestasCorrectas,
        total_preguntas: simulacro.numero_preguntas,
        tiempo_tomado: tiempo_tomado_minutos
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener resultados detallados de un intento
// @route   GET /api/simulacros/attempts/:attemptId
// @access  Private/Student
exports.getAttemptDetails = async (req, res, next) => {
  try {
    const attempt = await SimulacroAttempt.findById(req.params.attemptId)
      .populate({
        path: 'simulacro',
        select: 'titulo materia numero_preguntas duracion_minutos'
      })
      .populate({
        path: 'respuestas.pregunta',
        select: 'pregunta opciones respuesta_correcta explicacion categoria dificultad'
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Intento no encontrado'
      });
    }

    // Verificar que el intento pertenece al usuario
    if (attempt.usuario.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este intento'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener historial de intentos del usuario
// @route   GET /api/simulacros/history
// @access  Private/Student
exports.getUserHistory = async (req, res, next) => {
  try {
    const attempts = await SimulacroAttempt.find({ usuario: req.user.id })
      .populate('simulacro', 'titulo materia numero_preguntas')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener historial de intentos para un simulacro específico
// @route   GET /api/simulacros/:id/history
// @access  Private/Student
exports.getSimulacroHistory = async (req, res, next) => {
  try {
    const attempts = await SimulacroAttempt.find({
      usuario: req.user.id,
      simulacro: req.params.id
    })
      .populate('simulacro', 'titulo materia numero_preguntas duracion_minutos')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};
