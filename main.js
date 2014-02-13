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

/**
 * Web server dependencies
 */

var express = require('express');
//var routes = require('./routes');
//var user = require('./routes/user');
var http = require('http');
var path = require('path');
var app = express();

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
				models.tmdb_config = require('./models/tmdb_config')(mongoose);
				
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
											
											oscom.print('Starting web server.');

											// all environments
											app.set('port', config.express.port);
											app.set('views', path.join(__dirname, 'views'));
											app.set('view engine', 'ejs');


											if(config.express.behind_proxy){
												app.set('trust proxy', true);
											}

											app.use(express.logger('dev')); //
											app.use(express.json());
											app.use(express.urlencoded());
											app.use(express.methodOverride());
											app.use(app.router);
											app.use(express.static(path.join(__dirname, 'public')));


											app.get('/', function(req, res){
												res.render('index', {
													title: 'Movie Lib',
													host_path: req.protocol + "://" + req.get('host')
												});
											});


											// json data
											require(__dirname +'/routes/movies')(config, app, models, movie_info_db);

											http.createServer(app).listen(app.get('port'), function(){
												var running_on_port = (app.get('port')!=80)?':'+app.get('port'):'';
												oscom.print("\nYour movie library is on http://localhost"+running_on_port+"\nYou can close the server by pressing [CTRL]+[C]\n");

												if(config.auto_open){
													oscom.open('http://localhost'+running_on_port+'/');
												}

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
