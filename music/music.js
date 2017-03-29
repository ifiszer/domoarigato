var neo4j = require('../neo4j/Neo4JManager'),
 		id3 = require('music-tag'),
 		_ = require('underscore'),
		Q = require('q'),
		Query = require('./musicQueries');

(function () {
	var indexPath = function (req, res) {
		id3.read(req.body.path).then(function(files){
			var transactions = _.map(files, function(file, index, list){
									return {"query":Query.indexPathQuery,"params":file};
								});
			return neo4j.executeTransactions(transactions);
		}).then(function(result) {		
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		})
	}	

	var getAllArtists = function (req, res) {
		neo4j.query(Query.getAllArtistsQuery)
		.then(function(result) {		
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		})
	}

	var getFilteredArtists = function (req, res) {
		neo4j.query(Query.getFilteredArtistsQuery,
			   {artistFilter:req.params.artistFilter})
		.then(function(result) {		
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		})
	}

	var getAlbumsByArtist = function (req, res) {
		neo4j.query(Query.getAlbumsByArtistQuery,
			   {artistName:req.params.artistName})
		.then(function(result) {		
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		})
	}

	var getSongsByAlbum = function (req, res) {		
		neo4j.query(Query.getSongsByAlbumQuery, 
			   {artistName:req.params.artistName, albumName:req.params.albumName})
		.then(function(result) {		
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		})
	}	

	module.exports = {
		indexPath: indexPath,
		getAllArtists: getAllArtists,
		getFilteredArtists:getFilteredArtists,
		getAlbumsByArtist: getAlbumsByArtist,
		getSongsByAlbum: getSongsByAlbum
	};
}());