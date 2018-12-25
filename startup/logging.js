const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

module.exports = function () {
    process.on('uncaughtException', (e) => {
        winston.error(e.message, e);
        process.exit(1);
    });

// winston.handleExceptions(new winston.transports.File({filename: 'uncaughtExceptions.log'}));

    process.on('unhandledRejection', (e) => {
        winston.error(e.message, e);
        process.exit(1);
    });

    winston.add(new winston.transports.File({filename: "./../logfile.log"}));
    winston.add(new winston.transports.Console({
        colorize: true,
        prettyPrint: true
    }));
    winston.add(new winston.transports.MongoDB({
        db: 'mongodb://localhost:27017/vidly',
        level: 'error',
        options: {
            useNewUrlParser: true
        }
    }));
};
