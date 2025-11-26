const express = require('express');
const router = express.Router();
const Holiday = require('../models/holiday.model');

// Obtener todos los feriados activos
// GET /api/holidays
router.get('/', async (req, res) => {
    try {
        // Buscar solo feriados activos y ordenar por fecha ascendente
        const holidays = await Holiday.find({ holidayIsActive: true }).sort({ holidayDate: 1 });
        res.status(200).json({ success: true, holidays });
    } catch (error) {
        console.error('Error obteniendo feriados:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Crear nuevo feriado
// POST /api/holidays
router.post('/', async (req, res) => {
    try {
        const { holidayDate, holidayName, holidayDescription } = req.body;

        // Validar que vengan los campos obligatorios
        if (!holidayDate || !holidayName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Fecha y nombre son requeridos' 
            });
        }

        // Verificar si ya existe un feriado en esa fecha (no duplicados)
        const existingHoliday = await Holiday.findOne({ holidayDate: new Date(holidayDate) });
        if (existingHoliday) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ya existe un feriado en esta fecha' 
            });
        }

        // Crear nuevo feriado
        const newHoliday = new Holiday({
            holidayDate,
            holidayName,
            holidayDescription
        });

        // Guardar en la base de datos
        await newHoliday.save();
        res.status(201).json({ success: true, holiday: newHoliday });

    } catch (error) {
        console.error('Error creando feriado:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Actualizar feriado existente
// PUT /api/holidays/:id
router.put('/:id', async (req, res) => {
    try {
        const { holidayDate, holidayName, holidayDescription } = req.body;

        // Buscar feriado por ID
        const holiday = await Holiday.findById(req.params.id);
        if (!holiday) {
            return res.status(404).json({ success: false, message: 'Feriado no encontrado' });
        }

        // Verificar duplicado de fecha si se esta cambiando la fecha
        if (holidayDate && holidayDate !== holiday.holidayDate.toISOString()) {
            const existingHoliday = await Holiday.findOne({ 
                holidayDate: new Date(holidayDate),
                _id: { $ne: req.params.id } // Excluir el feriado actual
            });
            if (existingHoliday) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Ya existe un feriado en esta fecha' 
                });
            }
        }

        // Actualizar solo los campos enviados (actualizacion parcial)
        if (holidayDate) holiday.holidayDate = holidayDate;
        if (holidayName) holiday.holidayName = holidayName;
        if (holidayDescription !== undefined) holiday.holidayDescription = holidayDescription;

        // Guardar cambios en la base de datos
        await holiday.save();
        res.status(200).json({ success: true, holiday });

    } catch (error) {
        console.error('Error actualizando feriado:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Eliminar feriado (soft delete - no se borra fisicamente)
// DELETE /api/holidays/:id
router.delete('/:id', async (req, res) => {
    try {
        // Buscar feriado por ID
        const holiday = await Holiday.findById(req.params.id);
        if (!holiday) {
            return res.status(404).json({ success: false, message: 'Feriado no encontrado' });
        }

        // Marcar como inactivo en lugar de eliminar
        holiday.holidayIsActive = false;
        await holiday.save();

        res.status(200).json({ success: true, message: 'Feriado eliminado' });

    } catch (error) {
        console.error('Error eliminando feriado:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

module.exports = router;
