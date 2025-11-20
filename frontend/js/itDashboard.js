// Script para el panel de TI
const API_BASE_URL = 'http://localhost:3000/api';
let currentUserId = '507f1f77bcf86cd799439013';

document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndRole('it');
    initializeDashboard();
    setupEventListeners();
    loadProjects();
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

    // Selector de proyecto para asignacion
    document.getElementById('assignmentProject').addEventListener('change', handleProjectSelection);
}

// Mostrar seccion especifica
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    document.getElementById(sectionId).classList.remove('d-none');
    
    // Cargar datos segun la seccion
    switch(sectionId) {
        case 'project-management':
            loadProjects();
            break;
        case 'user-assignment':
            loadProjectsForAssignment();
            loadAvailableUsers();
            break;
        case 'project-catalog':
            loadProjectCatalog();
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

// Cargar proyectos
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const projects = await response.json();
        displayProjectsTable(projects);
    } catch (error) {
        console.error('Error cargando proyectos:', error);
        showError('Error cargando proyectos');
    }
}

// Mostrar tabla de proyectos
function displayProjectsTable(projects) {
    const tbody = document.getElementById('projectsTable');
    
    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay proyectos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = projects.map(project => `
        <tr>
            <td>${project.projectName}</td>
            <td>$${project.projectBudget.toLocaleString()}</td>
            <td>${formatDate(project.projectStartDate)}</td>
            <td>${formatDate(project.projectEndDate)}</td>
            <td><span class="badge status-${project.projectStatus}">${getStatusText(project.projectStatus)}</span></td>
            <td>${project.projectAssignedUsers.length} usuarios</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editProject('${project._id}')">
                    Editar
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProject('${project._id}')">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

// Guardar proyecto (crear o actualizar)
async function saveProject() {
    const projectId = document.getElementById('projectId').value;
    const projectData = {
        projectName: document.getElementById('projectName').value,
        projectDescription: document.getElementById('projectDescription').value,
        projectBudget: parseFloat(document.getElementById('projectBudget').value),
        projectStartDate: document.getElementById('projectStartDate').value,
        projectEndDate: document.getElementById('projectEndDate').value,
        projectStatus: document.getElementById('projectStatus').value,
        projectCreatedBy: currentUserId
    };
    
    try {
        const url = projectId ? `${API_BASE_URL}/projects/${projectId}` : `${API_BASE_URL}/projects`;
        const method = projectId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });
        
        if (response.ok) {
            showSuccess(projectId ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente');
            bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
            loadProjects();
            clearProjectForm();
        } else {
            throw new Error('Error guardando proyecto');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error guardando proyecto');
    }
}

// Editar proyecto
async function editProject(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
        const project = await response.json();
        
        // Llenar formulario con datos del proyecto
        document.getElementById('projectId').value = project._id;
        document.getElementById('projectName').value = project.projectName;
        document.getElementById('projectDescription').value = project.projectDescription;
        document.getElementById('projectBudget').value = project.projectBudget;
        document.getElementById('projectStartDate').value = project.projectStartDate.split('T')[0];
        document.getElementById('projectEndDate').value = project.projectEndDate.split('T')[0];
        document.getElementById('projectStatus').value = project.projectStatus;
        
        // Cambiar titulo del modal
        document.querySelector('#projectModal .modal-title').textContent = 'Editar Proyecto';
        
        // Mostrar modal
        new bootstrap.Modal(document.getElementById('projectModal')).show();
    } catch (error) {
        console.error('Error cargando proyecto:', error);
        showError('Error cargando datos del proyecto');
    }
}

// Eliminar proyecto
async function deleteProject(projectId) {
    if (!confirm('¿Esta seguro de que desea eliminar este proyecto?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Proyecto eliminado correctamente');
            loadProjects();
        } else {
            throw new Error('Error eliminando proyecto');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error eliminando proyecto');
    }
}

// Cargar proyectos para asignacion
async function loadProjectsForAssignment() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const projects = await response.json();
        
        const select = document.getElementById('assignmentProject');
        select.innerHTML = '<option value="">Seleccionar proyecto</option>' +
            projects.map(project => 
                `<option value="${project._id}">${project.projectName}</option>`
            ).join('');
    } catch (error) {
        console.error('Error cargando proyectos:', error);
        showError('Error cargando proyectos');
    }
}

// Cargar usuarios disponibles
async function loadAvailableUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const users = await response.json();
        displayAvailableUsers(users);
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        showError('Error cargando usuarios');
    }
}

// Mostrar usuarios disponibles
function displayAvailableUsers(users) {
    const container = document.getElementById('availableUsers');
    
    container.innerHTML = users.map(user => `
        <div class="user-assignment-item">
            <div>
                <strong>${user.userFullName}</strong><br>
                <small class="text-muted">${user.userDepartment} - ${user.userRole}</small>
            </div>
            <button class="btn btn-sm btn-outline-primary" onclick="assignUserToProject('${user._id}')">
                Asignar
            </button>
        </div>
    `).join('');
}

// Manejar seleccion de proyecto
async function handleProjectSelection() {
    const projectId = document.getElementById('assignmentProject').value;
    
    if (projectId) {
        await loadAssignedUsers(projectId);
    } else {
        document.getElementById('assignedUsers').innerHTML = '';
    }
}

// Cargar usuarios asignados al proyecto
async function loadAssignedUsers(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
        const project = await response.json();
        displayAssignedUsers(project.projectAssignedUsers);
    } catch (error) {
        console.error('Error cargando usuarios asignados:', error);
        showError('Error cargando usuarios asignados');
    }
}

// Mostrar usuarios asignados
function displayAssignedUsers(users) {
    const container = document.getElementById('assignedUsers');
    
    if (users.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay usuarios asignados a este proyecto</p>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-assignment-item">
            <div>
                <strong>${user.userFullName}</strong><br>
                <small class="text-muted">${user.userEmail}</small>
            </div>
            <button class="btn btn-sm btn-outline-danger" onclick="removeUserFromProject('${user._id}')">
                Remover
            </button>
        </div>
    `).join('');
}

// Asignar usuario a proyecto
async function assignUserToProject(userId) {
    const projectId = document.getElementById('assignmentProject').value;
    
    if (!projectId) {
        showError('Debe seleccionar un proyecto primero');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/assign-user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: userId })
        });
        
        if (response.ok) {
            showSuccess('Usuario asignado correctamente');
            loadAssignedUsers(projectId);
        } else {
            throw new Error('Error asignando usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error asignando usuario al proyecto');
    }
}

function removeUserFromProject(userId) {
    console.log('Remover usuario:', userId);
    showError('Funcionalidad en desarrollo');
}

// Cargar catalogo de proyectos
async function loadProjectCatalog() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const projects = await response.json();
        displayProjectCatalog(projects);
    } catch (error) {
        console.error('Error cargando catalogo:', error);
        showError('Error cargando catalogo de proyectos');
    }
}

// Mostrar catalogo de proyectos
function displayProjectCatalog(projects) {
    const container = document.getElementById('projectCatalog');
    
    if (projects.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No hay proyectos registrados</p></div>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title">${project.projectName}</h5>
                    <span class="badge status-${project.projectStatus}">${getStatusText(project.projectStatus)}</span>
                </div>
                <div class="card-body">
                    <p class="card-text">${project.projectDescription}</p>
                    <p><strong>Presupuesto:</strong> $${project.projectBudget.toLocaleString()}</p>
                    <p><strong>Usuarios:</strong> ${project.projectAssignedUsers.length}</p>
                    <p><strong>Periodo:</strong> ${formatDate(project.projectStartDate)} - ${formatDate(project.projectEndDate)}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-primary" onclick="editProject('${project._id}')">
                        Editar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Limpiar formulario de proyecto
function clearProjectForm() {
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    document.querySelector('#projectModal .modal-title').textContent = 'Crear Nuevo Proyecto';
}

// Inicializar dashboard
function initializeDashboard() {
    // Configurar fechas por defecto
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    document.getElementById('projectStartDate').value = today.toISOString().split('T')[0];
    document.getElementById('projectEndDate').value = nextMonth.toISOString().split('T')[0];
    
    // Limpiar formulario al cerrar modal
    document.getElementById('projectModal').addEventListener('hidden.bs.modal', clearProjectForm);
}

// Funciones de utilidad
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES');
}

function getStatusText(status) {
    const statusMap = {
        'planning': 'Planificacion',
        'active': 'Activo',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
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