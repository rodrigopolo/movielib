// Config File
var config={};
config.path = '/path/to/movies'
config.tmdb_key = '123-tmdb-key-123';
config.only_web_server = false;
config.auto_open = true;
config.mongodb = {
	host: 'localhost',
	db:   'movielib',
	port: 27018
}
config.express={
	port: 8001,
	// Express behind proxies: http://expressjs.com/guide.html#proxies
	behind_proxy: false
}
module.exports = config;