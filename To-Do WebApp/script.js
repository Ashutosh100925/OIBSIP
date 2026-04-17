// Main Logic for Task Management
document.addEventListener('DOMContentLoaded', () => {
    
    // Core State (initialized from localStorage)
    let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];
    let editingId = null;

    // DOM Caching
    const form = document.getElementById('task-form');
    const titleInput = document.getElementById('task-title');
    const descInput = document.getElementById('task-desc');
    const prioritySelect = document.getElementById('task-priority');
    const btnClear = document.getElementById('btn-clear');
    const btnSubmit = document.getElementById('btn-submit');
    const titleError = document.getElementById('title-error');
    
    const searchInput = document.getElementById('task-search');
    const pendingList = document.getElementById('pending-list');
    const completedList = document.getElementById('completed-list');
    
    const statTotal = document.getElementById('stat-total');
    const statPending = document.getElementById('stat-pending');
    const statCompleted = document.getElementById('stat-completed');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const currentDateEl = document.getElementById('current-date');

    // Init: Set the visual header date
    const initializeDateDisplay = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
    };

    // Helper: Sync with local storage and visually re-render
    const syncTasks = () => {
        localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
        renderBoard();
    };

    // Helper: Unix Timestamp to beautiful string
    const formatDateTime = (timestamp) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return `${d.toLocaleDateString(undefined, {month:'short', day:'numeric'})} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    // Form Event: Add / Update Task
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = titleInput.value.trim();
        const desc = descInput.value.trim();
        const priority = prioritySelect.value;
        
        // Strict title validation
        if (!title) {
            titleInput.classList.add('input-error');
            titleError.textContent = 'Please enter a task title.';
            titleError.style.display = 'block';
            setTimeout(() => titleInput.classList.remove('input-error'), 400); // Wait for shake anim
            return;
        }
        
        titleError.style.display = 'none';

        if (editingId) {
            // Update operation
            tasks = tasks.map(t => {
                if(t.id === editingId) {
                    return { ...t, title, description: desc, priority };
                }
                return t;
            });
            editingId = null;
            btnSubmit.innerHTML = "<i class='bx bx-plus'></i> Add Task";
        } else {
            // Create operation
            const newTask = {
                id: Date.now().toString(),
                title: title,
                description: desc,
                priority: priority,
                status: 'pending',
                createdAt: Date.now(),
                completedAt: null
            };
            tasks.unshift(newTask); // Push to the front of list
        }
        
        form.reset();
        syncTasks();
        titleInput.focus();
    });

    // Form Event: Clear
    btnClear.addEventListener('click', () => {
        form.reset();
        editingId = null;
        btnSubmit.innerHTML = "<i class='bx bx-plus'></i> Add Task";
        titleError.style.display = 'none';
        titleInput.classList.remove('input-error');
    });

    // Input Event: Live Search filtering
    searchInput.addEventListener('input', () => renderBoard());

    // Input Event: Clear validation errors when user types normally
    titleInput.addEventListener('input', () => {
        if(titleInput.value.trim()) {
            titleError.style.display = 'none';
            titleInput.classList.remove('input-error');
        }
    });

    // Master Event Delegation for dynamically minted buttons inside tasks lists
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.icon-btn');
        if (!btn) return;

        const card = btn.closest('.task-card');
        if(!card) return;
        
        const id = card.dataset.id;
        const action = btn.dataset.action;

        // Perform specific action based on button dataset value
        if (action === 'delete') {
            card.classList.add('deleting'); // Apply slide out animation
            setTimeout(() => {
                tasks = tasks.filter(t => t.id !== id);
                syncTasks();
            }, 300); // 300ms matches the slideOutRight animation bounds in CSS
        } 
        else if (action === 'complete') {
            tasks = tasks.map(t => {
                if (t.id === id) {
                    t.status = 'completed';
                    t.completedAt = Date.now();
                }
                return t;
            });
            syncTasks();
        } 
        else if (action === 'undo') {
            tasks = tasks.map(t => {
                if (t.id === id) {
                    t.status = 'pending';
                    t.completedAt = null;
                }
                return t;
            });
            syncTasks();
        } 
        else if (action === 'edit') {
            const task = tasks.find(t => t.id === id);
            if(task) {
                // Populate form
                titleInput.value = task.title;
                descInput.value = task.description;
                prioritySelect.value = task.priority;
                
                // Alter editing state
                editingId = task.id;
                btnSubmit.innerHTML = "<i class='bx bx-save'></i> Update Task";
                
                // Enhance UX, scroll/focus to form
                titleInput.focus();
                if(window.innerWidth <= 992) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        }
    });

    // Bulk Event: Clear all completed Tasks
    clearCompletedBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to remove all completed tasks permanently?')) {
            const completedCards = completedList.querySelectorAll('.task-card');
            
            // Apply visual destruction effect sequentially for flair
            completedCards.forEach((card, index) => {
                setTimeout(() => card.classList.add('deleting'), index * 50);
            });
            
            // Remove from memory after anim finishes
            setTimeout(() => {
                tasks = tasks.filter(t => t.status !== 'completed');
                syncTasks();
            }, 300 + (completedCards.length * 50));
        }
    });

    // Sub-routine: Build safe inner HTML for an individual task record
    const generateHTMLForTask = (task) => {
        const isCompleted = task.status === 'completed';
        
        let actionBtns = '';
        if (isCompleted) {
            actionBtns = `
                <button class="icon-btn undo" data-action="undo" title="Uncheck">
                    <i class='bx bx-undo'></i>
                </button>
                <button class="icon-btn delete" data-action="delete" title="Delete">
                    <i class='bx bx-trash'></i>
                </button>
            `;
        } else {
            actionBtns = `
                <button class="icon-btn complete" data-action="complete" title="Complete">
                    <i class='bx bx-check'></i>
                </button>
                <button class="icon-btn edit" data-action="edit" title="Edit">
                    <i class='bx bx-edit-alt'></i>
                </button>
                <button class="icon-btn delete" data-action="delete" title="Delete">
                    <i class='bx bx-trash'></i>
                </button>
            `;
        }

        // We use DOMPurify in big projects, but here we just escape angle brackets to avoid raw HTML injection issues natively
        const safeTitle = textToEntities(task.title);
        const safeDesc = task.description ? textToEntities(task.description).replace(/\n/g, '<br>') : '';

        return `
            <div class="task-card ${isCompleted ? 'completed' : `priority-${task.priority}`}" data-id="${task.id}">
                <div class="task-header">
                    <div class="task-info">
                        <h3 class="task-title">${safeTitle}</h3>
                        ${safeDesc ? `<p class="task-desc">${safeDesc}</p>` : ''}
                    </div>
                    <div class="task-actions">
                        ${actionBtns}
                    </div>
                </div>
                <div class="task-meta">
                    <div class="created-time" title="Task Created On">
                        <i class='bx bx-time'></i>
                        <span>Added: ${formatDateTime(task.createdAt)}</span>
                    </div>
                    ${isCompleted ? `
                        <div class="completed-time" title="Task Completed On">
                            <i class='bx bx-check-double'></i>
                            <span>Done: ${formatDateTime(task.completedAt)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    };

    // Sub-routine: HTML Sanitizer Helper
    const textToEntities = (str) => {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };

    // Core function to calculate and rewrite everything to the DOM 
    const renderBoard = () => {
        const query = searchInput.value.toLowerCase().trim();
        
        // Filter subsets and check against search query explicitly
        const pendingNodes = tasks.filter(t => t.status === 'pending' && (t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)));
        const completedNodes = tasks.filter(t => t.status === 'completed' && (t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)));

        // Inject Stat Data
        statTotal.innerText = tasks.length;
        statPending.innerText = tasks.filter(t => t.status === 'pending').length; // true non filtered query
        statCompleted.innerText = tasks.filter(t => t.status === 'completed').length; 

        // Contextually show/hide the Clear All button for clean UI
        clearCompletedBtn.style.display = completedNodes.length > 0 ? 'inline-block' : 'none';

        // Render nodes to the DOM with fallback Empty States
        if (pendingNodes.length === 0) {
            pendingList.innerHTML = `
                <div class="empty-state">
                    <i class='bx bx-notepad'></i>
                    <p>${query ? 'No matching pending tasks found.' : "No pending tasks. You're all caught up!"}</p>
                </div>
            `;
        } else {
            pendingList.innerHTML = pendingNodes.map(task => generateHTMLForTask(task)).join('');
        }

        if (completedNodes.length === 0) {
            completedList.innerHTML = `
                <div class="empty-state">
                    <i class='bx bx-badge-check'></i>
                    <p>${query ? 'No matching completed tasks found.' : "No completed tasks yet. Let's get to work!"}</p>
                </div>
            `;
        } else {
            // It visually makes sense to sort completed tasks by completion date (newest first)
            const resolvedNodes = [...completedNodes].sort((a,b) => b.completedAt - a.completedAt);
            completedList.innerHTML = resolvedNodes.map(task => generateHTMLForTask(task)).join('');
        }
    };

    // Boot Up
    initializeDateDisplay();
    renderBoard();
});
