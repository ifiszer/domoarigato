var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

//Music indexing
var music = require("./music/music.js");
app.post('/music/indexPath', [music.indexPath]);	
app.get('/music/artist/?', [music.getAllArtists]);
app.get('/music/artist/(:artistFilter)', [music.getFilteredArtists]);
app.get('/music/artist/:artistName/album/?', [music.getAlbumsByArtist]);	
app.get('/music/artist/:artistName/album/:albumName/song', [music.getSongsByAlbum]);

//Bluetooth
var bluetooth = require('./bluetooth/bluetooth.js');
app.get('/bluetooth/device/?', [bluetooth.peripheral]);
app.get('/bluetooth/device/:uuid/?', [bluetooth.peripheralInfo]);
app.get('/bluetooth/device/:uuid/service/?', [bluetooth.service]);
app.get('/bluetooth/device/:uuid/service/:suuid/?', [bluetooth.serviceInfo]);
app.get('/bluetooth/device/:uuid/service/:suuid/characteristic/?', [bluetooth.characteristic]);
app.get('/bluetooth/device/:uuid/service/:suuid/characteristic/:cuuid/?', [bluetooth.characteristicInfo]);
app.get('/bluetooth/device/:uuid/service/:suuid/characteristic/:cuuid/read', [bluetooth.characteristicRead]);
app.post('/bluetooth/device/:uuid/service/:suuid/characteristic/:cuuid/write', [bluetooth.characteristicWrite]);

//Server start
app.listen(80, function () {
  console.log('DomoArigato, Mr. Roboto!');
})