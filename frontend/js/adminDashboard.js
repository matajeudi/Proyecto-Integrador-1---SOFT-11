// Script para el panel de administrador

// URL base del servidor backend donde estan los endpoints de la API
const API_BASE_URL = 'http://localhost:3000/api';

// ID temporal del usuario administrador actual (se reemplazara con datos reales del login)
let currentUserId = '507f1f77bcf86cd799439011';

// Espera a que la pagina cargue completamente antes de ejecutar el codigo
document.addEventListener('DOMContentLoaded', function() {
    // Verifica que el usuario tenga sesion activa y sea administrador
    checkAuthAndRole('admin');
    initializeDashboard();
    loadPendingVacations();
    setupEventListeners();
    initThemeToggle();
});

// Inicializa el sistema de cambio de tema (claro/oscuro)
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    // Recupera el tema guardado anteriormente, si no existe usa 'light' por defecto
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Aplica el tema guardado a toda la pagina
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    // Si el boton existe en la pagina
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            // Actualiza el icono del boton segun el nuevo tema
            updateThemeIcon(newTheme, themeIcon);
        });
    }
}

// Cambia el icono del boton de tema segun el tema activo
function updateThemeIcon(theme, icon) {
    if (icon) {
        // Si el tema es oscuro, muestra el icono de sol (para cambiar a claro)
        if (theme === 'dark') {
            icon.classList.remove('bi-moon-stars-fill');
            icon.classList.add('bi-sun-fill');
        } else {
            // Si el tema es claro, muestra el icono de luna (para cambiar a oscuro)
            icon.classList.remove('bi-sun-fill');
            icon.classList.add('bi-moon-stars-fill');
        }
    }
}

// Verifica que el usuario tenga sesion activa y el rol correcto para acceder a esta pagina
function checkAuthAndRole(requiredRole) {
    // Busca los datos del usuario en el almacenamiento del navegador
    const currentUser = localStorage.getItem('currentUser');
    
    // Si no hay datos de usuario, significa que no ha iniciado sesion
    if (!currentUser) {
        console.error('401 Unauthorized: No hay sesion activa');
        // Muestra mensaje de error en pantalla
        showUnauthorizedError();
        // Despues de 2 segundos redirige al inicio para que inicie sesion
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    
    // Convierte el texto guardado en un objeto JavaScript para poder usarlo
    const user = JSON.parse(currentUser);
    
    // Verifica si el rol del usuario coincide con el rol requerido (admin, worker, etc)
    if (user.role !== requiredRole) {
        console.error(`403 Forbidden: Usuario con rol '${user.role}' intento acceder a dashboard '${requiredRole}'`);
        // Muestra mensaje de acceso denegado
        showForbiddenError();
        // Despues de 2 segundos redirige al inicio
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    
    // Si todo esta bien, muestra el nombre del usuario en la pagina
    document.getElementById('userName').textContent = user.name;
}

// Muestra un mensaje de error cuando el usuario no ha iniciado sesion
function showUnauthorizedError() {
    // Reemplaza todo el contenido de la pagina con un mensaje de error rojo
    document.body.innerHTML = `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="alert alert-danger text-center" role="alert">
                        <i class="bi bi-exclamation-triangle-fill" style="font-size: 3rem;"></i>
                        <h4 class="mt-3">401 - No Autorizado</h4>
                        <p>Debe iniciar sesion para acceder a esta pagina.</p>
                        <p class="mb-0">Redirigiendo al inicio...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Muestra un mensaje de error cuando el usuario no tiene permisos suficientes
function showForbiddenError() {
    // Reemplaza todo el contenido de la pagina con un mensaje de advertencia amarillo
    document.body.innerHTML = `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="alert alert-warning text-center" role="alert">
                        <i class="bi bi-shield-exclamation" style="font-size: 3rem;"></i>
                        <h4 class="mt-3">403 - Acceso Denegado</h4>
                        <p>No tiene permisos para acceder a esta pagina.</p>
                        <p class="mb-0">Redirigiendo al inicio...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Cierra la sesion del usuario y lo regresa a la pagina de inicio
function logout() {
    // Elimina los datos del usuario del almacenamiento del navegador
    localStorage.removeItem('currentUser');
    // Redirige a la pagina principal
    window.location.href = 'index.html';
}

// Configurar event listeners
function setupEventListeners() {
    // Navegacion entre secciones
    document.querySelectorAll('[data-section]').forEach(button => {
        button.addEventListener('click', function() {
            showSection(this.dataset.section);
            updateActiveButton(this);
        });
    });

    // Formulario de feriados
    document.getElementById('holidayForm').addEventListener('submit', handleHolidaySubmit);
    
    // Formulario de periodos de vacaciones
    document.getElementById('periodForm').addEventListener('submit', handlePeriodSubmit);
}

// Mostrar seccion especifica
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    document.getElementById(sectionId).classList.remove('d-none');
    
    // Cargar datos segun la seccion
    switch(sectionId) {
        case 'vacation-requests':
            loadPendingVacations();
            break;
        case 'reports-stats':
            loadReportsStats();
            break;
        case 'holiday-management':
            loadHolidays();
            break;
        case 'vacation-periods':
            loadVacationPeriods();
            break;
    }
}

// Actualizar boton activo
function updateActiveButton(activeButton) {
    document.querySelectorAll('.list-group-item').forEach(btn => {
        btn.classList.remove('active');
    });
    activeButton.classList.add('active');
}

// Cargar solicitudes de vacaciones pendientes
async function loadPendingVacations() {
    try {
        const response = await fetch(`${API_BASE_URL}/vacations/pending`);
        const vacations = await response.json();
        displayVacationRequests(vacations);
    } catch (error) {
        console.error('Error cargando solicitudes:', error);
        showError('Error cargando solicitudes de vacaciones');
    }
}

// Muestra las solicitudes de vacaciones en una tabla en la pantalla
function displayVacationRequests(vacations) {
    // Obtiene el cuerpo de la tabla donde se mostraran las solicitudes
    const tbody = document.getElementById('vacationRequestsTable');
    
    // Si no hay solicitudes pendientes, muestra un mensaje informativo
    if (vacations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay solicitudes pendientes</td></tr>';
        return;
    }
    
    // Recorre cada solicitud y crea una fila de tabla con sus datos
    tbody.innerHTML = vacations.map(vacation => `
        <tr>
            <td>${vacation.vacationUser.userFullName}</td>
            <td>${formatDate(vacation.vacationStartDate)}</td>
            <td>${formatDate(vacation.vacationEndDate)}</td>
            <td>${vacation.vacationDays}</td>
            <td>${vacation.vacationReason}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="openVacationModal('${vacation._id}')">
                    Procesar
                </button>
            </td>
        </tr>
    `).join(''); // Une todas las filas en un solo texto HTML
}

// Abre una ventana emergente para aprobar o rechazar una solicitud de vacaciones
function openVacationModal(vacationId) {
    // Guarda el ID de la solicitud en un campo oculto para usarlo despues
    document.getElementById('vacationId').value = vacationId;
    // Limpia el campo de comentarios para que este vacio
    document.getElementById('vacationComments').value = '';
    // Muestra la ventana emergente (modal) en la pantalla
    new bootstrap.Modal(document.getElementById('vacationModal')).show();
}

// Aprueba una solicitud de vacaciones y actualiza su estado en la base de datos
async function approveVacation() {
    // Obtiene el ID de la solicitud que se va a aprobar
    const vacationId = document.getElementById('vacationId').value;
    // Obtiene los comentarios que el administrador escribio (opcional)
    const comments = document.getElementById('vacationComments').value;
    
    try {
        // Envia la aprobacion al servidor backend
        const response = await fetch(`${API_BASE_URL}/vacations/${vacationId}/approve`, {
            method: 'PUT', // PUT porque estamos actualizando un registro existente
            headers: {
                'Content-Type': 'application/json' // Indica que enviamos datos en formato JSON
            },
            body: JSON.stringify({
                vacationStatus: 'approved', // Cambia el estado a aprobado
                vacationApprovedBy: currentUserId, // Registra quien aprobo la solicitud
                vacationComments: comments // Guarda los comentarios del administrador
            })
        });
        
        // Si el servidor respondio exitosamente
        if (response.ok) {
            showSuccess('Solicitud aprobada correctamente');
            // Cierra la ventana emergente
            bootstrap.Modal.getInstance(document.getElementById('vacationModal')).hide();
            // Recarga la lista de solicitudes pendientes (ya no aparecera esta)
            loadPendingVacations();
        } else {
            throw new Error('Error aprobando solicitud');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error procesando solicitud');
    }
}

// Rechaza una solicitud de vacaciones y actualiza su estado en la base de datos
async function rejectVacation() {
    // Obtiene el ID de la solicitud que se va a rechazar
    const vacationId = document.getElementById('vacationId').value;
    // Obtiene los comentarios explicando por que se rechaza (opcional)
    const comments = document.getElementById('vacationComments').value;
    
    try {
        // Envia el rechazo al servidor backend
        const response = await fetch(`${API_BASE_URL}/vacations/${vacationId}/approve`, {
            method: 'PUT', // PUT porque estamos actualizando un registro existente
            headers: {
                'Content-Type': 'application/json' // Indica que enviamos datos en formato JSON
            },
            body: JSON.stringify({
                vacationStatus: 'rejected', // Cambia el estado a rechazado
                vacationApprovedBy: currentUserId, // Registra quien rechazo la solicitud
                vacationComments: comments // Guarda los comentarios del administrador
            })
        });
        
        // Si el servidor respondio exitosamente
        if (response.ok) {
            showSuccess('Solicitud rechazada');
            // Cierra la ventana emergente
            bootstrap.Modal.getInstance(document.getElementById('vacationModal')).hide();
            // Recarga la lista de solicitudes pendientes (ya no aparecera esta)
            loadPendingVacations();
        } else {
            throw new Error('Error rechazando solicitud');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error procesando solicitud');
    }
}

// Carga las estadisticas de horas trabajadas por proyecto desde el servidor
async function loadReportsStats() {
    try {
        // Solicita al servidor las estadisticas de horas por proyecto
        const response = await fetch(`${API_BASE_URL}/reports/stats/hours-by-project`);
        // Convierte la respuesta del servidor en un objeto JavaScript
        const stats = await response.json();
        // Muestra los datos en un grafico de barras
        displayHoursChart(stats);
        // Muestra los datos en una lista con totales
        displayWorkloadStats(stats);
    } catch (error) {
        console.error('Error cargando estadisticas:', error);
        showError('Error cargando estadisticas');
    }
}

// Crea un grafico de barras mostrando las horas trabajadas por proyecto
function displayHoursChart(stats) {
    // Obtiene el elemento canvas donde se dibujara el grafico
    const ctx = document.getElementById('hoursChart').getContext('2d');
    
    // Crea un nuevo grafico usando la libreria Chart.js
    new Chart(ctx, {
        type: 'bar', // Tipo de grafico: barras verticales
        data: {
            // Etiquetas del eje X: nombres de los proyectos
            labels: stats.map(s => s.projectName),
            datasets: [{
                label: 'Horas Totales', // Titulo del conjunto de datos
                // Datos del eje Y: horas totales de cada proyecto
                data: stats.map(s => s.totalHours),
                backgroundColor: 'rgba(13, 110, 253, 0.8)', // Color de relleno de las barras (azul)
                borderColor: 'rgba(13, 110, 253, 1)', // Color del borde de las barras
                borderWidth: 1 // Grosor del borde
            }]
        },
        options: {
            responsive: true, // El grafico se ajusta al tamaño de la pantalla
            scales: {
                y: {
                    beginAtZero: true // El eje Y comienza en cero
                }
            }
        }
    });
}

// Muestra las estadisticas de carga de trabajo en formato de lista
function displayWorkloadStats(stats) {
    // Obtiene el contenedor donde se mostraran las estadisticas
    const container = document.getElementById('workloadStats');
    // Calcula el total de horas sumando las horas de todos los proyectos
    const totalHours = stats.reduce((sum, s) => sum + s.totalHours, 0);
    
    // Crea una lista con cada proyecto y sus horas
    container.innerHTML = stats.map(stat => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span>${stat.projectName}</span>
            <span class="badge bg-primary">${stat.totalHours}h</span>
        </div>
    `).join('') + `
        <hr>
        <div class="d-flex justify-content-between align-items-center">
            <strong>Total:</strong>
            <strong>${totalHours}h</strong>
        </div>
    `; // Agrega una linea separadora y el total general al final
}

// Manejar envio de formulario de feriados
async function handleHolidaySubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const editId = form.dataset.editId;
    const holidayName = document.getElementById('holidayName').value.trim();
    const holidayDate = document.getElementById('holidayDate').value;
    
    if (holidayName.length < 3) {
        showError('El nombre del feriado debe tener al menos 3 caracteres');
        return;
    }
    
    if (holidayName.length > 100) {
        showError('El nombre del feriado no puede exceder 100 caracteres');
        return;
    }
    
    const holidayData = {
        holidayName: holidayName,
        holidayDate: holidayDate
    };
    
    try {
        let response;
        if (editId) {
            response = await fetch(`${API_BASE_URL}/holidays/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(holidayData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/holidays`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(holidayData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(editId ? 'Feriado actualizado correctamente' : 'Feriado agregado correctamente');
            form.reset();
            delete form.dataset.editId;
            loadHolidays();
        } else {
            showError(result.message || 'Error procesando feriado');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error conectando con el servidor');
    }
}

async function editHoliday(holidayId) {
    try {
        const response = await fetch(`${API_BASE_URL}/holidays/${holidayId}`);
        const result = await response.json();
        
        if (result.success && result.holiday) {
            const holiday = result.holiday;
            document.getElementById('holidayName').value = holiday.holidayName;
            document.getElementById('holidayDate').value = holiday.holidayDate.split('T')[0];
            document.getElementById('holidayForm').dataset.editId = holidayId;
        }
    } catch (error) {
        showError('Error cargando feriado');
    }
}

// Cargar lista de feriados desde el backend
async function loadHolidays() {
    try {
        // Obtener todos los feriados activos de la base de datos
        const response = await fetch(`${API_BASE_URL}/holidays`);
        const result = await response.json();
        
        if (result.success) {
            displayHolidays(result.holidays);
        } else {
            showError('Error cargando feriados');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error conectando con el servidor');
    }
}

// Mostrar lista de feriados en el HTML
function displayHolidays(holidays) {
    const container = document.getElementById('holidaysList');
    
    // Verificar si hay feriados para mostrar
    if (holidays.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay feriados registrados</p>';
        return;
    }
    
    // Crear HTML para cada feriado con botones editar y eliminar
    container.innerHTML = holidays.map(holiday => `
        <div class="holiday-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
            <div>
                <strong>${holiday.holidayName}</strong><br>
                <small class="text-muted">${formatDate(holiday.holidayDate)}</small>
            </div>
            <div>
                <button class="btn btn-sm btn-primary me-1" onclick="editHoliday('${holiday._id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteHoliday('${holiday._id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Eliminar feriado de la base de datos
async function deleteHoliday(holidayId) {
    // Confirmar accion con el usuario
    const result = await Swal.fire({
        title: '¿Está seguro?',
        text: 'Se eliminará este feriado',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
    });
    
    if (!result.isConfirmed) {
        return;
    }
    
    try {
        // Enviar peticion DELETE al backend
        const response = await fetch(`${API_BASE_URL}/holidays/${holidayId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Feriado eliminado correctamente');
            loadHolidays(); // Recargar lista actualizada
        } else {
            showError('Error eliminando feriado');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error conectando con el servidor');
    }
}

// Inicializar dashboard
function initializeDashboard() {
    // Establecer fecha actual por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('holidayDate').value = today;
}

// Funciones de utilidad
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES');
}

function showSuccess(message) {
    Swal.fire({
        title: 'Exitoso',
        text: message,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#198754'
    });
}

function showError(message) {
    Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc3545'
    });
}


// ========== FUNCIONES PARA PERIODOS DE VACACIONES ==========

// Manejar envio de formulario de periodos de vacaciones
async function handlePeriodSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const editId = form.dataset.editId;
    const periodName = document.getElementById('periodName').value.trim();
    const periodStartDate = document.getElementById('periodStartDate').value;
    const periodEndDate = document.getElementById('periodEndDate').value;
    const periodDescription = document.getElementById('periodDescription').value.trim();
    
    if (periodName.length < 3) {
        showError('El nombre del periodo debe tener al menos 3 caracteres');
        return;
    }
    
    if (periodName.length > 100) {
        showError('El nombre del periodo no puede exceder 100 caracteres');
        return;
    }
    
    if (periodDescription && periodDescription.length > 500) {
        showError('La descripcion no puede exceder 500 caracteres');
        return;
    }
    
    const periodData = {
        periodName: periodName,
        periodStartDate: periodStartDate,
        periodEndDate: periodEndDate,
        periodDescription: periodDescription
    };
    
    if (new Date(periodData.periodEndDate) <= new Date(periodData.periodStartDate)) {
        showError('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
    }
    
    try {
        let response;
        if (editId) {
            response = await fetch(`${API_BASE_URL}/vacation-periods/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(periodData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/vacation-periods`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(periodData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(editId ? 'Periodo actualizado correctamente' : 'Periodo agregado correctamente');
            form.reset();
            delete form.dataset.editId;
            loadVacationPeriods();
        } else {
            showError(result.message || 'Error procesando periodo');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error conectando con el servidor');
    }
}

async function editVacationPeriod(periodId) {
    try {
        const response = await fetch(`${API_BASE_URL}/vacation-periods/${periodId}`);
        const result = await response.json();
        
        if (result.success && result.period) {
            const period = result.period;
            document.getElementById('periodName').value = period.periodName;
            document.getElementById('periodStartDate').value = period.periodStartDate.split('T')[0];
            document.getElementById('periodEndDate').value = period.periodEndDate.split('T')[0];
            document.getElementById('periodDescription').value = period.periodDescription || '';
            document.getElementById('periodForm').dataset.editId = periodId;
        }
    } catch (error) {
        showError('Error cargando periodo');
    }
}

// Carga periodos de vacaciones y renderiza calendario visual
async function loadVacationPeriods() {
    try {
        // Renderiza calendario con todos los eventos
        const events = await CalendarView.fetchAllEvents();
        CalendarView.renderFullCalendar('adminEventsCalendar', events);
        
        // Obtiene periodos activos desde API
        const response = await fetch(`${API_BASE_URL}/vacation-periods`);
        const result = await response.json();
        
        if (result.success) {
            displayVacationPeriods(result.periods);
        } else {
            showError('Error cargando periodos');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error conectando con el servidor');
    }
}

// Mostrar lista de periodos de vacaciones en el HTML
function displayVacationPeriods(periods) {
    const container = document.getElementById('periodsList');
    
    // Verificar si hay periodos para mostrar
    if (periods.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay periodos registrados</p>';
        return;
    }
    
    // Crear HTML para cada periodo con boton de eliminar
    container.innerHTML = periods.map(period => {
        // Calcular duracion del periodo en dias
        const startDate = new Date(period.periodStartDate);
        const endDate = new Date(period.periodEndDate);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        return `
            <div class="period-item mb-3 p-3 border rounded">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h3 class="h6 fw-bold mb-1">${period.periodName}</h3>
                        <small class="text-muted">
                            <i class="bi bi-calendar-range"></i> 
                            ${formatDate(period.periodStartDate)} - ${formatDate(period.periodEndDate)}
                            <span class="badge bg-info ms-2">${duration} días</span>
                        </small>
                        ${period.periodDescription ? `<p class="mb-0 mt-2 small">${period.periodDescription}</p>` : ''}
                    </div>
                    <div>
                        <button class="btn btn-sm btn-primary me-1" onclick="editVacationPeriod('${period._id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteVacationPeriod('${period._id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Eliminar periodo de vacaciones de la base de datos
async function deleteVacationPeriod(periodId) {
    // Confirmar accion con el usuario
    const result = await Swal.fire({
        title: '¿Está seguro?',
        text: 'Se eliminará este periodo de vacaciones',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
    });
    
    if (!result.isConfirmed) {
        return;
    }
    
    try {
        // Enviar peticion DELETE al backend
        const response = await fetch(`${API_BASE_URL}/vacation-periods/${periodId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Periodo eliminado correctamente');
            loadVacationPeriods(); // Recargar lista actualizada
        } else {
            showError('Error eliminando periodo');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error conectando con el servidor');
    }
}