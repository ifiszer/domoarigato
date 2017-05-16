(function () {	
	var registerPeripheralQuery = `CREATE (peripheral:Peripheral{uuid:$data.uuid})`;
	
	var getAllPeripheralQuery = `MATCH (peripheral:Peripheral) 
			   				  RETURN peripheral AS item`;

	module.exports = {
		registerPeripheralQuery:registerPeripheralQuery,
		getAllPeripheralsQuery:getAllPeripheralsQuery
	};
}());