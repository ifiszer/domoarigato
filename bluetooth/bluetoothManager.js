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
    deferred.resolve(services);
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
  connect:connect,
  disconnect:disconnect
};