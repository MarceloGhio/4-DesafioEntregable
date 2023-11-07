const express = require('express');
const expressHandlebars = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');
const ProductManager = require('./ProductManager');
const CartManager = require('./CartManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 8899;

// Configurar Handlebars como motor de plantillas
app.engine('handlebars', expressHandlebars());
app.set('view engine', 'handlebars');
app.set('views', 'views'); // Directorio de las vistas

// Crear una instancia de ProductManager y CartManager
const productManager = new ProductManager('./products.json');
const cartManager = new CartManager('./cart.json');

// Configurar middleware para manejar JSON
app.use(express.json());

// Rutas de productos
const productRouter = require('./productRouter');
app.use('/api/products', productRouter(productManager, io)); // Pasa el objeto io

// Rutas de carritos
const cartRouter = require('./cartRouter');
app.use('/api/carts', cartRouter(cartManager, io)); // Pasa el objeto io

// Ruta de inicio
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la aplicación de gestión de productos y carritos!');
});

// Iniciar el servidor y WebSocket
server.listen(port, () => {
    console.log(`Servidor Express corriendo en el puerto ${port}`);
});

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Emitir la lista de productos actual al cliente cuando se conecta
    socket.emit('productsUpdated', productManager.getProducts());

    // Escuchar un evento para crear un nuevo producto desde el cliente
    socket.on('createProduct', (newProduct) => {
        try {
            productManager.addProduct(newProduct);

            // Emitir la lista actualizada de productos a todos los clientes
            io.emit('productsUpdated', productManager.getProducts());
        } catch (error) {
            // Manejar errores, si es necesario
        }
    });

    // Escuchar el evento de desconexión del cliente
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});
