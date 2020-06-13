
/*
* Initialize title based on last visits action
* Custom title user got query or tag search in the localstorage
*/
function welcome(){
	var messages = {
		default: "Flickr image explorer",
		profile: 'Welcome back, last time you were browsing for  "'+localStorage.getItem('profile')+'"👇🏼',
		query: "Welcome back, last time around you searched for "+'"'+localStorage.getItem('last_query')+'"👇🏼'
	}
	if( localStorage.getItem('profile')){
		document.getElementById('app_title').innerHTML = messages.profile;
	} else if( localStorage.getItem('last_query') ){
		document.getElementById('app_title').innerHTML = messages.query
	} else {
		document.getElementById('app_title').innerHTML = messages.default;
	}
}
// run function direct
welcome();

/*
* Error handlers for request and images
* 
*/
function insertActionBar(type, msg){
	if(type === 'error' && msg){
		if(document.getElementsByClassName('action_bar--error').length <= 0){
			var action_bar = document.createElement('div');
			action_bar.classList.add('action_bar');
			action_bar.classList.add('action_bar--error');
			var message = document.createTextNode(msg);
			action_bar.appendChild(message);
			document.querySelector('body').appendChild(action_bar);
		}
	} else if(type === 'info' && msg){
		if(document.getElementsByClassName('action_bar--info').length <= 0){
			var action_bar = document.createElement('div');
			action_bar.classList.add('action_bar');
			action_bar.classList.add('action_bar--info');
			var message = document.createTextNode(msg);
			action_bar.appendChild(message);
			document.querySelector('body').appendChild(action_bar);
		}
	} else if(msg) {
		if(document.getElementsByClassName('action_bar').length <= 0){
			var action_bar = document.createElement('div');
			action_bar.classList.add('action_bar');
			var message = document.createTextNode(msg);
			action_bar.appendChild(message);
			document.querySelector('body').appendChild(action_bar);
		}
	}
}

function handleImageError(err){
	insertActionBar('error', 'Sorry, there are some problems with the images at the moment 🐛');
}

function handleRequestError(err){
	var error = err.type ? err.type : 'unknown error' ;
	error = error.toUpperCase();
	document.getElementById('loader_message').innerHTML = error+'<br>please try to reload the page or come back later.';
	document.getElementById('loader_message').style.color = '#ea3f3f';
	document.getElementById('loader_message').style.textAlign = 'center';
}

/*
* Saves data to localStorage
* Clear and set new data
*/
function localStorageHandler(data, query, profile){
	localStorage.clear();
	var today = new Date().getFullYear() + new Date().getMonth() + new Date().getDate();
	localStorage.setItem('last_api_call', today); // Fetch from API on same device once daily and store it in localStorage 
	localStorage.setItem('flickr_data', data); // Set data value as a string
	if(query){
		localStorage.setItem('last_query', query); // Used to build custom title on next visit
	} else if(profile){
		localStorage.setItem('profile', profile); // Used to build custom title on next visit
	}
}

/*
* Handle the UI loader feedback for user 
* 
*/
function loaderFeedback(state, status){
	if(state === 1 || state === 2 || state === 3){
		document.getElementById('loader').style.display = 'flex';
	} else if(state === 4 && status === 200){
		document.getElementById('loader').style.display = 'none';
	}
}

/*
* Builds html from API-response and calls the localStorage handler to save it as a string
* Generally when handle response data: save it as string so the localStorage can be used, parse it as JSON when using it
*/
function buildHtmlList(index, length, reset){
	var data = JSON.parse(localStorage.getItem('flickr_image_array'));
	// When new filter or search is applied this will reset the output to the 6 first in the new response
	if(reset){
		index = 0;
		length = 6;
		document.getElementById('flickr_list').innerHTML = '';
	}
	// Hide the load more button at the end of array and prevent index out of bound
	if(length >= data.length){
		length = data.length;
		document.getElementById('load_more').style.display = 'none';
		if(document.getElementById('no_more_to_load')){
			document.getElementById('no_more_to_load').style.display = 'block';
		}
	};
	// build html list items and append it to list
	for(var i = index; i < length; i++) {
		if(data[i].thumbnail && data[i].title){
			var li = document.createElement('li');
			var img = document.createElement('img');
			li.className = 'image_gallery__list-item';
			img.setAttribute('src', data[i].thumbnail);
			img.setAttribute('alt', data[i].title);
			img.setAttribute('onclick', 'openSlideshow('+data[i].id+')');
			img.setAttribute('data-index', i);
			img.addEventListener('error', handleImageError);
			li.appendChild(img);
			document.getElementById('flickr_list').appendChild(li);
		}
		document.getElementById('load_more').setAttribute('data-position',i+1);
	}
	// indicates no of hits and position to user
	document.getElementById('result_feedback').style.display = 'block';
	document.getElementById('active_images').innerHTML = length;
	document.getElementById('total_images').innerHTML = data.length;
}

/*
* Parse json string and build array of image url links
* Build a clean array of objects to use for generating html, store it as string in localStorage
*/
function requestReady(data,default_query){
	var json = JSON.parse(data);
	var photos = json.photos.photo;
	var flickrImageArray = []; 
	for (var i = 0; i < photos.length; i++) {
		if(photos[i].farm && photos[i].server && photos[i].id && photos[i].secret){
			var image = {};
			image.id = i;
			image.thumbnail = 'https://farm'+photos[i].farm+'.staticflickr.com/'+photos[i].server+'/'+photos[i].id+'_'+photos[i].secret+'_n.jpg';
			image.large = 'https://farm'+photos[i].farm+'.staticflickr.com/'+photos[i].server+'/'+photos[i].id+'_'+photos[i].secret+'_c.jpg';
			image.title = photos[i].title;
			flickrImageArray.push(image);
		}
	}
	localStorage.setItem('flickr_image_array', JSON.stringify(flickrImageArray));
	buildHtmlList(0,6,default_query);
	// destroy and build new slideshow with the new images
	destroySlideshow();
	buildSlideshow();
	loaderFeedback(4, 200);
}

/*
* Load more images
* Button that loads the next 6 images to UI
*/
function lazyLoad(e){
	var start = parseInt(e.target.getAttribute('data-position'));
	buildHtmlList(start, start+6, false);
}


/*
* Load more images
* Button that loads the next 6 images to UI
*/
function getFlickrData(searchString, tags, profile){
	loaderFeedback(1, false)
	var queryUrl;
	// declare tags and profile, sent as false to localStoragehandler() if nothing is passed here
	var tags = tags ? tags : false ;
	var profile = profile ? profile : false ;
	if(searchString){
		queryUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=d5a89ca76750d82938ce16db1d2b6b2b&format=json&nojsoncallback=1&content_type=1&privacy_filter=1&text='+searchString;
	} else if(tags){
		queryUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=d5a89ca76750d82938ce16db1d2b6b2b&format=json&nojsoncallback=1&content_type=1&privacy_filter=1&tag_mode=all&tags='+tags;
		var buttons = document.getElementsByClassName('image_gallery__filter_button');
		for(var i = 0; i < buttons.length;i++){
			buttons[i].classList.remove('active');
		}
		event.target.classList.add('active');
	} else {
		// search for dogs in tags as default :)
		queryUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=d5a89ca76750d82938ce16db1d2b6b2b&format=json&nojsoncallback=1&content_type=1&privacy_filter=1&tag_mode=all&tags=dogs,dog';
	}
	

	var flickrRequest = new XMLHttpRequest();
	flickrRequest.open("GET", queryUrl, true);
	flickrRequest.addEventListener('error', handleRequestError);
	flickrRequest.send();
	flickrRequest.onreadystatechange = function() {

		if(this.readyState === 4 && this.status === 200){
			localStorageHandler(this.responseText,searchString, profile);
			requestReady(this.responseText,true); // requestReady will build custom obj and call functions that will append html to DOM and save data to local storage
		}
	}
}


var today = new Date().getFullYear() + new Date().getMonth() + new Date().getDate(); // new API call every new day
var lastCall = localStorage.getItem('last_api_call');
var storedData = localStorage.getItem('flickr_data');

if(!lastCall || today > lastCall){
	getFlickrData(false,false); // new api request
} else if(storedData) {
	requestReady(storedData); // use stored api response
} else {
	console.log('Something went wrong, app wil try to load data from API'); // not supposed to end up here, log if we do
	getFlickrData(false,false);
}


// Eventlisteners

// load more images
document.getElementById('load_more').addEventListener('click', function(){
	lazyLoad(event);
});

// search
document.getElementById('search_button').addEventListener('click', function(event){
	event.preventDefault();
	var query = document.getElementById('search').value;
	getFlickrData(query, false);
});











