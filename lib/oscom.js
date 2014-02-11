/*!
 * Common OS Tasks
 * Copyright(c) 2014 Rodrigo Polo <rodrigopolo.com>
 * MIT Licensed
 */
var spawn = require('child_process').spawn;
var ospf = process.platform;

// Default on Windows
var os={
	nl:		"\033[0G",
	shell: 	'cmd',
	run:	'start',
	ds:		'\\'
};

if(ospf == 'linux'){
	os.nl 		= "\r"
    os.run 		= 'xdg-open';
    os.shell 	= 'bash';
    os.ds		= '/'
}else if(ospf == 'darwin'){
	os.nl 		= "\r"
    os.run 		= 'open';
    os.shell 	= 'bash';
    os.ds		= '/'
}  

exports.os = os;


/**
 * Passes the arguments to that desktop environment's file-opener application
 *
 * @param {File Path or URL/String} a string containing the desired URL or file path to open.
 * @api public
 */
exports.open = function (par) {
	var shell = spawn(os.shell);
	shell.stdin.write(os.run+' '+par+"\n");
	shell.stdin.end();
};

/**
 * Print text into stdout with or withour the return character 
 *
 * @param {Text/String} a string to print.
 * @param {return/Boolean} if you want to avoid the new line and use return instead.
 * @api public
 */
exports.print = function (str) {
    process.stdout.setEncoding('utf8');
	var nl = typeof(arguments[1]) === "undefined" ? null : true;
	if(nl){
		process.stdout.clearLine();
		process.stdout.write(str+os.nl);
	}else{
		process.stdout.clearLine();
		process.stdout.write(str+"\n");
	}
}


/**
 * Print text into stderr, terminate optional.
 *
 * @param {Text/String} a string to print.
 * @param {return/Boolean} if you want to terminate the script.
 * @api public
 */
exports.error = function (str) {
	var terminal = typeof(arguments[1]) === "undefined" ? null : true;
	process.stdout.clearLine();
	process.stderr.write(str+"\n");
	if(terminal){
		process.exit(1);
	}
}

/**
 * Ask a question into the console and read the stdin
 *
 * @param {Text/String} the question to ask.
 * @param {Callback/Function} A function to call after reading the stdin.
 * @api public
 */
exports.ask = function(question, callback) {
    var stdin  = process.stdin, 
        stdout = process.stdout;
    stdin.resume();
    process.stdin.setEncoding('utf8');
    stdout.write(question + ": ");
    stdin.once('data', function(data) {
        data = data.toString().trim();
        process.stdin.pause();
        callback(data);
    });
}


