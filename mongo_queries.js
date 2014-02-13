/**
 * MongoDB Queries for dev.
 **/


// subs es
db.movies.find({
    subtitles: 'es'
}).forEach(function(i){
	print(i.name);
})

// Audio ES stereo
db.movies.find({
    audio_tracks:{$elemMatch: {lang: 'es', channels: 2}}
}).forEach(function(i){
	print(i.name);
	i.audio_tracks.forEach(function(j){
            print(j.lang+': '+j.channels);
	});
	print("");
})

// Audio ES 5.1
db.movies.find({
    audio_tracks:{$elemMatch: {lang: 'es', channels: 6}}
}).forEach(function(i){
	print(i.name);
	i.audio_tracks.forEach(function(j){
            print(j.lang+': '+j.channels);
	});
	print("");
})


// Audio stereo and 5.1
db.movies.find({
    $and:[{audio_tracks:{$elemMatch: {channels: 2}}},{audio_tracks:{$elemMatch: {channels: 6}}}]
    
}).forEach(function(i){
	print(i.name);
	i.audio_tracks.forEach(function(j){
            print(j.lang+': '+j.channels);
	});
	print("");
})

// Dual audio
db.movies.find({
    $and:[{audio_tracks:{$elemMatch: {lang: 'en'}}},{audio_tracks:{$elemMatch: {lang: 'es'}}}]
    
}).forEach(function(i){
	print(i.name);
	i.audio_tracks.forEach(function(j){
            print(j.lang+': '+j.channels);
	});
	print("");
})

// SD
db.movies.find({
    video_tracks:{$elemMatch: {width: {"$lt": 960},codec:{$ne: "JPEG"}}}
},{'video_tracks.$':1,name:1}).forEach(function(i){
	i.video_tracks.forEach(function(j){
            printjson(j.width+': '+i.name);
	});
})

// 720p
db.movies.find({
    video_tracks:{$elemMatch: {width: {"$gte": 960, "$lte": 1280},codec:{$ne: "JPEG"}}}
},{'video_tracks.$':1,name:1}).forEach(function(i){
	i.video_tracks.forEach(function(j){
            printjson(j.width+': '+i.name);
	});
})

// 1080p
db.movies.find({
    video_tracks:{$elemMatch: {width: {"$gt": 1280, "$lte": 1920},codec:{$ne: "JPEG"}}}
},{'video_tracks.$':1,name:1}).forEach(function(i){
	i.video_tracks.forEach(function(j){
            printjson(j.width+': '+i.name);
	});
})


// Video JPEG
db.movies.find({
}).forEach(function(i){
	i.video_tracks.forEach(function(j){
            print(j.codec+"\t"+i.path);
	});
})


// Cast: id - Portman: 524
db.movies.find({
    cast:{$elemMatch: {id: 524}}
}).forEach(function(i){
            printjson(i.name);
})

// Crew: id - Steven Spielberg: 488
db.movies.find({
    crew:{$elemMatch: {id: 488}}
}).forEach(function(i){
            printjson(i.name);
})