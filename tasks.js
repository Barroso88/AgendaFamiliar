// ==================== TASKS ====================
function setTaskFilter(filterId, button) {
    State.filters.task = filterId;
    const buttons = document.querySelectorAll('.task-filter-3d');
    buttons.forEach(btn => {
        const isActive = btn === button;
        btn.classList.toggle('task-filter-3d-active', isActive);
        btn.classList.toggle('task-filter-3d-pressed', isActive);
        if (isActive) {
            btn.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.95), 0 0 22px rgba(255,255,255,0.86), 0 18px 34px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.92)';
            btn.style.transform = 'translateY(-2px) scale(0.99)';
            btn.style.filter = 'saturate(1.08) brightness(1.03)';
        } else {
            btn.style.boxShadow = '';
            btn.style.transform = '';
            btn.style.filter = '';
        }
    });
    if (button) button.offsetHeight;
    setTimeout(() => {
        renderTasks(document.getElementById('contentArea'));
    }, 90);
}

function renderTasks(container) {
    const pending = State.tasks.filter(t => !t.completed);
    const completed = State.tasks.filter(t => t.completed);
    const reminderEvents = State.events
        .filter(e => e.category !== 'feriado')
        .filter(e => e.date >= todayISO())
        .filter(e => !State.filters.task || State.filters.task === 'all' || (Array.isArray(e.members) && e.members.includes(State.filters.task)))
        .sort((a, b) => `${a.date} ${a.time || '00:00'}`.localeCompare(`${b.date} ${b.time || '00:00'}`));
    const reminderMemberIcons = {
        andre: '👨',
        nayara: '👩',
        sofia: '🎀',
        gucci: '🐾'
    };
    
    let html = `
    <div class="fade-in">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-3">
                <div class="text-3xl">✅</div>
                <div>
                    <h3 class="text-xl font-bold">Tarefas Familiares</h3>
                    <p class="text-sm text-gray-500">${completed.length}/${State.tasks.length} concluídas</p>
                </div>
            </div>
            <button onclick="openTaskModal()" class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Nova Tarefa
            </button>
        </div>
        
        <div class="flex justify-center mb-6">
            <div class="flex flex-wrap items-center justify-center gap-3 max-w-4xl">
            <button onclick="setTaskFilter('all', this)" class="task-filter-3d px-5 py-3 text-base font-semibold rounded-2xl whitespace-nowrap min-w-[7rem] ${State.filters.task === 'all' ? 'task-filter-3d-active' : ''}">Todos</button>
            ${State.members.map(m => {
                const sidebarIcons = {
                    andre: '👨',
                    nayara: '👩',
                    sofia: '🎀',
                    gucci: '🐾'
                };
                const iconClass = m.id === 'gucci' ? 'icon-white' : '';
                const icon = sidebarIcons[m.id] || m.icon || m.avatar;
                return `<button onclick="setTaskFilter('${m.id}', this)" class="task-filter-3d px-5 py-3 text-base font-semibold rounded-2xl whitespace-nowrap min-w-[7rem] ${State.filters.task === m.id ? getMemberBg(m.id) + ' ' + getMemberText(m.id) + ' task-filter-3d-active' : ''}"><span class="${iconClass} text-lg">${icon}</span> ${m.name}</button>`;
            }).join('')}
            </div>
        </div>`;

    if (reminderEvents.length) {
        html += `
        <div class="mb-6">
            <h4 class="font-bold text-sm text-gray-500 mb-3">EVENTOS AGENDADOS (${reminderEvents.length})</h4>
            <div class="space-y-2">
                ${reminderEvents.map(event => {
                    const memberId = Array.isArray(event.members) && event.members[0] ? event.members[0] : (event.category === 'gucci' ? 'gucci' : 'andre');
                    const member = getMember(memberId);
                    const icon = reminderMemberIcons[memberId] || member?.avatar || '📌';
                    return `
                    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 rounded-xl ${getMemberBg(memberId)} flex items-center justify-center text-base shadow-sm">${icon}</div>
                            <div class="flex-1 min-w-0">
                                <div class="font-medium">${event.title || 'Evento'}</div>
                                ${event.description ? `<div class="text-sm text-gray-500 mt-1">${event.description}</div>` : ''}
                                <div class="flex items-center gap-3 mt-2 flex-wrap">
                                    <div class="flex items-center gap-1">
                                        <span class="text-xs text-gray-500">${member?.name || 'Família'}</span>
                                    </div>
                                    <span class="text-xs text-gray-400">📅 ${formatShortDate(event.date)}${event.time ? ` • ${event.time}` : ''}</span>
                                    ${event.location ? `<span class="text-xs text-gray-400">📍 ${event.location}</span>` : ''}
                                </div>
                            </div>
                            <div class="flex gap-1">
                                <button onclick="openEventModal(${event.id})" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Editar evento">
                                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                </button>
                                <button onclick="deleteEvent(${event.id})" class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30" title="Apagar evento">
                                    <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }
    
    // Pending tasks
    const filterFn = State.filters.task && State.filters.task !== 'all' ? t => t.assignedTo === State.filters.task : () => true;
    const filteredPending = pending.filter(filterFn);
    
    if (filteredPending.length) {
        html += `<div class="mb-6">
            <h4 class="font-bold text-sm text-gray-500 mb-3">TAREFAS PENDENTES (${filteredPending.length})</h4>
            <div class="space-y-2">
                ${filteredPending.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(t => {
                    const member = getMember(t.assignedTo);
                    const isOverdue = new Date(t.dueDate) < new Date() && !isToday(t.dueDate);
                    return `
                    <div class="bg-white dark:bg-gray-800 rounded-xl border ${isOverdue ? 'border-red-200 dark:border-red-800' : 'border-gray-100 dark:border-gray-700'} p-4 hover:shadow-md transition-shadow">
                        <div class="flex items-start gap-3">
                            <input type="checkbox" class="checkbox-custom mt-1" onchange="toggleTask(${t.id})">
                            <div class="flex-1 min-w-0">
                                <div class="font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : ''}">${t.title}</div>
                                ${t.description ? `<div class="text-sm text-gray-500 mt-1">${t.description}</div>` : ''}
                                <div class="flex items-center gap-3 mt-2 flex-wrap">
                                    <div class="flex items-center gap-1">
                                        <div class="w-5 h-5 rounded-full ${getMemberColor(member.id)} flex items-center justify-center text-[10px]">${member.avatar}</div>
                                        <span class="text-xs text-gray-500">${member.name}</span>
                                    </div>
                                    <span class="text-xs text-gray-400">📅 ${formatShortDate(t.dueDate)}</span>
                                    ${isOverdue ? '<span class="text-xs text-red-500 font-medium">⚠️ Atrasada</span>' : ''}
                                </div>
                            </div>
                            <div class="flex gap-1">
                                <button onclick="openTaskModal(${t.id})" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                </button>
                                <button onclick="deleteTask(${t.id})" class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                                    <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }
    
    // Completed tasks
    const filteredCompleted = completed.filter(filterFn);
    if (filteredCompleted.length) {
        html += `
        <div>
            <h4 class="font-bold text-sm text-gray-500 mb-3">TAREFAS CONCLUÍDAS (${filteredCompleted.length})</h4>
            <div class="space-y-2">
                ${filteredCompleted.map(t => {
                    const member = getMember(t.assignedTo);
                    return `
                    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 opacity-60">
                        <div class="flex items-start gap-3">
                            <input type="checkbox" class="checkbox-custom mt-1" checked onchange="toggleTask(${t.id})">
                            <div class="flex-1 min-w-0">
                                <div class="font-medium line-through text-gray-500">${t.title}</div>
                                <div class="flex items-center gap-3 mt-2">
                                    <div class="flex items-center gap-1">
                                        <div class="w-5 h-5 rounded-full ${getMemberColor(member.id)} flex items-center justify-center text-[10px]">${member.avatar}</div>
                                        <span class="text-xs text-gray-500">${member.name}</span>
                                    </div>
                                    <span class="text-xs text-gray-400">📅 ${formatShortDate(t.dueDate)}</span>
                                </div>
                            </div>
                            <button onclick="deleteTask(${t.id})" class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                                <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }
    
    if (!filteredPending.length && !filteredCompleted.length) {
        html += '<div class="text-center py-12 text-gray-500"><p class="text-4xl mb-2">🎉</p><p>Sem tarefas!</p></div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function openTaskModal(taskId = null, prefillDate = null, prefillMember = null) {
    const task = taskId ? State.tasks.find(t => t.id === taskId) : null;
    const isEdit = !!task;
    const initialDate = isEdit ? task.dueDate : (prefillDate || todayISO());
    const initialMember = isEdit ? task.assignedTo : (prefillMember || (State.filters.member && State.filters.member !== 'all' ? State.filters.member : State.members[0]?.id || 'andre'));
    
    const content = `
    <div class="p-6">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">${isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
            <button onclick="closeModal()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
        <form onsubmit="saveTask(event, ${taskId || 'null'})" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Título *</label>
                <input type="text" id="taskTitle" value="${isEdit ? task.title : ''}" required class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Descrição</label>
                <textarea id="taskDesc" rows="2" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">${isEdit ? task.description || '' : ''}</textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Atribuído a *</label>
                    <select id="taskMember" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                        ${State.members.map(m => `<option value="${m.id}" ${(isEdit && task.assignedTo === m.id) || (!isEdit && initialMember === m.id) ? 'selected' : ''}>${m.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Data limite *</label>
                    <input type="date" id="taskDue" value="${initialDate}" required class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
            </div>
            <div class="flex gap-3 pt-2">
                <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
                <button type="submit" class="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">${isEdit ? 'Guardar' : 'Criar Tarefa'}</button>
            </div>
        </form>
    </div>`;
    
    openModal(content);
}

// ==================== FUNÇÕES CORRIGIDAS (ASYNC/AWAIT) ====================

async function saveTask(e, taskId) {
    e.preventDefault();
    const taskData = {
        id: taskId || Date.now(),
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDesc').value,
        assignedTo: document.getElementById('taskMember').value,
        dueDate: document.getElementById('taskDue').value,
        completed: taskId ? State.tasks.find(t => t.id === taskId).completed : false,
        category: 'geral'
    };
    
    if (taskId) {
        const idx = State.tasks.findIndex(t => t.id === taskId);
        State.tasks[idx] = taskData;
        showToast('Tarefa atualizada!');
    } else {
        State.tasks.push(taskData);
        showToast('Tarefa criada!');
    }
    
    await State.saveData(); // <-- AWAIT ADICIONADO
    closeModal();
    renderPage();
}

async function toggleTask(id) {
    const task = State.tasks.find(t => t.id === id);
    task.completed = !task.completed;
    await State.saveData(); // <-- AWAIT ADICIONADO
    renderPage();
    if (task.completed) showToast(`"${task.title}" concluída! 🎉`);
}

async function deleteTask(id) {
    State.tasks = State.tasks.filter(t => t.id !== id);
    await State.saveData(); // <-- AWAIT ADICIONADO
    showToast('Tarefa removida', 'warning');
    renderPage();
}
