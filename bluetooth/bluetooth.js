var _ = require('underscore'),
	Q = require('q')
	bt = require('./bluetoothManager');

(function () {
	var peripheral = function (req, res) {
		var result = _.map(bt.peripherals, function(peripheral, index, list){
									return {"uuid":peripheral.uuid,"manufacturer":peripheral.advertisement.manufacturerData.toString("utf8"),"name":peripheral.advertisement.localName,"state":peripheral.state};
								});
		res.status(200).json(result);		
	}	

	var peripheralInfo = function (req, res) {
		var peripheral = bt.peripherals[req.params.uuid];
		var result = {"uuid":peripheral.uuid,					  
					  "address":peripheral.address,
					  "addressType":peripheral.addressType,
					  "connectable":peripheral.connectable,
					  "manufacturer":peripheral.advertisement.manufacturerData.toString("utf8"),
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
			var service = services[req.params.suuid];
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

	var characteristic = function (req, res) {
		var result = bt.connect(req.params.uuid)
		.then(bt.service)
		.then(function(services) {
			return services[req.params.suuid];		    
		}).then(bt.characteristic)
		.then(function(characteristics) {
		    return _.map(characteristics, function(characteristic, index, list){
									return {"uuid":characteristic.uuid,
								    		"name":characteristic.name,
								    		"type":characteristic.type,
								    		"properties":characteristic.properties,
								    		"descriptors":characteristic.descriptors};
								});
		}).then(function(result) {
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		}).finally(function(res){
		  	bt.disconnect(req.params.uuid)
		})	
	}

	var characteristicInfo = function (req, res) {
		var result = bt.connect(req.params.uuid)
		.then(bt.service)
		.then(function(services) {
			return services[req.params.suuid];		    
		}).then(bt.characteristic)
		.then(function(characteristics) {
			return characteristics[req.params.cuuid];		    
		})
		.then(function(characteristics) {
		   return {"uuid":characteristic.uuid,
		    		"name":characteristic.name,
		    		"type":characteristic.type,
		    		"properties":characteristic.properties,
		    		"descriptors":characteristic.descriptors};
		}).then(function(result) {
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		}).finally(function(res){
		  	bt.disconnect(req.params.uuid)
		})	
	}

	var characteristicRead = function (req, res) {
		var result = bt.connect(req.params.uuid)
		.then(bt.service)
		.then(function(services) {
			return services[req.params.suuid];		    
		}).then(bt.characteristic)
		.then(function(characteristics) {
			return characteristics[req.params.cuuid];		    
		})
		.then(bt.characteristicRead)
		.then(function(result) {
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		}).finally(function(res){
		  	bt.disconnect(req.params.uuid)
		})	
	}

	var characteristicWrite = function (req, res) {
		var result = bt.connect(req.params.uuid)
		.then(bt.service)
		.then(function(services) {
			return services[req.params.suuid];		    
		}).then(bt.characteristic)
		.then(function(characteristics) {
			var characteristic = characteristics[req.params.cuuid];
			return bt.characteristicWrite(characteristic, req.body.value);		    
		})
		.then(function(result) {
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		}).finally(function(res){
		  	bt.disconnect(req.params.uuid)
		})	
	}

	var characteristicWriteWithoutResponse = function (req, res) {
		var result = bt.connect(req.params.uuid)
		.then(bt.service)
		.then(function(services) {
			return services[req.params.suuid];		    
		}).then(bt.characteristic)
		.then(function(characteristics) {
			var characteristic = characteristics[req.params.cuuid];
			return bt.characteristicWriteWithoutResponse(characteristic, req.body.value);		    
		})
		.then(function(result) {
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		}).finally(function(res){
		  	bt.disconnect(req.params.uuid)
		})	
	}

	var handleRead = function (req, res) {
		var result = bt.connect(req.params.uuid)
		.then(function(peripheral) {
			return bt.handleRead(peripheral, req.params.handle);		    
		}).then(function(result) {
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		}).finally(function(res){
		  	bt.disconnect(req.params.uuid)
		})	
	}

	var handleWrite = function (req, res) {
		var result = bt.connect(req.params.uuid)
		.then(function(peripheral) {
			return bt.handleWrite(peripheral, req.params.handle, req.body.value);		    
		}).then(function(result) {
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		}).finally(function(res){
		  	bt.disconnect(req.params.uuid)
		})	
	}

	var handleWriteWithoutResponse = function (req, res) {
		var result = bt.connect(req.params.uuid)
		.then(function(peripheral) {
			return bt.handleWriteWithoutResponse(peripheral, req.params.handle, req.body.value);		    
		}).then(function(result) {
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		}).finally(function(res){
		  	bt.disconnect(req.params.uuid)
		})	
	}

	module.exports = {
		peripheral: peripheral,
		peripheralInfo: peripheralInfo,
		service: service,
		serviceInfo:serviceInfo,
		characteristic:characteristic,
		characteristicInfo:characteristicInfo,
		characteristicRead:characteristicRead,
		characteristicWrite:characteristicWrite,
		characteristicWriteWithoutResponse:characteristicWriteWithoutResponse,
		handleRead:handleRead,
		handleWrite:handleWrite,
		handleWriteWithoutResponse:handleWriteWithoutResponse
	};
}());
