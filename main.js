var config = require('./config');

var mongod = require('./lib/mongod');
var oscom = require('./lib/oscom');

var mongoose = require('mongoose');
var movie_scan = require('./lib/movie_scan');

var mindbl = require('./lib/movie_info_db');
var fs = require('fs');
if(fs.existsSync(config.path)){
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
				
				// movie info class
				var movie_info_db = new mindbl({
					tmdb_key: config.tmdb_key,
					models: models,
					oscom: oscom
				});

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
											mongoose.connection.close(function(){
													oscom.print('Provisional: Press [CTRL]-[C]');
													//process.exit(0);
											});
										});
									});



								}
							});
						});

					}else{
						oscom.error('Mediainfo not installed, download from: http://mediaarea.net/en/MediaInfo/Download',true);
					}
				});


			});
		}else{
			oscom.error('MongoDB not installed.',true);
		}

	});

}else{
	oscom.error('Path to movies not found.');
}
