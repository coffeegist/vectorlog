var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var serialLogger = Promise.promisifyAll(require('./serialLogger'));
var port = process.argv[2];

function ensureLoggingDirectory(dir) {
    return fs.mkdirAsync(dir).catch(
        function(err) {
            if( err.code != 'EEXIST' ) { // If the error is anything other than 'entry exists'
                throw err;
            }
        }
    );
}

Promise.try(function(){ // If no port specified, show usage and available ports.
    if( !port ) {
        console.log('Usage: node app.js <serial-port>')
        console.log('Please provide a serial port from the list below.');

        return serialLogger.printSerialPorts().then(function() {
            process.exit();
        });
    }
}).then(function() {
    return ensureLoggingDirectory('./logs');
}).then(function() {
    var logFile = './logs/' + Date.now().toString() + ".log";

    serialLogger.openAsync(port, logFile).catch(
        function(e) {
            if(e.type == 'InvalidPort') {
                console.error(e.message);
                serialLogger.printSerialPorts();
            } else {
                console.error("SerialLogger.openAsync: ", e);
            }
        }
    );
}).catch(function(e) {
    console.error("Final: ", e);
});