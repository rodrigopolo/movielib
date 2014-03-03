// future params
var only_web_server = true;

/**
 * Movie lib scan dependencies
 */

// Config file
var config = require('./config');

// Mongod instance lib
var mongod = require('./lib/mongod');

// Mongose lib
var mongoose = require('mongoose');

// OS commands lib
var oscom = require('./lib/oscom');

// Movie file scan lib
var movie_scan = require('./lib/movie_scan');

// Mediainfo and TMDB lib
var mindbl = require('./lib/movie_info_db');

// File system lib
var fs = require('fs');



// fixing the path
config.path = config.path.replace(/\\/g, '/');
if(config.path.substr(-1)=='/'){
	config.path = config.path.substr(0,config.path.length-1);
}




mongod.check(function(err, installed){
	if(installed){
		oscom.print('MongoDB installed, starting on port:'+config.mongodb.port,true);
		mongod.runInBackground(config.mongodb.port,function(err, running){
			oscom.print('MongoDB running on port: '+config.mongodb.port);


			// Mongoose - make connection
			mongoose.connect('mongodb://'+config.mongodb.host+':'+config.mongodb.port+'/'+config.mongodb.db,function(err) {
					if(err){
						oscom.error('Cannot connect to the DB.',true);
					}
			});

			// mongoose models
			var models = {};

			// User model
			models.movies = require('./models/movies')(mongoose);
			models.tmdb_config = require('./models/tmdb_config')(mongoose);
			
			// movie info class
			var movie_info_db = new mindbl({
				tmdb_key: config.tmdb_key,
				models: models,
				oscom: oscom
			});

			if(fs.existsSync(config.path)){

				// only start as a web server without scanning
				if(only_web_server){
					// Express server
					require(__dirname +'/lib/express')(config, oscom, models, movie_info_db);
				}else{
					movie_info_db.mediainfoCheck(function(err, mi_installed){
						if(mi_installed){
							movie_info_db.cleanUp(function(){
								oscom.print('Scanning directory.');
								movie_scan.scanAndInsert(config.path,models,function(err,ret){
									if(err){
										oscom.error(err);
									}else{
										oscom.print(ret+' Movies found.');				



										movie_info_db.getAllSpecs(function(err){
											movie_info_db.getAllInfo(function(err){

												// Express server
												require(__dirname +'/lib/express')(config, oscom, models, movie_info_db);
												
											});
										});


									}
								});
							});

						}else{
							oscom.error('Mediainfo not installed, download from: http://mediaarea.net/en/MediaInfo/Download',true);
						}
					});
				}

			}else{
				oscom.error('Path to movies not found.');
			}



		});
	}else{
		oscom.error('MongoDB not installed.',true);
	}

});



