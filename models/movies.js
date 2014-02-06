module.exports = function(mongoose) {
	var collection = 'movies';
	var Schema = mongoose.Schema;
	//var ObjectId = Schema.ObjectId;

	var schema = new Schema({
		path: { 
			type: String, 
			unique: true,
			index: true
		},
		name: { 
			type: String, 
			index: true
		},
		ext: String,

		video_tracks: [],
		audio_tracks: [],
		subtitles: [],
		bitrate: Number,
		size: Number,
		duration: Number,

		imdb_id: { 
			type: String,
			index: true
		},
		original_title: String,
		tagline: String,
		overview: String,
		release_date: Date,
		backdrop_path: String,
		poster_path: String,
		vote_average: Number,

		mi_status: {
			type: Boolean,
			default: false,
		},
		md_status: {
			type: Boolean,
			default: false,
		}
	}, { 
		collection: collection,
		//strict: false
	});

	return mongoose.model(collection, schema);
};