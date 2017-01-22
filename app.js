var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

var music = require("./music/music.js");

/* SAMPLE REQUEST
{"name":"testSong2","track":2,"genre":["rock","pop"],"artist":"testArtist","album":"testAlbum"}
*/
app.post('/music/song', [music.insertSong]);	

app.get('/music/artist/(:artistFilter)', [music.getArtists]);

app.get('/music/artist/:artistName/album', [music.getAlbumsByArtist]);	

app.get('/music/artist/:artistName/album/:albumName/song', [music.getSongsByAlbum]);		

app.get('/music/song/:id', [music.getSongById]);	

app.listen(80, function () {
  console.log('Example app listening on port 80!')
})