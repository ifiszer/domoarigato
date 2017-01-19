var express = require('express');
var app = express();
var neo4j = require('./neo4j/Neo4JManager').driver;

app.get('/', function (req, res) {
	var session = neo4j.session();
	session
	  .run( "CREATE (a:Person {name: {name}, title: {title}})", {name: "Arthur", title: "King"});
	  .then( function() {
	    return session.run( "MATCH (a:Person) WHERE a.name = {name} RETURN a.name AS name, a.title AS title",
	        {name: "Arthur"});
	  })
	  .then( function( result ) {
	  	console.log(result);
	    res.send( result.records[0].get("title") + " " + result.records[0].get("name") );
	    session.close();
	  });
});

app.listen(80, function () {
  console.log('Example app listening on port 80!')
})