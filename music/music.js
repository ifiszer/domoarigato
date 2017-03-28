var neo4j = require('../neo4j/Neo4JManager').driver,
 		id3 = require('music-tag'),
 		_ = require('underscore'),
		Q = require('q');

(function () {
	var indexPath = function (req, res) {
		var session;
		var tx;
		id3.read(req.body.path).then(function(files) {
			session = neo4j.session();	
			tx = session.beginTransaction();
			return files;
		}).then(function(files){
			return Q.fcall(function(){
				var promises = _.map(files, function(file, index, list){
					return insertSong(file, tx);
				});
				return Q.all(promises);
			})
		}).then(function(res){
			tx.commit();
		}).then(function(result) {
			res.status(200).send();			
		}).catch(function(err) {
			tx.rollback();
			res.status(500).send(""+err);
		}).finally(function(res){
			session.close();
		}).done();
	}

	var insertSong = function(ReadResult, tx){
		return tx.run( `MERGE (artist:Artist{name:$data.band})
		  		 MERGE (album:Album {name: $data.album})<-[:Composed_by]-(artist)
		  		 CREATE (:Song {path:$path, title: $data.title, disc:$data.part_of_a_set, track: $data.track_number, genre: $data.genre})<-[:Contains]-(album)`
		  	   , ReadResult);	
	}

	var getAllArtists = function (req, res) {
		var session = neo4j.session();
		Q.fcall(function(){
				var promise = session.run( `MATCH (artist:Artist) 
							  RETURN artist AS artist`);
				return Q.when(promise);
		}).then(function(result) {		
		    res.status(200).json( result.records.map((record)=>{return record.get("artist").properties}) );
		}).catch(function(err){
		  	res.status(500).send(""+err);
		}).finally(function(res){
			session.close();
		});
	}

	var getFilteredArtists = function (req, res) {
		var session = neo4j.session();
		Q.fcall(function(){
				var promise = session.run( `MATCH (artist:Artist) 
							  WHERE LOWER(artist.name) CONTAINS LOWER($artistFilter)
							  RETURN artist AS artist`, {artistFilter:req.params.artistFilter});
				return Q.when(promise);
		}).then(function(result) {		
		    res.status(200).json( result.records.map((record)=>{return record.get("artist").properties}) );
		}).catch(function(err){
		  	res.status(500).send(""+err);
		}).finally(function(res){
			session.close();
		});
	}

	var getAlbumsByArtist = function (req, res) {
		var session = neo4j.session();
		Q.fcall(function(){
				var promise = session.run( `MATCH (artist:Artist{name:$artistName})
											MATCH (album:Album)<-[:Composed_by]-(artist) 
											RETURN album AS album`, {artistName:req.params.artistName});
				return Q.when(promise);
		}).then( function(result) {		
		     res.status(200).json( result.records.map((record)=>{return record.get("album").properties}) );
		}).catch(function(err){
		  	res.status(500).send(""+err);
		}).finally(function(res){
			session.close();
		}).done();
	}

	var getSongsByAlbum = function (req, res) {
		var session = neo4j.session();
		Q.fcall(function(){
				var promise = session.run( `MATCH (artist:Artist{name:$artistName})
											MATCH (album:Album{name:$albumName})<-[:Composed_by]-(artist) 
											MATCH (song:Song)<-[:Contains]-(album)
											RETURN song AS song ORDER BY song.disc ASC, song.track ASC`, 
											{artistName:req.params.artistName, albumName:req.params.albumName});
				return Q.when(promise);
		}).then( function(result) {		
		    res.status(200).json( result.records.map((record)=>{return record.get("song").properties}) );
		}).catch(function(err){
		  	res.status(500).send(""+err);
		}).finally(function(res){
			session.close();
		}).done();		  
	}

	var getSongById = function (req, res) {
		var session = neo4j.session();
		Q.fcall(function(){
				var promise = session.run( `MATCH (s:Song) WHERE ID(s)=$id RETURN s`,
										 {id:Number(req.params.id)});
				return Q.when(promise);
		}).then( function(result) {		
		    res.status(200).json( result.records[0].get("s").properties );
		}).catch(function(err){
		  	res.status(500).send(""+err);
		}).finally(function(res){
			session.close();
		}).done();
	}

	module.exports = {
		indexPath: indexPath,
		getAllArtists: getAllArtists,
		getFilteredArtists:getFilteredArtists,
		getAlbumsByArtist: getAlbumsByArtist,
		getSongsByAlbum: getSongsByAlbum,
		getSongById: getSongById
	};
}());