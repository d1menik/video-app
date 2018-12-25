const {Customer, validateCustomer} = require('../models/customer');
const validate = require('./../middleware/validate');
const auth = require('./../middleware/auth');
const {isAdmin} = require('./../middleware/admin');
const express = require('express');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    const customers = await Customer.find().sort('name');

    res.send(customers);
});

router.get('/:id', [auth, validate(validateCustomer)], async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if(!customer) return res.status(404).send('Customer with given id was not found.');

    res.send(customer);
});

router.post('/', [auth, validate(validateCustomer)], async (req, res) => {
    const customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    });

    await customer.save();
    res.send(customer);
});

router.put('/:id', [auth, isAdmin, validate(validateCustomer)], async (req, res) => {
    const customer = await Customer.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    }, {new: true});

    if(!customer) return res.status(404).send('Customer with given id was not found.');

    res.send(customer);
});

router.delete('/:id', [auth, isAdmin], async (req, res) => {
   const customer = await Customer.findByIdAndRemove(req.params.id);
   if(!customer) return res.status(404).send('Customer with given id was not found.');

   res.send(customer);
});

module.exports = router;