const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 5,
        maxLength: 100,
        trim: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        minLength: 5,
        maxLength: 255,
        trim: true,
        required: true
    },
     password: {
         type: String,
         minLength: 8,
         maxLength: 1024,
         required: true
     },
    isAdmin: Boolean
});

const User = mongoose.model('User', userSchema);

User.prototype.generateAuthToken = function () {
    return jwt.sign({_id: this._id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
};

function validateUser (user) {
    const schema = {
        name: Joi.string().min(5).max(100).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(255).required(),
    };
    return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;