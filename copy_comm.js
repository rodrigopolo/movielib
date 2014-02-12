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


var mids = ["52f8b92f3d6192901c67cb18","52f8b92f3d6192901c67cb06","52fa0556e3b34da41f076d07","52f8b92f3d6192901c67cb1b"];

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