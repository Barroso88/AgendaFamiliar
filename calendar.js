// ==================== CALENDAR ====================
function renderCalendar(container) {
    const view = State.calendarView;
    const calendarVars = getCalendarThemeVars();
    
    let html = `
    <div class="fade-in calendar-shell rounded-[32px] p-1" style="${calendarVars}">
        <div class="calendar-panel rounded-[28px] overflow-hidden">
        <!-- Controls -->
        <div class="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6 pt-5 pb-4">
            <div class="flex items-center gap-2">
                <button onclick="changeDate(-1)" class="calendar-nav-btn p-2 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <div>
                    <p class="text-[10px] uppercase tracking-[0.28em] text-gray-400 dark:text-gray-500 mb-1">Calendário</p>
                    <h3 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">${getCurrentPeriodLabel()}</h3>
                </div>
                <button onclick="changeDate(1)" class="calendar-nav-btn p-2 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
                <button onclick="goToToday()" class="ml-2 px-3 py-1.5 text-sm rounded-full text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all calendar-accent-btn">Hoje</button>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
                <div class="inline-flex items-center gap-1 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-800/80 p-1 shadow-sm">
                    <button onclick="setCalendarView('day')" class="calendar-tab px-3.5 py-1.5 text-sm rounded-xl ${view === 'day' ? 'active text-white' : 'text-gray-600 dark:text-gray-300'}">Dia</button>
                    <button onclick="setCalendarView('week')" class="calendar-tab px-3.5 py-1.5 text-sm rounded-xl ${view === 'week' ? 'active text-white' : 'text-gray-600 dark:text-gray-300'}">Semana</button>
                    <button onclick="setCalendarView('month')" class="calendar-tab px-3.5 py-1.5 text-sm rounded-xl ${view === 'month' ? 'active text-white' : 'text-gray-600 dark:text-gray-300'}">Mês</button>
                    <button onclick="setCalendarView('year')" class="calendar-tab px-3.5 py-1.5 text-sm rounded-xl ${view === 'year' ? 'active text-white' : 'text-gray-600 dark:text-gray-300'}">Ano</button>
                </div>
                <button onclick="openEventModal()" class="px-4 py-2 text-white text-sm rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-1 calendar-accent-btn">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Novo Evento
                </button>
            </div>
        </div>
        
        <!-- Filters -->
        <div class="calendar-filter-bar flex flex-wrap items-center gap-3 mx-4 lg:mx-6 mb-4 p-3 rounded-2xl shadow-sm">
            <span class="text-sm font-medium text-gray-500">Filtros:</span>
            <select onchange="State.filters.member=this.value; renderCalendar(document.getElementById('contentArea'))" class="calendar-select text-sm px-3 py-1.5 rounded-xl outline-none shadow-sm">
                <option value="all" ${State.filters.member === 'all' ? 'selected' : ''}>Todos os membros</option>
                ${State.members.map(m => `<option value="${m.id}" ${State.filters.member === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
            </select>
            <select onchange="State.filters.category=this.value; renderCalendar(document.getElementById('contentArea'))" class="calendar-select text-sm px-3 py-1.5 rounded-xl outline-none shadow-sm">
                <option value="all" ${State.filters.category === 'all' ? 'selected' : ''}>Todas as categorias</option>
                ${State.categories.map(c => `<option value="${c.id}" ${State.filters.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
        </div>
        
        <!-- Calendar Content -->
        <div class="mx-4 lg:mx-6 pb-6">
            <div class="bg-transparent overflow-hidden">
                ${view === 'month' ? renderMonthView() : view === 'week' ? renderWeekView() : view === 'year' ? renderYearView() : renderDayView()}
            </div>
        </div>
        </div>
    </div>`;
    
    container.innerHTML = html;
}

function renderMonthView() {
    const year = State.currentDate.getFullYear();
    const month = State.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const today = todayISO();
    
    let html = `
    <div class="calendar-panel rounded-3xl overflow-hidden">
    <div class="grid grid-cols-7">
        ${['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, idx) => {
            const weekendClass = idx === 5 ? 'weekend-sat' : idx === 6 ? 'weekend-sun' : '';
            return `<div class="calendar-weekday ${weekendClass} p-3 text-center text-[10px] uppercase tracking-[0.22em] font-semibold">${d}</div>`;
        }).join('')}`;
    
    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
        html += `<div class="calendar-day p-1 min-h-[80px]"></div>`;
    }
    
    // Days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === today;
        const weekdayIndex = (startDay + day - 1) % 7;
        const weekendClass = weekdayIndex === 5 ? 'weekend-sat' : weekdayIndex === 6 ? 'weekend-sun' : '';
        const dayEvents = getFilteredEvents().filter(e => e.date === dateStr);
        
        html += `<div role="button" tabindex="0" onclick="openTaskModal(null, '${dateStr}')" class="calendar-day ${weekendClass} p-2 ${isToday ? 'today' : ''} cursor-pointer">
            <div class="flex items-center justify-between mb-2">
                <div class="text-xs font-semibold ${isToday ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}">${day}</div>
                ${isToday ? '<span class="calendar-badge text-[10px] px-2 py-0.5 rounded-full text-white">Hoje</span>' : ''}
            </div>
            <div class="space-y-0.5">
                ${dayEvents.slice(0, 3).map(e => {
                    const memberTone = getMemberBg(e.members[0], '100');
                    return `<div class="calendar-event-pill text-[10px] px-1.5 py-1 rounded-lg truncate cursor-pointer ${memberTone} ${getMemberText(e.members[0])} hover:opacity-90 shadow-sm" onclick="event.stopPropagation(); openEventModal(${e.id})" title="${e.title}">${e.time ? e.time + ' ' : ''}${e.title}</div>`;
                }).join('')}
                ${dayEvents.length > 3 ? `<div class="text-[10px] text-gray-500 px-1">+${dayEvents.length - 3} mais</div>` : ''}
            </div>
        </div>`;
    }
    
    html += '</div></div>';
    return html;
}

function renderWeekView() {
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const startOfWeek = new Date(State.currentDate);
    startOfWeek.setDate(State.currentDate.getDate() - dayOfWeek);
    const todayStr = todayISO();
    
    let html = `<div class="calendar-panel rounded-3xl overflow-hidden">`;
    html += `<div class="grid grid-cols-7">`;
    
    // Header
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const isToday = dateStr === todayStr;
        const weekendClass = i === 5 ? 'weekend-sat' : i === 6 ? 'weekend-sun' : '';
        html += `<div role="button" tabindex="0" onclick="openTaskModal(null, '${dateStr}')" class="calendar-week-header ${weekendClass} p-3 text-center cursor-pointer ${isToday ? 'calendar-week-header-today' : ''}">
            <div class="text-[10px] uppercase tracking-[0.22em] text-gray-500">${d.toLocaleDateString('pt-PT', { weekday: 'short' })}</div>
            <div class="mt-1 inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${isToday ? 'calendar-day-chip today-glow' : 'calendar-day-chip'}">${d.getDate()}</div>
        </div>`;
    }
    html += '</div>';
    
    // Time slots
    html += `<div class="grid grid-cols-7 divide-x divide-gray-100/70 dark:divide-gray-700/70">`;
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayEvents = getFilteredEvents().filter(e => e.date === dateStr);
        const weekendClass = i === 5 ? 'weekend-sat' : i === 6 ? 'weekend-sun' : '';
        
        html += `<div role="button" tabindex="0" onclick="openTaskModal(null, '${dateStr}')" class="calendar-week-column ${weekendClass} p-2 min-h-[420px] cursor-pointer ${dateStr === todayStr ? 'calendar-week-column-today' : ''}">`;
        for (let hour = 7; hour <= 21; hour++) {
            const hourEvents = dayEvents.filter(e => {
                const h = parseInt((e.time || '').split(':')[0]);
                return h === hour;
            });
            html += `<div class="text-[10px] text-gray-400 border-t border-gray-50/80 dark:border-gray-700/70 py-1">${String(hour).padStart(2, '0')}:00</div>`;
            hourEvents.forEach(e => {
                const pillGlow = dateStr === todayStr ? 'today-glow' : '';
                html += `<div class="calendar-event-pill text-xs p-1.5 rounded-xl mb-1 cursor-pointer ${getMemberBg(e.members[0], '100')} ${getMemberText(e.members[0])} ${pillGlow} hover:opacity-90 shadow-sm" onclick="event.stopPropagation(); openEventModal(${e.id})">${e.time} ${e.title}</div>`;
            });
        }
        html += '</div>';
    }
    html += '</div></div>';
    return html;
}

function renderDayView() {
    const dateStr = State.currentDate.toISOString().split('T')[0];
    const dayEvents = getFilteredEvents().filter(e => e.date === dateStr).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const isToday = dateStr === todayISO();
    const displayDate = formatDate(dateStr);
    
    let html = `
    <div class="calendar-panel rounded-3xl overflow-hidden border border-gray-200/70 dark:border-gray-700/70 p-4">
        <div role="button" tabindex="0" onclick="openTaskModal(null, '${dateStr}')" class="text-center mb-4 cursor-pointer">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/70 shadow-sm mb-3">
                <span class="h-2 w-2 rounded-full ${isToday ? 'bg-indigo-500 today-glow' : 'bg-gray-400'}"></span>
                <span class="text-xs uppercase tracking-[0.22em] text-gray-500">${isToday ? 'Data atual' : 'Agenda diária'}</span>
            </div>
            <h3 class="text-xl font-bold ${isToday ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}">${displayDate}</h3>
            <p class="text-sm text-gray-500 mt-1">${dayEvents.length} eventos</p>
        </div>
        <div class="space-y-2">`;
    
    if (dayEvents.length === 0) {
        html += '<p class="text-center text-gray-500 py-8">Sem eventos para este dia</p>';
    } else {
        dayEvents.forEach(e => {
            html += `
            <div class="flex items-start gap-3 p-4 rounded-2xl ${getMemberBg(e.members[0], '50')} border border-gray-200/70 dark:border-gray-700/70 cursor-pointer hover:shadow-lg transition-all ${isToday ? 'today-glow' : ''}" onclick="openEventModal(${e.id})">
                <div class="text-center min-w-[60px]">
                    <div class="text-sm font-bold ${getMemberText(e.members[0])}">${e.time || '--:--'}</div>
                    ${e.endTime ? `<div class="text-xs text-gray-400">${e.endTime}</div>` : ''}
                </div>
                <div class="flex-1">
                    <div class="font-bold">${e.title}</div>
                    ${e.description ? `<div class="text-sm text-gray-500 mt-1">${e.description}</div>` : ''}
                    ${e.location ? `<div class="text-xs text-gray-400 mt-1">📍 ${e.location}</div>` : ''}
                    <div class="flex items-center gap-2 mt-2">
                        <span class="text-xs px-2 py-0.5 rounded-full ${getCategoryColor(e.category)}">${getCategoryName(e.category)}</span>
                        <div class="flex -space-x-1">
                            ${e.members.map(m => `<div class="w-5 h-5 rounded-full ${getMemberColor(m)} flex items-center justify-center text-[10px]">${getMember(m).avatar}</div>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button onclick="event.stopPropagation(); openEventModal(${e.id})" class="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onclick="event.stopPropagation(); deleteEvent(${e.id})" class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                        <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </div>`;
        });
    }
    
    html += '</div></div>';
    return html;
}

function renderYearView() {
    const year = State.currentDate.getFullYear();
    const today = todayISO();
    const monthLabels = Array.from({ length: 12 }, (_, monthIndex) => {
        const firstDay = new Date(year, monthIndex, 1);
        const lastDay = new Date(year, monthIndex + 1, 0);
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
            const monthName = titleCase(firstDay.toLocaleDateString('pt-PT', { month: 'long' }));
        let monthHtml = `
        <div role="button" tabindex="0" onclick="State.currentDate=new Date(${year}, ${monthIndex}, 1); setCalendarView('month')" class="calendar-tab calendar-year-card text-left rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <p class="text-[10px] uppercase tracking-[0.28em] text-gray-400">Mês</p>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${monthName}</h4>
                </div>
                <span class="calendar-badge text-xs px-2 py-1 rounded-full text-white">${lastDay.getDate()}</span>
            </div>
            <div class="grid grid-cols-7 gap-1 text-[10px] text-gray-400 mb-2">
                ${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, idx) => {
                    const weekendClass = idx === 5 ? 'weekend-sat' : idx === 6 ? 'weekend-sun' : '';
                    return `<span class="calendar-weekday-mini ${weekendClass} text-center">${day}</span>`;
                }).join('')}
            </div>
            <div class="grid grid-cols-7 gap-1">`;

        for (let i = 0; i < startDay; i++) {
            monthHtml += '<div class="calendar-mini-day"></div>';
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = getFilteredEvents().filter(e => e.date === dateStr);
            const isToday = dateStr === today;
            const weekdayIndex = (startDay + day - 1) % 7;
            const weekendClass = weekdayIndex === 5 ? 'weekend-sat' : weekdayIndex === 6 ? 'weekend-sun' : '';
            monthHtml += `
                <button type="button" onclick="event.stopPropagation(); State.currentDate=new Date('${dateStr}T00:00:00'); setCalendarView('day')" class="calendar-mini-day ${isToday ? 'today' : ''} ${weekendClass === 'weekend-sat' ? 'calendar-mini-weekend-sat' : weekendClass === 'weekend-sun' ? 'calendar-mini-weekend-sun' : ''} flex items-center justify-center rounded-full text-xs font-medium ${isToday ? 'today-glow' : 'calendar-mini-default'}">
                    ${day}
                    ${dayEvents.length ? `<span class="ml-1 text-[9px] opacity-80">${dayEvents.length}</span>` : ''}
                </button>`;
        }

        monthHtml += `
            </div>
        </div>`;
        return monthHtml;
    });

    return `
    <div class="calendar-panel rounded-3xl overflow-hidden border border-gray-200/70 dark:border-gray-700/70 p-4 lg:p-6">
        <div class="flex items-center justify-between gap-3 mb-4">
            <div>
                <p class="text-[10px] uppercase tracking-[0.28em] text-gray-400 dark:text-gray-500">Vista anual</p>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">${year}</h3>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Clique num mês para abrir a vista mensal</div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            ${monthLabels.join('')}
        </div>
    </div>`;
}

function getFilteredEvents() {
    let events = [...State.events];
    if (State.filters.member !== 'all') events = events.filter(e => e.members.includes(State.filters.member));
    if (State.filters.category !== 'all') events = events.filter(e => e.category === State.filters.category);
    return events;
}

function getCurrentPeriodLabel() {
    const d = State.currentDate;
    const view = State.calendarView;
    if (view === 'day') return formatDate(d.toISOString().split('T')[0]);
    if (view === 'week') {
        const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
        const start = new Date(d); start.setDate(d.getDate() - dayOfWeek);
        const end = new Date(start); end.setDate(start.getDate() + 6);
        return `${titleCase(start.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }))} - ${titleCase(end.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' }))}`;
    }
    if (view === 'year') return `${d.getFullYear()}`;
    return `${titleCase(d.toLocaleDateString('pt-PT', { month: 'long' }))} ${d.getFullYear()}`;
}

function setCalendarView(view) {
    State.calendarView = view;
    renderCalendar(document.getElementById('contentArea'));
}

function changeDate(direction) {
    const d = new Date(State.currentDate);
    const view = State.calendarView;
    if (view === 'day') d.setDate(d.getDate() + direction);
    else if (view === 'week') d.setDate(d.getDate() + (direction * 7));
    else if (view === 'year') d.setFullYear(d.getFullYear() + direction);
    else d.setMonth(d.getMonth() + direction);
    State.currentDate = d;
    renderCalendar(document.getElementById('contentArea'));
}

function goToToday() {
    State.currentDate = new Date();
    renderCalendar(document.getElementById('contentArea'));
}

// ==================== EVENT MODAL ====================
function openEventModal(eventId = null) {
    const event = eventId ? State.events.find(e => e.id === eventId) : null;
    const isEdit = !!event;
    
    const content = `
    <div class="p-6">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">${isEdit ? 'Editar Evento' : 'Novo Evento'}</h3>
            <button onclick="closeModal()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
        <form onsubmit="saveEvent(event, ${eventId || 'null'})" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Título *</label>
                <input type="text" id="evtTitle" value="${isEdit ? event.title : ''}" required class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Descrição</label>
                <textarea id="evtDesc" rows="2" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">${isEdit ? event.description || '' : ''}</textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Data *</label>
                    <input type="date" id="evtDate" value="${isEdit ? event.date : todayISO()}" required class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-sm font-medium mb-1">Hora início</label>
                        <input type="time" id="evtTime" value="${isEdit ? event.time || '' : ''}" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Hora fim</label>
                        <input type="time" id="evtEndTime" value="${isEdit ? event.endTime || '' : ''}" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Local</label>
                <input type="text" id="evtLocation" value="${isEdit ? event.location || '' : ''}" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Categoria</label>
                    <select id="evtCategory" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                        ${State.categories.map(c => `<option value="${c.id}" ${isEdit && event.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Membros</label>
                    <select id="evtMembers" multiple class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500 h-20">
                        ${State.members.map(m => `<option value="${m.id}" ${isEdit && event.members.includes(m.id) ? 'selected' : ''}>${m.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <input type="checkbox" id="evtReminder" ${isEdit && event.reminder ? 'checked' : ''} class="checkbox-custom">
                <label for="evtReminder" class="text-sm">Ativar lembrete</label>
            </div>
            <div class="flex gap-3 pt-2">
                <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
                <button type="submit" class="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">${isEdit ? 'Guardar' : 'Criar Evento'}</button>
            </div>
        </form>
    </div>`;
    
    openModal(content);
}

function saveEvent(e, eventId) {
    e.preventDefault();
    const members = Array.from(document.getElementById('evtMembers').selectedOptions).map(o => o.value);
    
    const eventData = {
        id: eventId || Date.now(),
        title: document.getElementById('evtTitle').value,
        description: document.getElementById('evtDesc').value,
        date: document.getElementById('evtDate').value,
        time: document.getElementById('evtTime').value,
        endTime: document.getElementById('evtEndTime').value,
        location: document.getElementById('evtLocation').value,
        category: document.getElementById('evtCategory').value,
        members: members.length ? members : [State.members[0].id],
        reminder: document.getElementById('evtReminder').checked
    };
    
    if (eventId) {
        const idx = State.events.findIndex(ev => ev.id === eventId);
        State.events[idx] = eventData;
        showToast('Evento atualizado!');
    } else {
        State.events.push(eventData);
        showToast('Evento criado!');
    }
    
    State.saveData();
    closeModal();
    renderPage();
}

function deleteEvent(id) {
    if (confirm('Tem a certeza que deseja eliminar este evento?')) {
        State.events = State.events.filter(e => e.id !== id);
        State.saveData();
        showToast('Evento eliminado', 'warning');
        renderPage();
    }
}
