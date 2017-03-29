(function () {
	var indexPathQuery = `MERGE (artist:Artist{name:$data.band})
			  		  MERGE (album:Album {name: $data.album})<-[:Composed_by]-(artist)
			  		  CREATE (:Song {path:$path, title: $data.title, disc:$data.part_of_a_set, track: $data.track_number, genre: $data.genre})<-[:Contains]-(album)`;

	var getAllArtistsQuery = `MATCH (artist:Artist) 
			   				  RETURN artist AS item`;

	var getFilteredArtistsQuery = `MATCH (artist:Artist) 
								   WHERE LOWER(artist.name) CONTAINS LOWER($artistFilter)
								   RETURN artist AS item`;

	var getAlbumsByArtistQuery = `MATCH (artist:Artist{name:$artistName})
								  MATCH (album:Album)<-[:Composed_by]-(artist) 
								  RETURN album AS item`;

	var getSongsByAlbumQuery = `MATCH (artist:Artist{name:$artistName})
							    MATCH (album:Album{name:$albumName})<-[:Composed_by]-(artist) 
							    MATCH (song:Song)<-[:Contains]-(album)
							    RETURN song AS item ORDER BY song.disc ASC, song.track ASC`;	

	module.exports = {
		indexPathQuery:indexPathQuery,
		getAllArtistsQuery:getAllArtistsQuery,
		getFilteredArtistsQuery:getFilteredArtistsQuery,
		getAlbumsByArtistQuery:getAlbumsByArtistQuery,
		getSongsByAlbumQuery:getSongsByAlbumQuery
	};
}());