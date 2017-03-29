var neo4jDriver = require('neo4j-driver').v1,
	_ = require('underscore'),
	Q = require('q');

(function () {
	var neo4j = neo4jDriver.driver("bolt://localhost:7687", neo4jDriver.auth.basic("neo4j", "34602488"));

	var query = function(query){
		query(query, null);
	}

	var query = function(query, params){
		var session = neo4j.session();
		return Q.fcall(function(){
			var promise = session.run(query, params);
			return Q.when(promise);
		}).then(function(result) {
			return result.records.map((record)=>{return record.get("item").properties});		
		}).finally(function(res){
			session.close();
		});
	}

	var executeTransactions = function(transactions){
		var session = neo4j.session();
		var tx = session.beginTransaction();
		return Q.fcall(function(){
			var promises = _.map(transactions, function(transaction, index, list){
				return tx.run( transaction.query, transaction.params);
			});
			return Q.all(promises);
		}).then(function(res){
			tx.commit();
		}).catch(function(err) {
			tx.rollback();
			throw err;
		}).finally(function(res){
			session.close();
		})
	}	

	module.exports = {
		query: query,
		executeTransactions:executeTransactions
	};
}());