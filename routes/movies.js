//

module.exports = function(config, app, models, movie_info_db) {

	app.get('/config', function(req, res, next) {
		movie_info_db.tmdb_config(function(err,conf){
			if(err){
				res.json({
					err: err
				});
			}else{
				res.json({
					result: 'ok',
					config: conf
				});
			}
		});
	});

	app.get('/search/:query', function(req, res, next) {
		//console.log('Q:'+req.query.q);
		console.log(req.params.query);


		x=[{"year": "1961","value": "West Side Story","tokens": ["West","Side","Story"]},{"year": "1962","value": "Lawrence of Arabia","tokens": ["Lawrence","of","Arabia"]},{"year": "1963","value": "Tom Jones","tokens": ["Tom","Jones"]},{"year": "1964","value": "My Fair Lady","tokens": ["My","Fair","Lady"]},{"year": "1965","value": "The Sound of Music","tokens": ["The","Sound","of","Music"]},{"year": "1966","value": "A Man for All Seasons","tokens": ["A","Man","for","All","Seasons"]},{"year": "1967","value": "In the Heat of the Night","tokens": ["In","the","Heat","of","the","Night"]},{"year": "1968","value": "Oliver!","tokens": ["Oliver!"]},{"year": "1969","value": "Midnight Cowboy","tokens": ["Midnight","Cowboy"]},{"year": "1970","value": "Patton","tokens": ["Patton"]},{"year": "1971","value": "The French Connection","tokens": ["The","French","Connection"]},{"year": "1972","value": "The Godfather","tokens": ["The","Godfather"]},{"year": "1973","value": "The Sting","tokens": ["The","Sting"]},{"year": "1974","value": "The Godfather Part II","tokens": ["The","Godfather","Part","II"]},{"year": "1975","value": "One Flew over the Cuckoo's Nest","tokens": ["One","Flew","over","the","Cuckoo's","Nest"]},{"year": "1976","value": "Rocky","tokens": ["Rocky"]},{"year": "1977","value": "Annie Hall","tokens": ["Annie","Hall"]},{"year": "1978","value": "The Deer Hunter","tokens": ["The","Deer","Hunter"]},{"year": "1979","value": "Kramer vs. Kramer","tokens": ["Kramer","vs.","Kramer"]},{"year": "1980","value": "Ordinary People","tokens": ["Ordinary","People"]},{"year": "1981","value": "Chariots of Fire","tokens": ["Chariots","of","Fire"]},{"year": "1982","value": "Gandhi","tokens": ["Gandhi"]},{"year": "1983","value": "Terms of Endearment","tokens": ["Terms","of","Endearment"]},{"year": "1984","value": "Amadeus","tokens": ["Amadeus"]},{"year": "1985","value": "Out of Africa","tokens": ["Out","of","Africa"]},{"year": "1986","value": "Platoon","tokens": ["Platoon"]},{"year": "1987","value": "The Last Emperor","tokens": ["The","Last","Emperor"]},{"year": "1988","value": "Rain Man","tokens": ["Rain","Man"]},{"year": "1989","value": "Driving Miss Daisy","tokens": ["Driving","Miss","Daisy"]},{"year": "1990","value": "Dances With Wolves","tokens": ["Dances","With","Wolves"]},{"year": "1991","value": "The Silence of the Lambs","tokens": ["The","Silence","of","the","Lambs"]},{"year": "1992","value": "Unforgiven","tokens": ["Unforgiven"]},{"year": "1993","value": "Schindler’s List","tokens": ["Schindler’s","List"]},{"year": "1994","value": "Forrest Gump","tokens": ["Forrest","Gump"]},{"year": "1995","value": "Braveheart","tokens": ["Braveheart"]},{"year": "1996","value": "The English Patient","tokens": ["The","English","Patient"]},{"year": "1997","value": "Titanic","tokens": ["Titanic"]},{"year": "1998","value": "Shakespeare in Love","tokens": ["Shakespeare","in","Love"]},{"year": "1999","value": "American Beauty","tokens": ["American","Beauty"]},{"year": "2000","value": "Gladiator","tokens": ["Gladiator"]},{"year": "2001","value": "A Beautiful Mind","tokens": ["A","Beautiful","Mind"]},{"year": "2002","value": "Chicago","tokens": ["Chicago"]},{"year": "2003","value": "The Lord of the Rings: The Return of the King","tokens": ["The","Lord","of","the","Rings:","The","Return","of","the","King"]},{"year": "2004","value": "Million Dollar Baby","tokens": ["Million","Dollar","Baby"]},{"year": "2005","value": "Crash","tokens": ["Crash"]},{"year": "2006","value": "The Departed","tokens": ["The","Departed"]},{"year": "2007","value": "No Country for Old Men","tokens": ["No","Country","for","Old","Men"]},{"year": "2008","value": "Slumdog Millionaire","tokens": ["Slumdog","Millionaire"]},{"year": "2009","value": "The Hurt Locker","tokens": ["The","Hurt","Locker"]},{"year": "2010","value": "The King's Speech","tokens": ["The","King's","Speech"]},{"year": "2011","value": "The Artist","tokens": ["The","Artist"]},{"year": "2012","value": "Argo","tokens": ["Argo"]}];

		res.json(x);

		

	});

	app.get('/movies', function(req, res, next) {

		findMovies({},function(err, movies){
			if(err){
				res.json({
					err: err
				});
			}else{
				res.json({
					result: 'ok',
					movies: movies
				});
			}
		});

	});


	app.get('/movies/:action?', function(req, res, next) {

		var query = {};

		if(req.params.action=='a_eng_esp'){
			query['$and'] = [{audio_tracks:{$elemMatch: {lang: 'en'}}},{audio_tracks:{$elemMatch: {lang: 'es'}}}];
		}else if(req.params.action=='s_esp'){
			query['subtitles'] = 'es';
		}else if(req.params.action=='a_5_1'){
			query['audio_tracks'] = {$elemMatch: {ch: 6}};
		}else if(req.params.action=='v_sd'){
			query['video_tracks'] = {$elemMatch: {width: {"$lt": 960},codec:{$ne: "JPEG"}}};
		}else if(req.params.action=='v_720'){
			query['video_tracks'] = {$elemMatch: {width: {"$gte": 960, "$lte": 1280},codec:{$ne: "JPEG"}}};
		}else if(req.params.action=='v_1080'){
			query['video_tracks'] = {$elemMatch: {width: {"$gt": 1280, "$lte": 1920},codec:{$ne: "JPEG"}}};
		}

		findMovies(query,function(err, movies){
			if(err){
				res.json({
					err: err
				});
				console.log(err);
			}else{
				res.json({
					result: 'ok',
					movies: movies
				});
			}
		});

	});


	function findMovies(query, done){

		var selec = {
			id: 0,
			__v: 0,
			mi_status: 0,
			md_status: 0,
			cast: 0,
			crew: 0,
			genres: 0,
			tagline: 0,
			overview: 0,
			backdrop_path: 0,
			path: 0,
			ext: 0,
			
		}

		/*selec = {
			name: 				1,
			'video_tracks.$':	1,
			audio_tracks:		1,
			subtitles:			1,
			bitrate:			1,
			size:				1,
			duration:			1,
			imdb_id:			1,
			release_date:		1,
			poster_path:		1,
			vote_average:		1,
			trailers:			1,
			menu:				1
		}*/

		models.movies.find(query)
		.sort({ modified: -1 })
		.select(selec)
		.exec(function(err,r){
			if(err){
				console.log(err);
			}
			done(err,r);
		});
	}


}



