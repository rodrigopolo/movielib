

var config;
var movie_data;
var total_bytes = 0;


function apicom(op, done){
	var action = host_path+'/'+op.action;
	if(op.filter){
		action+='/'+op.filter
	}
	$.ajax({
		type: 'GET', // POST
		url: action,
		//data: JSON.stringify(op),
		//data: op,
		//contentType: 'application/json; charset=utf-8',
		//dataType: 'json',
		success: function(json_data){
			if(json_data.result=='ok'){
				done(json_data);
			}
			if(json_data.err){
				console.log(json_data.err);
			}
		},
		failure: function(errMsg) {
			console.log(errMsg);
		}
	});
}

var x;


$(function(){


var template = Handlebars.compile($("#mt_movieTemplate").html());


	apicom({
		action: 'config'
	},function(conf_data){
		
		config = conf_data.config;
		conf_data = null;

		apicom({
			action: 'movies'
		}, function(data){
			movie_data = data;
			data = null;

			//$("#movieTemplate").tmpl(movie_data).appendTo("#movies");

			//$('#movies').mustache('mt_movieTemplate', movie_data);

			$('#movies').html(template(movie_data));


			$( "#movies input[type='checkbox']" ).change(function() {
				calc_total();
			});

		});
	});



	$('#size_calc').on('show.bs.dropdown', function () {
	  
	  var r='';
	  for(var i=0; i<speeds.length;i++){
	  	r += '<li><a href="#">'+secToTime((total_bytes/speeds[i].b)*1000)+' <span class="label label-default">'+speeds[i].label+'</span></a></li>';
	  }
	 
	  $('#size_list').html(r);

	});

	$('#selec a').click(function(e){
		e.preventDefault();
		var ac = $(this).attr('href').substr(1);
		var doac = false;

		if(ac=='a'){
			$("#movies input[type='checkbox']").each(function() {
				$(this).prop("checked", true);
			});
			doac = true;
		}else if(ac=='n'){
			$("#movies input[type='checkbox']").each(function() {
				$(this).prop("checked",false);
			});
			doac = true;
		}else if(ac=='i'){
			$("#movies input[type='checkbox']").each(function() {
				if(this.checked){		
					$(this).prop("checked", false);
				}else{
					$(this).prop("checked", true);
				}
			});
			doac = true;
		}else if(ac=='c'){
			var selids=[];
			$("#movies input[type='checkbox']").each(function() {
				if(this.checked){		
					var mit = movie_data.movies[$(this).attr('name').substr(1)];
					selids.push(mit._id);
				}
			});
			$('#alerttxt').val(JSON.stringify(selids));
			$('#myModal').modal()
		}
		if(doac){
			calc_total();
		}
	});

	$('#filter a').click(function(e){
		e.preventDefault();
		var ac = $(this).attr('href').substr(1);

		if(ac.length>0){
			filterMovies(ac);
		}


	});



	var films = new Bloodhound({
	  datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
	  queryTokenizer: Bloodhound.tokenizers.whitespace,
	  remote: '/search/%QUERY.json'
	  //,prefetch: '../data/films/post_1960.json'
	});
	 
	films.initialize();
	 
	$('.typeahead').typeahead(null, {
	  displayKey: 'value',
	  source: films.ttAdapter(),
	  templates: {
	    suggestion: Handlebars.compile(
	      '<p><strong>{{value}}</strong> ({{year}})</p>'
	    )
	  }
	});




});



function shortBytes(bytes) {
	var div = 1024;
	var sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
	if (bytes == 0) return 'n/a';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(div)));
	return (bytes / Math.pow(div, i)).toFixed(1) + '' + sizes[i];
};

function shortBits(bytes) {
	var div = 1000;
	var sizes = ['B', 'K', 'M', 'G', 'T'];
	if (bytes == 0) return 'n/a';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(div)));
	return (bytes / Math.pow(div, i)).toFixed(1) + '' + sizes[i];
};

function shortBytesMac(bytes) {
	var div = 1000;
	var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return 'n/a';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(div)));
	return (bytes / Math.pow(div, i)).toFixed(1) + '' + sizes[i];
};


function audioChan(n){
	var chan = [
		'N/A',
		'Mono',
		'Stereo',
		'2.1',
		'4.0',
		'4.1',
		'5.1',
		'6.1',
		'7.1',
		'8.1?',
		'9.1'
	];
	return chan[n];
}

function audiSample(sr){
	return (sr / 1000).toFixed(1)+'kHz';
}

function audioCodec(codec){
	if(codec=='AC3'){
		return 'Dolby';
	}else if(codec=='AAC LC'){
		return 'AAC';
	}else if(codec=='MPA1L3'){
		return 'MP3';
	}else{
		return codec;
	}
}


function releaseDate(d){
	return moment(d,"YYYY-MM-DDTHH:mm:ss.SSSZ").format('D-MMM-YYYY');
}


function videoCodec(codec){
	if(codec=='MPEG-4 Visual'){
		return 'MP4';
	}else{
		return codec;
	}
}

function videoProfile(prof){
	if(prof=='Advanced Simple@L5'){
		return 'AS@5';
	}else{
		return prof;
	}
}

function videoRes(w,h){
	if(w<=480){
		return 'SD'
	}else if(w>480 && w<1280){
		return w+'x'+h+'px'
	}else if(w>=1280 && w<1920){
		return '720p'
	}else if(w>=1920){
		return '1080p'
	}else{
		return w;
	}
}

// seconds to time string HH:MM:SS
function secToTime(s){
	s = s / 1000;
	var pre = '';
	if (s < 0) {
		pre = '-';
		s = s * -1;
	}
	var sep = ':';
	var hh = parseInt(s / 3600);
	s %= 3600;
	var mm = parseInt(s / 60);
	var ss = parseInt(s % 60);
	if(hh>=1){
		return pre+hh+sep+pad(mm,2)+sep+pad(ss,2)+'hrs';
	}
	if(mm>=1){
		return pre+mm+sep+pad(ss,2)+'min';
	}
	return pre+ss+'sec';

	function pad(num, size) {
		var s = num + "";
		while (s.length < size) s = "0" + s;
		return s;
	}
}


var speeds = [
	{label: "<span class='ri'>0</span><span class='ri'>0</span>1Mbps", b:125000},
	{label: "<span class='ri'>0</span><span class='ri'>0</span>5Mbps", b:625000},
	{label: "<span class='ri'>0</span>10Mbps", b:1250000},
	{label: "<span class='ri'>0</span>20Mbps", b:2500000},
	{label: "100Mbps", b:12500000},

	{label: "<span class='ri'>0</span>10MiB/s", b:10485760},
	{label: "<span class='ri'>0</span>25MiB/s", b:26214400},
	{label: "<span class='ri'>0</span>35MiB/s", b:36700160},
	{label: "<span class='ri'>0</span>60MiB/s", b:62914560},
	{label: "120MiB/s", b:125829120},
	{label: "140MiB/s", b:146800640},
	{label: "160MiB/s", b:167772160},
	{label: "200MiB/s", b:209715200}
]

function calc_total(){
	total_bytes=0;
	var totsel =0;
	$("#movies input[type='checkbox']").each(function() {
		if(this.checked){		
			var mit = movie_data.movies[$(this).attr('name').substr(1)];
			totsel++;
			total_bytes+=mit.size;
		}
	});
	if(total_bytes>0){
		$('#bsel').text(shortBytes(total_bytes)+' / '+shortBytesMac(total_bytes));

	}else{
		$('#bsel').text('0 Bytes');		
	}

	$('#msel').text(totsel);
}


function filterMovies(filter){
		apicom({
			action: 'movies',
			filter: filter
		}, function(data){
			movie_data = data.movies;
			json_data = null;

			$('#movies').html('');

			$("#movieTemplate").tmpl(movie_data.movies).appendTo("#movies");


			$( "#movies input[type='checkbox']" ).change(function() {
				calc_total();
			});

		});
}



Handlebars.registerHelper('poster_url', function(block) {
	return config.images.base_url+config.images.poster_sizes[0]+block;
});

Handlebars.registerHelper('shortBytes', function(block) {
	return shortBytes(block);
});

Handlebars.registerHelper('releaseDate', function(block) {
	return releaseDate(block);
});

Handlebars.registerHelper('secToTime', function(block) {
	return secToTime(block);
});

Handlebars.registerHelper('shortBits', function(block) {
	return shortBits(block);
});

Handlebars.registerHelper('videoCodec', function(block) {
	return videoCodec(block);
});

Handlebars.registerHelper('videoProfile', function(block) {
	return videoProfile(block);
});

Handlebars.registerHelper('videoRes', function(w,h) {
	return videoRes(w,h);
});

Handlebars.registerHelper('upper', function(block) {
	return block.toUpperCase();
});

Handlebars.registerHelper('audioCodec', function(block) {
	return audioCodec(block);
});

Handlebars.registerHelper('audioChan', function(block) {
	return audioChan(block);
});

Handlebars.registerHelper('audiSample', function(block) {
	return audiSample(block);
});

