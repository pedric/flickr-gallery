var menu = document.getElementById('filterbox');
var button = document.getElementById('menu_btn');

/*
* This toggle the category filters on screens < 600px
*
*/
var toggleMenu = function(e) {
	if (menu.classList.contains('active')) {
		menu.classList.remove('active');
		e.classList.remove('active');
		menu.style.height = '0px';
		menu.setAttribute('aria-hidden', true);
	} else {
		menu.classList.add('active');
		e.classList.add('active');
		menu.style.height = menu.scrollHeight+'px';
		menu.setAttribute('aria-hidden', false);
	}
}

// add click event to button
button.addEventListener('click', function() {
	toggleMenu(this);
});