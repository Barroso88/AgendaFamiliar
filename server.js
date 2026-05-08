const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { URL } = require('url');
const { Pool } = require('pg');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = '325347990401-qc3psp9e17fn4vi742f96cv4thkh6qo5.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const ALLOWED_EMAILS = [
    'andremrbarroso@gmail.com',
    'naykfreitas@gmail.com',
    'a.m.r.barroso@gmail.com'
];

async function verifyGoogleToken(token) {
    if (!token) return null;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(payload.email)) {
            console.log(`Acesso negado para email: ${payload.email}`);
            return null;
        }
        return payload;
    } catch (err) {
        console.error('Erro na validação do token:', err.message);
        return null;
    }
}

const PORT = Number(process.env.PORT || 3035);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'agenda.db');
const LEGACY_JSON_FILE = path.join(DATA_DIR, 'store.json');
const LEGACY_BACKUP_DIR = path.join(DATA_DIR, 'backups');
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
};

let pool = null;

function emptyState() {
    return {
        theme: 'midnight',
        events: [],
        shoppingItems: [],
        tasks: [],
        notifications: [],
        updatedAt: 0
    };
}

function normalizeState(source = {}) {
    return {
        ...emptyState(),
        ...source,
        events: Array.isArray(source.events) ? source.events : [],
        shoppingItems: Array.isArray(source.shoppingItems) ? source.shoppingItems : [],
        tasks: Array.isArray(source.tasks) ? source.tasks : [],
        notifications: Array.isArray(source.notifications) ? source.notifications : [],
        updatedAt: Number.isFinite(source.updatedAt) ? source.updatedAt : Date.now()
    };
}

async function ensureDataDir() {
    await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJsonFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return normalizeState(JSON.parse(content));
    } catch {
        return null;
    }
}

async function readLatestLegacyBackup() {
    try {
        const entries = await fs.readdir(LEGACY_BACKUP_DIR, { withFileTypes: true });
        const backupFiles = entries
            .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
            .map(entry => entry.name)
            .sort()
            .reverse();

        for (const fileName of backupFiles) {
            const snapshot = await readJsonFile(path.join(LEGACY_BACKUP_DIR, fileName));
            if (snapshot) return snapshot;
        }
    } catch {
        return null;
    }
    return null;
}

async function readLegacySnapshot() {
    return (await readJsonFile(LEGACY_JSON_FILE)) || (await readLatestLegacyBackup());
}

async function initDatabase() {
    pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'agenda'
    });

    await pool.query(`
        CREATE TABLE IF NOT EXISTS app_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            payload TEXT NOT NULL,
            updated_at BIGINT NOT NULL
        );
    `);
}

async function getDbState() {
    try {
        const { rows } = await pool.query('SELECT payload, updated_at FROM app_state WHERE id = 1');
        if (rows.length === 0) return null;
        return normalizeState(JSON.parse(rows[0].payload));
    } catch (e) {
        return null;
    }
}

async function saveDbState(state) {
    const payload = normalizeState(state);
    await pool.query(`
        INSERT INTO app_state (id, payload, updated_at)
        VALUES (1, $1, $2)
        ON CONFLICT(id) DO UPDATE SET
            payload = EXCLUDED.payload,
            updated_at = EXCLUDED.updated_at
    `, [JSON.stringify(payload), payload.updatedAt]);
    return payload;
}

async function bootstrapStorage() {
    await ensureDataDir();
    await initDatabase();

    const current = await getDbState();
    if (current) return current;

    const legacy = await readLegacySnapshot();
    if (legacy) {
        return await saveDbState(legacy);
    }

    return await saveDbState(emptyState());
}

function contentType(filePath) {
    return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function sendFile(res, filePath) {
    try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType(filePath) });
        res.end(data);
    } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
    }
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    res.end(JSON.stringify(payload));
}

async function handleApiState(req, res) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const user = await verifyGoogleToken(token);
    
    if (!user) {
        sendJson(res, 401, { ok: false, error: 'Não autorizado. Faz login primeiro.' });
        return;
    }

    if (req.method === 'GET') {
        const state = (await getDbState()) || emptyState();
        sendJson(res, 200, state);
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString('utf8');
        });

        req.on('end', async () => {
            try {
                const parsed = JSON.parse(body || '{}');
                const payload = await saveDbState(parsed);
                sendJson(res, 200, { ok: true, updatedAt: payload.updatedAt });
            } catch (error) {
                console.error('Erro no processamento do POST:', error);
                sendJson(res, 400, { ok: false, error: 'Invalid state or write error' });
            }
        });
        return;
    }

    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', 'Allow': 'GET, POST' });
    res.end('Method not allowed');
}

const server = http.createServer(async (req, res) => {
    try {
        const requestUrl = new URL(req.url, `http://${req.headers.host}`);
        const pathname = decodeURIComponent(requestUrl.pathname);

        if (pathname === '/limpar') {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"><title>A Limpar...</title></head>
                <body>
                    <script>
                        localStorage.clear();
                        window.location.href = '/';
                    </script>
                </body>
                </html>
            `);
            return;
        }

        if (pathname === '/api/debug-state') {
            try {
                const state = await getDbState();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    hasState: !!state, 
                    events: state?.events?.length || 0,
                    tasks: state?.tasks?.length || 0,
                    updatedAt: state?.updatedAt || 0,
                    firstEvents: state?.events?.slice(0, 5) || []
                }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
            return;
        }

        if (pathname === '/api/recover') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, message: 'Recover is disabled in Postgres mode.' }));
            return;
        }

        if (pathname === '/api/state') {
            await handleApiState(req, res);
            return;
        }

        let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
        if (!filePath.startsWith(PUBLIC_DIR)) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Forbidden');
            return;
        }

        try {
            const stat = await fs.stat(filePath);
            if (stat.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }
            await sendFile(res, filePath);
        } catch {
            await sendFile(res, path.join(PUBLIC_DIR, 'index.html'));
        }
    } catch (error) {
        console.error('Erro no servidor:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Internal server error');
    }
});

bootstrapStorage()
    .then(() => {
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Agenda Familiar ativa na porta ${PORT}`);
            console.log(`Base de dados: ${DB_FILE}`);
        });
    })
    .catch(error => {
        console.error('Falha ao inicializar armazenamento:', error);
        process.exit(1);
    });
