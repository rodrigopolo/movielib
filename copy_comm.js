var config = require('./config');
var mongoose = require('mongoose');
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


var mids = ["5314b5c128d3f6c40b8f9384","531899afb4d49e380afdc37f","5314b5c128d3f6c40b8f93af","5314b5c128d3f6c40b8f938c","5314b5c128d3f6c40b8f93d0","53152b5845ec1a8013e78346","53152b5845ec1a8013e78347","53152b5845ec1a8013e78321","53152b5845ec1a8013e78387","5314b5c128d3f6c40b8f930d"];

var fpath;

var is_win = (process.platform.substr(0,3)=='win');

// is_win = false;



models.movies.find({
	_id:{$in: mids}
})
.sort({ path: 1 })
.select({
	path: 1
})
.exec(function (err, movies) {
	if(err){
		console.log(err);
	}else{


		for(var i=0;i<movies.length;i++){
			fpath = movies[i].path
			if(is_win){
				fpath = fpath.replace(/\//g, '\\');
				console.log('copy '+'"'+fpath+'"');
			}else{
				console.log('cp '+'"'+fpath+'" ./');
			}
		}

		mongoose.connection.close();
	}
});