var config = require('./config');

var mongod = require('./lib/mongod');
var oscom = require('./lib/oscom');

var mongoose = require('mongoose');
var movie_scan = require('./lib/movie_scan');

var mindbl = require('./lib/movie_info_db');


// Mongoose - make connection
mongoose.connect('mongodb://'+config.mongodb.host+':'+config.mongodb.port+'/'+config.mongodb.db,function(err) {
		if(err){
			process.stdout.write('Cannot connect to the DB.');
			process.exit(1);
		}
});

// mongoose models
var models = {};

// User model
models.movies = require('./models/movies')(mongoose);




mongod.check(function(err, installed){
	if(installed){
		oscom.print('MongoDB installed, starting on port:'+config.mongodb.port,true);
		mongod.runInBackground(config.mongodb.port,function(err, running){
			oscom.print('MongoDB running on port: '+config.mongodb.port);

			oscom.print('Scanning directory.');
			movie_scan.scanAndInsert(config.path,models,function(err,ret){
				if(err){
					oscom.print(err);
				}else{
					oscom.print(ret+' Movies found.');


					
					var movie_info_db = new mindbl({
						tmdb_key: config.tmdb_key,
						models: models,
						oscom: oscom
					});



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
		oscom.print('MongoDB not installed.');
		process.exit(1);
	}

});