var 	_ = require('underscore'),
		Q = require('q'),
		noble = require('noble');

var peripherals = {};

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  peripherals[peripheral.uuid]=peripheral;
});

var service = function(peripheral){
  var deferred = Q.defer();  
  peripheral.discoverServices(null, function(error, services) {
    if(error){
      deferred.reject(error);
    }
    var result = {}
    _.each(services, function(service){
                          result[service.uuid]=service;
                      });
    deferred.resolve(result);
  })    
  return deferred.promise;
}

var characteristic = function(service){
  var deferred = Q.defer();  
  service.discoverCharacteristics(null, function(error, characteristics) {
    if(error){
      deferred.reject(error);
    }
    var result = {}
    _.each(characteristics, function(characteristic){
                          result[characteristic.uuid]=characteristic;
                      });
    deferred.resolve(result);
  })    
  return deferred.promise;
}

var characteristicRead = function(characteristic){
  var deferred = Q.defer();  
  if(response && characteristic.properties.indexOf("read")===-1){
    deferred.reject("read not available")
  }
  characteristic.read(function(error, data) {
    if(error){
      deferred.reject(error);
    }    
    deferred.resolve(data.toString('utf8'));
  })    
  return deferred.promise;
}

var characteristicWrite = function(characteristic, value){
  return characteristicWrite (characteristic, value, false);
}

var characteristicWriteWithoutResponse = function(characteristic, value, response){
  return characteristicWrite (characteristic, value, true);
}

var characteristicWrite = function(characteristic, value, response){
  var deferred = Q.defer();

  if(response && characteristic.properties.indexOf("write")===-1){
    deferred.reject("write not available")
  }else if(!response && characteristic.properties.indexOf("writeWithoutResponse")===-1){
    deferred.reject("writeWithoutResponse not available")
  }

  characteristic.write(new Buffer(value), response, function(error) {
    if(error){
      deferred.reject(error);
    }    
    deferred.resolve();
  })    
  return deferred.promise;
}

var connect = function(uuid){
  var peripheral = peripherals[uuid];
  var deferred = Q.defer();
  peripheral.connect(function(){
    deferred.resolve(peripheral);
  });
  return deferred.promise;
}

var disconnect = function(uuid){
  var peripheral = peripherals[uuid];
  var deferred = Q.defer();
  peripheral.disconnect(function(){
    deferred.resolve(peripheral);
  });
  return deferred.promise;
}

var self = module.exports = {
  peripherals: peripherals,
  service: service,
  characteristic: characteristic,
  characteristicRead : characteristicRead,
  characteristicWrite : characteristicWrite,
  connect:connect,
  disconnect:disconnect
};