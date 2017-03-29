var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

var music = require("./music/music.js");


app.post('/music/indexPath', [music.indexPath]);	

app.get('/music/artist/', [music.getAllArtists]);

app.get('/music/artist/(:artistFilter)', [music.getFilteredArtists]);

app.get('/music/artist/:artistName/album', [music.getAlbumsByArtist]);	

app.get('/music/artist/:artistName/album/:albumName/song', [music.getSongsByAlbum]);

app.listen(80, function () {
  console.log('DomoArigato, Mr. Roboto!');
})