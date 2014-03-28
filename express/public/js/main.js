

var config;
var movie_data;
var total_bytes = 0;


function apicom(action, op, done){
	var url = host_path+'/'+action;

	$.ajax({
		type: 'POST', // POST
		url: url,
		data: JSON.stringify(op),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
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





	// Load Handle Bars
	var template = Handlebars.compile($("#mt_movieTemplate").html());

	// Request config
	apicom('config',{},function(conf_data){
		config = conf_data.config;
		popForm(conf_data.specs);
		conf_data = null;
		loadMovies();
	});


	// Calc the total size of selected items
	$('#size_calc').on('show.bs.dropdown', function () {
	  var r='';
	  for(var i=0; i<speeds.length;i++){
	  	r += '<li><a href="#">'+secToTime((total_bytes/speeds[i].b)*1000)+' <span class="label label-default">'+speeds[i].label+'</span></a></li>';
	  }
	  $('#size_list').html(r);
	});

	// Drop down "Selection"
	$('#selec a').click(function(e){
		e.preventDefault();

		// get the action
		var ac = $(this).attr('href').substr(1);
		var doac = false;

		if(ac=='a'){
			// Select all
			$("#movies input[type='checkbox']").each(function() {
				$(this).prop("checked", true);
			});
			doac = true;
		}else if(ac=='n'){
			// Select none
			$("#movies input[type='checkbox']").each(function() {
				$(this).prop("checked",false);
			});
			doac = true;
		}else if(ac=='i'){
			// Inverse selection
			$("#movies input[type='checkbox']").each(function() {
				if(this.checked){		
					$(this).prop("checked", false);
				}else{
					$(this).prop("checked", true);
				}
			});
			doac = true;
		}else if(ac=='c'){
			// Get selected IDs
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

		// If there is an action done, calc totals.
		if(doac){
			calc_total();
		}
	});

	// Global loader movies options	
	var mvOps = {
		sort_by: 'modified',
		sort_order: -1
	};

	// Sort By...
	$('#sort a').click(function(e){
		e.preventDefault();
		var ac = $(this).attr('href').substr(1);
		if(ac){
			if(ac==mvOps.sort_by){
				mvOps.sort_order = mvOps.sort_order * -1;
			}else{
				mvOps.sort_by = ac;
			}
			loadMovies();
		}
	});


	// Load movies
	function loadMovies(){
		apicom('movies', mvOps, function(data){
			movie_data = data;
			data = null;
			// render
			$('#movies').html(template(movie_data));
			$( "#movies input[type='checkbox']" ).change(function() {
				calc_total();
			});
		});
	}



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


// Audio Channels
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

// Audio Sample Rate
function audiSample(sr){
	return (sr / 1000).toFixed(1)+'kHz';
}

// Audio Codec
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

// Release Date
function releaseDate(d){
	return moment(d,"YYYY-MM-DDTHH:mm:ss.SSSZ").format('D-MMM-YYYY');
}

// Video Codec
function videoCodec(codec){
	if(codec=='MPEG-4 Visual'){
		return 'MP4';
	}else{
		return codec;
	}
}

// Video Profile
function videoProfile(prof){
	if(prof=='Advanced Simple@L5'){
		return 'AS@5';
	}else{
		return prof;
	}
}

// Video Resolution
function videoRes(w,h){
	if(w < 960){
		return 'SD';
	}else if(w>=960 && w<=1280){
		return '720p';
	}else if(w>1280 && w<=1920){
		return '1080p';
	}else if(w>1920 && w<=2048){
		return '2K';
	}else if(w>2048 && w<=3840){
		return '4K';
	}else if(w>3840 && w<=4096){
		return '4K DCI';
	}else if(w>4096 && w<=5120){
		return '4K UWT';
	}else{
		return w;
	}
}

// Seconds to time string HH:MM:SS
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

// Calc Total Size
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





// Connection Speeds
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



// Damn Handlebars Helpers
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


// populate form
function popForm(fdata){
	var t1 = Handlebars.compile($("#filter_form").html());
	$('#f_filter').html(t1(fdata));


	// Auto-complete search field
	var films = new Bloodhound({
		datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		// remote: '/search/%QUERY',
		prefetch: '/typeahead'
	});

	films.initialize();

	// Init typeahead
	$('.typeahead').typeahead(null, {
		displayKey: 'value',
		source: films.ttAdapter(),
		templates: {
			suggestion: Handlebars.compile('<p>{{value}} ({{year}}) <span class="label label-elegant">{{videoRes width height}}</span></p>')
		}
	});




}