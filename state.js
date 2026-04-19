function todayISO(date = new Date()) {
    return date.toISOString().split('T')[0];
}

function dateFromISO(dateStr) {
    return dateStr ? new Date(`${dateStr}T00:00:00`) : null;
}

function getMember(memberId) {
    return State.members.find(member => member.id === memberId);
}

function getGreeting(date = new Date()) {
    const hour = date.getHours();
    const name = 'André e Nayara';

    if (hour >= 20 || hour < 8) return `Boa Noite, ${name}!`;
    if (hour >= 12) return `Boa Tarde, ${name}!`;
    return `Bom Dia, ${name}!`;
}

function titleCase(text) {
    return text
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-');
}

function getThemeConfig(themeId = State.theme) {
    const resolvedTheme = normalizeThemeId(themeId);
    const baseTheme = THEME_PRESETS[resolvedTheme] || THEME_PRESETS.aurora;
    const variant = THEME_VARIANTS[resolvedTheme] || {};
    return {
        ...baseTheme,
        ...variant,
        buttonGradient: variant.buttonGradient || `linear-gradient(135deg, ${baseTheme.accent}, ${baseTheme.accent2})`,
        cardGradient: variant.cardGradient || `linear-gradient(180deg, color-mix(in srgb, ${baseTheme.accent} 18%, ${baseTheme.surfaceStrong || '#ffffff'}), color-mix(in srgb, ${baseTheme.accent2} 12%, ${baseTheme.surface || '#ffffff'}))`,
        panelGlow: variant.panelGlow || baseTheme.accentSoft
    };
}

function getCalendarThemeVars(themeId = State.theme) {
    const theme = getThemeConfig(themeId);
    return `--calendar-accent:${theme.accent};--calendar-accent-2:${theme.accent2};--calendar-panel-bg:${theme.background};--calendar-surface:${theme.surface || 'rgba(255,255,255,0.94)'};--calendar-surface-strong:${theme.surfaceStrong || 'rgba(255,255,255,0.98)'};--calendar-border:${theme.border || 'rgba(191, 219, 254, 0.95)'};--calendar-glow:${theme.accentSoft};--calendar-shadow:${theme.mode === 'dark' ? 'rgba(0,0,0,0.28)' : 'rgba(15,23,42,0.10)'};`;
}

function safeFontFamily(fontFamily) {
    return (fontFamily || '"Inter", system-ui, sans-serif').replace(/"/g, "'");
}

function normalizeThemeId(themeId) {
    if (!themeId || themeId === 'light') return 'aurora';
    if (themeId === 'dark') return 'midnight';
    return THEME_PRESETS[themeId] ? themeId : 'aurora';
}

function isRemoteApiAvailable() {
    return window.location.protocol !== 'file:';
}

function safeLocalStorageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        return false;
    }
}

function getDefaultLocalState() {
    return {
        theme: normalizeThemeId(safeLocalStorageGet('theme')),
        events: [],
        shoppingItems: [],
        tasks: [],
        notifications: [],
        updatedAt: 0
    };
}

function createEmptyStatePayload() {
    return getDefaultLocalState();
}

function sanitizeStatePayload(payload) {
    const defaults = createEmptyStatePayload();
    const source = payload && typeof payload === 'object' ? payload : {};
    return {
        theme: normalizeThemeId(source.theme || defaults.theme),
        events: Array.isArray(source.events) ? source.events : defaults.events,
        shoppingItems: Array.isArray(source.shoppingItems) ? source.shoppingItems : defaults.shoppingItems,
        tasks: Array.isArray(source.tasks) ? source.tasks : defaults.tasks,
        notifications: Array.isArray(source.notifications) ? source.notifications : defaults.notifications,
        updatedAt: Number.isFinite(source.updatedAt) ? source.updatedAt : defaults.updatedAt
    };
}

function pickLatestState(remoteState, cachedState) {
    const remote = remoteState ? sanitizeStatePayload(remoteState) : null;
    const cached = cachedState ? sanitizeStatePayload(cachedState) : null;
    if (!remote) return cached || getDefaultLocalState();
    if (!cached) return remote;
    return (remote.updatedAt || 0) >= (cached.updatedAt || 0) ? remote : cached;
}

// ==================== STATE MANAGEMENT ====================
const STORAGE_KEYS = {
    events: 'fam_events',
    shopping: 'fam_shopping',
    tasks: 'fam_tasks',
    notifications: 'fam_notifs',
    state: 'fam_state'
};

const REMOTE_STATE_ENDPOINT = '/api/state';

const THEME_PRESETS = {
    aurora: { label: 'Aurora Night', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #22d3ee, #10b981)', background: 'radial-gradient(circle at top left, rgba(34, 211, 238, 0.18), transparent 24%), radial-gradient(circle at top right, rgba(16, 185, 129, 0.12), transparent 22%), radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.10), transparent 26%), linear-gradient(180deg, #07131a 0%, #0b1c24 100%)', sidebar: 'linear-gradient(180deg, rgba(7,19,26,0.98), rgba(10,26,35,0.96))', header: 'linear-gradient(180deg, rgba(7,19,26,0.98), rgba(10,26,35,0.96))', surface: 'rgba(10, 26, 35, 0.94)', surfaceStrong: 'rgba(7, 19, 26, 0.98)', border: 'rgba(34, 211, 238, 0.60)', accent: '#22d3ee', accent2: '#10b981', accentSoft: 'rgba(34, 211, 238, 0.20)' },
    ocean: { label: 'Ocean Night', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', background: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.20), transparent 22%), radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.14), transparent 26%), radial-gradient(circle at center left, rgba(20, 184, 166, 0.10), transparent 20%), linear-gradient(180deg, #06101e 0%, #071726 100%)', sidebar: 'linear-gradient(180deg, rgba(6,16,30,0.98), rgba(8,22,38,0.96))', header: 'linear-gradient(180deg, rgba(6,16,30,0.98), rgba(8,22,38,0.96))', surface: 'rgba(8, 22, 38, 0.94)', surfaceStrong: 'rgba(6, 16, 30, 0.98)', border: 'rgba(56, 189, 248, 0.62)', accent: '#38bdf8', accent2: '#0ea5e9', accentSoft: 'rgba(56, 189, 248, 0.20)' },
    forest: { label: 'Forest Night', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #34d399, #16a34a)', background: 'radial-gradient(circle at top left, rgba(52, 211, 153, 0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(22, 163, 74, 0.14), transparent 26%), radial-gradient(circle at center right, rgba(132, 204, 22, 0.10), transparent 22%), linear-gradient(180deg, #06120d 0%, #0a1c12 100%)', sidebar: 'linear-gradient(180deg, rgba(6,18,13,0.98), rgba(10,28,18,0.96))', header: 'linear-gradient(180deg, rgba(6,18,13,0.98), rgba(10,28,18,0.96))', surface: 'rgba(10, 28, 18, 0.94)', surfaceStrong: 'rgba(6, 18, 13, 0.98)', border: 'rgba(52, 211, 153, 0.62)', accent: '#34d399', accent2: '#16a34a', accentSoft: 'rgba(52, 211, 153, 0.20)' },
    sunset: { label: 'Sunset Night', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #fb7185, #f97316)', background: 'radial-gradient(circle at top right, rgba(251, 113, 133, 0.20), transparent 24%), radial-gradient(circle at bottom left, rgba(249, 115, 22, 0.16), transparent 26%), radial-gradient(circle at center left, rgba(251, 191, 36, 0.10), transparent 22%), linear-gradient(180deg, #160b12 0%, #241115 100%)', sidebar: 'linear-gradient(180deg, rgba(22,11,18,0.98), rgba(36,17,21,0.96))', header: 'linear-gradient(180deg, rgba(22,11,18,0.98), rgba(36,17,21,0.96))', surface: 'rgba(36, 17, 21, 0.94)', surfaceStrong: 'rgba(22, 11, 18, 0.98)', border: 'rgba(251, 113, 133, 0.62)', accent: '#fb7185', accent2: '#f97316', accentSoft: 'rgba(251, 113, 133, 0.20)' },
    lavender: { label: 'Lavender Night', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #a78bfa, #ec4899)', background: 'radial-gradient(circle at top right, rgba(167, 139, 250, 0.20), transparent 24%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.16), transparent 26%), radial-gradient(circle at center left, rgba(192, 132, 252, 0.10), transparent 22%), linear-gradient(180deg, #120c1e 0%, #1d1230 100%)', sidebar: 'linear-gradient(180deg, rgba(18,12,30,0.98), rgba(29,18,48,0.96))', header: 'linear-gradient(180deg, rgba(18,12,30,0.98), rgba(29,18,48,0.96))', surface: 'rgba(29, 18, 48, 0.94)', surfaceStrong: 'rgba(18, 12, 30, 0.98)', border: 'rgba(167, 139, 250, 0.62)', accent: '#a78bfa', accent2: '#ec4899', accentSoft: 'rgba(167, 139, 250, 0.20)' },
    coral: { label: 'Coral Night', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #fb7185, #f43f5e)', background: 'radial-gradient(circle at top left, rgba(251, 113, 133, 0.20), transparent 24%), radial-gradient(circle at bottom right, rgba(244, 63, 94, 0.16), transparent 26%), radial-gradient(circle at center right, rgba(248, 113, 113, 0.10), transparent 22%), linear-gradient(180deg, #170c10 0%, #231116 100%)', sidebar: 'linear-gradient(180deg, rgba(23,12,16,0.98), rgba(35,17,22,0.96))', header: 'linear-gradient(180deg, rgba(23,12,16,0.98), rgba(35,17,22,0.96))', surface: 'rgba(35, 17, 22, 0.94)', surfaceStrong: 'rgba(23, 12, 16, 0.98)', border: 'rgba(251, 113, 133, 0.62)', accent: '#fb7185', accent2: '#f43f5e', accentSoft: 'rgba(251, 113, 133, 0.20)' },
    mint: { label: 'Mint Night', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #2dd4bf, #06b6d4)', background: 'radial-gradient(circle at top right, rgba(45, 212, 191, 0.20), transparent 24%), radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.16), transparent 26%), radial-gradient(circle at center left, rgba(16, 185, 129, 0.10), transparent 22%), linear-gradient(180deg, #061315 0%, #0b1f24 100%)', sidebar: 'linear-gradient(180deg, rgba(6,19,21,0.98), rgba(11,31,36,0.96))', header: 'linear-gradient(180deg, rgba(6,19,21,0.98), rgba(11,31,36,0.96))', surface: 'rgba(11, 31, 36, 0.94)', surfaceStrong: 'rgba(6, 19, 21, 0.98)', border: 'rgba(45, 212, 191, 0.62)', accent: '#2dd4bf', accent2: '#06b6d4', accentSoft: 'rgba(45, 212, 191, 0.20)' },
    royal: { label: 'Royal Night', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #818cf8, #f59e0b)', background: 'radial-gradient(circle at top left, rgba(129, 140, 248, 0.20), transparent 24%), radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.16), transparent 26%), radial-gradient(circle at center right, rgba(79, 70, 229, 0.10), transparent 22%), linear-gradient(180deg, #0b1020 0%, #131a2e 100%)', sidebar: 'linear-gradient(180deg, rgba(11,16,32,0.98), rgba(19,26,46,0.96))', header: 'linear-gradient(180deg, rgba(11,16,32,0.98), rgba(19,26,46,0.96))', surface: 'rgba(19, 26, 46, 0.94)', surfaceStrong: 'rgba(11, 16, 32, 0.98)', border: 'rgba(129, 140, 248, 0.62)', accent: '#818cf8', accent2: '#f59e0b', accentSoft: 'rgba(129, 140, 248, 0.20)' },
    sofia: { label: 'Sofia Velvet', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #f472b6, #c084fc)', background: 'radial-gradient(circle at top left, rgba(244, 114, 182, 0.22), transparent 24%), radial-gradient(circle at bottom right, rgba(192, 132, 252, 0.16), transparent 26%), radial-gradient(circle at center left, rgba(251, 182, 206, 0.10), transparent 22%), linear-gradient(180deg, #170b18 0%, #26132f 100%)', sidebar: 'linear-gradient(180deg, rgba(23,11,24,0.98), rgba(38,19,47,0.96))', header: 'linear-gradient(180deg, rgba(23,11,24,0.98), rgba(38,19,47,0.96))', surface: 'rgba(38, 19, 47, 0.94)', surfaceStrong: 'rgba(23, 11, 24, 0.98)', border: 'rgba(244, 114, 182, 0.62)', accent: '#f472b6', accent2: '#c084fc', accentSoft: 'rgba(244, 114, 182, 0.20)' },
    gucci: { label: 'Gucci Luxe', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #fbbf24, #22c55e)', background: 'radial-gradient(circle at top left, rgba(251, 191, 36, 0.22), transparent 24%), radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.16), transparent 26%), radial-gradient(circle at center right, rgba(217, 119, 6, 0.10), transparent 22%), linear-gradient(180deg, #141008 0%, #1f1b11 100%)', sidebar: 'linear-gradient(180deg, rgba(20,16,8,0.98), rgba(31,27,17,0.96))', header: 'linear-gradient(180deg, rgba(20,16,8,0.98), rgba(31,27,17,0.96))', surface: 'rgba(31, 27, 17, 0.94)', surfaceStrong: 'rgba(20, 16, 8, 0.98)', border: 'rgba(251, 191, 36, 0.62)', accent: '#fbbf24', accent2: '#22c55e', accentSoft: 'rgba(251, 191, 36, 0.20)' },
    midnight: { label: 'Midnight', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #818cf8, #f472b6)', background: 'radial-gradient(circle at top right, rgba(129, 140, 248, 0.24), transparent 22%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.16), transparent 26%), radial-gradient(circle at center left, rgba(59, 130, 246, 0.12), transparent 20%), linear-gradient(180deg, #0c1220 0%, #090f1d 100%)', sidebar: 'linear-gradient(180deg, rgba(10,16,31,0.98), rgba(12,20,36,0.96))', header: 'linear-gradient(180deg, rgba(10,16,31,0.98), rgba(12,20,36,0.96))', surface: 'rgba(13, 20, 36, 0.94)', surfaceStrong: 'rgba(10, 16, 31, 0.98)', border: 'rgba(71, 85, 105, 0.82)', accent: '#818cf8', accent2: '#f472b6', accentSoft: 'rgba(129, 140, 248, 0.22)' },
    graphite: { label: 'Graphite', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #334155, #60a5fa)', background: 'radial-gradient(circle at top right, rgba(96, 165, 250, 0.18), transparent 22%), radial-gradient(circle at bottom left, rgba(148, 163, 184, 0.12), transparent 26%), radial-gradient(circle at center right, rgba(51, 65, 85, 0.12), transparent 20%), linear-gradient(180deg, #0a1220 0%, #121826 100%)', sidebar: 'linear-gradient(180deg, rgba(10,16,28,0.98), rgba(12,18,30,0.96))', header: 'linear-gradient(180deg, rgba(10,16,28,0.98), rgba(12,18,30,0.96))', surface: 'rgba(15, 23, 42, 0.94)', surfaceStrong: 'rgba(10, 16, 28, 0.98)', border: 'rgba(71, 85, 105, 0.82)', accent: '#60a5fa', accent2: '#94a3b8', accentSoft: 'rgba(96, 165, 250, 0.20)' },
    deep_ocean: { label: 'Deep Ocean', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #0ea5e9, #14b8a6)', background: 'radial-gradient(circle at top left, rgba(14, 165, 233, 0.20), transparent 22%), radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.16), transparent 26%), radial-gradient(circle at center left, rgba(6, 182, 212, 0.12), transparent 20%), linear-gradient(180deg, #04111f 0%, #081826 100%)', sidebar: 'linear-gradient(180deg, rgba(6,15,28,0.98), rgba(8,20,32,0.96))', header: 'linear-gradient(180deg, rgba(6,15,28,0.98), rgba(8,20,32,0.96))', surface: 'rgba(8, 20, 32, 0.94)', surfaceStrong: 'rgba(6, 15, 28, 0.98)', border: 'rgba(14, 165, 233, 0.68)', accent: '#38bdf8', accent2: '#14b8a6', accentSoft: 'rgba(56, 189, 248, 0.20)' },
    ember: { label: 'Ember', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #f97316, #ef4444)', background: 'radial-gradient(circle at top left, rgba(249, 115, 22, 0.22), transparent 22%), radial-gradient(circle at bottom right, rgba(239, 68, 68, 0.18), transparent 26%), radial-gradient(circle at center right, rgba(251, 146, 60, 0.12), transparent 20%), linear-gradient(180deg, #120b0c 0%, #1c1011 100%)', sidebar: 'linear-gradient(180deg, rgba(25,14,15,0.98), rgba(30,16,17,0.96))', header: 'linear-gradient(180deg, rgba(25,14,15,0.98), rgba(30,16,17,0.96))', surface: 'rgba(30, 16, 17, 0.94)', surfaceStrong: 'rgba(25, 14, 15, 0.98)', border: 'rgba(127, 29, 29, 0.72)', accent: '#fb923c', accent2: '#ef4444', accentSoft: 'rgba(249, 115, 22, 0.20)' },
    amethyst: { label: 'Amethyst', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #8b5cf6, #ec4899)', background: 'radial-gradient(circle at top left, rgba(139, 92, 246, 0.22), transparent 22%), radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.18), transparent 26%), radial-gradient(circle at center right, rgba(168, 85, 247, 0.12), transparent 20%), linear-gradient(180deg, #120b1d 0%, #1b102c 100%)', sidebar: 'linear-gradient(180deg, rgba(25,14,38,0.98), rgba(29,17,45,0.96))', header: 'linear-gradient(180deg, rgba(25,14,38,0.98), rgba(29,17,45,0.96))', surface: 'rgba(29, 17, 45, 0.94)', surfaceStrong: 'rgba(25, 14, 38, 0.98)', border: 'rgba(109, 40, 217, 0.68)', accent: '#a78bfa', accent2: '#ec4899', accentSoft: 'rgba(139, 92, 246, 0.20)' },
    emerald_noir: { label: 'Emerald Noir', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #10b981, #0f766e)', background: 'radial-gradient(circle at top left, rgba(16, 185, 129, 0.20), transparent 22%), radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.16), transparent 26%), radial-gradient(circle at center right, rgba(52, 211, 153, 0.10), transparent 20%), linear-gradient(180deg, #051412 0%, #081d1b 100%)', sidebar: 'linear-gradient(180deg, rgba(8,20,18,0.98), rgba(10,28,26,0.96))', header: 'linear-gradient(180deg, rgba(8,20,18,0.98), rgba(10,28,26,0.96))', surface: 'rgba(10, 28, 26, 0.94)', surfaceStrong: 'rgba(8, 20, 18, 0.98)', border: 'rgba(16, 185, 129, 0.68)', accent: '#34d399', accent2: '#0f766e', accentSoft: 'rgba(16, 185, 129, 0.20)' },
    neon_mint: { label: 'Neon Mint', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #22c55e, #06b6d4)', background: 'radial-gradient(circle at top left, rgba(34, 211, 238, 0.20), transparent 22%), radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.16), transparent 26%), radial-gradient(circle at center right, rgba(34, 197, 94, 0.10), transparent 20%), linear-gradient(180deg, #051513 0%, #081c1d 100%)', sidebar: 'linear-gradient(180deg, rgba(8,22,20,0.98), rgba(10,29,29,0.96))', header: 'linear-gradient(180deg, rgba(8,22,20,0.98), rgba(10,29,29,0.96))', surface: 'rgba(10, 29, 29, 0.94)', surfaceStrong: 'rgba(8, 22, 20, 0.98)', border: 'rgba(20, 184, 166, 0.68)', accent: '#22d3ee', accent2: '#22c55e', accentSoft: 'rgba(34, 211, 238, 0.20)' },
    obsidian_royal: { label: 'Obsidian Royal', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #4f46e5, #f59e0b)', background: 'radial-gradient(circle at top right, rgba(79, 70, 229, 0.18), transparent 22%), radial-gradient(circle at bottom left, rgba(245, 158, 11, 0.16), transparent 26%), radial-gradient(circle at center left, rgba(96, 165, 250, 0.10), transparent 20%), linear-gradient(180deg, #050914 0%, #0a1020 100%)', sidebar: 'linear-gradient(180deg, rgba(8,12,26,0.98), rgba(12,17,33,0.96))', header: 'linear-gradient(180deg, rgba(8,12,26,0.98), rgba(12,17,33,0.96))', surface: 'rgba(12, 17, 33, 0.94)', surfaceStrong: 'rgba(8, 12, 26, 0.98)', border: 'rgba(99, 102, 241, 0.68)', accent: '#818cf8', accent2: '#f59e0b', accentSoft: 'rgba(79, 70, 229, 0.20)' },
    sofia_night: { label: 'Sofia Night', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #f472b6, #c084fc)', background: 'radial-gradient(circle at top left, rgba(244, 114, 182, 0.22), transparent 22%), radial-gradient(circle at bottom right, rgba(192, 132, 252, 0.18), transparent 26%), radial-gradient(circle at center right, rgba(251, 182, 206, 0.10), transparent 20%), linear-gradient(180deg, #170b18 0%, #220f2a 100%)', sidebar: 'linear-gradient(180deg, rgba(33,12,31,0.98), rgba(35,16,44,0.96))', header: 'linear-gradient(180deg, rgba(33,12,31,0.98), rgba(35,16,44,0.96))', surface: 'rgba(35, 16, 44, 0.94)', surfaceStrong: 'rgba(33, 12, 31, 0.98)', border: 'rgba(236, 72, 153, 0.68)', accent: '#f472b6', accent2: '#c084fc', accentSoft: 'rgba(244, 114, 182, 0.20)' },
    gucci_night: { label: 'Gucci Night', group: 'Escuros', mode: 'dark', preview: 'linear-gradient(135deg, #f59e0b, #22c55e)', background: 'radial-gradient(circle at top left, rgba(245, 158, 11, 0.22), transparent 22%), radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.18), transparent 26%), radial-gradient(circle at center right, rgba(166, 123, 91, 0.10), transparent 20%), linear-gradient(180deg, #131008 0%, #1a1a12 100%)', sidebar: 'linear-gradient(180deg, rgba(26,18,10,0.98), rgba(28,26,18,0.96))', header: 'linear-gradient(180deg, rgba(26,18,10,0.98), rgba(28,26,18,0.96))', surface: 'rgba(28, 26, 18, 0.94)', surfaceStrong: 'rgba(26, 18, 10, 0.98)', border: 'rgba(217, 119, 6, 0.68)', accent: '#f59e0b', accent2: '#22c55e', accentSoft: 'rgba(245, 158, 11, 0.20)' }
};

const THEME_VARIANTS = {
    aurora: { fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif' },
    ocean: { fontFamily: '"DM Sans", "Inter", system-ui, sans-serif' },
    forest: { fontFamily: '"Manrope", "Inter", system-ui, sans-serif' },
    sunset: { fontFamily: '"Cormorant Garamond", Georgia, serif' },
    lavender: { fontFamily: '"Playfair Display", Georgia, serif' },
    coral: { fontFamily: '"Montserrat", "Inter", system-ui, sans-serif' },
    mint: { fontFamily: '"Poppins", "Inter", system-ui, sans-serif' },
    royal: { fontFamily: '"Fraunces", Georgia, serif' },
    sofia: { fontFamily: '"Merriweather", Georgia, serif' },
    gucci: { fontFamily: '"Merriweather", Georgia, serif' },
    midnight: { fontFamily: '"Inter", system-ui, sans-serif' },
    graphite: { fontFamily: '"Montserrat", "Inter", system-ui, sans-serif' },
    deep_ocean: { fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif' },
    ember: { fontFamily: '"Poppins", "Inter", system-ui, sans-serif' },
    amethyst: { fontFamily: '"Playfair Display", Georgia, serif' },
    emerald_noir: { fontFamily: '"DM Sans", "Inter", system-ui, sans-serif' },
    neon_mint: { fontFamily: '"Manrope", "Inter", system-ui, sans-serif' },
    obsidian_royal: { fontFamily: '"Fraunces", Georgia, serif' },
    sofia_night: { fontFamily: '"Cormorant Garamond", Georgia, serif' },
    gucci_night: { fontFamily: '"Merriweather", Georgia, serif' }
};

const PAGE_TITLES = {
    dashboard: 'Página Inicial',
    calendar: 'Calendário',
    shopping: 'Lista de Compras',
    shopping_market: 'Modo Mercado',
    tasks: 'Tarefas',
    gucci: 'Área da Gucci',
    sofia: 'Área da Sofia',
    andre: 'Área do André',
    nayara: 'Área da Nayara',
    profiles: 'Perfis da Família'
};

const State = {
    currentPage: 'dashboard',
    theme: normalizeThemeId(safeLocalStorageGet('theme')),
    currentDate: new Date(),
    calendarView: 'month', // 'day', 'week', 'month', 'year'
    filters: { member: 'all', category: 'all', shopping: 'all', task: 'all' },
    
    members: [
        { id: 'andre', name: 'André', role: 'Pai', color: 'andre', avatar: 'A', icon: '👨' },
        { id: 'nayara', name: 'Nayara', role: 'Mãe', color: 'nayara', avatar: 'N', icon: '👩' },
        { id: 'sofia', name: 'Sofia', role: 'Filha', color: 'sofia', avatar: 'S', icon: '👧' },
        { id: 'gucci', name: 'Gucci', role: 'Cadela', color: 'gucci', avatar: '🐶', icon: '🐕' }
    ],
    
    categories: [
        { id: 'consultas', name: 'Consultas', color: 'red' },
        { id: 'exames', name: 'Exames', color: 'orange' },
        { id: 'profissional', name: 'Profissional', color: 'blue' },
        { id: 'escola', name: 'Escola', color: 'purple' },
        { id: 'lazer', name: 'Lazer', color: 'green' },
        { id: 'domestico', name: 'Tarefas Domésticas', color: 'gray' },
        { id: 'gucci', name: 'Compromissos da Gucci', color: 'amber' }
    ],
    
    events: [],
    shoppingItems: [],
    tasks: [],
    notifications: [],
    
    async init() {
        await this.loadData();
        this.updateBadges();
    },
    
    async loadData() {
        let cachedState = null;
        try {
            cachedState = JSON.parse(safeLocalStorageGet(STORAGE_KEYS.state) || 'null');
        } catch (e) {
            console.error('Error loading cached data', e);
        }

        if (!isRemoteApiAvailable()) {
            if (cachedState) {
                this.applyStatePayload(sanitizeStatePayload(cachedState));
                return;
            }
            this.applyStatePayload(getDefaultLocalState());
            return;
        }

        try {
            const response = await fetch(REMOTE_STATE_ENDPOINT, { cache: 'no-store' });
            if (response.ok) {
                const remoteData = await response.json();
                this.applyStatePayload(pickLatestState(remoteData, cachedState));
                return;
            }
        } catch(e) { console.error('Error loading data', e); }

        if (cachedState) {
            this.applyStatePayload(sanitizeStatePayload(cachedState));
            return;
        }

        this.applyStatePayload(getDefaultLocalState());
    },
    
    applyStatePayload(payload) {
        const safe = sanitizeStatePayload(payload);
        this.theme = safe.theme;
        this.events = safe.events;
        this.shoppingItems = safe.shoppingItems;
        this.tasks = safe.tasks;
        this.notifications = safe.notifications;
    },

    snapshot() {
        return sanitizeStatePayload({
            theme: this.theme,
            events: this.events,
            shoppingItems: this.shoppingItems,
            tasks: this.tasks,
            notifications: this.notifications,
            updatedAt: Date.now()
        });
    },

    async saveData() {
        const payload = this.snapshot();
        const serialized = JSON.stringify(payload);
        try {
            safeLocalStorageSet(STORAGE_KEYS.state, serialized);
            if (isRemoteApiAvailable()) {
                let sent = false;
                if (navigator.sendBeacon) {
                    try {
                        sent = navigator.sendBeacon(
                            REMOTE_STATE_ENDPOINT,
                            new Blob([serialized], { type: 'application/json' })
                        );
                    } catch (beaconError) {
                        sent = false;
                    }
                }

                if (!sent) {
                    const response = await fetch(REMOTE_STATE_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: serialized,
                        keepalive: true
                    });
                    if (!response.ok) {
                        throw new Error(`Remote save failed with status ${response.status}`);
                    }
                }
            }
        } catch (e) {
            console.error('Error saving data', e);
            safeLocalStorageSet(STORAGE_KEYS.state, serialized);
            if (isRemoteApiAvailable()) {
                showToast('Não foi possível guardar no Unraid', 'warning');
            }
        }
        this.updateBadges();
    },
    
    seedData() {
        this.events = [];
        this.shoppingItems = [];
        this.tasks = [];
        this.notifications = [];
    },
    
    updateBadges() {
        const shoppingBadge = document.getElementById('shoppingBadge');
        const shoppingAlertCard = document.getElementById('shoppingAlertCard');
        const shoppingAlertCount = document.getElementById('shoppingAlertCount');
        const shoppingAlertText = document.getElementById('shoppingAlertText');
        const tasksBadge = document.getElementById('tasksBadge');
        const notifBadge = document.getElementById('notifBadge');
        
        const pendingShopping = this.shoppingItems.filter(i => !i.bought).length;
        const pendingTasks = this.tasks.filter(t => !t.completed).length;
        
        if (shoppingBadge) {
            shoppingBadge.textContent = pendingShopping;
            shoppingBadge.classList.toggle('hidden', pendingShopping === 0);
        }
        if (shoppingAlertCard) {
            shoppingAlertCard.classList.toggle('hidden', pendingShopping === 0);
        }
        if (shoppingAlertCount) {
            shoppingAlertCount.textContent = pendingShopping;
        }
        if (shoppingAlertText) {
            shoppingAlertText.textContent = pendingShopping === 1
                ? 'Há 1 item por comprar na lista.'
                : `Há ${pendingShopping} itens por comprar na lista.`;
        }
        if (tasksBadge) {
            tasksBadge.textContent = pendingTasks;
            tasksBadge.classList.toggle('hidden', pendingTasks === 0);
        }
        if (notifBadge) {
            const notifCount = this.notifications.length;
            notifBadge.textContent = notifCount;
            notifBadge.classList.toggle('hidden', notifCount === 0);
        }
    }
};

// ==================== NAVIGATION ====================
function navigateTo(page) {
    State.currentPage = page;
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('bg-indigo-50', btn.dataset.page === page);
        btn.classList.toggle('dark:bg-gray-700', btn.dataset.page === page);
        btn.classList.toggle('text-indigo-600', btn.dataset.page === page);
        btn.classList.toggle('dark:text-indigo-400', btn.dataset.page === page);
    });
    
    document.getElementById('pageTitle').textContent = PAGE_TITLES[page] || PAGE_TITLES.dashboard;
    
    closeNotifications();
    renderPage();
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.add('collapsed');
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// ==================== THEME ====================
function applyTheme(themeId = State.theme, persist = true) {
    const resolvedTheme = normalizeThemeId(themeId);
    const theme = getThemeConfig(resolvedTheme);
    State.theme = resolvedTheme;

    const root = document.documentElement;
    root.classList.toggle('dark', theme.mode === 'dark');
    root.dataset.theme = resolvedTheme;
    document.body.dataset.theme = resolvedTheme;
    document.body.style.background = theme.background;
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundSize = 'cover';
    document.body.style.fontFamily = theme.fontFamily || '"Inter", system-ui, sans-serif';
    document.documentElement.style.setProperty('--theme-font-family', theme.fontFamily || '"Inter", system-ui, sans-serif', 'important');

    root.style.setProperty('--theme-sidebar-bg', theme.sidebar);
    root.style.setProperty('--theme-header-bg', theme.header);
    root.style.setProperty('--calendar-panel-bg', theme.background);
    root.style.setProperty('--theme-surface', theme.surface || 'rgba(255,255,255,0.94)');
    root.style.setProperty('--theme-surface-strong', theme.surfaceStrong || 'rgba(255,255,255,0.98)');
    root.style.setProperty('--theme-border', theme.border || 'rgba(191, 219, 254, 0.95)');
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-accent-2', theme.accent2);
    root.style.setProperty('--theme-accent-soft', theme.accentSoft);
    root.style.setProperty('--theme-page-glow', theme.panelGlow || theme.accentSoft);
    root.style.setProperty('--theme-button-gradient', theme.buttonGradient);
    root.style.setProperty('--theme-card-gradient', theme.cardGradient);
    root.style.setProperty('--theme-font-family', theme.fontFamily || '"Inter", system-ui, sans-serif', 'important');

    if (persist) {
        State.saveData(); // <--- O ERRO ESTAVA AQUI, AGORA ESTÁ CORRIGIDO!
    }

    updateThemeUI();
}

function updateThemeUI() {
    const theme = getThemeConfig(State.theme);
    const button = document.getElementById('themeButton');
    const label = document.getElementById('themeCurrentLabel');
    const icon = document.getElementById('themeCurrentIcon');

    if (button) {
        button.style.background = theme.buttonGradient || `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`;
        button.style.boxShadow = `0 12px 24px ${theme.accentSoft}`;
    }
    if (label) {
        label.textContent = theme.label;
    }
    if (icon) {
        icon.innerHTML = theme.mode === 'dark'
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4V2m0 20v-2m8.49-8H22m-20 0h1.51M17.657 6.343l1.414-1.414M4.929 19.071l1.414-1.414m0-11.314L4.93 4.929m14.142 14.142l-1.414-1.414M12 8a4 4 0 100 8 4 4 0 000-8z"/>';
    }

    renderThemePanel();

    document.querySelectorAll('[data-theme-option]').forEach(btn => {
        const active = btn.dataset.themeOption === State.theme;
        btn.classList.toggle('theme-option-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
}

function renderThemePanel() {
    const host = document.getElementById('themePanelContent');
    if (!host) return;

    const darkThemes = Object.entries(THEME_PRESETS)
        .map(([themeId]) => [themeId, getThemeConfig(themeId)])
        .filter(([, theme]) => theme.group === 'Escuros');

    const renderCard = ([themeId, theme]) => `
        <button type="button" data-theme-option="${themeId}" onclick="setTheme('${themeId}'); closeThemeMenu();"
            class="theme-option text-left rounded-2xl border border-gray-200 dark:border-gray-700 p-3 transition-all bg-white dark:bg-gray-900 shadow-sm">
            <div class="rounded-2xl overflow-hidden mb-3 border border-white/40 dark:border-white/10">
                <div class="h-24 p-3 flex flex-col justify-between text-white" style="background: ${theme.preview}; font-family: ${safeFontFamily(theme.fontFamily)};">
                    <div class="flex items-start justify-between">
                        <div>
                            <div class="text-sm font-semibold tracking-wide">${theme.label}</div>
                            <div class="text-[11px] opacity-80">${theme.group}</div>
                        </div>
                        <div class="w-9 h-9 rounded-xl bg-white/18 backdrop-blur-sm flex items-center justify-center text-sm shadow-inner" style="font-family: ${safeFontFamily(theme.fontFamily)};">Aa</div>
                    </div>
                    <div class="flex items-center gap-2 text-[10px]">
                        <span class="px-2 py-1 rounded-full bg-white/18 backdrop-blur-sm">Cards</span>
                        <span class="px-2 py-1 rounded-full bg-black/20 backdrop-blur-sm">Buttons</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between gap-2">
                <div>
                    <div class="text-sm font-semibold">${theme.label}</div>
                    <div class="text-[11px] text-gray-500 dark:text-gray-400">${theme.mode === 'dark' ? 'Escuro' : 'Claro'} • ${theme.group}</div>
                </div>
                <div class="flex gap-1">
                    <span class="w-3 h-3 rounded-full" style="background:${theme.accent}"></span>
                    <span class="w-3 h-3 rounded-full" style="background:${theme.accent2}"></span>
                </div>
            </div>
        </button>
    `;

    host.innerHTML = `
        <div class="space-y-5">
            <section>
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h4 class="text-sm font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Temas Escuros</h4>
                        <p class="text-xs text-gray-500 dark:text-gray-400">20 estilos profundos e distintos</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    ${darkThemes.map(renderCard).join('')}
                </div>
            </section>
        </div>
    `;
}

function toggleThemeMenu() {
    const panel = document.getElementById('themePanel');
    if (!panel) return;
    if (panel.classList.contains('hidden')) {
        renderThemePanel();
        panel.classList.remove('hidden');
        panel.setAttribute('aria-hidden', 'false');
    } else {
        panel.classList.add('hidden');
        panel.setAttribute('aria-hidden', 'true');
    }
}

function closeThemeMenu() {
    const panel = document.getElementById('themePanel');
    if (panel) {
        panel.classList.add('hidden');
        panel.setAttribute('aria-hidden', 'true');
    }
}

function setTheme(themeId) {
    closeThemeMenu();
    applyTheme(themeId);
    requestAnimationFrame(() => closeThemeMenu());
}

function toggleTheme() {
    toggleThemeMenu();
}

// ==================== NOTIFICATIONS ====================
function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    panel.classList.toggle('hidden');
    renderNotifications();
}

function closeNotifications() {
    document.getElementById('notificationsPanel').classList.add('hidden');
}

function renderNotifications() {
    const list = document.getElementById('notificationsList');
    if (!State.notifications.length) {
        list.innerHTML = '<p class="text-center text-gray-500 py-4 text-sm">Sem notificações</p>';
        return;
    }
    list.innerHTML = State.notifications.map(n => `
        <div class="p-3 rounded-lg ${n.type === 'urgent' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : n.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'} fade-in">
            <div class="flex items-start gap-2">
                <span class="text-lg">${n.type === 'urgent' ? '🔴' : n.type === 'warning' ? '🟡' : '🔵'}</span>
                <p class="text-sm flex-1">${n.message}</p>
            </div>
        </div>
    `).join('');
}

function clearNotifications() {
    State.notifications = [];
    State.saveData();
    renderNotifications();
}

// ==================== TOAST ====================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const colors = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500' };
    toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 fade-in text-sm`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ==================== MODAL ====================
function openModal(content) {
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
}

// ==================== SEARCH ====================
function handleSearch(query) {
    if (!query.trim()) { renderPage(); return; }
    const q = query.toLowerCase();
    const results = { events: [], items: [], tasks: [] };
    results.events = State.events.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    results.items = State.shoppingItems.filter(i => i.name.toLowerCase().includes(q));
    results.tasks = State.tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    renderSearchResults(results, query);
}

function renderSearchResults(results, query) {
    const content = document.getElementById('contentArea');
    let html = `<div class="fade-in"><h3 class="text-lg font-bold mb-4">Resultados para "${query}"</h3>`;
    
    if (results.events.length) {
        html += `<h4 class="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2">Eventos (${results.events.length})</h4>`;
        html += `<div class="space-y-2 mb-6">${results.events.map(e => `<div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"><div class="font-medium">${e.title}</div><div class="text-sm text-gray-500">${e.date} ${e.time}</div></div>`).join('')}</div>`;
    }
    if (results.items.length) {
        html += `<h4 class="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2">Compras (${results.items.length})</h4>`;
        html += `<div class="space-y-2 mb-6">${results.items.map(i => `<div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${i.bought ? 'opacity-50' : ''}"><div class="font-medium">${i.name}</div><div class="text-sm text-gray-500">${i.category}</div></div>`).join('')}</div>`;
    }
    if (results.tasks.length) {
        html += `<h4 class="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2">Tarefas (${results.tasks.length})</h4>`;
        html += `<div class="space-y-2">${results.tasks.map(t => `<div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${t.completed ? 'opacity-50' : ''}"><div class="font-medium">${t.title}</div><div class="text-sm text-gray-500">${t.assignedTo} • ${t.dueDate}</div></div>`).join('')}</div>`;
    }
    if (!results.events.length && !results.items.length && !results.tasks.length) {
        html += '<p class="text-gray-500">Nenhum resultado encontrado</p>';
    }
    html += '</div>';
    content.innerHTML = html;
}

// ==================== HELPERS ====================
function getMemberColor(memberId) {
    const colors = { andre: 'bg-andre-500 text-white', nayara: 'bg-nayara-500 text-white', sofia: 'bg-sofia-500 text-white', gucci: 'bg-gucci-500 text-white' };
    return colors[memberId] || 'bg-gray-500 text-white';
}

function getMemberBg(memberId, opacity = '10') {
    const colors = { andre: `bg-andre-${opacity}`, nayara: `bg-nayara-${opacity}`, sofia: `bg-sofia-${opacity}`, gucci: `bg-gucci-${opacity}` };
    return colors[memberId] || `bg-gray-${opacity}`;
}

function getMemberText(memberId) {
    const colors = { andre: 'text-andre-600 dark:text-andre-400', nayara: 'text-nayara-600 dark:text-nayara-400', sofia: 'text-sofia-600 dark:text-sofia-400', gucci: 'text-gucci-600 dark:text-gucci-400' };
    return colors[memberId] || 'text-gray-600';
}

function getCategoryColor(cat) {
    const colors = { consultas: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', exames: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', profissional: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', escola: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', lazer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', domestico: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', gucci: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    return colors[cat] || 'bg-gray-100 text-gray-700';
}

function getCategoryName(cat) {
    const c = State.categories.find(c => c.id === cat);
    return c ? c.name : cat;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = dateFromISO(dateStr);
    const weekday = d.toLocaleDateString('pt-PT', { weekday: 'long' });
    const month = d.toLocaleDateString('pt-PT', { month: 'long' });
    return `${titleCase(weekday)}, ${d.getDate()} de ${titleCase(month)}`;
}

function formatShortDate(dateStr) {
    if (!dateStr) return '';
    const d = dateFromISO(dateStr);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
}

function isToday(dateStr) {
    const today = todayISO();
    return dateStr === today;
}

function isThisWeek(dateStr) {
    const today = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((d - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff < 7;
}
