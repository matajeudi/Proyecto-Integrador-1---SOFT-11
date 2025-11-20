const express = require('express');
const router = express.Router();
const Vacation = require('../models/vacation.model');

// GET - Obtener todas las solicitudes de vacaciones
router.get('/', async (req, res) => {
  try {
    const vacations = await Vacation.find()
      .populate('vacationUser', 'userName userFullName userDepartment')
      .populate('vacationApprovedBy', 'userName userFullName')
      .sort({ createdAt: -1 });
    res.json(vacations);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo solicitudes de vacaciones', error: error.message });
  }
});

// GET - Obtener solicitudes por usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const vacations = await Vacation.find({ vacationUser: req.params.userId })
      .populate('vacationUser', 'userName userFullName')
      .populate('vacationApprovedBy', 'userName userFullName')
      .sort({ createdAt: -1 });
    res.json(vacations);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo solicitudes del usuario', error: error.message });
  }
});

// GET - Obtener solicitudes pendientes
router.get('/pending', async (req, res) => {
  try {
    const pendingVacations = await Vacation.find({ vacationStatus: 'pending' })
      .populate('vacationUser', 'userName userFullName userDepartment')
      .sort({ createdAt: -1 });
    res.json(pendingVacations);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo solicitudes pendientes', error: error.message });
  }
});

// GET - Obtener solicitud por ID
router.get('/:id', async (req, res) => {
  try {
    const vacation = await Vacation.findById(req.params.id)
      .populate('vacationUser', 'userName userFullName userDepartment')
      .populate('vacationApprovedBy', 'userName userFullName');
    
    if (!vacation) {
      return res.status(404).json({ message: 'Solicitud de vacaciones no encontrada' });
    }
    res.json(vacation);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo solicitud', error: error.message });
  }
});

// POST - Crear nueva solicitud de vacaciones
router.post('/', async (req, res) => {
  try {
    const newVacation = new Vacation(req.body);
    const savedVacation = await newVacation.save();
    
    const populatedVacation = await Vacation.findById(savedVacation._id)
      .populate('vacationUser', 'userName userFullName userDepartment');
    
    res.status(201).json(populatedVacation);
  } catch (error) {
    res.status(400).json({ message: 'Error creando solicitud de vacaciones', error: error.message });
  }
});

// PUT - Aprobar o rechazar solicitud
router.put('/:id/approve', async (req, res) => {
  try {
    const { vacationStatus, vacationApprovedBy, vacationComments } = req.body;
    
    const updatedVacation = await Vacation.findByIdAndUpdate(
      req.params.id,
      {
        vacationStatus,
        vacationApprovedBy,
        vacationComments,
        vacationApprovalDate: new Date()
      },
      { new: true, runValidators: true }
    ).populate('vacationUser', 'userName userFullName userDepartment')
     .populate('vacationApprovedBy', 'userName userFullName');

    if (!updatedVacation) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    res.json(updatedVacation);
  } catch (error) {
    res.status(400).json({ message: 'Error procesando solicitud', error: error.message });
  }
});

// PUT - Actualizar solicitud (solo si esta pendiente)
router.put('/:id', async (req, res) => {
  try {
    const vacation = await Vacation.findById(req.params.id);
    
    if (!vacation) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    
    if (vacation.vacationStatus !== 'pending') {
      return res.status(400).json({ message: 'Solo se pueden editar solicitudes pendientes' });
    }

    const updatedVacation = await Vacation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('vacationUser', 'userName userFullName userDepartment');

    res.json(updatedVacation);
  } catch (error) {
    res.status(400).json({ message: 'Error actualizando solicitud', error: error.message });
  }
});

// DELETE - Eliminar solicitud (solo si esta pendiente)
router.delete('/:id', async (req, res) => {
  try {
    const vacation = await Vacation.findById(req.params.id);
    
    if (!vacation) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    
    if (vacation.vacationStatus !== 'pending') {
      return res.status(400).json({ message: 'Solo se pueden eliminar solicitudes pendientes' });
    }

    await Vacation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Solicitud eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando solicitud', error: error.message });
  }
});

module.exports = router;