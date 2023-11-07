const fs = require('fs');

class CartManager {
    constructor(filePath) {
        this.path = filePath;
        this.carts = [];
        this.cartIdCounter = 1;
        this.initializeCarts();
    }

    initializeCarts() {
        try {
            const data = fs.readFileSync(this.path, 'utf8');
            this.carts = JSON.parse(data);
            this.updateCartIdCounter();
        } catch (err) {
            this.carts = [];
        }
    }

    updateCartIdCounter() {
        if (this.carts.length > 0) {
            const maxId = Math.max(...this.carts.map((cart) => cart.id));
            this.cartIdCounter = maxId + 1;
        }
    }

    saveCarts() {
        fs.writeFileSync(this.path, JSON.stringify(this.carts, null, 2), 'utf8');
    }

    createCart(cart) {
        const cartId = this.generateUniqueId();
        cart.id = cartId;
        cart.products = [];
        this.carts.push(cart);
        this.saveCarts();
        return cartId;
    }

    getCartById(cartId) {
        const cart = this.carts.find((existingCart) => existingCart.id === cartId);
        if (!cart) {
            throw new Error("Carrito no encontrado.");
        }
        return cart;
    }

    addProductToCart(cartId, productId, quantity) {
        const cart = this.getCartById(cartId);
        const productIndex = cart.products.findIndex((product) => product.id === productId);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ id: productId, quantity });
        }

        this.saveCarts();
    }

    generateUniqueId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}

module.exports = CartManager;
