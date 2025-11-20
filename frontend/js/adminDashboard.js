// Script para el panel de administrador
const API_BASE_URL = 'http://localhost:3000/api';
let currentUserId = '507f1f77bcf86cd799439011';

document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndRole('admin');
    initializeDashboard();
    loadPendingVacations();
    setupEventListeners();
    initThemeToggle();
});

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme, themeIcon);
        });
    }
}

function updateThemeIcon(theme, icon) {
    if (icon) {
        if (theme === 'dark') {
            icon.classList.remove('bi-moon-stars-fill');
            icon.classList.add('bi-sun-fill');
        } else {
            icon.classList.remove('bi-sun-fill');
            icon.classList.add('bi-moon-stars-fill');
        }
    }
}

function checkAuthAndRole(requiredRole) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        console.error('401 Unauthorized: No hay sesion activa');
        showUnauthorizedError();
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    const user = JSON.parse(currentUser);
    if (user.role !== requiredRole) {
        console.error(`403 Forbidden: Usuario con rol '${user.role}' intento acceder a dashboard '${requiredRole}'`);
        showForbiddenError();
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    document.getElementById('userName').textContent = user.name;
}

function showUnauthorizedError() {
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

function showForbiddenError() {
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

function logout() {
    localStorage.removeItem('currentUser');
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

// Mostrar solicitudes de vacaciones
function displayVacationRequests(vacations) {
    const tbody = document.getElementById('vacationRequestsTable');
    
    if (vacations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay solicitudes pendientes</td></tr>';
        return;
    }
    
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
    `).join('');
}

// Abrir modal para procesar vacacion
function openVacationModal(vacationId) {
    document.getElementById('vacationId').value = vacationId;
    document.getElementById('vacationComments').value = '';
    new bootstrap.Modal(document.getElementById('vacationModal')).show();
}

// Aprobar vacacion
async function approveVacation() {
    const vacationId = document.getElementById('vacationId').value;
    const comments = document.getElementById('vacationComments').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/vacations/${vacationId}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vacationStatus: 'approved',
                vacationApprovedBy: currentUserId,
                vacationComments: comments
            })
        });
        
        if (response.ok) {
            showSuccess('Solicitud aprobada correctamente');
            bootstrap.Modal.getInstance(document.getElementById('vacationModal')).hide();
            loadPendingVacations();
        } else {
            throw new Error('Error aprobando solicitud');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error procesando solicitud');
    }
}

// Rechazar vacacion
async function rejectVacation() {
    const vacationId = document.getElementById('vacationId').value;
    const comments = document.getElementById('vacationComments').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/vacations/${vacationId}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vacationStatus: 'rejected',
                vacationApprovedBy: currentUserId,
                vacationComments: comments
            })
        });
        
        if (response.ok) {
            showSuccess('Solicitud rechazada');
            bootstrap.Modal.getInstance(document.getElementById('vacationModal')).hide();
            loadPendingVacations();
        } else {
            throw new Error('Error rechazando solicitud');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error procesando solicitud');
    }
}

// Cargar estadisticas de reportes
async function loadReportsStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/stats/hours-by-project`);
        const stats = await response.json();
        displayHoursChart(stats);
        displayWorkloadStats(stats);
    } catch (error) {
        console.error('Error cargando estadisticas:', error);
        showError('Error cargando estadisticas');
    }
}

// Mostrar grafico de horas
function displayHoursChart(stats) {
    const ctx = document.getElementById('hoursChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: stats.map(s => s.projectName),
            datasets: [{
                label: 'Horas Totales',
                data: stats.map(s => s.totalHours),
                backgroundColor: 'rgba(13, 110, 253, 0.8)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Mostrar estadisticas de carga de trabajo
function displayWorkloadStats(stats) {
    const container = document.getElementById('workloadStats');
    const totalHours = stats.reduce((sum, s) => sum + s.totalHours, 0);
    
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
    `;
}

// Manejar envio de formulario de feriados
async function handleHolidaySubmit(e) {
    e.preventDefault();
    
    const holidayData = {
        name: document.getElementById('holidayName').value,
        date: document.getElementById('holidayDate').value
    };
    
    // Implementar logica para guardar feriados en el backend
    showSuccess('Feriado agregado correctamente');
    e.target.reset();
    loadHolidays();
}

// Cargar lista de feriados
function loadHolidays() {
    // Datos de ejemplo, reemplazar con llamada a API
    const holidays = [
        { name: 'Año Nuevo', date: '2024-01-01' },
        { name: 'Dia del Trabajador', date: '2024-05-01' },
        { name: 'Independencia', date: '2024-09-15' }
    ];
    
    const container = document.getElementById('holidaysList');
    container.innerHTML = holidays.map(holiday => `
        <div class="holiday-item">
            <strong>${holiday.name}</strong><br>
            <small class="text-muted">${formatDate(holiday.date)}</small>
        </div>
    `).join('');
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
    showAlert(message, 'success');
}

function showError(message) {
    showAlert(message, 'danger');
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.container-fluid').prepend(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}