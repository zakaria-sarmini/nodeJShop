var express = require('express');
var router = express.Router();
var Products = require('../models/products-schema');
var Cart = require('../models/cart');
var Orders = require('../models/orders');

router.get('/', function (req, res, next) {
    res.render('shop/index', {title: 'World of Games'})
});

router.get('/orders', function (req, res, next) {
    Orders.find(function (err, orders) {
        if (err) {
            console.log(err)
        }
        var orders = orders;
        res.render('shop/orders', {title: 'Orders', orders: orders})
    });
});

router.get('/gallery', function (req, res, next) {
    Products.find(function (err, data) {
        var result = [];
        var row = 3;
        for (var i = 0; i < data.length; i += row) {
            result.push(data.slice(i, i + row));
        }
        var success = req.flash('success')[0];
        res.render('shop/gallery', {title: 'Shopping Cart', products: result, success: success, noSuccess: !success});
    });
});

router.post('/add-a-game', function (req, res, next) {
    var newGame = new Products({
        title: req.body.Name,
        imagePath: req.body.imageUrl,
        description: req.body.description,
        price: req.body.price
    });

    newGame.save(function (err, game) {
        if (err) {
            console.log(err)
        }
        return game
    });

    res.redirect('/gallery');
});

router.get('/add-to-cart/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Products.findById(productId, function (err, product) {
        if (err) {
            res.redirect('/');
        }
        cart.add(product.id, product);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/gallery');
    });
});

router.get('/shopping-cart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
    })
});

router.get('/checkout', isLoggedIn, function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }
    var errors = req.flash('error')[0];
    var cart = new Cart(req.session.cart);
    res.render('shop/checkout', {title: 'checklist', total: cart.totalPrice, errors: errors, noErrors: !errors});
});

router.post('/checkout', isLoggedIn, function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    var stripe = require("stripe")(
        "YOUR-STRIPE-KEY"
    );
    stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "testing charges"
    }, function (err, charge) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('/checkout');
        }
        var order = new Orders({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
        order.save(function (err, result) {
            req.flash('success', 'your item will be delivered within 24 hours');
            req.session.cart = null;
            res.redirect('/gallery')
        });
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.session.oldUrl = req.url;
    res.redirect('/users/signin')
}

module.exports = router;
