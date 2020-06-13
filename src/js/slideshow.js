
/*
* Displays slideshow and image that is passed as index
*
*/
function openSlideshow(index){
	var slides = document.getElementsByClassName('slideshow__slide');
	var prevButtonStyles = 'block';
	var nextButtonStyles = 'block';
	if(index <= 0){
		prevButtonStyles = 'none';// hide if on the first position of array
	}
	if(index >= slides.length){
		nextButtonStyles = 'none'; // hide if on the last position of array
	}
	var slideshow = document.getElementsByClassName('slideshow');
	for(var i = 0;i < slideshow.length;i++){
		slideshow[i].style.display = 'block';
		slideshow[i].setAttribute('aria-hidden', false);
	}
	for(var i = 0;i < slides.length;i++){
		if(i === index){
			slides[i].classList.add('active');
			slides[i].setAttribute('aria-hidden', false);
			slides[i].querySelector('.prev_button').style.display = prevButtonStyles;
			slides[i].querySelector('.next_button').style.display = nextButtonStyles;
		}
	}
}

/*
* Builds the slideshow and appends it to body
*
*/
function buildSlideshow(){
	var data = JSON.parse(localStorage.getItem('flickr_image_array'));
	var slideshow = document.createElement('div');
	slideshow.className = 'slideshow';
	slideshow.setAttribute('aria-hidden', true);

	for(var i = 0; i < data.length; i++) {
		if(data[i].thumbnail && data[i].title){
			var slide = document.createElement('div');
			var closeButton = document.createElement('img');
			var img = document.createElement('img');
			var byline = document.createElement('p');
			var prev = document.createElement('button');
			var next = document.createElement('button');
			// slide
			slide.className = 'slideshow__slide';
			slide.setAttribute('aria-hidden', true);
			slide.setAttribute('aria-label', data[i].title);
			// prev btn
			prev.className = 'prev_button';
			prev.appendChild(document.createTextNode('previous'));
			prev.setAttribute('onclick', 'jump(-1)');
			// next btn
			next.className = 'next_button';
			next.appendChild(document.createTextNode('next'));
			next.setAttribute('onclick', 'jump(1)');
			// byline
			byline.appendChild(document.createTextNode(data[i].title));
			// close btn
			closeButton.setAttribute('alt', 'click me to close slideshow');
			closeButton.setAttribute('src', 'images/cross_light.svg');
			closeButton.setAttribute('onclick', 'hideSlideshow()');
			closeButton.className = 'slideshow__close-button';
			// image
			img.className = 'slideshow__image';
			img.setAttribute('src', data[i].large);
			img.setAttribute('alt', data[i].title);
			img.setAttribute('data-index', i);
			img.setAttribute('onclick', 'jump(1)');
			img.addEventListener('error', handleImageError);
			// append elements to slide
			slide.appendChild(closeButton);
			slide.appendChild(img);
			slide.appendChild(byline);
			slide.appendChild(prev);
			slide.appendChild(next);
			// append slide to slideshow
			slideshow.appendChild(slide);
		}
	}
	document.querySelector('body').appendChild(slideshow);
}


/*
* jump back or forward in slideshow
*
*/
function jump(direction){
	var index = 0;
	var slides = document.getElementsByClassName('slideshow__slide');
	for(var i = 0;i < slides.length;i++){
		if(slides[i].classList.contains('active')){
			slides[i].classList.remove('active');
			index = i + direction;
		}
	}
	var prevButtonStyles = 'block';
	var nextButtonStyles = 'block';
	if(index <= 0){
		prevButtonStyles = 'none';// hide if on the first position of array
		index = 0;
	}
	if(index > slides.length-1){
		nextButtonStyles = 'none'; // hide if on the last position of array
		index = slides.length-1;
	}
	for(var i = 0;i < slides.length;i++){
		if(i === index){
			slides[i].classList.add('active');
			slides[i].setAttribute('aria-hidden', false);
			slides[i].querySelector('.prev_button').style.display = prevButtonStyles;
			slides[i].querySelector('.next_button').style.display = nextButtonStyles;
		}
	}
}


/*
* Hides the slideshow
*
*/
function hideSlideshow(){
	var slideshow = document.getElementsByClassName('slideshow');
	for(var i = 0;i < slideshow.length;i++){
		slideshow[i].style.display = 'none';
	}
	var slides = document.getElementsByClassName('slideshow__slide');
	for(var i = 0;i < slides.length;i++){
		slides[i].classList.remove('active');
	}
}

window.addEventListener('click', function(event){
	if(event.target.className === 'slideshow'){
		hideSlideshow();
	}
});

/*
* removes the slideshow from dom
* Call this before building new html with new api response
*/
function destroySlideshow(){
	var slideshow = document.getElementsByClassName('slideshow');
	if(slideshow[0]){
		slideshow[0].remove();
	}
}