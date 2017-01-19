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
	  .run( `MERGE (a:Album {name: {album}, artist:{artist}}) 
	  		 MERGE (:Song {name: {name}, track: {track}, genre: {genre}})<-[:Contains]-(a)`, req.body)
	   .then( function() {
	    res.status(200).send( "Created OK" );	
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