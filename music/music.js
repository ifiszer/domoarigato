var neo4j = require('../neo4j/Neo4JManager').driver,
 		id3 = require('music-tag'),
 		_ = require('underscore'),
		Q = require('q');

(function () {
	var indexPath = function (req, res) {
		var session = neo4j.session();	
		var tx = session.beginTransaction();	
		tx.run( "Create (algo:Algo{dato:3})")
		.then(function(result){
			tx.commit();
			session.close();
		});
		

		id3.read(req.body.path).then(function(files) {
			
			Q.fcall(function(){
				_.each(files, function(file, index, list){
					insertSong(file, tx);
				})
			}).then(function(res){
				
			}).catch(function(err) {
				console.log(err);
				throw err;
			}).done();
		}).then(function(result) {
			res.status(200).send();			
		}).catch(function(err) {
			console.log(err);
			res.status(500).send( err.Error );
		}).done();
	}

	var insertSong = function(ReadResult, tx){
		var session = neo4j.session();
		var tx = session.beginTransaction();
		 tx.run( `MERGE (artist:Artist{name:{data.artist}})
		  		 MERGE (album:Album {name: {data.album}})<-[:Composed_by]-(artist)
		  		 CREATE (:Song {path:{path}, title: {data.title}, disc:{data.part_of_a_set}, track: {data.track_number}, genre: {data.genre}})<-[:Contains]-(album)`
		  	   , ReadResult)
		 .then(function(result){
		 	tx.commit();
		 	session.close();
		 });	
	}

	var getArtists = function (req, res) {
		var session = neo4j.session();
		return session.run( `MATCH (a:Artist) 
							 WHERE a.name =~ "(?i).*{artistFilter}.*"
							 RETURN a.name AS artistName`, {artistFilter:req.params.artistFilter})
		   .then( function(result) {
		    res.status(200).json( result.records.map((record)=>{return record.get("artistName")}) );
		    session.close();    	   
		  })
		  .catch(function(err){
		  	res.status(500).send( err );
		  	session.close();
		  })
	}

	var getAlbumsByArtist = function (req, res) {
		var session = neo4j.session();
		return session.run( `MATCH (artist:Artist{name:{artistName}})
							 MATCH (album:Album)<-[:Composed_by]-(artist) 
							 RETURN album.name AS albumName`, {artistName:req.params.artistName})
		   .then( function(result) {
		    res.status(200).json( result.records.map((record)=>{return record.get("albumName")}) );
		    session.close();    	   
		  })
		  .catch(function(err){
		  	res.status(500).send( err );
		  	session.close();
		  })
	}

	var getSongsByAlbum = function (req, res) {
		var session = neo4j.session();
		return session.run( `MATCH (artist:Artist{name:{artistName}})
							 MATCH (album:Album{name:{albumName}})<-[:Composed_by]-(artist) 
							 MATCH (song:Song)<-[:Contains]-(album)
							 RETURN song AS song ORDER BY song.track ASC`, 
							 {artistName:req.params.artistName, albumName:req.params.albumName})
		   .then( function(result) {
		    res.status(200).json( result.records.map((record)=>{return record.get("song").properties}) );
		    session.close();    	   
		  })
		  .catch(function(err){
		  	res.status(500).send( err );
		  	session.close();
		  })
	}

	var getSongById = function (req, res) {
		var session = neo4j.session();
		return session.run( `MATCH (s:Song) WHERE ID(s)={id} RETURN s`, {id:Number(req.params.id)})
		   .then( function(result) {
		    res.status(200).json( result.records[0].get("s").properties );	
		    session.close();    	   
		  })
		  .catch(function(err){
		  	res.status(500).send( err );
		  	session.close();
		  })
	}
	module.exports = {
		indexPath: indexPath,
		getArtists: getArtists,
		getAlbumsByArtist: getAlbumsByArtist,
		getSongsByAlbum: getSongsByAlbum,
		getSongById: getSongById
	};
}());