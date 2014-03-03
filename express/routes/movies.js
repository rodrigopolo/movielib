//

module.exports = function(config, app, models, movie_info_db){

	app.post('/config', function(req, res, next){
		movie_info_db.tmdb_config(function(err,conf){
			if(err){
				res.json({
					err: err
				});
			}else{

				getMovSpecs(function(r){
					res.json({
						result: 'ok',
						config: conf,
						specs: r
					});
				});

			}
		});
	});

	app.post('/movies', function(req, res, next){

		//console.log(req.body);

		var sort={};
		if(req.body.sort_by && req.body.sort_order){
			sort[req.body.sort_by] = req.body.sort_order;
		}


		findMovies({},sort,function(err, movies){
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

	app.get('/search/:query', function(req, res, next){

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

	// Typeahead
	app.get('/typeahead', function(req, res, next){

		res.setHeader('Cache-Control', 'no-cache');
        
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



	app.get('/filter', function(req, res, next){

		var query = {

		};

		models.movies.find(query)
		.sort({ modified: -1 })
		.select(selec)
		.exec(function(err,r){
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

	function findMovies(query, sort, done){

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
		.sort(sort)
		.select(selec)
		.exec(function(err,r){
			if(err){
				console.log(err);
			}
			done(err,r);
		});
	}

	// Aggregate mos common movie specs into an object
	function getMovSpecs(done){

		var result = {};		
		var counter = 0;
		var queries = [
			{
				name: 'audio_lang',
				query: [
				{ $match: {audio_tracks:{$not: {$size: 0}}} },
				{ $unwind: "$audio_tracks" },
				{ $group: {
					_id: "$audio_tracks.lang",
					total: { $sum: 1 },
				} },
				{ $sort: {total: -1} }]
			},
			{
				name: 'audio_codec',
				query: [
				{ $match: {audio_tracks:{$not: {$size: 0}}} },
				{ $unwind: "$audio_tracks" },
				{ $group: {
					_id: "$audio_tracks.codec",
					total: { $sum: 1 },
				} },
				{ $sort: {total: -1} }]
			},
			{
				name: 'audio_ch',
				query: [
					{ $match: {audio_tracks:{$not: {$size: 0}}} },
					{ $unwind: "$audio_tracks" },
					{ $group: {
						_id: "$audio_tracks.ch",
						total: { $sum: 1 },
					} },
					{ $sort: {total: -1} }
				]
			},
			{
				name: 'video_width',
				query: [
					{ $match: {video_tracks:{$not: {$size: 0}}} },
					{ $unwind: "$video_tracks" },
					{ $group: {
						_id: "$video_tracks.width",
						total: { $sum: 1 },
					} },
					{ $sort: {total: -1} }
				]
			},
			{
				name: 'video_codec',
				query: [
					{ $match: {video_tracks:{$not: {$size: 0}}} },
					{ $unwind: "$video_tracks" },
					{ $group: {
						_id: "$video_tracks.codec",
						total: { $sum: 1 },
					} },
					{ $sort: {total: -1} }
				]
			},
			{
				name: 'subs',
				query: [
					{ $match: {subtitles:{$not: {$size: 0}}} },
					{ $unwind: "$subtitles" },
					{ $group: {
						_id: "$subtitles",
						total: { $sum: 1 },
					} },
					{ $sort: {total: -1} }
				]
			},
			{
				name: 'genres',
				query: [
					{ $unwind: "$genres" },
					{ $group: {
						_id: "$genres.id",
						total: { $sum: 1 },
						members: {
							$addToSet:{ 
								name: "$genres.name"
							}
						}
					} },
					{ $sort: {total: -1} }
				]
			}
		];	

		makeQuery();

		function makeQuery(){
			if(counter<queries.length){
				var current_query_name = queries[counter].name;
				var current_query = queries[counter].query;

				models.movies.aggregate(current_query, function (e, r){
					result[current_query_name] = r;
					counter++;
					makeQuery();
				});			
			}else{
				done(result);
			}
		}
	}


}



