const express = require('express');
const router = express.Router();
const VacationPeriod = require('../models/vacationPeriod.model');

// GET - Obtener todos los periodos activos
router.get('/', async (req, res) => {
  try {
    const periods = await VacationPeriod.find({ periodIsActive: true })
      .sort({ periodStartDate: 1 });
    
    res.json({
      success: true,
      periods: periods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo periodos de vacaciones',
      error: error.message
    });
  }
});

// GET - Obtener periodo por ID
router.get('/:id', async (req, res) => {
  try {
    const period = await VacationPeriod.findById(req.params.id);
    
    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Periodo no encontrado'
      });
    }
    
    res.json({
      success: true,
      period: period
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo periodo',
      error: error.message
    });
  }
});

// POST - Crear nuevo periodo
router.post('/', async (req, res) => {
  try {
    const { periodName, periodStartDate, periodEndDate, periodDescription } = req.body;
    
    const newPeriod = new VacationPeriod({
      periodName,
      periodStartDate,
      periodEndDate,
      periodDescription
    });
    
    await newPeriod.save();
    
    res.status(201).json({
      success: true,
      message: 'Periodo creado correctamente',
      period: newPeriod
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creando periodo',
      error: error.message
    });
  }
});

// PUT - Actualizar periodo
router.put('/:id', async (req, res) => {
  try {
    const { periodName, periodStartDate, periodEndDate, periodDescription } = req.body;
    
    const period = await VacationPeriod.findById(req.params.id);
    
    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Periodo no encontrado'
      });
    }
    
    if (periodName) period.periodName = periodName;
    if (periodStartDate) period.periodStartDate = periodStartDate;
    if (periodEndDate) period.periodEndDate = periodEndDate;
    if (periodDescription !== undefined) period.periodDescription = periodDescription;
    
    await period.save();
    
    res.json({
      success: true,
      message: 'Periodo actualizado correctamente',
      period: period
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error actualizando periodo',
      error: error.message
    });
  }
});

// DELETE - Eliminar periodo (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const period = await VacationPeriod.findByIdAndUpdate(
      req.params.id,
      { periodIsActive: false },
      { new: true }
    );
    
    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Periodo no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Periodo eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando periodo',
      error: error.message
    });
  }
});

module.exports = router;
