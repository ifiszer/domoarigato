var _ = require('underscore'),
	Q = require('q')
	bt = require('./bluetoothManager');

(function () {
	var scan = function (req, res) {
		var result = _.map(bt.peripherals, function(peripheral, index, list){
									return {"uuid":peripheral.uuid,"name":peripheral.advertisement.localName,"state":peripheral.state};
								});
		res.status(200).json(result);		
	}	

	var peripheralInfo = function (req, res) {
		var peripheral = bt.peripherals[req.params.uuid];
		var result = {"uuid":peripheral.uuid,					  
					  "address":peripheral.address,
					  "addressType":peripheral.addressType,
					  "connectable":peripheral.connectable,
					  "name":peripheral.advertisement.localName,
					  "state":peripheral.state}
		res.status(200).json(result);		
	}

	var service = function (req, res) {
		var result = bt.connect(req.params.uuid)
		.then(bt.service)
		.then(function(services) {
		    return _.map(services, function(service, index, list){
									return {"uuid":service.uuid, "name":service.name};
								});
		}).then(function(result) {
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		}).finally(function(res){
		  	bt.disconnect(req.params.uuid)
		})	
	}	

	var serviceInfo = function (req, res) {
		var result = bt.connect(req.params.uuid)
		.then(bt.service)
		.then(function(services) {
			var service = _.find(services, function(service){ 
									return service.uuid === req.params.suuid; 
								});
		    return {"uuid":service.uuid,
		    		"name":service.name,
		    		"type":service.type,
		    		"includedServiceUuids":service.includedServiceUuids};
		}).then(function(result) {
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		}).finally(function(res){
		  	bt.disconnect(req.params.uuid)
		})	
	}

	var connect = function (req, res) {
		bt.connect(req.params.uuid)
		.then(function(result) {
		    res.status(200).json("Connected to "+result.advertisement.localName);
		}).catch(function(err){
		  	res.status(500).send(err);
		})
	}	

	var disconnect = function (req, res) {
		bt.disconnect(req.params.uuid)
		.then(function(result) {
		    res.status(200).json("Disconnected from "+result.advertisement.localName);
		}).catch(function(err){
		  	res.status(500).send(err);
		})
	}	

	module.exports = {
		scan: scan,
		peripheralInfo: peripheralInfo,
		service: service,
		serviceInfo:serviceInfo,
		connect:connect,
		disconnect:disconnect
	};
}());
