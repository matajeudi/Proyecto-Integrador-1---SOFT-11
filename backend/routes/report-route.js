const express = require('express');
const router = express.Router();
const DailyReport = require('../models/dailyReport.model');

// GET - Obtener todos los reportes
router.get('/', async (req, res) => {
  try {
    const reports = await DailyReport.find()
      .populate('reportUser', 'userName userFullName')
      .populate('reportActivities.activityProject', 'projectName')
      .sort({ reportDate: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo reportes', error: error.message });
  }
});

// GET - Obtener reportes por usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const reports = await DailyReport.find({ reportUser: req.params.userId })
      .populate('reportUser', 'userName userFullName')
      .populate('reportActivities.activityProject', 'projectName')
      .sort({ reportDate: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo reportes del usuario', error: error.message });
  }
});

// GET - Obtener reportes por proyecto
router.get('/project/:projectId', async (req, res) => {
  try {
    const reports = await DailyReport.find({
      'reportActivities.activityProject': req.params.projectId
    })
      .populate('reportUser', 'userName userFullName')
      .populate('reportActivities.activityProject', 'projectName')
      .sort({ reportDate: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo reportes del proyecto', error: error.message });
  }
});

// GET - Obtener reporte por ID
router.get('/:id', async (req, res) => {
  try {
    const report = await DailyReport.findById(req.params.id)
      .populate('reportUser', 'userName userFullName')
      .populate('reportActivities.activityProject', 'projectName');
    
    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo reporte', error: error.message });
  }
});

// POST - Crear nuevo reporte diario
router.post('/', async (req, res) => {
  try {
    const newReport = new DailyReport(req.body);
    const savedReport = await newReport.save();
    
    const populatedReport = await DailyReport.findById(savedReport._id)
      .populate('reportUser', 'userName userFullName')
      .populate('reportActivities.activityProject', 'projectName');
    
    res.status(201).json(populatedReport);
  } catch (error) {
    res.status(400).json({ message: 'Error creando reporte', error: error.message });
  }
});

// PUT - Actualizar reporte
router.put('/:id', async (req, res) => {
  try {
    const updatedReport = await DailyReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('reportUser', 'userName userFullName')
     .populate('reportActivities.activityProject', 'projectName');

    if (!updatedReport) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    res.json(updatedReport);
  } catch (error) {
    res.status(400).json({ message: 'Error actualizando reporte', error: error.message });
  }
});

// DELETE - Eliminar reporte
router.delete('/:id', async (req, res) => {
  try {
    const report = await DailyReport.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    res.json({ message: 'Reporte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando reporte', error: error.message });
  }
});

// GET - Estadisticas de horas por proyecto
router.get('/stats/hours-by-project', async (req, res) => {
  try {
    const stats = await DailyReport.aggregate([
      { $unwind: '$reportActivities' },
      {
        $group: {
          _id: '$reportActivities.activityProject',
          totalHours: { $sum: '$reportActivities.activityHours' },
          reportCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $project: {
          projectName: '$project.projectName',
          totalHours: 1,
          reportCount: 1
        }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo estadisticas', error: error.message });
  }
});

module.exports = router;