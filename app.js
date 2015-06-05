var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var serialLogger = require('./serial-logger');
var port = process.argv[2];

function showUsage() {
    return Promise.try(function() {
        console.log('Usage: node app.js <serial-port>')
        console.log('Please provide a serial port from the list below.');
        return serialLogger.printSerialPorts();
    }).finally(function() {
        process.exit();
    });
}

function ensureLoggingDirectory(dir) {
    return fs.mkdirAsync(dir).catch(
        function(err) {
            if( err.code != 'EEXIST' ) { // If the error is anything other than 'entry exists'
                throw err;
            }
        }
    );
}

Promise.try(function() {
    if( !port ) {
        return showUsage();
    }
}).then(function() {
    return ensureLoggingDirectory('./logs');
}).then(function() {
    var logFile = './logs/' + Date.now().toString() + ".log";
    return serialLogger.open(port, logFile);
}).catch(function(e) {
    console.error("Final: ", e);
});