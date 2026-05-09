const fs = require('fs');

let content = fs.readFileSync('server.js', 'utf8');

content = content.replace(
    "const { DatabaseSync } = require('node:sqlite');",
    "const { Pool } = require('pg');"
);

content = content.replace(
    "let db = null;",
    "let pool = null;"
);

content = content.replace(
    /function initDatabase\(\) \{[\s\S]*?function getDbState/,
    `async function initDatabase() {
    pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'agenda'
    });

    await pool.query(\`
        CREATE TABLE IF NOT EXISTS app_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            payload TEXT NOT NULL,
            updated_at BIGINT NOT NULL
        );
    \`);
}

async function getDbState`
);

content = content.replace(
    /async function getDbState\(\) \{[\s\S]*?function saveDbState/,
    `async function getDbState() {
    try {
        const { rows } = await pool.query('SELECT payload, updated_at FROM app_state WHERE id = 1');
        if (rows.length === 0) return null;
        return normalizeState(JSON.parse(rows[0].payload));
    } catch (e) {
        return null;
    }
}

async function saveDbState`
);

content = content.replace(
    /async function saveDbState\(state\) \{[\s\S]*?async function bootstrapStorage/,
    `async function saveDbState(state) {
    const payload = normalizeState(state);
    await pool.query(\`
        INSERT INTO app_state (id, payload, updated_at)
        VALUES (1, $1, $2)
        ON CONFLICT(id) DO UPDATE SET
            payload = EXCLUDED.payload,
            updated_at = EXCLUDED.updated_at
    \`, [JSON.stringify(payload), payload.updatedAt]);
    return payload;
}

async function bootstrapStorage`
);

content = content.replace(
    /async function bootstrapStorage\(\) \{[\s\S]*?function contentType/,
    `async function bootstrapStorage() {
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

function contentType`
);

content = content.replace(
    "const state = getDbState() || emptyState();",
    "const state = (await getDbState()) || emptyState();"
);

content = content.replace(
    "const payload = saveDbState(parsed);",
    "const payload = await saveDbState(parsed);"
);

content = content.replace(
    "const state = getDbState();",
    "const state = await getDbState();"
);

// Wipe out the /api/recover block logic
content = content.replace(
    /if \(pathname === '\/api\/recover'\) \{[\s\S]*?if \(pathname === '\/api\/state'\)/,
    `if (pathname === '/api/recover') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, message: 'Recover is disabled in Postgres mode.' }));
            return;
        }

        if (pathname === '/api/state')`
);

fs.writeFileSync('server.js', content, 'utf8');
console.log('server.js updated successfully!');
