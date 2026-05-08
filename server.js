const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { URL } = require('url');
const { DatabaseSync } = require('node:sqlite');
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

let db = null;

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

function initDatabase() {
    db = new DatabaseSync(DB_FILE);
    db.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        CREATE TABLE IF NOT EXISTS app_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            payload TEXT NOT NULL,
            updated_at INTEGER NOT NULL
        );
    `);
}

function getDbState() {
    const row = db.prepare('SELECT payload, updated_at FROM app_state WHERE id = 1').get();
    if (!row) return null;
    try {
        return normalizeState(JSON.parse(row.payload));
    } catch {
        return null;
    }
}

function saveDbState(state) {
    const payload = normalizeState(state);
    db.prepare(`
        INSERT INTO app_state (id, payload, updated_at)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            payload = excluded.payload,
            updated_at = excluded.updated_at
    `).run(JSON.stringify(payload), payload.updatedAt);
    return payload;
}

async function bootstrapStorage() {
    await ensureDataDir();
    initDatabase();

    const current = getDbState();
    if (current) return current;

    const legacy = await readLegacySnapshot();
    if (legacy) {
        return saveDbState(legacy);
    }

    return saveDbState(emptyState());
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
        const state = getDbState() || emptyState();
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
                const payload = saveDbState(parsed);
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

        if (pathname === '/api/debug-state') {
            try {
                const state = getDbState();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    hasState: !!state, 
                    events: state?.events?.length || 0,
                    tasks: state?.tasks?.length || 0,
                    updatedAt: state?.updatedAt || 0
                }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
            return;
        }

        if (pathname === '/api/recover') {
            try {
                const fsSync = require('fs');
                
                // Procurar a base de dados real nas duas pastas possíveis
                const pathsToTry = [
                    '/app/data',
                    '/data',
                    path.join(__dirname, 'data')
                ];
                
                let bestWalPath = null;
                let bestWalSize = -1;
                let bestDbPath = null;

                for (const p of pathsToTry) {
                    const wp = path.join(p, 'agenda.db-wal');
                    const dp = path.join(p, 'agenda.db');
                    if (fsSync.existsSync(wp) && fsSync.existsSync(dp)) {
                        const size = fsSync.statSync(wp).size;
                        if (size > bestWalSize) {
                            bestWalSize = size;
                            bestWalPath = wp;
                            bestDbPath = dp;
                        }
                    }
                }

                if (!bestWalPath) {
                    throw new Error('WAL file not found in any known directory');
                }
                
                const dbFile = fsSync.readFileSync(bestDbPath);
                const walContent = fsSync.readFileSync(bestWalPath);
                
                const frameSize = 4120;
                const commitOffsets = [];
                // Identificar todos os commits no histórico do WAL
                for (let offset = 32; offset <= walContent.length - frameSize; offset += frameSize) {
                    const dbSize = walContent.readUInt32BE(offset + 4);
                    if (dbSize !== 0) commitOffsets.push(offset);
                }

                let recoveredPayload = null;
                const tempDbPath = path.join(DATA_DIR, 'temp_recover.db');
                const tempWalPath = tempDbPath + '-wal';

                // Rebobinar o WAL commit a commit (do mais recente para o mais antigo)
                for (let i = commitOffsets.length - 1; i >= 0; i--) {
                    const commitOffset = commitOffsets[i];
                    const newWalSize = commitOffset + frameSize;
                    
                    fsSync.writeFileSync(tempDbPath, dbFile);
                    fsSync.writeFileSync(tempWalPath, walContent.slice(0, newWalSize));
                    
                    try {
                        const tempDb = new DatabaseSync(tempDbPath);
                        const row = tempDb.prepare('SELECT payload FROM app_state WHERE id = 1').get();
                        tempDb.close(); // Isto apaga o tempWalPath automaticamente
                        
                        if (row && row.payload) {
                            const parsed = JSON.parse(row.payload);
                            if (parsed.events && parsed.events.length > 0) {
                                recoveredPayload = parsed;
                                break; // Encontrámos a base de dados boa!
                            }
                        }
                    } catch (e) {
                        // Ignorar frames incompletos
                    }
                }
                
                try { fsSync.unlinkSync(tempDbPath); } catch(e){}

                if (recoveredPayload) {
                    // FORÇAR a data de atualização para AGORA, para o browser aceitar que esta 
                    // versão é mais recente que a cache envenenada
                    recoveredPayload.updatedAt = Date.now();
                    saveDbState(recoveredPayload);
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ ok: true, message: 'MILAGRE! Recuperados ' + recoveredPayload.events.length + ' eventos da máquina do tempo do SQLite.' }));
                    return;
                }

                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ ok: false, message: 'O histórico foi vasculhado e não há nenhum evento guardado no ficheiro WAL.' }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ ok: false, message: err.message }));
            }
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
