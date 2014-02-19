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


var mids = ["5302e09ca3ca68a40e15147e","5302afdd44b891ac100091b3","5302afdd44b891ac10009155","530183d4c72574641756f647","530183d4c72574641756f641","530183d4c72574641756f5e9","530183d4c72574641756f5e8","530183d4c72574641756f665","530183d4c72574641756f608","530183d4c72574641756f645","530183d4c72574641756f637","530183d4c72574641756f621","530183d4c72574641756f5fc","530183d4c72574641756f631","530183d4c72574641756f630","530183d4c72574641756f62f","530183d4c72574641756f62e","530183d4c72574641756f622","530183d4c72574641756f661","530183d4c72574641756f604","530183d4c72574641756f603","530183d4c72574641756f653","530183d4c72574641756f652","530183d4c72574641756f61e","530183d4c72574641756f636","530183d4c72574641756f623","530183d4c72574641756f657","530183d4c72574641756f5f5","530183d4c72574641756f656","530183d4c72574641756f642","530183d4c72574641756f632","530183d4c72574641756f625","530183d4c72574641756f63b","530183d4c72574641756f619","530183d4c72574641756f63a","530183d4c72574641756f62a","530183d4c72574641756f65f","530183d4c72574641756f659","530183d4c72574641756f605","530183d4c72574641756f667","530183d4c72574641756f5a0","530183d4c72574641756f59a","530183d4c72574641756f5a4","530183d4c72574641756f578","530183d4c72574641756f57d","530183d4c72574641756f51b"];

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