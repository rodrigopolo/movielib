var scandir = require('./scandir');

exports.scanAndInsert = function (path, models, done) {

	// movie array
	var data_db=[];

	scandir.walk(path, function(err, files) {
		var file;
		if (err){
			done('Error browsing path.',null);
		}else{

			// pupulate the movie array
			for(var i=0;i<files.length;i++){
				file = {};
				file.path = files[i];
				file.ext = file.path.substring(file.path.lastIndexOf('.')+1).toLowerCase();
				if(file.ext=='mp4' || file.ext=='m4v' || file.ext=='avi' || file.ext=='mkv' || file.ext=='mov' || file.ext=='wmv'){

					file.name = file.path.substr(file.path.lastIndexOf('/')+1);
					file.name = file.name.substr(0,file.name.lastIndexOf('.'));

					if(file.name.substr(0,1)!='.'){
						data_db.push(file);
					}

				}
			}

			// insert the movies into DB
			models.movies.create(data_db, function(err, ret){
				// ignore insert duplicates
				if(err){
					if(err.code==11000){
						err=null;
					}
				}
				if(err){
					done('DB error inserting movies.',null);
				}else{
					done(null,data_db.length);
				}

				// mongoose.connection.close();
				// what else?
				//console.log(JSON.stringify(data_db));


			});



		}
	});

}