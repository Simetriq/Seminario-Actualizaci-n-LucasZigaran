// ═══════════════════════════════════════════════════════════════════
//  servidor.js  —  Backend para Registro de Alumnos
//  Ejecutar:  node servidor.js
//  Acceder:   http://<IP-del-servidor>:3000
// ═══════════════════════════════════════════════════════════════════

const http = require('http');
const url  = require('url');

const PORT = 3000;

// ── Datos en memoria: { "ip": [ {id, nombre, edad, nota}, … ] } ──
const dataPorIP = {};

function obtenerIP(req) {
  // X-Forwarded-For por si hay proxy; si no, la IP directa
  const fwd = req.headers['x-forwarded-for'];
  return (fwd ? fwd.split(',')[0] : req.socket.remoteAddress).trim();
}

// ── HTML de la página (idéntico al Punto 1 pero consume la API) ──
function paginaHTML() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Registro de Alumnos</title>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0e0f13; --surface: #16181f; --border: #2a2d38;
      --accent: #e8ff47; --accent2: #47d4ff; --text: #f0f0f0;
      --muted: #6b7080; --danger: #ff4747; --radius: 10px;
    }
    html, body { min-height: 100vh; background: var(--bg); color: var(--text);
      font-family: 'DM Sans', sans-serif; }
    body::before {
      content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    }
    .wrapper { position: relative; z-index: 1; max-width: 780px; margin: 0 auto; padding: 48px 24px 80px; }
    header { margin-bottom: 48px; }
    .eyebrow { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; }
    h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 8vw, 80px); line-height: 1; }
    h1 span { color: var(--accent); }
    .ip-badge { display: inline-block; margin-top: 10px; padding: 4px 12px; border: 1px solid var(--border);
      border-radius: 20px; font-size: 12px; color: var(--muted); }
    .ip-badge b { color: var(--accent2); }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px; margin-bottom: 48px; }
    .fields { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .field label { display: block; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
      color: var(--muted); margin-bottom: 8px; }
    .field input { width: 100%; background: var(--bg); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 12px 14px; color: var(--text);
      font-family: 'DM Sans', sans-serif; font-size: 15px; transition: border-color .2s, box-shadow .2s; outline: none; }
    .field input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(232,255,71,.12); }
    .field input::placeholder { color: var(--muted); }
    #error-msg { font-size: 13px; color: var(--danger); min-height: 18px; margin-bottom: 16px; }
    .btn-row { display: flex; gap: 12px; align-items: center; }
    button { cursor: pointer; border: none; border-radius: var(--radius); font-family: 'DM Sans', sans-serif;
      font-weight: 600; letter-spacing: .5px; transition: transform .15s, box-shadow .15s; }
    button:active { transform: scale(.97); }
    .btn-primary { background: var(--accent); color: #0e0f13; padding: 13px 28px; font-size: 14px; }
    .btn-primary:hover { box-shadow: 0 0 20px rgba(232,255,71,.4); }
    .btn-danger { background: transparent; border: 1px solid var(--danger); color: var(--danger); padding: 13px 20px; font-size: 13px; }
    .btn-danger:hover { background: rgba(255,71,71,.08); }
    .meta { font-size: 12px; color: var(--muted); margin-left: auto; }
    .count { color: var(--accent2); font-weight: 600; }
    .table-section h2 { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 1px; margin-bottom: 16px; }
    .table-wrap { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: rgba(232,255,71,.06); }
    thead th { padding: 14px 20px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
      color: var(--accent); text-align: left; font-weight: 500; }
    tbody tr { border-top: 1px solid var(--border); transition: background .15s; animation: fadeUp .3s ease both; }
    tbody tr:hover { background: rgba(255,255,255,.03); }
    tbody td { padding: 14px 20px; font-size: 14px; }
    td.rank { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: var(--muted); width: 50px; }
    .nota-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-weight: 600; font-size: 13px; }
    .nota-high { background: rgba(232,255,71,.12); color: var(--accent); }
    .nota-mid  { background: rgba(71,212,255,.12); color: var(--accent2); }
    .nota-low  { background: rgba(255,71,71,.12);  color: var(--danger); }
    .del-btn { background: none; border: none; color: var(--muted); font-size: 16px; padding: 4px 8px;
      border-radius: 6px; transition: color .15s, background .15s; }
    .del-btn:hover { color: var(--danger); background: rgba(255,71,71,.1); }
    .empty { text-align: center; padding: 60px 20px; color: var(--muted); }
    .empty-icon { font-size: 40px; margin-bottom: 12px; }
    .empty p { font-size: 14px; }
    .status { font-size: 12px; color: var(--muted); margin-top: 12px; transition: color .3s; }
    .status.ok  { color: #6bffb8; }
    .status.err { color: var(--danger); }
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @media (max-width: 560px) {
      .fields { grid-template-columns: 1fr; }
      .btn-row { flex-wrap: wrap; }
      .meta { margin-left: 0; }
    }
  </style>
</head>
<body>
<div class="wrapper">
  <header>
    <p class="eyebrow">Sistema escolar — Modo Red</p>
    <h1>Registro de<br/><span>Alumnos</span></h1>
    <div class="ip-badge">Tus datos se guardan por tu IP: <b id="mi-ip">…</b></div>
  </header>

  <div class="card">
    <div class="fields">
      <div class="field">
        <label for="inp-nombre">Nombre</label>
        <input id="inp-nombre" type="text" placeholder="Ej: María García" maxlength="60"/>
      </div>
      <div class="field">
        <label for="inp-edad">Edad</label>
        <input id="inp-edad" type="number" placeholder="Ej: 17" min="1" max="120"/>
      </div>
      <div class="field">
        <label for="inp-nota">Nota</label>
        <input id="inp-nota" type="number" placeholder="0 – 10" min="0" max="10" step="0.01"/>
      </div>
    </div>
    <div id="error-msg"></div>
    <div class="btn-row">
      <button class="btn-primary" onclick="agregarAlumno()">＋ Agregar alumno</button>
      <button class="btn-danger"  onclick="borrarTodo()">Borrar todo</button>
      <span class="meta">Total: <span class="count" id="total">0</span> alumnos</span>
    </div>
    <div class="status" id="status"></div>
  </div>

  <div class="table-section">
    <h2>Datos de Alumnos</h2>
    <div class="table-wrap" id="tabla-wrap"></div>
  </div>
</div>

<script>
  function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function classBadge(n){ return n>=7?'nota-high':n>=5?'nota-mid':'nota-low'; }

  function setStatus(msg, tipo) {
    const el = document.getElementById('status');
    el.textContent = msg;
    el.className = 'status ' + (tipo || '');
    if (tipo === 'ok') setTimeout(() => { el.textContent = ''; el.className = 'status'; }, 2500);
  }

  async function cargarAlumnos() {
    try {
      const res = await fetch('/api/alumnos');
      const { ip, alumnos } = await res.json();
      document.getElementById('mi-ip').textContent = ip;
      renderizar(alumnos);
    } catch(e) { setStatus('Error al conectar con el servidor.', 'err'); }
  }

  function renderizar(alumnos) {
    alumnos = [...alumnos].sort((a,b) => b.nota!==a.nota ? b.nota-a.nota : a.nombre.localeCompare(b.nombre,'es'));
    document.getElementById('total').textContent = alumnos.length;
    const wrap = document.getElementById('tabla-wrap');
    if (!alumnos.length) {
      wrap.innerHTML = '<div class="empty"><div class="empty-icon">📋</div><p>Aún no hay alumnos cargados.<br/>Completá el formulario y presioná <strong>Agregar alumno</strong>.</p></div>';
      return;
    }
    const rows = alumnos.map((a,i) => \`
      <tr>
        <td class="rank">\${String(i+1).padStart(2,'0')}</td>
        <td>\${escHtml(a.nombre)}</td>
        <td>\${a.edad}</td>
        <td><span class="nota-badge \${classBadge(a.nota)}">\${Number(a.nota).toFixed(2)}</span></td>
        <td><button class="del-btn" onclick="eliminar(\${a.id})">✕</button></td>
      </tr>\`).join('');
    wrap.innerHTML = \`<table>
      <thead><tr><th>#</th><th>Nombre</th><th>Edad</th><th>Nota</th><th></th></tr></thead>
      <tbody>\${rows}</tbody></table>\`;
  }

  async function agregarAlumno() {
    const nombre = document.getElementById('inp-nombre').value.trim();
    const edadRaw = document.getElementById('inp-edad').value.trim();
    const notaRaw = document.getElementById('inp-nota').value.trim();
    const errEl = document.getElementById('error-msg');

    if (!nombre)  { errEl.textContent = '⚠ Ingresá el nombre.'; return; }
    const edad = Number(edadRaw);
    if (!edadRaw || isNaN(edad) || edad<1 || edad>120) { errEl.textContent = '⚠ Edad inválida (1–120).'; return; }
    const nota = Number(notaRaw);
    if (notaRaw==='' || isNaN(nota) || nota<0 || nota>10) { errEl.textContent = '⚠ Nota debe ser entre 0 y 10.'; return; }
    errEl.textContent = '';

    try {
      const res = await fetch('/api/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, edad, nota })
      });
      if (!res.ok) throw new Error();
      document.getElementById('inp-nombre').value = '';
      document.getElementById('inp-edad').value   = '';
      document.getElementById('inp-nota').value   = '';
      document.getElementById('inp-nombre').focus();
      setStatus('✓ Alumno guardado en el servidor.', 'ok');
      await cargarAlumnos();
    } catch { setStatus('Error al guardar. ¿Está el servidor corriendo?', 'err'); }
  }

  async function eliminar(id) {
    try {
      await fetch('/api/alumnos/' + id, { method: 'DELETE' });
      await cargarAlumnos();
    } catch { setStatus('Error al eliminar.', 'err'); }
  }

  async function borrarTodo() {
    if (!confirm('¿Borrar todos tus alumnos?')) return;
    try {
      await fetch('/api/alumnos', { method: 'DELETE' });
      await cargarAlumnos();
    } catch { setStatus('Error al borrar.', 'err'); }
  }

  document.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => { if(e.key==='Enter') agregarAlumno(); }));

  cargarAlumnos();
</script>
</body>
</html>`;
}

// ── Router ──────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const ip      = obtenerIP(req);
  const parsed  = url.parse(req.url, true);
  const path    = parsed.pathname;
  const method  = req.method.toUpperCase();

  // CORS permisivo para red local
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── GET / → servir HTML ────────────────────────────────────────
  if (method === 'GET' && (path === '/' || path === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(paginaHTML());
    return;
  }

  // ── GET /api/alumnos → devolver alumnos de esta IP ────────────
  if (method === 'GET' && path === '/api/alumnos') {
    const alumnos = dataPorIP[ip] || [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ip, alumnos }));
    return;
  }

  // ── POST /api/alumnos → agregar alumno ────────────────────────
  if (method === 'POST' && path === '/api/alumnos') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { nombre, edad, nota } = JSON.parse(body);
        if (!nombre || isNaN(Number(edad)) || isNaN(Number(nota))) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Datos inválidos.' }));
          return;
        }
        if (!dataPorIP[ip]) dataPorIP[ip] = [];
        const alumno = { id: Date.now(), nombre: String(nombre).trim(), edad: Number(edad), nota: Number(nota) };
        dataPorIP[ip].push(alumno);
        console.log(`[+] ${ip} → Alumno agregado: ${alumno.nombre} (nota ${alumno.nota})`);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(alumno));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON inválido.' }));
      }
    });
    return;
  }

  // ── DELETE /api/alumnos/:id → eliminar uno ────────────────────
  const matchDel = path.match(/^\/api\/alumnos\/(\d+)$/);
  if (method === 'DELETE' && matchDel) {
    const id = Number(matchDel[1]);
    if (dataPorIP[ip]) {
      dataPorIP[ip] = dataPorIP[ip].filter(a => a.id !== id);
    }
    console.log(`[-] ${ip} → Alumno id ${id} eliminado`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ── DELETE /api/alumnos → borrar todos de esta IP ─────────────
  if (method === 'DELETE' && path === '/api/alumnos') {
    delete dataPorIP[ip];
    console.log(`[x] ${ip} → Todos los alumnos eliminados`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ── 404 ────────────────────────────────────────────────────────
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada.' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('════════════════════════════════════════════');
  console.log('  Servidor Registro de Alumnos');
  console.log(`  Escuchando en http://0.0.0.0:${PORT}`);
  console.log('  Accedé desde cualquier PC en la red:');
  console.log(`  http://<TU-IP-LOCAL>:${PORT}`);
  console.log('  (Para ver tu IP: ipconfig en Windows / ifconfig en Linux)');
  console.log('════════════════════════════════════════════');
});
