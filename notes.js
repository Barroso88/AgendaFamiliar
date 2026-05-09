// ==================== FAMILY NOTES ====================

const NOTE_COLORS = {
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-200' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/40', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-200' },
    green: { bg: 'bg-green-100 dark:bg-green-900/40', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-200' },
    pink: { bg: 'bg-pink-100 dark:bg-pink-900/40', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-800 dark:text-pink-200' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/40', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-800 dark:text-purple-200' }
};

function renderNotes(container) {
    const notes = State.notes || [];
    
    // Sort notes: newest first
    const sortedNotes = [...notes].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    let html = `
    <div class="fade-in">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="text-3xl">📝</span> Notas da Família
                </h2>
                <p class="text-gray-500 mt-1">Avisos, recados e ideias para a família.</p>
            </div>
            <button onclick="openNoteModal()" class="w-full md:w-auto px-4 py-2.5 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2" style="background: var(--theme-button-gradient, linear-gradient(135deg, #0ea5e9, #14b8a6)); box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.4);">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Nova Nota
            </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    `;

    if (sortedNotes.length === 0) {
        html += `
            <div class="col-span-full py-16 text-center">
                <div class="text-6xl mb-4 opacity-50">📝</div>
                <h3 class="text-xl font-bold text-gray-400 dark:text-gray-500 mb-2">Sem notas</h3>
                <p class="text-gray-500 dark:text-gray-400">Cria a primeira nota para a família ver.</p>
            </div>
        `;
    } else {
        sortedNotes.forEach(note => {
            const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
            const author = getMember(note.author);
            const authorName = author ? author.name : 'Desconhecido';
            const authorBg = author ? getMemberBg(note.author, '500') : 'bg-gray-400';
            
            // Format date
            const dateObj = new Date(note.createdAt);
            const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')} às ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
            
            // Format content to handle newlines
            const formattedContent = (note.content || '').replace(/\n/g, '<br>');

            html += `
                <div class="card-hover relative p-5 rounded-2xl border ${colorConfig.border} ${colorConfig.bg} shadow-sm transition-all group flex flex-col h-full min-h-[160px]">
                    <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="deleteNote(${note.id})" class="p-1.5 bg-white/50 dark:bg-gray-800/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 rounded-lg transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                    
                    <div class="flex-1 mb-4">
                        <p class="text-sm md:text-base whitespace-pre-wrap leading-relaxed ${colorConfig.text} font-medium">${formattedContent}</p>
                    </div>
                    
                    <div class="mt-auto flex items-center justify-between pt-3 border-t ${colorConfig.border} border-opacity-50">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full ${authorBg} shadow-sm"></span>
                            <span class="text-xs font-semibold ${colorConfig.text} opacity-80">${authorName}</span>
                        </div>
                        <span class="text-[10px] font-bold uppercase tracking-wider ${colorConfig.text} opacity-60">${dateStr}</span>
                    </div>
                </div>
            `;
        });
    }

    html += `
        </div>
    </div>
    `;

    container.innerHTML = html;
}

function openNoteModal() {
    const modalContent = document.getElementById('modalContent');
    const authorOptions = State.members.map(m => 
        `<option value="${m.id}">${m.name}</option>`
    ).join('');

    let html = `
        <div class="p-5 md:p-6 fade-in">
            <div class="flex justify-between items-center mb-5">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="text-xl">📝</span> Nova Nota
                </h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <form id="noteForm" onsubmit="saveNote(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Autor da Nota</label>
                    <select id="noteAuthor" required class="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none">
                        ${authorOptions}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nota</label>
                    <textarea id="noteContent" required rows="4" placeholder="Escreve o recado ou aviso..." class="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none resize-none"></textarea>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cor da Nota</label>
                    <div class="flex gap-3">
                        <label class="cursor-pointer group">
                            <input type="radio" name="noteColor" value="yellow" class="peer hidden" checked>
                            <div class="w-8 h-8 rounded-full bg-yellow-200 dark:bg-yellow-700 border-2 border-transparent peer-checked:border-gray-900 dark:peer-checked:border-white shadow-sm transition-all group-hover:scale-110"></div>
                        </label>
                        <label class="cursor-pointer group">
                            <input type="radio" name="noteColor" value="blue" class="peer hidden">
                            <div class="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-700 border-2 border-transparent peer-checked:border-gray-900 dark:peer-checked:border-white shadow-sm transition-all group-hover:scale-110"></div>
                        </label>
                        <label class="cursor-pointer group">
                            <input type="radio" name="noteColor" value="green" class="peer hidden">
                            <div class="w-8 h-8 rounded-full bg-green-200 dark:bg-green-700 border-2 border-transparent peer-checked:border-gray-900 dark:peer-checked:border-white shadow-sm transition-all group-hover:scale-110"></div>
                        </label>
                        <label class="cursor-pointer group">
                            <input type="radio" name="noteColor" value="pink" class="peer hidden">
                            <div class="w-8 h-8 rounded-full bg-pink-200 dark:bg-pink-700 border-2 border-transparent peer-checked:border-gray-900 dark:peer-checked:border-white shadow-sm transition-all group-hover:scale-110"></div>
                        </label>
                        <label class="cursor-pointer group">
                            <input type="radio" name="noteColor" value="purple" class="peer hidden">
                            <div class="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-700 border-2 border-transparent peer-checked:border-gray-900 dark:peer-checked:border-white shadow-sm transition-all group-hover:scale-110"></div>
                        </label>
                    </div>
                </div>

                <div class="pt-4 flex justify-end gap-3">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancelar</button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style="background: var(--theme-button-gradient, linear-gradient(135deg, #0ea5e9, #14b8a6));">Guardar</button>
                </div>
            </form>
        </div>
    `;

    modalContent.innerHTML = html;
    document.getElementById('modalOverlay').classList.remove('hidden');
    
    // Auto-focus text area
    setTimeout(() => {
        document.getElementById('noteContent').focus();
    }, 100);
}

async function saveNote(e) {
    e.preventDefault();
    
    const content = document.getElementById('noteContent').value.trim();
    const author = document.getElementById('noteAuthor').value;
    const colorInput = document.querySelector('input[name="noteColor"]:checked');
    const color = colorInput ? colorInput.value : 'yellow';

    if (!content) return;

    if (!State.notes) {
        State.notes = [];
    }

    const newNote = {
        id: Date.now(),
        content: content,
        author: author,
        color: color,
        createdAt: Date.now()
    };

    State.notes.push(newNote);
    await State.saveData();
    
    // Add notification
    const authorName = getMember(author)?.name || 'Alguém';
    addNotification('Nova Nota', `${authorName} adicionou uma nova nota para a família.`, 'notes');
    
    closeModal();
    if (State.currentPage === 'notes') {
        renderPage();
    }
}

async function deleteNote(id) {
    if (confirm('Tens a certeza que queres apagar esta nota?')) {
        State.notes = State.notes.filter(n => n.id !== id);
        await State.saveData();
        if (State.currentPage === 'notes') {
            renderPage();
        }
    }
}
