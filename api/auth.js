const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Simulación de base de datos de usuarios (en producción usarías MongoDB)
const users = new Map();

// Ruta para registro de usuarios
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, specialty, orientation, subscriptionPlan } = req.body;
    
    if (!name || !email || !password || !specialty || !orientation || !subscriptionPlan) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        message: 'Se requieren name, email, password, specialty, orientation y subscriptionPlan'
      });
    }

    // Verificar si el usuario ya existe
    if (users.has(email)) {
      return res.status(400).json({
        error: 'Usuario ya existe',
        message: 'El email ya está registrado'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      specialty,
      orientation,
      subscriptionPlan,
      createdAt: new Date(),
      isActive: true
    };

    users.set(email, user);

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Usuario registrado correctamente',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        specialty: user.specialty,
        orientation: user.orientation,
        subscriptionPlan: user.subscriptionPlan
      }
    });

  } catch (error) {
    console.error('Error registrando usuario:', error);
    res.status(500).json({
      error: 'Error registrando usuario',
      message: error.message
    });
  }
});

// Ruta para login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        message: 'Se requieren email y password'
      });
    }

    // Verificar si el usuario existe
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        specialty: user.specialty,
        orientation: user.orientation,
        subscriptionPlan: user.subscriptionPlan
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error en login',
      message: error.message
    });
  }
});

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Token requerido',
      message: 'Se requiere token de autenticación'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Token inválido',
        message: 'Token de autenticación inválido'
      });
    }
    req.user = user;
    next();
  });
};

// Ruta para obtener perfil del usuario
router.get('/profile', authenticateToken, (req, res) => {
  try {
    // Buscar usuario por email
    const user = Array.from(users.values()).find(u => u.email === req.user.email);
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario no existe'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        specialty: user.specialty,
        orientation: user.orientation,
        subscriptionPlan: user.subscriptionPlan,
        createdAt: user.createdAt,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      error: 'Error obteniendo perfil',
      message: error.message
    });
  }
});

// Ruta para actualizar perfil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, specialty, orientation } = req.body;
    
    // Buscar usuario por email
    const user = Array.from(users.values()).find(u => u.email === req.user.email);
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario no existe'
      });
    }

    // Actualizar campos
    if (name) user.name = name;
    if (specialty) user.specialty = specialty;
    if (orientation) user.orientation = orientation;

    users.set(user.email, user);

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        specialty: user.specialty,
        orientation: user.orientation,
        subscriptionPlan: user.subscriptionPlan
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      error: 'Error actualizando perfil',
      message: error.message
    });
  }
});

// Ruta para cambiar plan de suscripción
router.post('/change-subscription', authenticateToken, (req, res) => {
  try {
    const { newPlan } = req.body;
    
    if (!newPlan) {
      return res.status(400).json({
        error: 'Plan requerido',
        message: 'Se requiere especificar el nuevo plan'
      });
    }

    // Buscar usuario por email
    const user = Array.from(users.values()).find(u => u.email === req.user.email);
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario no existe'
      });
    }

    // Actualizar plan
    user.subscriptionPlan = newPlan;
    users.set(user.email, user);

    res.json({
      success: true,
      message: 'Plan de suscripción actualizado correctamente',
      newPlan: user.subscriptionPlan
    });

  } catch (error) {
    console.error('Error cambiando suscripción:', error);
    res.status(500).json({
      error: 'Error cambiando suscripción',
      message: error.message
    });
  }
});

module.exports = router; 