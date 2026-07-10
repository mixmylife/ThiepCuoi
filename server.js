/**
 * ThiepCuoiViet Platform v3.0 — Full End-to-End
 * ===============================================
 * Routes:
 *   GET  /                     → Landing page
 *   GET  /tao-thiep            → Wizard tạo thiệp
 *   GET  /admin                → Admin CMS
 *   GET  /thiep/:slug          → Xem thiệp
 *   GET  /thiet-ke/:template   → Preview template
 *
 * API:
 *   GET/POST /api/wedding-config/:slug
 *   GET      /api/invitations
 *   GET      /api/check-slug/:slug
 *   POST     /api/rsvp/:slug
 *   GET      /api/rsvp/:slug
 *   GET      /api/rsvp/:slug/export
 *   POST/GET/DELETE /api/guestbook/:slug
 *   POST     /api/upload
 *   POST     /api/upload-multiple
 *   GET      /api/stats/:slug
 *   GET      /api/platform-stats
 *   GET      /api/templates
 *   GET      /api/qr?data=...
 */

const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const cors       = require('cors');
const bodyParser = require('body-parser');
const multer     = require('multer');
const QRCode     = require('qrcode');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const sharp      = require('sharp');

const app  = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'thiepcuoiviet_super_secret_key_2026';
const HOME_INVITATION_SLUG = process.env.HOME_INVITATION_SLUG || 'huy-hihi-duyen';

// ==========================================
// PATHS
// ==========================================
const PATHS = {
    public:      path.join(__dirname, 'public'),
    templates:   path.join(__dirname, 'public', 'templates'),
    data:        path.join(__dirname, 'data'),
    invitations: path.join(__dirname, 'data', 'invitations'),
    guests:      path.join(__dirname, 'data', 'guests'),
    uploads:     path.join(__dirname, 'uploads'),
};

Object.values(PATHS).forEach(p => {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const STATS_FILE = path.join(PATHS.data, 'platform_stats.json');
if (!fs.existsSync(STATS_FILE)) {
    fs.writeFileSync(STATS_FILE, JSON.stringify({
        totalViews: 0, totalRsvp: 0, totalInvitations: 0,
        createdAt: new Date().toISOString()
    }, null, 4));
}

const USERS_FILE = path.join(PATHS.data, 'users.json');
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 4));
}

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
const staticCache = {
    maxAge: '30d',
    immutable: true,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        if (/\.(?:ttf|otf|woff2?|eot)$/i.test(filePath)) {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
    },
};
app.use('/uploads', express.static(PATHS.uploads, staticCache));
app.use(express.static(PATHS.public, staticCache));

// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, PATHS.uploads),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 8)}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Tăng lên 50MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép upload ảnh hoặc file âm thanh!'));
        }
    }
});

async function optimizeUploadedImage(file) {
    if (!file?.mimetype?.startsWith('image/')) return;
    if (/image\/(?:gif|svg\+xml)/i.test(file.mimetype)) return;

    const ext = path.extname(file.path).toLowerCase();
    const tmpPath = `${file.path}.tmp`;
    const pipeline = sharp(file.path, { failOn: 'none' })
        .rotate()
        .resize({
            width: 1920,
            height: 1920,
            fit: 'inside',
            withoutEnlargement: true,
        });

    if (['.jpg', '.jpeg'].includes(ext)) {
        await pipeline.jpeg({ quality: 78, mozjpeg: true }).toFile(tmpPath);
    } else if (ext === '.png') {
        await pipeline.png({ compressionLevel: 9, palette: true }).toFile(tmpPath);
    } else if (ext === '.webp') {
        await pipeline.webp({ quality: 78 }).toFile(tmpPath);
    } else if (ext === '.avif') {
        await pipeline.avif({ quality: 60 }).toFile(tmpPath);
    } else {
        return;
    }

    const original = fs.statSync(file.path).size;
    const optimized = fs.statSync(tmpPath).size;
    if (optimized > 0 && optimized < original) {
        fs.renameSync(tmpPath, file.path);
        file.size = optimized;
    } else {
        fs.rmSync(tmpPath, { force: true });
    }
}

// ==========================================
// HELPERS
// ==========================================
function readJSON(filePath, fallback = null) {
    try {
        if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) { console.error('[readJSON]', filePath, e.message); }
    return fallback;
}
function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
}
function getTemplate(slug) {
    return readJSON(path.join(PATHS.invitations, `${slug}.json`))?.template || 'boho-floral-green';
}
function updateStats(field, delta = 1) {
    const stats = readJSON(STATS_FILE, {});
    stats[field] = (stats[field] || 0) + delta;
    writeJSON(STATS_FILE, stats);
}

const VIEW_FLUSH_INTERVAL_MS = Number(process.env.VIEW_FLUSH_INTERVAL_MS || 10000);
const pendingViews = new Map();
let pendingTotalViews = 0;

function queueView(slug) {
    const current = pendingViews.get(slug) || { count: 0, lastViewed: null };
    current.count += 1;
    current.lastViewed = new Date().toISOString();
    pendingViews.set(slug, current);
    pendingTotalViews += 1;
}

function flushPendingViews() {
    if (!pendingViews.size && !pendingTotalViews) return;

    for (const [slug, pending] of pendingViews.entries()) {
        const cfgFile = path.join(PATHS.invitations, `${slug}.json`);
        if (!fs.existsSync(cfgFile)) continue;

        const cfg = readJSON(cfgFile, {});
        cfg.stats = cfg.stats || {};
        cfg.stats.views = (cfg.stats.views || 0) + pending.count;
        cfg.stats.lastViewed = pending.lastViewed;
        writeJSON(cfgFile, cfg);
    }

    if (pendingTotalViews) updateStats('totalViews', pendingTotalViews);

    pendingViews.clear();
    pendingTotalViews = 0;
}

function getPendingViews(slug) {
    return pendingViews.get(slug) || { count: 0, lastViewed: null };
}

const viewFlushTimer = setInterval(flushPendingViews, VIEW_FLUSH_INTERVAL_MS);
viewFlushTimer.unref?.();
process.on('beforeExit', flushPendingViews);
process.on('SIGINT', () => { flushPendingViews(); process.exit(0); });
process.on('SIGTERM', () => { flushPendingViews(); process.exit(0); });

function slugExists(slug) {
    return fs.existsSync(path.join(PATHS.invitations, `${slug}.json`));
}

function sendInvitationPage(slug, res) {
    const template = getTemplate(slug);
    const tplFile  = path.join(PATHS.templates, template, 'index.html');
    const fallback = path.join(PATHS.templates, 'boho-floral-green', 'index.html');

    const cfgFile = path.join(PATHS.invitations, `${slug}.json`);
    if (fs.existsSync(cfgFile)) {
        queueView(slug);
    }

    if (fs.existsSync(tplFile))  return res.sendFile(tplFile);
    if (fs.existsSync(fallback)) return res.sendFile(fallback);
    res.status(404).send('<h2 style="text-align:center;padding:80px;font-family:sans-serif">Thiệp không tồn tại</h2>');
}

function sendHomeSharePage(req, res) {
    const target = `/thiep/${HOME_INVITATION_SLUG}`;
    const origin = `${req.protocol}://${req.get('host')}`;
    res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thiệp cưới Duyên Huy</title>
    <meta name="description" content="Thiệp cưới Duyên Huy">
    <meta property="og:title" content="Thiệp cưới Duyên Huy">
    <meta property="og:description" content="Thiệp cưới Duyên Huy">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${origin}/">
    <meta property="og:image" content="${origin}/share-duyen-huy.jpg">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Thiệp cưới Duyên Huy">
    <meta name="twitter:description" content="Thiệp cưới Duyên Huy">
    <link rel="canonical" href="${origin}${target}">
    <link rel="icon" href="/favicon.png" type="image/png">
    <meta http-equiv="refresh" content="0;url=${target}">
</head>
<body>
    <script>window.location.replace(${JSON.stringify(target)});</script>
    <p>Đang mở <a href="${target}">Thiệp cưới Duyên Huy</a>...</p>
</body>
</html>`);
}

// Middleware xác thực JWT
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Không có quyền truy cập (Thiếu Token)' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
}

// ==========================================
// WEB ROUTES
// ==========================================
app.get('/', sendHomeSharePage);
app.get('/tao-thiep', (req, res) => res.sendFile(path.join(PATHS.public, 'tao-thiep.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(PATHS.public, 'admin.html')));
app.get('/login', (req, res) => res.sendFile(path.join(PATHS.public, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(PATHS.public, 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(PATHS.public, 'dashboard.html')));

// Preview template (không load data, dùng data mẫu)
app.get('/preview/:template', (req, res) => {
    const tplFile = path.join(PATHS.templates, req.params.template, 'index.html');
    if (fs.existsSync(tplFile)) return res.sendFile(tplFile);
    res.redirect('/thiep/demo');
});

// Xem thiệp theo slug
app.get('/thiep/:slug', (req, res) => {
    const slug     = req.params.slug;
    sendInvitationPage(slug, res);
});

// ==========================================
// API — CHECK SLUG
// ==========================================
app.get('/api/check-slug/:slug', (req, res) => {
    const slug = req.params.slug.toLowerCase().trim();
    const reserved = ['admin', 'tao-thiep', 'templates', 'api', 'uploads', 'demo', 'preview', 'login', 'register', 'dashboard'];
    if (reserved.includes(slug)) return res.json({ available: false, reason: 'Từ dành riêng' });
    if (!/^[a-z0-9\-]+$/.test(slug)) return res.json({ available: false, reason: 'Chỉ dùng a-z, 0-9, dấu gạch ngang' });
    res.json({ available: !slugExists(slug) });
});

// ==========================================
// API — AUTH
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' });

        const users = readJSON(USERS_FILE, []);
        if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email đã tồn tại' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: Date.now().toString(), fullName, email, password: hashedPassword, createdAt: new Date().toISOString() };
        users.push(newUser);
        writeJSON(USERS_FILE, users);

        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: newUser.id, fullName, email } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = readJSON(USERS_FILE, []);
        const user = users.find(u => u.email === email);
        if (!user) return res.status(400).json({ error: 'Tài khoản không tồn tại' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Mật khẩu không đúng' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token, user: { id: user.id, fullName: user.fullName, email } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/me', verifyToken, (req, res) => {
    const users = readJSON(USERS_FILE, []);
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json({ id: user.id, fullName: user.fullName, email: user.email });
});

// ==========================================
// API — WEDDING CONFIG
// ==========================================
app.get('/api/wedding-config/:slug', (req, res) => {
    const file = path.join(PATHS.invitations, `${req.params.slug}.json`);
    const data = readJSON(file);
    if (data) return res.json(data);
    res.status(404).json({ error: 'Không tìm thấy thiệp' });
});

// Fallback: get default config (for backward compat)
app.get('/api/wedding-config', (req, res) => {
    const file = path.join(PATHS.invitations, 'demo.json');
    const data = readJSON(file);
    if (data) return res.json(data);
    res.status(404).json({ error: 'No config' });
});

app.post('/api/wedding-config/:slug', verifyToken, (req, res) => {
    const slug    = req.params.slug;
    const file    = path.join(PATHS.invitations, `${slug}.json`);
    const isNew   = !fs.existsSync(file);
    let existingData = {};

    if (!isNew) {
        existingData = readJSON(file, {});
        // Nếu thiệp đã có chủ, kiểm tra xem có phải của user này không
        if (existingData.userId && existingData.userId !== req.user.id) {
            return res.status(403).json({ error: 'Bạn không có quyền sửa thiệp này!' });
        }
    }

    const payload = {
        ...existingData,
        ...req.body,
        slug,
        userId: req.user.id, // Gắn ID của user hiện tại
        updatedAt: new Date().toISOString()
    };

    if (isNew && !payload.createdAt) payload.createdAt = payload.updatedAt;

    try {
        writeJSON(file, payload);
        if (isNew) updateStats('totalInvitations');
        res.json({ success: true, slug, shareUrl: `/thiep/${slug}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Danh sách thiệp của user hiện tại
app.get('/api/invitations', verifyToken, (req, res) => {
    if (!fs.existsSync(PATHS.invitations)) return res.json([]);
    const list = fs.readdirSync(PATHS.invitations)
        .filter(f => f.endsWith('.json'))
        .map(f => {
            return readJSON(path.join(PATHS.invitations, f), {});
        })
        .filter(d => d.userId === req.user.id) // Lọc theo userId
        .map(d => ({
            slug:       d.slug,
            groomName:  d.groom?.name || d.groom?.shortName || '',
            brideName:  d.bride?.name || d.bride?.shortName || '',
            template:   d.template || 'boho-floral-green',
            weddingDate:d.weddingDate || '',
            weddingDateText: d.weddingDateText || '',
            views:      d.stats?.views || 0,
            updatedAt:  d.updatedAt || d.createdAt || '',
            createdAt:  d.createdAt || ''
        }))
        .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
    res.json(list);
});

// ==========================================
// API — RSVP
// ==========================================
app.post('/api/rsvp/:slug', (req, res) => {
    const slug   = req.params.slug;
    const file   = path.join(PATHS.guests, `${slug}.json`);
    const { name, phone, attendance, message, voiceMessage } = req.body;
    console.log('--- RSVP Received ---');
    console.log('Name:', name);
    console.log('Voice Message exists?', !!voiceMessage);
    if (voiceMessage) console.log('Voice Message length:', voiceMessage.length);

    if (!name) return res.status(400).json({ error: 'Vui lòng nhập tên!' });
    const guests = readJSON(file, []);
    guests.push({
        id: Date.now(), name, phone: phone || '',
        attendance: attendance || 'yes', message: message || '',
        voiceMessage: voiceMessage || null,
        createdAt: new Date().toISOString()
    });
    try {
        writeJSON(file, guests);
        updateStats('totalRsvp');
        res.json({ success: true, total: guests.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/rsvp/:slug', (req, res) => {
    const file = path.join(PATHS.guests, `${req.params.slug}.json`);
    res.json(readJSON(file, []));
});

// Export RSVP dạng CSV
app.get('/api/rsvp/:slug/export', (req, res) => {
    const slug  = req.params.slug;
    const file  = path.join(PATHS.guests, `${slug}.json`);
    const list  = readJSON(file, []);
    const header = 'STT,Tên,Điện Thoại,Tham Dự,Lời Chúc,Thời Gian';
    const rows   = list.map((g, i) =>
        `${i+1},"${g.name}","${g.phone||''}","${g.attendance==='yes'?'Có':'Không'}","${(g.message||'').replace(/"/g,"'")}","${new Date(g.createdAt).toLocaleString('vi-VN')}"`
    );
    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="rsvp-${slug}.csv"`);
    res.send('\uFEFF' + csv); // BOM for Excel
});

// DELETE one RSVP
app.delete('/api/rsvp/:slug/:id', (req, res) => {
    const file  = path.join(PATHS.guests, `${req.params.slug}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Không tìm thấy' });
    const list  = readJSON(file, []).filter(g => g.id !== Number(req.params.id));
    writeJSON(file, list);
    res.json({ success: true });
});

// ==========================================
// API — GUESTBOOK
// ==========================================
app.post('/api/guestbook/:slug', (req, res) => {
    const file   = path.join(PATHS.guests, `guestbook_${req.params.slug}.json`);
    const { name, message, emoji } = req.body;
    if (!name || !message) return res.status(400).json({ error: 'Thiếu tên hoặc lời chúc!' });
    const entries = readJSON(file, []);
    const entry   = {
        id: Date.now(), name: name.trim(), message: message.trim(),
        emoji: emoji || '💕', approved: true, createdAt: new Date().toISOString()
    };
    entries.unshift(entry);
    try { writeJSON(file, entries); res.json({ success: true, entry }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/guestbook/:slug', (req, res) => {
    const file = path.join(PATHS.guests, `guestbook_${req.params.slug}.json`);
    res.json((readJSON(file, [])).filter(e => e.approved));
});

app.delete('/api/guestbook/:slug/:id', (req, res) => {
    const file = path.join(PATHS.guests, `guestbook_${req.params.slug}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Không tìm thấy' });
    writeJSON(file, readJSON(file, []).filter(e => e.id !== Number(req.params.id)));
    res.json({ success: true });
});

// ==========================================
// API — UPLOAD
// ==========================================
app.post('/api/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Không có file!' });
    try { await optimizeUploadedImage(req.file); }
    catch (e) { console.warn('[optimizeUploadedImage]', req.file.filename, e.message); }
    res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

app.post('/api/upload-multiple', upload.array('images', 20), async (req, res) => {
    if (!req.files?.length) return res.status(400).json({ error: 'Không có file!' });
    await Promise.all(req.files.map(async file => {
        try { await optimizeUploadedImage(file); }
        catch (e) { console.warn('[optimizeUploadedImage]', file.filename, e.message); }
    }));
    res.json({ success: true, urls: req.files.map(f => `/uploads/${f.filename}`) });
});

// ==========================================
// API — QR CODE (auto-generate)
// ==========================================
app.get('/api/qr', async (req, res) => {
    const data = req.query.data || req.query.url || '';
    if (!data) return res.status(400).json({ error: 'Thiếu data!' });
    try {
        const qrDataUrl = await QRCode.toDataURL(data, {
            width: 300, margin: 2,
            color: { dark: '#1a1a1a', light: '#ffffff' }
        });
        res.json({ success: true, qr: qrDataUrl });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// QR code dạng PNG image
app.get('/api/qr/image', async (req, res) => {
    const data = req.query.data || '';
    if (!data) return res.status(400).send('Missing data');
    try {
        const buffer = await QRCode.toBuffer(data, { width: 300, margin: 2 });
        res.setHeader('Content-Type', 'image/png');
        res.send(buffer);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// ==========================================
// API — STATS
// ==========================================
app.get('/api/stats/:slug', (req, res) => {
    const slug   = req.params.slug;
    const cfg    = readJSON(path.join(PATHS.invitations, `${slug}.json`), {});
    const guests = readJSON(path.join(PATHS.guests, `${slug}.json`), []);
    const gb     = readJSON(path.join(PATHS.guests, `guestbook_${slug}.json`), []);
    const pending = getPendingViews(slug);
    res.json({
        views:         (cfg.stats?.views || 0) + pending.count,
        totalRsvp:     guests.length,
        attendingYes:  guests.filter(g => g.attendance === 'yes').length,
        attendingNo:   guests.filter(g => g.attendance === 'no').length,
        guestbookCount:gb.filter(g => g.approved).length,
        lastViewed:    pending.lastViewed || cfg.stats?.lastViewed || null,
        template:      cfg.template || 'boho-floral-green',
    });
});

app.get('/api/platform-stats', (req, res) => {
    const stats = readJSON(STATS_FILE, {});
    // Count actual invitations
    const invitations = fs.existsSync(PATHS.invitations)
        ? fs.readdirSync(PATHS.invitations).filter(f => f.endsWith('.json')).length
        : 0;
    res.json({ ...stats, totalViews: (stats.totalViews || 0) + pendingTotalViews, totalInvitations: invitations });
});

// ==========================================
// API — TEMPLATES LIST
// ==========================================
app.get('/api/templates', (req, res) => {
    res.json([
        { id:'song-long-do',     name:'Song Long Đỏ (Truyền Thống)', style:'Đỏ vàng kim, truyền thống', tier:'pro', color:'#8b0000',
            thumb:'https://images.unsplash.com/photo-1543880492-3c8cfaec859e?q=80&w=400' },
        { id:'boho-floral-green', name:'Boho Floral Green', style:'Tự nhiên, vintage',    tier:'free', color:'#5d7b6f',
            thumb:'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400' },
        { id:'luxury-gold',      name:'Luxury Gold',        style:'Sang trọng, đẳng cấp', tier:'free', color:'#d4af37',
            thumb:'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400' },
        { id:'minimalist-white', name:'Minimalist White',   style:'Tối giản, tinh tế',    tier:'free', color:'#2d6a4f',
            thumb:'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=400' },
        { id:'romantic-pink',    name:'Romantic Blossom',   style:'Lãng mạn, ngọt ngào',  tier:'free', color:'#d63384',
            thumb:'https://images.unsplash.com/photo-1606402179428-a57976d71fa4?q=80&w=400' },
    ]);
});

// ==========================================
// 404
// ==========================================
app.use((req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Endpoint không tồn tại' });
    res.status(404).sendFile(path.join(PATHS.public, 'landing.html'));
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
    console.log('\n🌸 ================================================');
    console.log('   ThiepCuoiViet Platform v3.0 — Full End-to-End');
    console.log('================================================');
    console.log(`🏠  Trang Chủ:     http://localhost:${PORT}/`);
    console.log(`✨  Tạo Thiệp:     http://localhost:${PORT}/tao-thiep`);
    console.log(`🎨  Mẫu Thiệp:    http://localhost:${PORT}/thiep/demo`);
    console.log(`⚙️   Admin CMS:    http://localhost:${PORT}/admin`);
    console.log(`📋  Preview:       http://localhost:${PORT}/preview/boho-floral-green`);
    console.log('================================================');
    console.log(`📁  Public:  ${PATHS.public}`);
    console.log(`🗄️   Data:    ${PATHS.data}`);
    console.log('================================================\n');
});
