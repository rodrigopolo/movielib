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


var mids = ["535f5c1d26d1db5406d40486","535f5c1d26d1db5406d40487","535f5c1d26d1db5406d40427","535f5c1d26d1db5406d40404","535f5c1d26d1db5406d40444","535f5c1d26d1db5406d40450","535f5c1d26d1db5406d404c0","535f5c1d26d1db5406d40403","535f5c1d26d1db5406d40417","535f5c1d26d1db5406d40443","535f5c1d26d1db5406d40457","535f5c1d26d1db5406d4046f","535f5c1d26d1db5406d4040d","535f5c1d26d1db5406d404e0","535f5c1d26d1db5406d40401","535f5c1d26d1db5406d4041c","535f5c1d26d1db5406d404ab","535f5c1d26d1db5406d40431","535f5c1d26d1db5406d404da","535f5c1d26d1db5406d40446","535f5c1d26d1db5406d40476","535f5c1d26d1db5406d4048d","535f5c1d26d1db5406d40430","535f5c1d26d1db5406d4050b","535f5c1d26d1db5406d404a3","535f5c1d26d1db5406d404ba","535f5c1d26d1db5406d4047b","535f5c1d26d1db5406d404aa","535f5c1d26d1db5406d4046d","535f5c1d26d1db5406d404e2","535f5c1d26d1db5406d40458","535f5c1d26d1db5406d403fb","535f5c1d26d1db5406d4049e","535f5c1d26d1db5406d404b0","535f5c1d26d1db5406d404b6","535f5c1d26d1db5406d40475","535f5c1d26d1db5406d404e3","535f5c1d26d1db5406d40484","535f5c1d26d1db5406d4040c","535f5c1d26d1db5406d404b9","535f5c1d26d1db5406d40432","535f5c1d26d1db5406d404fc","535f5c1d26d1db5406d40495","535f5c1d26d1db5406d403d8","535f5c1d26d1db5406d4045a","535f5c1d26d1db5406d404c6","535f5c1d26d1db5406d403fd","535f5c1d26d1db5406d40416","535f5c1d26d1db5406d40480","535f5c1d26d1db5406d403e8","535f5c1d26d1db5406d40518","535f5c1d26d1db5406d404ca","535f5c1d26d1db5406d40507","535f5c1d26d1db5406d4050a","535f5c1d26d1db5406d4042f","535f5c1d26d1db5406d404ff","535f5c1d26d1db5406d40419","535f5c1d26d1db5406d4045c","535f5c1d26d1db5406d40516","535f5c1d26d1db5406d404f3","535f5c1d26d1db5406d40503","535f5c1d26d1db5406d40448","535f5c1d26d1db5406d404be","535f5c1d26d1db5406d40408","535f5c1d26d1db5406d404bb","535f5c1d26d1db5406d403de","535f5c1d26d1db5406d40407","535f5c1d26d1db5406d4043e","535f5c1d26d1db5406d40502","535f5c1d26d1db5406d403dd","535f5c1d26d1db5406d403ee","535f5c1d26d1db5406d404ad","535f5c1d26d1db5406d40456","535f5c1d26d1db5406d40424","535f5c1d26d1db5406d40501","535f5c1d26d1db5406d40406","535f5c1d26d1db5406d404d5","535f5c1d26d1db5406d404c1","535f5c1d26d1db5406d40433","535f5c1d26d1db5406d403fa","535f5c1d26d1db5406d40434","535f5c1d26d1db5406d40469","535f5c1d26d1db5406d404e1","535f5c1d26d1db5406d404ae","535f5c1d26d1db5406d40435","535f5c1d26d1db5406d403fc","535f5c1d26d1db5406d4042c","535f5c1d26d1db5406d4042b","535f5c1d26d1db5406d4042e","535f5c1d26d1db5406d40494","535f5c1d26d1db5406d40506","535f5c1d26d1db5406d40505","535f5c1d26d1db5406d40504"];

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