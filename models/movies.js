module.exports = function(mongoose) {
	var collection = 'movies';
	var Schema = mongoose.Schema;
	//var ObjectId = Schema.ObjectId;

	var schema = new Schema({

		added: {
			type: Date, 
			default: Date.now 
		},
		encoded: {
			type: Date, 
			default: Date.now 
		},
		tagged: {
			type: Date, 
			default: Date.now 
		},
		created: {
			type: Date, 
			default: Date.now 
		},
		modified: {
			type: Date, 
			default: Date.now 
		},

		path: { 
			type:		String, 
			unique:		true,
			index:		true
		},
		name: { 
			type:		String, 
			index:		true
		},
		ext:				String,

		video_tracks:		[],
		audio_tracks:		[],
		subtitles:			[],
		bitrate:			Number,
		size:				Number,
		duration:			Number,

		id: { 
			type:		Number, 
			index:		true
		},
		genres:				[],
		imdb_id: { 
			type:		String,
			index: 		true
		},
		original_title:		String,
		tagline:			String,
		overview:			String,
		release_date:		Date,
		backdrop_path:		String,
		poster_path:		String,
		vote_average:		Number,

		cast:				[],
		crew:				[],

		trailers: {
			quicktime:		[],
			youtube:		[]
		},

		menu: {
			type: 		Boolean,
			default: 	false,
		},

		mi_status: {
			type: 		Boolean,
			default: 	false,
		},
		md_status: {
			type:		Boolean,
			default:	false,
		}
	}, { 
		collection: collection,
		//strict: false
	});

	return mongoose.model(collection, schema);
};