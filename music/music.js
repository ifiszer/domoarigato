var neo4j = require('../neo4j/Neo4JManager').driver;

exports.insertSong = function (req, res) {
	var session = neo4j.session();
	session
	  .run( `MERGE (artist:Artist{name:{artist}})
	  		 MERGE (album:Album {name: {album}})<-[:Composed_by]-(artist)
	  		 CREATE (:Song {name: {name}, track: {track}, genre: {genre}})<-[:Contains]-(album)`, req.body)
	   .then( function() {
	    res.status(200).send( "Created OK" );	
	    session.close();    	   
	  })
	  .catch(function(err){
	  	res.status(500).send( err );
	  	session.close();
	  })
}

exports.getArtists = function (req, res) {
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

exports.getAlbumsByArtist = function (req, res) {
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

exports.getSongsByAlbum = function (req, res) {
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

exports.getSongById = function (req, res) {
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