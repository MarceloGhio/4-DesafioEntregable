const express = require('express');
const cartRouter = express.Router();

module.exports = (cartManager, io) => {
    // Endpoint para crear un nuevo carrito
    cartRouter.post('/', (req, res) => {
        try {
            const newCart = req.body;
            const cartId = cartManager.createCart(newCart);
            res.status(201).json({ id: cartId });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Endpoint para listar productos de un carrito por su ID
    cartRouter.get('/:cid', (req, res) => {
        const cartId = req.params.cid;
        try {
            const cart = cartManager.getCartById(cartId);
            res.json(cart);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    // Endpoint para agregar un producto a un carrito por su ID
    cartRouter.post('/:cid/product/:pid', (req, res) => {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1; // Default quantity to 1 if not provided
        try {
            cartManager.addProductToCart(cartId, productId, quantity);

            // Envía la lista actualizada de carritos a través de WebSocket
            io.emit('cartsUpdated', cartManager.carts);

            res.status(204).end();
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    return cartRouter;
};
