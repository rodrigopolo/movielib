// MongoDB settings
var config={};
config.path = '/path/to/movies'
config.tmdb_key = '123-tmdb-key-123';
config.mongodb = {
	host: 'localhost',
	db:   'movies',
	port: 27018
}
config.express={
	port:8888
}
module.exports = config;