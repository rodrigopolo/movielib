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

		var b=req.params.query;
		var jrt = [];

		models.movies.find({name: new RegExp(b,'i')})
		.sort({ modified: -1 })
		.select({
			name: 1,
			size: 1,
		})
		.exec(function(err,r){

			for(var i=0;i<r.length;i++){

				var movie_n = getYear(r[i].name);

				if(movie_n){
					jrt.push({
						size: r[i].size,
						year: movie_n.year,
						value: movie_n.title,
						tokens: movie_n.title.split(' ')
					});
				}else{
					jrt.push({
						size: r[i].size,
						year: false,
						value: r[i].name,
						tokens: r[i].name.split(' ')
					});
				}

			}
			res.json(jrt);
		});	
	});

	app.get('/all', function(req, res, next) {

		var jrt = [];

		models.movies.find()
		.sort({ name: 1 })
		.select({
			name: 1,
			video_tracks: 1,
		})
		.exec(function(err,r){

			for(var i=0;i<r.length;i++){

				var movie_n = getYear(r[i].name);
				var movie_w = (r[i].video_tracks[0])?r[i].video_tracks[0].width:0;
				var movie_h = (r[i].video_tracks[0])?r[i].video_tracks[0].height:0;

				if(movie_n){
					jrt.push({
						width: movie_w,
						height: movie_h,
						year: movie_n.year,
						value: movie_n.title,
						tokens: movie_n.title.split(' ')
					});
				}else{
					jrt.push({
						width: movie_w,
						height: movie_h,
						year: false,
						value: r[i].name,
						tokens: r[i].name.split(' ')
					});
				}

			}
			res.json(jrt);
		});	
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


	function getYear(title){
		var matches = title.match(/"?(.*?)"?\s+\((.{4})\)/);
		if(matches){
			if(matches[2]){
				return {
					title: matches[1],
					year: matches[2]
				};
			}
		}
		return false;
	}

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



