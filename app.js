var express = require('express');
var bodyParser = require('body-parser');
var neo4j = require('./neo4j/Neo4JManager').driver;

var app = express();
app.use(bodyParser.json());

/* SAMPLE REQUEST
{"name":"testSong2","track":2,"genre":["rock","pop"],"artist":"testArtist","album":"testAlbum"}
*/

app.post('/music/song', function (req, res) {
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
});	

app.get('/music/artist', function (req, res) {
	var session = neo4j.session();
	return session.run( `MATCH (a:Artist) 
						 RETURN a.name AS artistName`)
	   .then( function(result) {
	    res.status(200).json( result.records.map((record)=>{return record.get("artistName")}) );
	    session.close();    	   
	  })
	  .catch(function(err){
	  	res.status(500).send( err );
	  	session.close();
	  })
});

app.get('/music/artist/:artistName/album', function (req, res) {
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
});	

app.get('/music/artist/:artistName/album/:albumName/song', function (req, res) {
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
});		

app.get('/music/song/:id', function (req, res) {
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
});	

app.listen(80, function () {
  console.log('Example app listening on port 80!')
})