var mimovie = require("mimovie");

var oscom;
var models;
var mdb;


var movie_info_db = function(settings) {
	mdb = require('moviedb')(settings.tmdb_key);
	models = settings.models;
	oscom = settings.oscom;
};






// Get all movie's specs - EXPORT
movie_info_db.prototype.getAllSpecs = function(done){

	var query = models.movies.find({
		mi_status: false
	});

	query.sort({ path: 1 });

	query.select({
		_id: 0,
		path: 1
	});

	query.exec(function (err, movies) {
		if(err){
			done(err);
		}else{
			oscom.print('Getting file specs.');
			getInfo(movies,function(err,ret){
				// success
				done(null);
			});
		}
	})
	
}

// Get all movies info from TMDB - EXPORT
movie_info_db.prototype.getAllInfo = function(done){

	var query = models.movies.find({
		mi_status: true,
		md_status: false
	});

	query.sort({ path: 1 });

	query.select({
		_id: 0,
		name: 1
	});

	query.exec(function (err, movies) {
		if(err){
			done(err);
		}else{

			oscom.print('Getting info from TMDB');
			getTMDB(movies,function(err,ret){
				done(null);
			});

		}
	})
	
}

function getInfo(movies, done){
	var quee = 0;	// to count the loop
	var progress=0;
	proc();
	// process each file
	function proc(){
		if(quee>=movies.length){
			// Quee complete
			done();
		}else{
			getUpdateMovieSpecs(movies[quee].path,function(err,specs){
				if(err){
					oscom.print(err+': '+movies[quee].path,true);
				}else{
					progress = (((quee+1)/movies.length)*100).toFixed(2);
					oscom.print(progress+'% - '+movies[quee].path,true);
				}
				quee++;
				proc();
			});
		}
	}
}

function getUpdateMovieSpecs(movie, done){
	mimovie(movie, function(err, movie_specs) {
	  if (err) {
	    done(err,null);
	  }else{
		movie_specs.mi_status = true;
		models.movies.update({
			path: movie
		}, movie_specs, function(err, num, n){
			if(err){
				done(err,null);
			}else{
		  		done(null,movie);
			}
		});
	  }
	});
}

function getTMDB(movies, done){
	var quee = 0;	// to count the loop
	var progress=0;
	proc();
	// process each file
	function proc(){
		if(quee>=movies.length){
			// success
			done();			
		}else{
			getUpdateMovieInfo(movies[quee].name,function(err,specs){
				if(err){
					oscom.print(err+': '+movies[quee].name);
				}else{
					progress = (((quee+1)/movies.length)*100).toFixed(2);
					oscom.print(progress+'% - '+movies[quee].name,true);
				}
				quee++;
				proc();
			});
		}
	}
}

function getUpdateMovieInfo(movie, done){
	getMovieDBData(movie, function(err, movie_data) {
	  if (err) {
	    done(err,null);
	  }else{
		movie_data.md_status = true;
		models.movies.update({
			name: movie
		}, movie_data, function(err, num, n){
			if(err){
				done(err,null);
			}else{
		  		done(null,movie);
			}
		});
	  }
	});
}

function getMovieDBData(movie,done){

	var regx = /"?(.*?)"?\s+\((.{4})\)/;
	var matches = movie.match(regx);

	var mdb_query ={
		query: movie
	}
	if(matches){
		if(matches.length==3){
			mdb_query ={
				query: matches[1],
				primary_release_year: matches[2]
			}
		}
	}

	mdb.searchMovie(mdb_query, function(err, res){
		if(err){
			done(err,null);
		}else{
			if(res.results[0]){
				getTMDBFullDetails(res.results[0].id,function(err,r){
					done(err,r);
				});
			}else{
				if(matches){
					if(matches.length==3){
						mdb_query ={
							query: matches[1]
						}
						mdb.searchMovie(mdb_query, function(err, res){
							if(err){
								done(err,null);
							}else{
								if(res.results[0]){
									getTMDBFullDetails(res.results[0].id,function(err,r){
										oscom.print(movie+' found, but probably wrong date on file name.');
										done(err,r);
									});
								}else{
									done('Not found', null);
								}
							}
						});
					}else{
						done('Not found', null);
					}
				}else{
					done('Not found', null);
				}
			}
		}
	});
}

function getTMDBFullDetails(mid,done){
	mdb.movieInfo({id: mid}, function(err, r){
		if(err){
			done(err, null);
		}else{
			done(null,{
				imdb_id:			r.imdb_id,
				original_title:		r.original_title,
				tagline:			r.tagline,
				overview:			r.overview,
				release_date:		r.release_date,
				backdrop_path:		r.backdrop_path,
				poster_path:		r.poster_path,
				vote_average:		r.vote_average,
				md_status:			true
			});
		}
	});
}


module.exports = movie_info_db;