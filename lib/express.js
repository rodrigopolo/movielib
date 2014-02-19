/**
 * Web server dependencies
 */

var express = require('express');
//var routes = require('./routes');
//var user = require('./routes/user');
var http = require('http');
var app = express();

module.exports = function(config, oscom, models, movie_info_db) {

	oscom.print('Starting web server.');

	// all environments
	app.set('port', config.express.port);
	app.set('views', __dirname+'/../views');
	app.set('view engine', 'ejs');


	if(config.express.behind_proxy){
		app.set('trust proxy', true);
	}

	app.use(express.logger('dev')); //
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname+'/../public'));


	app.get('/', function(req, res){
		res.render('index', {
			title: 'Movie Lib',
			host_path: req.protocol + "://" + req.get('host')
		});
	});


	// json data
	require(__dirname +'/../routes/movies')(config, app, models, movie_info_db);

	http.createServer(app).listen(app.get('port'), function(){
		var running_on_port = (app.get('port')!=80)?':'+app.get('port'):'';
		oscom.print("\nYour movie library is on http://localhost"+running_on_port+"\nYou can close the server by pressing [CTRL]+[C]\n");

		if(config.auto_open){
			oscom.open('http://localhost'+running_on_port+'/');
		}

	});

}