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

models.movies.find()
.sort({ release_date: -1 })
.select({
	id: 0,
	__v: 0,
	mi_status: 0,
	md_status: 0,
	cast: 0,
	crew: 0,
	tagline: 0,
	overview: 0,
	backdrop_path: 0,
	path: 0,
	ext: 0
})
.exec(function (err, movies) {
	if(err){	
		console.log('models.movies.find');
		console.log(err);
	}else{

		var dump=[];
		for(var i=0;i<movies.length;i++){
			dump.push(movies[i]);
		}
		console.log(JSON.stringify(dump));

		mongoose.connection.close();
	}
});
