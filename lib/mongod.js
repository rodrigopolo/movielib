// Check if mongo is installed
var spawn = require('child_process').spawn;
var mongo;
var autokill = false;

//exports.
exports.check = function (done) {
	var mongo = spawn('mongod', ['--version']);
	mongo.stdout.setEncoding('utf8');

	mongo.on('error', function (err) {
		// no output needed
	});

	mongo.on('close', function (code) {
		if(code==0){
			done(null,true);
		}else{
			done(code,false);
		}
	});
}

exports.runInBackground = function (port, done) {
	var running = false;
	mongo = spawn('mongod', [
		'--dbpath='+ __dirname+'/../mongo/db',
		'--logpath',
		''+ __dirname+'/../mongo/log',
		'--logappend',
		'--port',
		port
	]);
	mongo.stdout.setEncoding('utf8');

	// listen stdout
	mongo.stdout.on('data', function (data) {
		setTimeout(function(){
			if(!running){
				done(null,true);
				running = true;
			}
		},1000)
		//console.log('stdout: '+data);	    
	});

	mongo.on('close', function (code) {
		if(!autokill){
			console.log('MongoDB Closed with code: '+ code);
		}
		process.exit(1);
	});

}

exports.Stop = function (done) {
	autokill = true;
	//mongo.kill('SIGTERM');
	//mongo.kill();
	//mongo.stdin.write("\x03");
	//process.kill(mongo);
	//console.log('???');
	//done();
}

