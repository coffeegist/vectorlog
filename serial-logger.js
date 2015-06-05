var Promise = require("bluebird");
var SerialPort = Promise.promisifyAll(require("serialport"));
var fs = Promise.promisifyAll(require("fs"));

var vectorStream = null;
var serialPort = null;

function _isValidPort(port) {
    return Promise.try(function() {
        return _getSerialPortNames();
    }).then(function(serialPortNames) {
        if( serialPortNames.indexOf(port) == -1 ) {
            return false;
        } else {
            return true;
        }
    });
}

function _getSerialPortNames() {
    return _getAvailableSerialPorts().then(function(serialPorts) {
        var portNames = [];
        serialPorts.forEach(function(port) {
            portNames.push(port.comName);
        });

        return portNames;
    });
}

function _getAvailableSerialPorts() {
    return SerialPort.listAsync().then(function(serialPorts) {
        return serialPorts;
    });
}

module.exports = {
    open: function(port, logFile, errorCallback) {
        return Promise.try(function() {
            _isValidPort(port).then(function (result) {
                if (!result) errorCallback({type: 'InvalidPort', message: 'Port \'' + port + '\' does not exist.'});

                serialPort = new SerialPort.SerialPort(port,
                    {baudrate: 921600},
                    false
                );

                vectorStream = fs.createWriteStream(logFile);
                vectorStream.on("error", function (err) {
                    errorCallback(err);
                });

                serialPort.openAsync().then(function () {
                    serialPort.on("data", function (data) {
                        vectorStream.write(data);
                    });

                    serialPort.on("close", function () {
                        if (vectorStream != null) {
                            vectorStream.close();
                        }
                    });

                    serialPort.on("error", function (e) {
                        console.error("SerialPort.onError: ", e);
                    });
                }).catch(function (err) {
                    errorCallback(err);
                });
            }).catch(function (e) {
                throw e
            });
        }).nodeify();
    },

    close: function() {
        if( serialPort != null ) {
            serialPort.closeAsync().then(function() {
                if( vectorStream != null ) {
                    vectorStream.close();
                }
            });
        }
    },

    printSerialPorts: function() {
        return _getAvailableSerialPorts().then(function(serialPorts) {
            serialPorts.forEach(function(port) {
                console.log(port.comName);
            });
        });
    }
};