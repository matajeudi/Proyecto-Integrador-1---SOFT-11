const express = require('express');
const router = express.Router();
const Project = require('../models/project.model');

// GET - Obtener todos los proyectos
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('projectAssignedUsers', 'userName userFullName userEmail')
      .populate('projectCreatedBy', 'userName userFullName');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo proyectos', error: error.message });
  }
});

// GET - Obtener proyecto por ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('projectAssignedUsers', 'userName userFullName userEmail')
      .populate('projectCreatedBy', 'userName userFullName');
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo proyecto', error: error.message });
  }
});

// POST - Crear nuevo proyecto
router.post('/', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    const savedProject = await newProject.save();
    
    const populatedProject = await Project.findById(savedProject._id)
      .populate('projectAssignedUsers', 'userName userFullName userEmail')
      .populate('projectCreatedBy', 'userName userFullName');
    
    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(400).json({ message: 'Error creando proyecto', error: error.message });
  }
});

// PUT - Actualizar proyecto
router.put('/:id', async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('projectAssignedUsers', 'userName userFullName userEmail')
     .populate('projectCreatedBy', 'userName userFullName');

    if (!updatedProject) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: 'Error actualizando proyecto', error: error.message });
  }
});

// PUT - Asignar usuario a proyecto
router.put('/:id/assign-user', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { projectAssignedUsers: userId } },
      { new: true }
    ).populate('projectAssignedUsers', 'userName userFullName userEmail');

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: 'Error asignando usuario', error: error.message });
  }
});

// DELETE - Eliminar proyecto
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    res.json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando proyecto', error: error.message });
  }
});

module.exports = router;