const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.use(express.urlencoded({ extended: true }));

let sessionConfig = {
    secret: process.env.SESSION_SECRET || 'le-chateau-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
};

try {
    const session = require('express-session');
    app.use(session(sessionConfig));
} catch (e) {
    console.log('Session module not available');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const types = /jpeg|jpg|png|webp/;
        const extname = types.test(path.extname(file.originalname).toLowerCase());
        const mimetype = types.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USER || 'admin',
    password: process.env.ADMIN_PASS || 'LeChateau2026'
};

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    res.redirect('/login');
};

let reservas = [
    { id: 1, nombre: 'Carlos García', telefono: '555-1234', fecha: '2026-05-20', hora: '19:00', personas: 4, estado: 'confirmada' },
    { id: 2, nombre: 'María López', telefono: '555-5678', fecha: '2026-05-21', hora: '20:30', personas: 2, estado: 'pendiente' },
];

let menuItems = [
    { id: 1, categoria: 'entradas', nombre: 'Foie Gras Terrine', descripcion: 'Con chutney de higos y brioche tostado', precio: 32, imagen: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=300&q=80' },
    { id: 2, categoria: 'entradas', nombre: 'Tartar de Atún', descripcion: 'Con aguacate, sésamo y reducción de soja', precio: 28, imagen: 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=300&q=80' },
    { id: 3, categoria: 'entradas', nombre: 'Sopa de Mariscos', descripcion: 'Bouillabaisse tradicional con rouille', precio: 26, imagen: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80' },
    { id: 4, categoria: 'principales', nombre: 'Wagyu Ribeye 300g', descripcion: 'A5 japonés con salsa de trufa y papas trufadas', precio: 120, imagen: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=300&q=80' },
    { id: 5, categoria: 'principales', nombre: 'Lubina Salvaje', descripcion: 'Con costra de hierbas y risotto de limón', precio: 58, imagen: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&q=80' },
    { id: 6, categoria: 'principales', nombre: 'Pato Lacado', descripcion: 'Pechuga crujiente con naranja y arroz jazmín', precio: 52, imagen: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=300&q=80' },
    { id: 7, categoria: 'postres', nombre: 'Tarta Tatin', descripcion: 'Con helado de vainilla de Madagascar', precio: 18, imagen: 'https://images.unsplash.com/photo-1562007908-16a5a0a56db4?w=300&q=80' },
    { id: 8, categoria: 'postres', nombre: 'Soufflé de Chocolate', descripcion: 'Con corazón fundido y crema inglesa', precio: 16, imagen: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&q=80' },
];

let cupones = [
    { id: 1, codigo: 'BIENVENIDA', descuento: 10, tipo: 'porcentaje', descripcion: '10% de descuento - Nuevo cliente', activo: true },
    { id: 2, codigo: 'VIP20', descuento: 20, tipo: 'porcentaje', descripcion: '20% de descuento - Miembro VIP', activo: true },
    { id: 3, codigo: 'ESPECIAL50', descuento: 50, tipo: 'euros', descripcion: '€50 de descuento - Oferta especial', activo: true },
];

let diasEspeciales = [
    { id: 1, fecha: '2026-12-24', tipo: 'evento', titulo: 'Noche de Navidad', descripcion: 'Cena especial de Navidad - Solo con reserva', cerrado: true },
    { id: 2, fecha: '2026-12-25', tipo: 'cerrado', titulo: 'Día de Navidad', descripcion: 'Restaurante cerrado', cerrado: true },
    { id: 3, fecha: '2026-12-31', tipo: 'evento', titulo: 'Noche Vieja', descripcion: 'Cena de Fin de Año - Solo con reserva', cerrado: true },
    { id: 4, fecha: '2026-01-01', tipo: 'cerrado', titulo: 'Año Nuevo', descripcion: 'Restaurante cerrado', cerrado: true },
];

app.get('/', (req, res) => {
    res.render('index', { pagina: 'inicio' });
});

app.get('/menu', (req, res) => {
    res.render('menu', { pagina: 'menu', menuItems });
});

app.get('/reservas', (req, res) => {
    res.render('reservas', { pagina: 'reservas' });
});

app.get('/galeria', (req, res) => {
    res.render('galeria', { pagina: 'galeria' });
});

app.get('/contacto', (req, res) => {
    res.render('contacto', { pagina: 'contacto' });
});

app.get('/login', (req, res) => {
    if (req.session && req.session.isAdmin) {
        return res.redirect('/admin');
    }
    res.render('login', { pagina: 'login' });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        req.session.isAdmin = true;
        res.json({ success: true, redirect: '/admin' });
    } else {
        res.json({ success: false });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/admin', isAuthenticated, (req, res) => {
    res.render('admin', { pagina: 'admin', reservas });
});

app.get('/admin/menu', isAuthenticated, (req, res) => {
    res.render('admin-menu', { pagina: 'admin', menuItems, cupones });
});

app.get('/admin/calendario', isAuthenticated, (req, res) => {
    res.render('admin-calendario', { pagina: 'admin', diasEspeciales, reservas });
});

app.post('/api/reservas', (req, res) => {
    const { nombre, telefono, fecha, hora, personas } = req.body;
    const diaCerrado = diasEspeciales.find(d => d.fecha === fecha && d.cerrado);
    if (diaCerrado) {
        return res.json({ success: false, error: `Lo sentimos, no hay servicio el ${diaCerrado.titulo}` });
    }
    const nuevaReserva = {
        id: reservas.length + 1,
        nombre,
        telefono,
        fecha,
        hora,
        personas: parseInt(personas),
        estado: 'pendiente'
    };
    reservas.push(nuevaReserva);
    res.json({ success: true, reserva: nuevaReserva });
});

app.put('/api/reservas/:id', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const reserva = reservas.find(r => r.id === parseInt(id));
    if (reserva) {
        reserva.estado = estado;
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.delete('/api/reservas/:id', (req, res) => {
    const { id } = req.params;
    reservas = reservas.filter(r => r.id !== parseInt(id));
    res.json({ success: true });
});

app.get('/api/reservas', (req, res) => {
    res.json(reservas);
});

app.get('/api/menu', (req, res) => {
    res.json(menuItems);
});

app.post('/api/menu', upload.single('imagen'), (req, res) => {
    const { nombre, descripcion, precio, categoria } = req.body;
    const imagen = req.file ? '/uploads/' + req.file.filename : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80';
    const nuevoItem = {
        id: menuItems.length + 1,
        categoria: categoria || 'entradas',
        nombre,
        descripcion,
        precio: parseFloat(precio),
        imagen
    };
    menuItems.push(nuevoItem);
    res.json({ success: true, item: nuevoItem });
});

app.put('/api/menu/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria, imagenUrl } = req.body;
    const item = menuItems.find(m => m.id === parseInt(id));
    if (item) {
        if (nombre) item.nombre = nombre;
        if (descripcion) item.descripcion = descripcion;
        if (precio) item.precio = parseFloat(precio);
        if (categoria) item.categoria = categoria;
        if (req.file) {
            item.imagen = '/uploads/' + req.file.filename;
        } else if (imagenUrl) {
            item.imagen = imagenUrl;
        }
        res.json({ success: true, item });
    } else {
        res.json({ success: false });
    }
});

app.delete('/api/menu/:id', (req, res) => {
    const { id } = req.params;
    menuItems = menuItems.filter(m => m.id !== parseInt(id));
    res.json({ success: true });
});

app.get('/api/cupones', (req, res) => {
    res.json(cupones);
});

app.post('/api/cupones', (req, res) => {
    const { codigo, descuento, tipo, descripcion } = req.body;
    const nuevoCupon = {
        id: cupones.length + 1,
        codigo: codigo.toUpperCase(),
        descuento: parseFloat(descuento),
        tipo: tipo || 'porcentaje',
        descripcion: descripcion || '',
        activo: true
    };
    cupones.push(nuevoCupon);
    res.json({ success: true, cupon: nuevoCupon });
});

app.put('/api/cupones/:id', (req, res) => {
    const { id } = req.params;
    const { codigo, descuento, tipo, descripcion, activo } = req.body;
    const cupon = cupones.find(c => c.id === parseInt(id));
    if (cupon) {
        if (codigo) cupon.codigo = codigo.toUpperCase();
        if (descuento !== undefined) cupon.descuento = parseFloat(descuento);
        if (tipo) cupon.tipo = tipo;
        if (descripcion !== undefined) cupon.descripcion = descripcion;
        if (activo !== undefined) cupon.activo = activo;
        res.json({ success: true, cupon });
    } else {
        res.json({ success: false });
    }
});

app.delete('/api/cupones/:id', (req, res) => {
    const { id } = req.params;
    cupones = cupones.filter(c => c.id !== parseInt(id));
    res.json({ success: true });
});

app.post('/api/cupones/validar', (req, res) => {
    const { codigo } = req.body;
    const cupon = cupones.find(c => c.codigo === codigo.toUpperCase() && c.activo);
    if (cupon) {
        res.json({ valid: true, cupon });
    } else {
        res.json({ valid: false });
    }
});

app.get('/api/dias-especiales', (req, res) => {
    res.json(diasEspeciales);
});

app.post('/api/dias-especiales', (req, res) => {
    const { fecha, tipo, titulo, descripcion, cerrado } = req.body;
    const existe = diasEspeciales.find(d => d.fecha === fecha);
    if (existe) {
        return res.json({ success: false, error: 'Ya existe un registro para esta fecha' });
    }
    const nuevoDia = {
        id: diasEspeciales.length + 1,
        fecha,
        tipo: tipo || 'evento',
        titulo: titulo || '',
        descripcion: descripcion || '',
        cerrado: cerrado || false
    };
    diasEspeciales.push(nuevoDia);
    res.json({ success: true, dia: nuevoDia });
});

app.put('/api/dias-especiales/:id', (req, res) => {
    const { id } = req.params;
    const { fecha, tipo, titulo, descripcion, cerrado } = req.body;
    const dia = diasEspeciales.find(d => d.id === parseInt(id));
    if (dia) {
        if (fecha) dia.fecha = fecha;
        if (tipo) dia.tipo = tipo;
        if (titulo !== undefined) dia.titulo = titulo;
        if (descripcion !== undefined) dia.descripcion = descripcion;
        if (cerrado !== undefined) dia.cerrado = cerrado;
        res.json({ success: true, dia });
    } else {
        res.json({ success: false });
    }
});

app.delete('/api/dias-especiales/:id', (req, res) => {
    const { id } = req.params;
    diasEspeciales = diasEspeciales.filter(d => d.id !== parseInt(id));
    res.json({ success: true });
});

module.exports = app;