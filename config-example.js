// MongoDB settings
var config={};
config.path = '/path/to/movies'
config.tmdb_key = '123-tmdb-key-123';
config.auto_open = true;
config.mongodb = {
	host: 'localhost',
	db:   'movies',
	port: 27018
}
config.express={
	port: 8001,
	// Express behind proxies: http://expressjs.com/guide.html#proxies
	behind_proxy: false
}
module.exports = config;