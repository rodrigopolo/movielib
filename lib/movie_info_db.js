var mimovie = require("mimovie");
var spawn = require('child_process').spawn;
var fs = require('fs');

var oscom;
var models;
var mdb;

// main class
var movie_info_db = function(settings) {
	mdb = require('moviedb')(settings.tmdb_key);
	models = settings.models;
	oscom = settings.oscom;
};

movie_info_db.prototype.tmdb_config = function(done){
	models.tmdb_config.findOne()
	.select({
		_id: 0,
		__v: 0
	})
	.exec(function (err, tmdb_config) {
		if(err){
			done(err,null);
			oscom.error(err);
		}else{
			if(tmdb_config){
				done(null,tmdb_config);
			}else{
				mdb.configuration(function(err, res_conf){
					if(err){
						done(err,null);
						oscom.error(err,true);
					}else{
						models.tmdb_config.create(res_conf, function(err, ret){

							if(err){
								done(err,null);
								oscom.error(err);
							}else{
								done(null,res_conf);
							}

						});
						
					}
				});

			}
		}
	});
}


// Check if mediainfo is available
movie_info_db.prototype.mediainfoCheck = function(done){
	var mediainfo = spawn('mediainfo', [__filename]);
	mediainfo.stdout.setEncoding('utf8');

	mediainfo.on('error', function (err) {
		// no output needed
	});
	mediainfo.on('close', function (code) {
		if(code==0){
			done(null,true);
		}else{
			done(code,false);
		}
	});
}

// Remove from DB not existent files
movie_info_db.prototype.cleanUp = function(done){
	models.movies.find()
	.sort({ release_date: -1 })
	.select({
		//_id: 0,
		path: 1
	})
	.exec(function (err, movies) {
		if(err){
			oscom.error(err);
		}else{

			var remove=[];
			for(var i=0;i<movies.length;i++){
				if (fs.existsSync(movies[i].path)) {
					// Do something
				}else{
					oscom.print('Removing: '+movies[i].path+' from db.');
					
					remove.push(movies[i]._id);
				}
			}

			if(remove.length>0){
				models.movies.remove({
					_id:{$in: remove}
				}, function(err) {
					if (err){
						oscom.print('Database error cleaning removed movies.');
					}else{
						oscom.print('Done cleaning.');
						done();
					}
				});

			}else{
				done();
			}

		}
	});
}


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

			oscom.print('Getting info from TMDB.');
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

	var search = movie;

	// remove first two that appear on iTunes
	var matches_digit = search.match(/^(\d{2})\s(.*?)/);
	if(matches_digit){
		if(matches_digit[1]){
			search = search.substr(3);
		}
	}



	// for some files
	search = search.replace('.',' ');

	// for iTunes rename
	search = search.replace('(1080p HD)','');
	search = search.replace('(HD)','');
	search = search.trim();

	var regx = /"?(.*?)"?\s+\((.{4})\)/;
	var matches = search.match(regx);

	var mdb_query ={
		query: search
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
	var m={};
	mdb.movieInfo({id: mid}, function(err, r){
		if(err){
			done(err, null);
		}else{

			m.id				= r.id,
			m.genres			= r.genres,
			m.imdb_id			= r.imdb_id,
			m.original_title	= r.original_title,
			m.tagline			= r.tagline,
			m.overview			= r.overview,
			m.release_date		= r.release_date,
			m.backdrop_path		= r.backdrop_path,
			m.poster_path		= r.poster_path,
			m.vote_average		= r.vote_average,
			m.md_status			= true

			mdb.movieCredits({id: mid}, function(err, r2){
				if(err){
					done(err, null);
				}else{
					
					m.cast		= r2.cast;
					m.crew		= r2.crew;

					mdb.movieTrailers({id: mid}, function(err, r3){
						if(err){
							done(err, null);
						}else{
							m.trailers = {
								quicktime:	r3.quicktime,
								youtube:	r3.youtube
							}
							done(null,m);
						}
					});
				}
			});

			
		}
	});
}


module.exports = movie_info_db;