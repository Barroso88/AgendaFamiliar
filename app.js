// ==================== RENDER PAGES ====================
function renderPage() {
    const content = document.getElementById('contentArea');
    const renderers = {
        dashboard: renderDashboard,
        calendar: renderCalendar,
        shopping: renderShopping,
        shopping_market: renderShoppingFocus,
        tasks: renderTasks,
        notes: typeof renderNotes !== 'undefined' ? renderNotes : renderDashboardFallback,
        gucci: renderGucci,
        sofia: renderSofia,
        andre: renderAndre,
        nayara: renderNayara,
        profiles: renderProfiles,
        eventos: renderEventsList
    };
    const renderer = renderers[State.currentPage] || renderDashboard;
    content.innerHTML = '';
    try {
        renderer(content);
    } catch (error) {
        console.error(`Render failed for ${State.currentPage}`, error);
        renderDashboardFallback(content);
    }
}

// ==================== DASHBOARD ====================
function renderDashboard(container) {
    const today = todayISO();
    const todayEvents = State.events.filter(e => e.date === today).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const scheduledEvents = State.events.filter(e => e.category !== 'feriado' && e.date >= today).sort((a, b) => `${a.date} ${a.time || '00:00'}`.localeCompare(`${b.date} ${b.time || '00:00'}`));
    const weekEvents = State.events.filter(e => isThisWeek(e.date) && e.date !== today).sort((a, b) => a.date.localeCompare(b.date));
    const pendingShopping = State.shoppingItems.filter(i => !i.bought);
    const urgentShopping = pendingShopping.filter(i => i.priority === 'alta');
    const pendingTasks = State.tasks.filter(t => !t.completed);
    const pendingWorkItems = pendingTasks.length + scheduledEvents.length;
    const urgentTasks = pendingTasks.filter(t => { const d = new Date(t.dueDate); const now = new Date(); return d <= now; });
    
    let html = `
    <div class="fade-in space-y-6">
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <h2 class="text-xl font-bold mb-0.5">${getGreeting()}</h2>
            <p class="text-indigo-100 text-sm">${formatDate(today)} • ${todayEvents.length} hoje</p>
        </div>
        
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button type="button" onclick="navigateTo('calendar')" class="text-left bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700 w-full">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">📅</div>
                    <div>
                        <p class="text-2xl font-bold">${scheduledEvents.length}</p>
                        <p class="text-xs text-gray-500">Eventos Hoje</p>
                        <p class="text-[10px] text-gray-400">Hoje + agendados</p>
                    </div>
                </div>
            </button>
            <button type="button" onclick="navigateTo('shopping_market')" class="text-left bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700 w-full">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600">🛒</div>
                    <div>
                        <p class="text-2xl font-bold">${pendingShopping.length}</p>
                        <p class="text-xs text-gray-500">Itens por Comprar</p>
                    </div>
                </div>
            </button>
            <button type="button" onclick="navigateTo('tasks')" class="text-left bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700 w-full">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600">✅</div>
                    <div>
                        <p class="text-2xl font-bold">${pendingWorkItems}</p>
                        <p class="text-xs text-gray-500">Tarefas Pendentes</p>
                        <p class="text-[10px] text-gray-400">Tarefas + eventos</p>
                    </div>
                </div>
            </button>
            <button type="button" onclick="navigateTo('${urgentShopping.length ? 'shopping_market' : 'tasks'}')" class="text-left bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700 w-full">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600">⚠️</div>
                    <div>
                        <p class="text-2xl font-bold">${urgentTasks.length + urgentShopping.length}</p>
                        <p class="text-xs text-gray-500">Alertas Urgentes</p>
                    </div>
                </div>
            </button>
        </div>
        
        <div class="grid lg:grid-cols-3 gap-4">
            <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="font-bold text-base">📅 Eventos de Hoje</h3>
                    <button onclick="navigateTo('calendar')" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Ver calendário</button>
                </div>
                ${todayEvents.length ? `
                    <div class="space-y-2">
                        ${todayEvents.map(e => {
                            return `
                            <div class="flex items-center gap-3 p-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg" style="background: linear-gradient(135deg, #4ade80, #22c55e) !important; border: 1px solid #16a34a !important; box-shadow: 0 0 16px rgba(34, 197, 94, 0.4) !important; color: #022c22 !important;">
                                <div class="flex-1 min-w-0">
                                    <div class="font-extrabold text-sm truncate" style="color: #022c22 !important;">${e.title}</div>
                                    ${(e.time || e.location) ? `<div class="text-xs mt-0.5 font-bold tracking-wide" style="color: rgba(2, 44, 34, 0.8) !important;">${e.time || ''} ${e.location ? '• ' + e.location : ''}</div>` : ''}
                                </div>
                                <span class="text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider" style="background-color: rgba(0,0,0,0.15) !important; color: #022c22 !important;">${getCategoryName(e.category)}</span>
                            </div>
                            `;
                        }).join('')}
                    </div>
                ` : '<p class="text-gray-500 text-sm py-4">Sem eventos para hoje 🎉</p>'}
            </div>
            
            <div class="h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 flex flex-col">
                <h3 class="font-bold text-base mb-2">⚠️ Urgente</h3>
                ${urgentShopping.length ? `
                    <div class="mb-3">
                        <p class="text-xs font-semibold text-gray-500 mb-2">COMPRAS</p>
                        ${urgentShopping.map(i => `
                            <div class="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 mb-1">
                                <span class="text-red-500 text-sm">🔴</span>
                                <span class="text-sm flex-1">${i.name}</span>
                                <span class="text-xs text-gray-500">x${i.quantity}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${urgentTasks.length ? `
                    <div>
                        <p class="text-xs font-semibold text-gray-500 mb-2">TAREFAS</p>
                        ${urgentTasks.map(t => {
                            const assignedId = Array.isArray(t.assignedTo) ? t.assignedTo[0] : t.assignedTo;
                            const member = getMember(assignedId) || { id: 'family', avatar: '👨‍👩‍👧‍👦', name: 'Família' };
                            return `
                            <div class="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 mb-1">
                                <span class="text-orange-500 text-sm">⏰</span>
                                <span class="text-sm flex-1">${t.title}</span>
                                <span class="text-xs px-1.5 py-0.5 rounded ${getMemberColor(member.id)}">${member.avatar}</span>
                            </div>
                        `}).join('')}
                    </div>
                ` : ''}
                ${!urgentShopping.length && !urgentTasks.length ? '<p class="text-gray-500 text-sm">Tudo em dia! ✅</p>' : ''}
            </div>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-4">
            <div class="h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 flex flex-col">
                <h3 class="font-bold text-base mb-2">📆 Esta Semana</h3>
                ${weekEvents.length ? `
                    <div class="space-y-2">
                        ${weekEvents.slice(0, 5).map(e => `
                            <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div class="text-center min-w-[50px]">
                                    <div class="text-xs text-gray-500">${new Date(e.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short' })}</div>
                                    <div class="font-bold text-lg">${new Date(e.date + 'T00:00:00').getDate()}</div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-sm truncate">${e.title}</div>
                                    <div class="text-xs text-gray-500">${e.time || ''}</div>
                                </div>
                                <div class="flex -space-x-1">
                                    ${e.members.map(m => { const memb = getMember(m); return memb ? `<div class="w-6 h-6 rounded-full ${getMemberColor(m)} flex items-center justify-center text-xs" title="${memb.name}">${memb.avatar}</div>` : ''; }).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-gray-500 text-sm">Sem eventos esta semana</p>'}
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h3 class="font-bold text-lg mb-4">👨‍👩‍👧‍🐕 Resumo por Membro</h3>
                <div class="space-y-3">
                    ${State.members.map(m => {
                        const memberEvents = State.events.filter(e => Array.isArray(e.members) && e.members.includes(m.id) && isThisWeek(e.date));
                        const memberTasks = State.tasks.filter(t => t.assignedTo === m.id && !t.completed);
                        const memberScheduledEvents = State.events.filter(e => Array.isArray(e.members) && e.members.includes(m.id) && e.date >= today && e.category !== 'feriado');
                        return `
                        <div class="flex items-center gap-3 p-3 rounded-lg ${getMemberBg(m.id)}">
                            <div class="w-10 h-10 rounded-full ${getMemberColor(m.id)} flex items-center justify-center text-sm font-bold">${m.avatar}</div>
                            <div class="flex-1">
                                <div class="font-medium">${m.name} <span class="text-xs text-gray-500">(${m.role})</span></div>
                                <div class="text-xs text-gray-500">${memberEvents.length} eventos esta semana • ${memberTasks.length + memberScheduledEvents.length} tarefas pendentes</div>
                            </div>
                            <button onclick="State.filters.member='${m.id}'; navigateTo('calendar')" class="text-xs px-2 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">Ver</button>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    </div>`;
    container.innerHTML = html;
}

function renderDashboardFallback(container) {
    container.innerHTML = `
    <div class="fade-in space-y-6">
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <h2 class="text-2xl font-bold mb-1">${getGreeting()}</h2>
            <p class="text-indigo-100">${formatDate(todayISO())}</p>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <p class="text-2xl font-bold">0</p>
                <p class="text-xs text-gray-500">Eventos Hoje</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <p class="text-2xl font-bold">0</p>
                <p class="text-xs text-gray-500">Itens por Comprar</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <p class="text-2xl font-bold">0</p>
                <p class="text-xs text-gray-500">Tarefas Pendentes</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <p class="text-2xl font-bold">0</p>
                <p class="text-xs text-gray-500">Alertas Urgentes</p>
            </div>
        </div>
        <div class="grid lg:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h3 class="font-bold text-lg mb-4">📅 Eventos de Hoje</h3>
                <p class="text-gray-500 text-sm py-4">Sem eventos para hoje 🎉</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h3 class="font-bold text-lg mb-4">⚠️ Urgente</h3>
                <p class="text-gray-500 text-sm">Tudo em dia! ✅</p>
            </div>
        </div>
    </div>`;
}

// ==================== GUCCI AREA ====================
function renderGucci(container) {
    const gucciEvents = State.events.filter(e => e.category === 'gucci' || (Array.isArray(e.members) && e.members.includes('gucci')));
    const gucciTasks = State.tasks.filter(t => t.category === 'gucci' || t.assignedTo === 'gucci');
    const gucciShopping = State.shoppingItems.filter(i => i.category === 'animais');
    const getEventMoment = (event) => new Date(`${event.date}T${event.time || '00:00'}`);
    const eventText = (event) => (event.title || '').toLowerCase();
    const consultPrefix = 'Consulta';
    const upcomingVet = gucciEvents.filter(e => e.date >= todayISO() && (eventText(e).includes('consulta') || eventText(e).includes('vet'))).sort((a, b) => a.date.localeCompare(b.date));
    const upcomingVaccine = gucciEvents.filter(e => eventText(e).includes('vacina') || eventText(e).includes('desparasit')).sort((a, b) => a.date.localeCompare(b.date));
    const gucciConsultEvents = gucciEvents.filter(e => eventText(e).includes('consulta') || eventText(e).includes('vet'));
    const lastConsult = [...gucciConsultEvents].filter(e => getEventMoment(e) <= new Date()).sort((a, b) => getEventMoment(b) - getEventMoment(a))[0];
    const nextConsult = [...gucciConsultEvents].filter(e => getEventMoment(e) > new Date()).sort((a, b) => getEventMoment(a) - getEventMoment(b))[0];
    const gucciVaccineEvents = gucciEvents.filter(e => eventText(e).includes('vacina') || eventText(e).includes('desparasit'));
    const lastVaccine = [...gucciVaccineEvents].filter(e => getEventMoment(e) <= new Date()).sort((a, b) => getEventMoment(b) - getEventMoment(a))[0];
    const nextVaccine = [...gucciVaccineEvents].filter(e => getEventMoment(e) > new Date()).sort((a, b) => getEventMoment(a) - getEventMoment(b))[0];
    const gucciBathEvents = gucciEvents.filter(e => eventText(e).includes('banho'));
    const lastBath = [...gucciBathEvents].filter(e => getEventMoment(e) <= new Date()).sort((a, b) => getEventMoment(b) - getEventMoment(a))[0];
    const nextBath = [...gucciBathEvents].filter(e => getEventMoment(e) > new Date()).sort((a, b) => getEventMoment(a) - getEventMoment(b))[0];
    const gucciTosaEvents = gucciEvents.filter(e => eventText(e).includes('tosa'));
    const lastTosa = [...gucciTosaEvents].filter(e => getEventMoment(e) <= new Date()).sort((a, b) => getEventMoment(b) - getEventMoment(a))[0];
    const nextTosa = [...gucciTosaEvents].filter(e => getEventMoment(e) > new Date()).sort((a, b) => getEventMoment(a) - getEventMoment(b))[0];
    const calculateGucciAge = () => {
        const birthDate = new Date('2022-11-15');
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        if (today.getDate() < birthDate.getDate()) months--;
        if (months < 0) { years--; months += 12; }
        return `${years} ${years === 1 ? 'Ano' : 'Anos'} e ${months} ${months === 1 ? 'Mês' : 'Meses'}`;
    };

    let html = `
    <div class="fade-in space-y-8 pb-12">
        <!-- Gucci Profile Hero -->
        <div class="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl premium-shadow">
            <div class="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <span class="text-9xl">🐾</span>
            </div>
            <div class="p-6 md:p-8 flex flex-col items-center gap-6 relative z-10">
                <div class="flex flex-col md:flex-row items-center gap-6 w-full">
                    <div class="relative">
                        <div class="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl md:text-6xl shadow-2xl shadow-amber-500/40 ring-4 ring-white dark:ring-gray-700">🐶</div>
                        <div class="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 border-4 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs shadow-lg" title="Saudável">✨</div>
                    </div>
                    <div class="text-center md:text-left flex-1">
                        <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">Gucci</h2>
                        <div class="flex flex-wrap justify-center md:justify-start gap-2">
                            <span class="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">Shih Tzu</span>
                            <span class="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">${calculateGucciAge()}</span>
                            <span class="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">Fêmea</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <div class="glass-panel p-3 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                        <p class="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1">Próxima Consulta</p>
                        <p class="font-bold text-sm text-gray-900 dark:text-white">${nextConsult ? formatShortDate(nextConsult.date) : '—'}</p>
                    </div>
                    <div class="glass-panel p-3 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                        <p class="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1">Próxima Vacina</p>
                        <p class="font-bold text-sm text-gray-900 dark:text-white">${nextVaccine ? formatShortDate(nextVaccine.date) : '—'}</p>
                    </div>
                    <div class="glass-panel p-3 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                        <p class="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1">Próximo Banho</p>
                        <p class="font-bold text-sm text-gray-900 dark:text-white">${nextBath ? formatShortDate(nextBath.date) : '—'}</p>
                    </div>
                    <div class="glass-panel p-3 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                        <p class="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1">Próxima Tosa</p>
                        <p class="font-bold text-sm text-gray-900 dark:text-white">${nextTosa ? formatShortDate(nextTosa.date) : '—'}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
            <!-- Health Column -->
            <div class="space-y-6">
                <div class="flex items-center gap-3 px-2">
                    <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-xl shadow-inner">🩺</div>
                    <h3 class="text-xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 uppercase">Saúde e Bem-Estar</h3>
                </div>

                <!-- Veterinário Section -->
                <div class="area-gradient-amber rounded-3xl border border-amber-100 dark:border-amber-900/50 p-6 space-y-5 shadow-lg shadow-amber-500/5">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">🏥 Consultas</h4>
                        <button onclick="document.getElementById('gucciConsultForm').classList.toggle('hidden')" class="p-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>

                    <div id="gucciConsultForm" class="hidden glass-panel p-4 rounded-2xl space-y-3 animate-slide-up">
                        <div class="grid grid-cols-2 gap-2">
                            <input type="date" id="gucciConsultDate" value="${todayISO()}" class="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border-0 shadow-sm text-sm outline-none focus:ring-2 focus:ring-amber-500">
                            <input type="time" id="gucciConsultTime" value="${new Date().toTimeString().slice(0,5)}" class="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border-0 shadow-sm text-sm outline-none focus:ring-2 focus:ring-amber-500">
                        </div>
                        <input type="text" id="gucciConsultNote" placeholder="Notas da consulta..." class="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border-0 shadow-sm text-sm outline-none focus:ring-2 focus:ring-amber-500">
                        <button type="button" onclick="registerGucciConsult()" class="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25">Registar Agora</button>
                    </div>

                    <div class="grid gap-3">
                        <div class="area-status-card p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Última consulta</span>
                                ${lastConsult ? `<div class="flex gap-1"><button onclick="openEventModal('${lastConsult.id}')" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">✏️</button></div>` : ''}
                            </div>
                            ${lastConsult ? `
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-xl">🏥</div>
                                    <div class="flex-1">
                                        <div class="font-bold text-sm">${lastConsult.title}</div>
                                        <div class="text-[11px] text-gray-500 font-medium">${formatShortDate(lastConsult.date)} • ${lastConsult.time || '--:--'}</div>
                                    </div>
                                </div>
                            ` : '<p class="text-xs text-gray-400 text-center py-2 italic">Sem histórico</p>'}
                        </div>
                        <div class="area-status-card p-4 rounded-2xl bg-sky-100 dark:bg-sky-900/40 shadow-md shadow-sky-500/10 border border-sky-200 dark:border-sky-800">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-300">Próxima consulta</span>
                                ${nextConsult ? `<div class="flex gap-1"><button onclick="openEventModal('${nextConsult.id}')" class="p-1.5 rounded-lg bg-white/50 dark:bg-black/20">✏️</button></div>` : ''}
                            </div>
                            ${nextConsult ? `
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-xl shadow-sm">📅</div>
                                    <div class="flex-1">
                                        <div class="font-bold text-sm text-sky-900 dark:text-sky-100">${nextConsult.title}</div>
                                        <div class="text-[11px] text-sky-700 dark:text-sky-300 font-bold">${formatShortDate(nextConsult.date)} • ${nextConsult.time || '--:--'}</div>
                                    </div>
                                </div>
                            ` : '<p class="text-xs text-sky-500 dark:text-sky-400 text-center py-2 italic">Nada agendado</p>'}
                        </div>
                    </div>
                </div>

                <!-- Vacinas Section -->
                <div class="area-gradient-rose rounded-3xl border border-rose-100 dark:border-rose-900/50 p-6 space-y-5 shadow-lg shadow-rose-500/5">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-rose-800 dark:text-rose-200 flex items-center gap-2">💉 Plano de Vacinação</h4>
                        <button onclick="document.getElementById('gucciVaccineForm').classList.toggle('hidden')" class="p-2 rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-all">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>

                    <div id="gucciVaccineForm" class="hidden glass-panel p-4 rounded-2xl space-y-3 animate-slide-up">
                        <div class="grid grid-cols-2 gap-2">
                            <input type="date" id="gucciVaccineDate" value="${todayISO()}" class="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border-0 shadow-sm text-sm outline-none focus:ring-2 focus:ring-rose-500">
                            <input type="time" id="gucciVaccineTime" value="${new Date().toTimeString().slice(0,5)}" class="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border-0 shadow-sm text-sm outline-none focus:ring-2 focus:ring-rose-500">
                        </div>
                        <input type="text" id="gucciVaccineNote" placeholder="Nome da vacina..." class="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border-0 shadow-sm text-sm outline-none focus:ring-2 focus:ring-rose-500">
                        <button type="button" onclick="registerGucciVaccine()" class="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25">Registar Vacina</button>
                    </div>

                    <div class="grid gap-3">
                        <div class="area-status-card p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Última vacina</span>
                                ${lastVaccine ? `<div class="flex gap-1"><button onclick="openEventModal('${lastVaccine.id}')" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">✏️</button></div>` : ''}
                            </div>
                            ${lastVaccine ? `
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-xl">💉</div>
                                    <div class="flex-1">
                                        <div class="font-bold text-sm">${lastVaccine.title}</div>
                                        <div class="text-[11px] text-gray-500 font-medium">${formatShortDate(lastVaccine.date)}</div>
                                    </div>
                                </div>
                            ` : '<p class="text-xs text-gray-400 text-center py-2 italic">Sem registo</p>'}
                        </div>
                        <div class="area-status-card p-4 rounded-2xl bg-rose-100 dark:bg-rose-900/40 shadow-md shadow-rose-500/10 border border-rose-200 dark:border-rose-800">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-300">Próxima vacina</span>
                                ${nextVaccine ? `<div class="flex gap-1"><button onclick="openEventModal('${nextVaccine.id}')" class="p-1.5 rounded-lg bg-white/50 dark:bg-black/20">✏️</button></div>` : ''}
                            </div>
                            ${nextVaccine ? `
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-xl shadow-sm">📅</div>
                                    <div class="flex-1">
                                        <div class="font-bold text-sm text-rose-900 dark:text-rose-100">${nextVaccine.title}</div>
                                        <div class="text-[11px] text-rose-700 dark:text-rose-300 font-bold">${formatShortDate(nextVaccine.date)}</div>
                                    </div>
                                </div>
                            ` : '<p class="text-xs text-rose-500 dark:text-rose-400 text-center py-2 italic">Plano em dia</p>'}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Grooming Column -->
            <div class="space-y-6">
                <div class="flex items-center gap-3 px-2">
                    <div class="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-xl shadow-inner">🧼</div>
                    <h3 class="text-xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 uppercase">Higiene e Estética</h3>
                </div>

                <!-- Banho Section -->
                <div class="area-gradient-sky rounded-3xl border border-sky-100 dark:border-sky-900/50 p-6 space-y-5 shadow-lg shadow-sky-500/5">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-sky-800 dark:text-sky-200 flex items-center gap-2">🛁 Banho</h4>
                        <button onclick="document.getElementById('gucciBathForm').classList.toggle('hidden')" class="p-2 rounded-xl bg-sky-500 text-white shadow-md shadow-amber-500/20 hover:bg-sky-600 transition-all">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>

                    <div id="gucciBathForm" class="hidden glass-panel p-4 rounded-2xl space-y-3 animate-slide-up">
                        <div class="grid grid-cols-2 gap-2">
                            <input type="date" id="gucciBathDate" value="${todayISO()}" class="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border-0 shadow-sm text-sm outline-none focus:ring-2 focus:ring-sky-500">
                            <input type="time" id="gucciBathTime" value="${new Date().toTimeString().slice(0,5)}" class="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border-0 shadow-sm text-sm outline-none focus:ring-2 focus:ring-sky-500">
                        </div>
                        <button type="button" onclick="registerGucciBath()" class="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25">Registar Banho</button>
                    </div>

                    <div class="grid gap-3">
                        <div class="area-status-card p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Último banho</span>
                                ${lastBath ? `<div class="flex gap-1"><button onclick="openEventModal('${lastBath.id}')" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">✏️</button></div>` : ''}
                            </div>
                            ${lastBath ? `
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-xl">🛁</div>
                                    <div class="flex-1">
                                        <div class="font-bold text-sm">${lastBath.title}</div>
                                        <div class="text-[11px] text-gray-500 font-medium">${formatShortDate(lastBath.date)}</div>
                                    </div>
                                </div>
                            ` : '<p class="text-xs text-gray-400 text-center py-2 italic">Sem histórico</p>'}
                        </div>
                        <div class="area-status-card p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/40 shadow-md shadow-blue-500/10 border border-blue-200 dark:border-blue-800">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">Próximo banho</span>
                                ${nextBath ? `<div class="flex gap-1"><button onclick="openEventModal('${nextBath.id}')" class="p-1.5 rounded-lg bg-white/50 dark:bg-black/20">✏️</button></div>` : ''}
                            </div>
                            ${nextBath ? `
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-xl shadow-sm">📅</div>
                                    <div class="flex-1">
                                        <div class="font-bold text-sm text-blue-900 dark:text-blue-100">${nextBath.title}</div>
                                        <div class="text-[11px] text-blue-700 dark:text-blue-300 font-bold">${formatShortDate(nextBath.date)}</div>
                                    </div>
                                </div>
                            ` : '<p class="text-xs text-blue-500 dark:text-blue-400 text-center py-2 italic">A precisar de banho?</p>'}
                        </div>
                    </div>
                </div>

                <!-- Tosa Section -->
                <div class="area-gradient-purple rounded-3xl border border-purple-100 dark:border-purple-900/50 p-6 space-y-5 shadow-lg shadow-purple-500/5">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">✂️ Tosa</h4>
                        <button onclick="document.getElementById('gucciTosaForm').classList.toggle('hidden')" class="p-2 rounded-xl bg-purple-500 text-white shadow-md shadow-purple-500/20 hover:bg-purple-600 transition-all">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>

                    <div id="gucciTosaForm" class="hidden glass-panel p-4 rounded-2xl space-y-3 animate-slide-up">
                        <div class="grid grid-cols-2 gap-2">
                            <input type="date" id="gucciTosaDate" value="${todayISO()}" class="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border-0 shadow-sm text-sm outline-none focus:ring-2 focus:ring-purple-500">
                            <input type="time" id="gucciTosaTime" value="${new Date().toTimeString().slice(0,5)}" class="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border-0 shadow-sm text-sm outline-none focus:ring-2 focus:ring-purple-500">
                        </div>
                        <button type="button" onclick="registerGucciTosa()" class="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm shadow-lg shadow-purple-500/25">Registar Tosa</button>
                    </div>

                    <div class="grid gap-3">
                        <div class="area-status-card p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Última Tosa</span>
                                ${lastTosa ? `<div class="flex gap-1"><button onclick="openEventModal('${lastTosa.id}')" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">✏️</button></div>` : ''}
                            </div>
                            ${lastTosa ? `
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-xl">✂️</div>
                                    <div class="flex-1">
                                        <div class="font-bold text-sm">${lastTosa.title}</div>
                                        <div class="text-[11px] text-gray-500 font-medium">${formatShortDate(lastTosa.date)}</div>
                                    </div>
                                </div>
                            ` : '<p class="text-xs text-gray-400 text-center py-2 italic">Sem histórico</p>'}
                        </div>
                        <div class="area-status-card p-4 rounded-2xl bg-violet-100 dark:bg-violet-900/40 shadow-md shadow-violet-500/10 border border-violet-200 dark:border-violet-800">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-300">Próxima Tosa</span>
                                ${nextTosa ? `<div class="flex gap-1"><button onclick="openEventModal('${nextTosa.id}')" class="p-1.5 rounded-lg bg-white/50 dark:bg-black/20">✏️</button></div>` : ''}
                            </div>
                            ${nextTosa ? `
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-xl shadow-sm">📅</div>
                                    <div class="flex-1">
                                        <div class="font-bold text-sm text-violet-900 dark:text-violet-100">${nextTosa.title}</div>
                                        <div class="text-[11px] text-violet-700 dark:text-violet-300 font-bold">${formatShortDate(nextTosa.date)}</div>
                                    </div>
                                </div>
                            ` : '<p class="text-xs text-violet-500 dark:text-violet-400 text-center py-2 italic">A precisar de um corte?</p>'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    container.innerHTML = html;
}


// ==================== FUNÇÕES DE REGISTO CORRIGIDAS (ASYNC/AWAIT) ====================

async function registerGucciBath() {
    const bathDate = document.getElementById('gucciBathDate')?.value || todayISO();
    const bathTime = document.getElementById('gucciBathTime')?.value || '';
    const bathNote = document.getElementById('gucciBathNote')?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: 'Banho da Gucci',
        description: bathNote ? bathNote : 'Registo de banho',
        date: bathDate,
        time: bathTime,
        endTime: '',
        location: '',
        category: 'gucci',
        members: ['gucci'],
        reminder: false
    });

    await State.saveData();
    showToast('Banho registado!');
    renderPage();
}

async function registerGucciConsult() {
    const consultDate = document.getElementById('gucciConsultDate')?.value || todayISO();
    const consultTime = document.getElementById('gucciConsultTime')?.value || '';
    const consultNote = document.getElementById('gucciConsultNote')?.value.trim() || '';
    
    State.events.push({
        id: Date.now(),
        title: 'Consulta da Gucci',
        description: consultNote ? consultNote : 'Registo de consulta',
        date: consultDate,
        time: consultTime,
        endTime: '',
        location: '',
        category: 'gucci',
        members: ['gucci'],
        reminder: false
    });

    await State.saveData();
    showToast('Consulta registada!');
    renderPage();
}

async function registerGucciVaccine() {
    const vaccineDate = document.getElementById('gucciVaccineDate')?.value || todayISO();
    const vaccineTime = document.getElementById('gucciVaccineTime')?.value || '';
    const vaccineNote = document.getElementById('gucciVaccineNote')?.value.trim() || '';
    
    State.events.push({
        id: Date.now(),
        title: 'Vacina da Gucci',
        description: vaccineNote ? vaccineNote : 'Registo de vacina',
        date: vaccineDate,
        time: vaccineTime,
        endTime: '',
        location: '',
        category: 'gucci',
        members: ['gucci'],
        reminder: false
    });

    await State.saveData();
    showToast('Vacina registada!');
    renderPage();
}

async function registerGucciTosa() {
    const tosaDate = document.getElementById('gucciTosaDate')?.value || todayISO();
    const tosaTime = document.getElementById('gucciTosaTime')?.value || '';
    const tosaNote = document.getElementById('gucciTosaNote')?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: 'Tosa da Gucci',
        description: tosaNote ? tosaNote : 'Registo de tosa',
        date: tosaDate,
        time: tosaTime,
        endTime: '',
        location: '',
        category: 'gucci',
        members: ['gucci'],
        reminder: false
    });

    await State.saveData();
    showToast('Tosa registada!');
    renderPage();
}

async function registerSofiaConsult() {
    const consultDate = document.getElementById('sofiaConsultDate')?.value || todayISO();
    const consultTime = document.getElementById('sofiaConsultTime')?.value || '';
    const consultNote = document.getElementById('sofiaConsultNote')?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: 'Consulta da Sofia',
        description: consultNote ? consultNote : 'Registo de consulta',
        date: consultDate,
        time: consultTime,
        endTime: '',
        location: '',
        category: 'saude',
        members: ['sofia'],
        reminder: false
    });

    await State.saveData();
    showToast('Consulta registada!');
    renderPage();
}

async function registerSofiaVaccine() {
    const vaccineDate = document.getElementById('sofiaVaccineDate')?.value || todayISO();
    const vaccineTime = document.getElementById('sofiaVaccineTime')?.value || '';
    const vaccineNote = document.getElementById('sofiaVaccineNote')?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: 'Vacina da Sofia',
        description: vaccineNote ? vaccineNote : 'Registo de vacina',
        date: vaccineDate,
        time: vaccineTime,
        endTime: '',
        location: '',
        category: 'saude',
        members: ['sofia'],
        reminder: false
    });

    await State.saveData();
    showToast('Vacina registada!');
    renderPage();
}

async function registerPersonalConsult(memberId, displayName) {
    const consultDate = document.getElementById(`${memberId}ConsultDate`)?.value || todayISO();
    const consultTime = document.getElementById(`${memberId}ConsultTime`)?.value || '';
    const consultNote = document.getElementById(`${memberId}ConsultNote`)?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: `Consulta de ${displayName}`,
        description: consultNote ? consultNote : 'Registo de consulta',
        date: consultDate,
        time: consultTime,
        endTime: '',
        location: '',
        category: 'saude',
        members: [memberId],
        reminder: false
    });

    await State.saveData();
    showToast('Consulta registada!');
    renderPage();
}

async function registerPersonalVaccine(memberId, displayName) {
    const vaccineDate = document.getElementById(`${memberId}VaccineDate`)?.value || todayISO();
    const vaccineTime = document.getElementById(`${memberId}VaccineTime`)?.value || '';
    const vaccineNote = document.getElementById(`${memberId}VaccineNote`)?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: `Vacina de ${displayName}`,
        description: vaccineNote ? vaccineNote : 'Registo de vacina',
        date: vaccineDate,
        time: vaccineTime,
        endTime: '',
        location: '',
        category: 'saude',
        members: [memberId],
        reminder: false
    });

    await State.saveData();
    showToast('Vacina registada!');
    renderPage();
}

function registerAndreConsult() { registerPersonalConsult('andre', 'André'); }
function registerAndreVaccine() { registerPersonalVaccine('andre', 'André'); }
function registerNayaraConsult() { registerPersonalConsult('nayara', 'Nayara'); }
function registerNayaraVaccine() { registerPersonalVaccine('nayara', 'Nayara'); }

// ==================== RENDERS PESSOAIS (SOFIA, ANDRE, NAYARA) ====================

function renderPersonalArea(container, config) {
    const { memberId, title, accentName, accentClass, accentSoftClass, consultPrefix, vaccinePrefix, emptyConsultText, emptyVaccineText } = config;
    const showBabyExtras = config.showBabyExtras ?? (memberId === 'sofia');
    const member = getMember(memberId);
    const displayTitle = title || (member ? member.name : 'Área Pessoal');
    
    const familyEvents = State.events.filter(e => Array.isArray(e.members) && e.members.includes(memberId));
    
    const familyTasks = State.tasks.filter(t => {
        const text = (t.title || '').toLowerCase();
        return t.assignedTo === memberId ||
            t.category === 'baby' || t.category === 'saude' || t.category === 'family' ||
            text.includes('fralda') || text.includes('leite') ||
            text.includes('papinha') || text.includes('pediatra') || text.includes('sesta');
    });
    
    const familyShopping = State.shoppingItems.filter(i => {
        const text = `${i.name || ''} ${i.notes || ''}`.toLowerCase();
        return i.category === 'bebé' || i.category === 'baby' || i.category === 'family' ||
            text.includes(memberId) || text.includes('fralda') || text.includes('leite') ||
            text.includes('toalhitas') || text.includes('pomada') ||
            text.includes('biberão') || text.includes('biberao') || text.includes('chupeta');
    });
    
    const textOfEvent = (event) => (event.title || '').toLowerCase();
    const upcomingCare = familyEvents.filter(e => e.date >= todayISO() && (
        textOfEvent(e).includes('pediatra') || textOfEvent(e).includes('consulta') ||
        textOfEvent(e).includes('vacina') || textOfEvent(e).includes('leite') ||
        textOfEvent(e).includes('banho')
    )).sort((a, b) => a.date.localeCompare(b.date));
    
    const upcomingActivities = familyEvents.filter(e => e.date >= todayISO() && (
        textOfEvent(e).includes('sesta') || textOfEvent(e).includes('soninho') ||
        textOfEvent(e).includes('brincar') || textOfEvent(e).includes('passeio') ||
        textOfEvent(e).includes('colo')
    )).sort((a, b) => a.date.localeCompare(b.date));
    
    const pendingTasks = familyTasks.filter(t => !t.completed).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    const pendingSupplies = familyShopping.filter(i => !i.bought);
    
    const getEventMoment = (event) => new Date(`${event.date}T${event.time || '00:00'}`);
    const consultEvents = familyEvents.filter(e => textOfEvent(e).includes('consulta') || textOfEvent(e).includes('pediatra'));
    const lastConsult = [...consultEvents].filter(e => getEventMoment(e) <= new Date()).sort((a, b) => getEventMoment(b) - getEventMoment(a))[0];
    const nextConsult = [...consultEvents].filter(e => getEventMoment(e) > new Date()).sort((a, b) => getEventMoment(a) - getEventMoment(b))[0];
    
    const vaccineEvents = familyEvents.filter(e => textOfEvent(e).includes('vacina'));
    const lastVaccine = [...vaccineEvents].filter(e => getEventMoment(e) <= new Date()).sort((a, b) => getEventMoment(b) - getEventMoment(a))[0];
    const nextVaccine = [...vaccineEvents].filter(e => getEventMoment(e) > new Date()).sort((a, b) => getEventMoment(a) - getEventMoment(b))[0];
    
    let html = `
    <div class="fade-in">
        <div class="grid grid-cols-2 lg:grid-cols-${showBabyExtras ? '4' : '2'} gap-4 mb-6">
            <div class="bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-900/25 dark:via-sky-900/25 dark:to-blue-900/25 rounded-xl p-4 card-hover border border-cyan-100 dark:border-cyan-800 shadow-lg shadow-cyan-500/10">
                <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="text-2xl">🏥</div>
                </div>
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">${nextConsult ? nextConsult.title : 'Sem consulta futura'}</p>
                <p class="text-xl font-bold text-cyan-700 dark:text-cyan-200 mt-1">${nextConsult ? `${new Date(nextConsult.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}` : '—'}</p>
                <p class="text-sm font-medium text-cyan-700/90 dark:text-cyan-200/90">${nextConsult ? `${nextConsult.time || 'Adiciona uma nova consulta'}` : 'Adiciona uma nova consulta'}</p>
            </div>
            <div class="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 dark:from-violet-900/25 dark:via-fuchsia-900/25 dark:to-purple-900/25 rounded-xl p-4 card-hover border border-violet-100 dark:border-violet-800 shadow-lg shadow-violet-500/10">
                <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="text-2xl">💉</div>
                </div>
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">${nextVaccine ? nextVaccine.title : 'Sem vacina futura'}</p>
                <p class="text-xl font-bold text-violet-700 dark:text-violet-200 mt-1">${nextVaccine ? `${new Date(nextVaccine.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}` : '—'}</p>
                <p class="text-sm font-medium text-violet-700/90 dark:text-violet-200/90">${nextVaccine ? `${nextVaccine.time || 'Adiciona uma nova vacina'}` : 'Adiciona uma nova vacina'}</p>
            </div>
            ${showBabyExtras ? `
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700">
                <div class="text-2xl mb-2">🧷</div>
                <p class="text-2xl font-bold">${pendingSupplies.length}</p>
                <p class="text-xs text-gray-500">Essenciais Pendentes</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700">
                <div class="text-2xl mb-2">🧸</div>
                <p class="text-2xl font-bold">${upcomingActivities.length}</p>
                <p class="text-xs text-gray-500">Momentos de Colo</p>
            </div>
            ` : ''}
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
            <div class="${accentClass} rounded-xl border p-4">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">🩺 ${consultPrefix}</h3>
                <div class="mb-4 p-4 bg-white/70 dark:bg-gray-900/25 rounded-2xl">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
                            <p class="text-sm font-semibold">Registar ${consultPrefix.toLowerCase()}</p>
                            <p class="text-xs text-gray-500">Data e hora da próxima marcação</p>
                        </div>
                        <span class="text-lg">🩺</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <input type="date" id="${memberId}ConsultDate" value="${todayISO()}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500">
                        <input type="time" id="${memberId}ConsultTime" value="${new Date().toTimeString().slice(0,5)}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500">
                    </div>
                    <input type="text" id="${memberId}ConsultNote" placeholder="Notas da marcação (opcional)" class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500 mb-3">
                    <button type="button" onclick="register${memberId.charAt(0).toUpperCase() + memberId.slice(1)}Consult()" class="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Registar ${consultPrefix.toLowerCase()}
                    </button>
                </div>
                <div class="grid gap-3">
                    <div class="area-status-card p-4 rounded-2xl bg-rose-100 dark:bg-rose-900/40 shadow-md shadow-rose-500/10 border border-rose-200 dark:border-rose-800 ring-1 ring-rose-50 dark:ring-rose-900/30">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800 shadow-sm">Última ${consultPrefix}</span>
                            ${lastConsult ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal('${lastConsult.id}')" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Editar ${consultPrefix.toLowerCase()}">✏️</button>
                                    <button type="button" onclick="deleteEvent(${lastConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Apagar ${consultPrefix.toLowerCase()}">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${lastConsult ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-lg text-white shadow-lg shadow-rose-500/20">🩺</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${lastConsult.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(lastConsult.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${lastConsult.time ? ' • ' + lastConsult.time : ''}${lastConsult.description ? ' • ' + lastConsult.description : ''}</div>
                                </div>
                            </div>
                        ` : `<p class="text-sm text-gray-500">${emptyConsultText || 'Ainda não existe nenhum registo.'}</p>`}
                    </div>
                    <div class="area-status-card p-4 rounded-2xl bg-sky-100 dark:bg-sky-900/40 shadow-md shadow-sky-500/10 border border-sky-200 dark:border-sky-800 ring-1 ring-sky-50 dark:ring-sky-900/30">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800 shadow-sm">Próxima ${consultPrefix}</span>
                            ${nextConsult ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal('${nextConsult.id}')" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-sky-600 dark:text-sky-300" title="Editar ${consultPrefix.toLowerCase()}">✏️</button>
                                    <button type="button" onclick="deleteEvent(${nextConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-sky-600 dark:text-sky-300" title="Apagar ${consultPrefix.toLowerCase()}">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${nextConsult ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-lg text-white shadow-lg shadow-sky-500/20">📅</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${nextConsult.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(nextConsult.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${nextConsult.time ? ' • ' + nextConsult.time : ''}${nextConsult.description ? ' • ' + nextConsult.description : ''}</div>
                                </div>
                            </div>
                        ` : `<p class="text-sm text-gray-500">Ainda não existe nenhuma marcação futura.</p>`}
                    </div>
                </div>
            </div>

            <div class="${accentSoftClass} rounded-xl border p-4">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">💉 Vacinas</h3>
                <div class="mb-4 p-4 bg-white/70 dark:bg-gray-900/25 rounded-2xl">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
                            <p class="text-sm font-semibold">Registar vacina</p>
                            <p class="text-xs text-gray-500">Data e hora da próxima vacina</p>
                        </div>
                        <span class="text-lg">💉</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <input type="date" id="${memberId}VaccineDate" value="${todayISO()}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-rose-100 dark:border-rose-800 text-sm outline-none focus:ring-2 focus:ring-rose-500">
                        <input type="time" id="${memberId}VaccineTime" value="${new Date().toTimeString().slice(0,5)}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-rose-100 dark:border-rose-800 text-sm outline-none focus:ring-2 focus:ring-rose-500">
                    </div>
                    <input type="text" id="${memberId}VaccineNote" placeholder="Notas da vacina (opcional)" class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-rose-100 dark:border-rose-800 text-sm outline-none focus:ring-2 focus:ring-rose-500 mb-3">
                    <button type="button" onclick="register${memberId.charAt(0).toUpperCase() + memberId.slice(1)}Vaccine()" class="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Registar vacina
                    </button>
                </div>
                <div class="grid gap-3">
                    <div class="area-status-card p-4 rounded-2xl bg-rose-100 dark:bg-rose-900/40 shadow-md shadow-rose-500/10 border border-rose-200 dark:border-rose-800 ring-1 ring-rose-50 dark:ring-rose-900/30">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800 shadow-sm">Última Vacina</span>
                            ${lastVaccine ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal('${lastVaccine.id}')" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Editar vacina">✏️</button>
                                    <button type="button" onclick="deleteEvent(${lastVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Apagar vacina">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${lastVaccine ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center text-lg text-white shadow-lg shadow-rose-500/20">💉</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${lastVaccine.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(lastVaccine.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${lastVaccine.time ? ' • ' + lastVaccine.time : ''}${lastVaccine.description ? ' • ' + lastVaccine.description : ''}</div>
                                </div>
                            </div>
                        ` : `<p class="text-sm text-gray-500">${emptyVaccineText || 'Ainda não existe nenhum registo de vacina.'}</p>`}
                    </div>
                    <div class="area-status-card p-4 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/40 shadow-md shadow-fuchsia-500/10 border border-fuchsia-200 dark:border-fuchsia-800 ring-1 ring-fuchsia-50 dark:ring-fuchsia-900/30">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 dark:bg-fuchsia-900/50 dark:text-fuchsia-300 dark:border-fuchsia-800 shadow-sm">Próxima ${vaccinePrefix}</span>
                            ${nextVaccine ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal('${nextVaccine.id}')" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-fuchsia-600 dark:text-fuchsia-300" title="Editar vacina">✏️</button>
                                    <button type="button" onclick="deleteEvent(${nextVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-fuchsia-600 dark:text-fuchsia-300" title="Apagar vacina">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${nextVaccine ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center text-lg text-white shadow-lg shadow-fuchsia-500/20">📅</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${nextVaccine.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(nextVaccine.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${nextVaccine.time ? ' • ' + nextVaccine.time : ''}${nextVaccine.description ? ' • ' + nextVaccine.description : ''}</div>
                                </div>
                            </div>
                        ` : `<p class="text-sm text-gray-500">Ainda não existe nenhuma vacina futura.</p>`}
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    container.innerHTML = html;
}

function renderAndre(container) {
    renderPersonalArea(container, {
        memberId: 'andre',
        title: 'Área do André',
        consultPrefix: 'Consulta',
        vaccinePrefix: 'Vacina',
        accentClass: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 border-sky-100 dark:border-sky-800',
        accentSoftClass: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-900/20 dark:via-sky-900/20 dark:to-blue-900/20 border-cyan-100 dark:border-cyan-800',
        emptyConsultText: 'Ainda não existe nenhum registo de consulta.',
        emptyVaccineText: 'Ainda não existe nenhum registo de vacina.'
    });
}

function renderNayara(container) {
    renderPersonalArea(container, {
        memberId: 'nayara',
        title: 'Área da Nayara',
        consultPrefix: 'Consulta',
        vaccinePrefix: 'Vacina',
        accentClass: 'bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-900/20 dark:via-pink-900/20 dark:to-fuchsia-900/20 border-rose-100 dark:border-rose-800',
        accentSoftClass: 'bg-gradient-to-br from-fuchsia-50 via-pink-50 to-rose-50 dark:from-fuchsia-900/20 dark:via-pink-900/20 dark:to-rose-900/20 border-fuchsia-100 dark:border-fuchsia-800',
        emptyConsultText: 'Ainda não existe nenhum registo de consulta.',
        emptyVaccineText: 'Ainda não existe nenhum registo de vacina.'
    });
}

function renderSofia(container) {
    renderPersonalArea(container, {
        memberId: 'sofia',
        title: 'Área da Sofia',
        consultPrefix: 'Consulta',
        vaccinePrefix: 'Vacina',
        accentClass: 'bg-gradient-to-br from-fuchsia-50 via-pink-50 to-rose-50 dark:from-fuchsia-900/20 dark:via-pink-900/20 dark:to-rose-900/20 border-fuchsia-100 dark:border-fuchsia-800',
        accentSoftClass: 'bg-gradient-to-br from-rose-50 via-fuchsia-50 to-pink-50 dark:from-rose-900/20 dark:via-fuchsia-900/20 dark:to-pink-900/20 border-rose-100 dark:border-rose-800',
        emptyConsultText: 'Ainda não existe nenhum registo de consulta.',
        emptyVaccineText: 'Ainda não existe nenhum registo de vacina.',
        showBabyExtras: false
    });
}

// ==================== PROFILES ====================
function renderProfiles(container) {
    let html = `
    <div class="fade-in">
        <h3 class="text-xl font-bold mb-6">👨‍👩‍👧‍🐕 Perfis da Família</h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">`;
    State.members.forEach(m => {
        const memberEvents = State.events.filter(e => Array.isArray(e.members) && e.members.includes(m.id));
        const memberTasks = State.tasks.filter(t => t.assignedTo === m.id);
        const upcomingEvents = memberEvents.filter(e => e.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
        const pendingTasks = memberTasks.filter(t => !t.completed);
        const sidebarIcons = {
            andre: '👨',
            nayara: '👩',
            sofia: '🎀',
            gucci: '🐾'
        };
        const icon = sidebarIcons[m.id] || m.avatar;
        const iconClass = m.id === 'gucci' ? 'icon-white' : '';
        
        html += `
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden card-hover">
            <div class="${getMemberBg(m.id)} p-6 text-center">
                <div class="text-4xl font-bold mx-auto mb-3 leading-none"><span class="${iconClass}">${icon}</span></div>
                <h4 class="text-lg font-bold">${m.name}</h4>
                <p class="text-sm opacity-70">${m.role}</p>
            </div>
            <div class="p-4 space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Eventos</span>
                    <span class="font-bold">${memberEvents.length}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Tarefas Pendentes</span>
                    <span class="font-bold">${pendingTasks.length}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Tarefas Concluídas</span>
                    <span class="font-bold">${memberTasks.filter(t => t.completed).length}</span>
                </div>
                
                ${upcomingEvents.length ? `
                    <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p class="text-xs font-semibold text-gray-500 mb-2">PRÓXIMOS EVENTOS</p>
                        <div class="space-y-1">
                            ${upcomingEvents.map(e => `
                                <div class="text-xs flex items-center gap-2">
                                    <span class="event-dot ${getMemberColor(m.id).split(' ')[0].replace('text-white', '').replace('bg-', 'bg-').replace('500', '400')}"></span>
                                    <span class="truncate">${e.title}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${pendingTasks.length ? `
                    <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p class="text-xs font-semibold text-gray-500 mb-2">TAREFAS</p>
                        <div class="space-y-1">
                            ${pendingTasks.slice(0, 2).map(t => `
                                <div class="text-xs flex items-center gap-2">
                                    <span class="text-amber-500">⏰</span>
                                    <span class="truncate">${t.title}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <button onclick="State.filters.member='${m.id}'; navigateTo('calendar')" class="w-full mt-2 px-3 py-2 rounded-lg ${getMemberBg(m.id)} ${getMemberText(m.id)} text-sm font-medium hover:opacity-80 transition-opacity">
                    Ver Calendário
                </button>
            </div>
        </div>`;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
    State.currentPage = 'dashboard';
    
    await State.init();

    if (typeof bindGlobalControls === 'function') bindGlobalControls();
    if (typeof startRouteWatcher === 'function') startRouteWatcher();
    const initialHashPage = window.location.hash.replace('#', '');
    if (typeof applyTheme === 'function') applyTheme(State.theme);
    if (initialHashPage && PAGE_TITLES[initialHashPage]) {
        navigateTo(initialHashPage, false);
    } else {
        navigateTo('dashboard', false);
    }
    
    if (window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.add('collapsed');
    }
    
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const themePanel = document.getElementById('themePanel');
        if (themePanel && !themePanel.contains(e.target) && !e.target.closest('#themeButton')) {
            if (typeof closeThemeMenu === 'function') closeThemeMenu();
        }
        if (sidebar && window.innerWidth < 1024 && !sidebar.classList.contains('collapsed') && !sidebar.contains(e.target) && !e.target.closest('button[onclick="toggleSidebar()"]')) {
            sidebar.classList.add('collapsed');
        }
    });
});
