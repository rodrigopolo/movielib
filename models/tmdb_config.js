module.exports = function(mongoose) {
	var collection = 'tmdb_config';
	var Schema = mongoose.Schema;
	//var ObjectId = Schema.ObjectId;

	var schema = new Schema({

		images: {
			base_url: String,
			secure_base_url: String,
			backdrop_sizes: [],
			logo_sizes: [],
			poster_sizes: [],
			profile_sizes: [],
			still_sizes: []
		},
		change_keys: []

	}, { 
		collection: collection,
		//strict: false
	});

	return mongoose.model(collection, schema);
};