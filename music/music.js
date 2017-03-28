var neo4j = require('../neo4j/Neo4JManager').driver,
 		id3 = require('music-tag'),
 		_ = require('underscore'),
		Q = require('q');

(function () {
	var indexPath = function (req, res) {
		processAndRespond(req, res, function(){
			return id3.read(req.body.path).then(function(files){
				var session = neo4j.session();
				var tx = session.beginTransaction();
				return Q.fcall(function(){
					var promises = _.map(files, function(file, index, list){
						return insertSong(file, tx);
					});
					return Q.all(promises);
				}).then(function(res){
					tx.commit();
					return "Succesfully Indexed";
				}).catch(function(err) {
					tx.rollback();
					throw err;
				}).finally(function(res){
					session.close();
				})
			});
		});
	}

	var insertSong = function(ReadResult, tx){
		return tx.run( `MERGE (artist:Artist{name:$data.band})
		  		 MERGE (album:Album {name: $data.album})<-[:Composed_by]-(artist)
		  		 CREATE (:Song {path:$path, title: $data.title, disc:$data.part_of_a_set, track: $data.track_number, genre: $data.genre})<-[:Contains]-(album)`
		  	   , ReadResult);	
	}

	var getAllArtists = function (req, res) {
		processAndRespond(req, res, function(){
			var session = neo4j.session();
			return Q.fcall(function(){
				var promise = session.run( `MATCH (artist:Artist) 
						  					RETURN artist AS artist`);
				return Q.when(promise);
			}).then(function(result) {
				return result.records.map((record)=>{return record.get("artist").properties});		
			}).finally(function(res){
				session.close();
			})
		});
	}

	var getFilteredArtists = function (req, res) {
		processAndRespond(req, res, function(){
			var session = neo4j.session();
			return Q.fcall(function(){
				var promise = session.run( `MATCH (artist:Artist) 
							  WHERE LOWER(artist.name) CONTAINS LOWER($artistFilter)
							  RETURN artist AS artist`, {artistFilter:req.params.artistFilter});
				return Q.when(promise);
			}).then(function(result) {
				return result.records.map((record)=>{return record.get("artist").properties});		
			}).finally(function(res){
				session.close();
			})
		});
	}

	var getAlbumsByArtist = function (req, res) {
		processAndRespond(req, res, function(){
			var session = neo4j.session();
			return Q.fcall(function(){
				var promise = session.run( `MATCH (artist:Artist{name:$artistName})
											MATCH (album:Album)<-[:Composed_by]-(artist) 
											RETURN album AS album`, {artistName:req.params.artistName});
				return Q.when(promise);
			}).then(function(result) {
				return result.records.map((record)=>{return record.get("album").properties});		
			}).finally(function(res){
				session.close();
			})
		});
	}

	var getSongsByAlbum = function (req, res) {
		processAndRespond(req, res, function(){
			var session = neo4j.session();
			return Q.fcall(function(){
				var promise = session.run( `MATCH (artist:Artist{name:$artistName})
											MATCH (album:Album{name:$albumName})<-[:Composed_by]-(artist) 
											MATCH (song:Song)<-[:Contains]-(album)
											RETURN song AS song ORDER BY song.disc ASC, song.track ASC`, 
											{artistName:req.params.artistName, albumName:req.params.albumName});
				return Q.when(promise);
			}).then(function(result) {
				return result.records.map((record)=>{return record.get("song").properties});		
			}).finally(function(res){
				session.close();
			})
		});		
	}

	var processAndRespond = function(req, res, f){
		Q.fcall(f)
		.then(function(result) {		
		    res.status(200).json(result);
		}).catch(function(err){
		  	res.status(500).send(err);
		});
	}

	module.exports = {
		indexPath: indexPath,
		getAllArtists: getAllArtists,
		getFilteredArtists:getFilteredArtists,
		getAlbumsByArtist: getAlbumsByArtist,
		getSongsByAlbum: getSongsByAlbum
	};
}());