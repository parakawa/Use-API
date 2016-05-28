



// constructor

function YTS(options) {
	this.requestParameters = null;

	// set default parameters for request
	this.requestParameters = {
		part: 'snippet',
		key: 'AIzaSyAHFmDVyINh6FDY4o9LVt13O2pSMI9JLdI'
	};

	// response data
	this.videosData = null;

	// gather elements from options
	this.$prevButtons = options.$prevButtons;
	this.$nextButtons = options.$nextButtons;
	this.resultsParent = options.resultsParent;
}




// prototype methods

YTS.prototype.search = function searchYT(queryData) {
	var yts = this;

	// set passed parameters
	if (queryData.query) {
		this.requestParameters.q = queryData.query;
	}

	if (queryData.pageToken) {
		this.requestParameters.pageToken = queryData.pageToken;
	} else {
		delete this.requestParameters.pageToken;
	}

	// make request
	// docs: https://developers.google.com/youtube/v3/docs/search/list
	$.getJSON(
		'https://www.googleapis.com/youtube/v3/search',
		this.requestParameters,
		function(videosData) {
			yts.videosData = videosData;
			yts.renderVideos(videosData);
		}
	);
};

YTS.prototype.prev = function() {
	this.search({
		pageToken: this.videosData.prevPageToken
	});
};

YTS.prototype.next = function() {
	this.search({
		pageToken: this.videosData.nextPageToken
	});
};

YTS.prototype.renderVideos = function(videosData) {
	var yts = this;

	// empty results parent
	$(this.resultsParent).empty();

	// fill results parent
	var renderedEls = videosData.items.map(function(videoData) {
		return yts.renderVideo(videoData);
	});
	$(this.resultsParent).append(renderedEls);

	// only show necessary prev and next buttons
	this.$prevButtons.prop('hidden', false);
	this.$nextButtons.prop('hidden', false);
	this.$prevButtons.prop('disabled', !videosData.prevPageToken);
	this.$nextButtons.prop('disabled', !videosData.nextPageToken);
};

YTS.prototype.renderVideo = function renderVideo(videoData) {
	// video info
	var pageURL = 'https://youtu.be/' + videoData.id.videoId;
	var thumbnailURL = videoData.snippet.thumbnails.medium.url;
	var title = videoData.snippet.title;

	// <li>
	var $li = $('<li>');
		// <a>
		var $a = $('<a>');
		$a.attr('href', pageURL);
			// <h3>
			var $title = $('<h3>');
			$title.text(title);
			// <img>
			var $img = $('<img>');
			$img.attr('src', thumbnailURL);

	// put elements together
	$a.append($title);
	$a.append($img);
	$li.append($a);

	return $li[0];
};




// DOM tie-in

var app = new YTS({
	$prevButtons: $('.yt-search .prev-page'),
	$nextButtons: $('.yt-search .next-page'),
	resultsParent: $('.yt-search .video-results')[0]
});

$('.video-search-form').on('submit', function(event) {
	event.preventDefault();
	app.search({
		query: this.query.value
	});
	this.query.value = '';
});

app.$prevButtons.on('click', function() {
	// go to previous page
	app.prev();
});

app.$nextButtons.on('click', function() {
	// go to next page
	app.next();
});