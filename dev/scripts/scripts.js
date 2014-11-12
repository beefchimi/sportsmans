document.addEventListener('DOMContentLoaded', function() {


	// Global Variables
	// ----------------------------------------------------------------------------
	var elBody  = document.body,
		topLink = document.getElementById('back-to-top');


	// onPageLoad: Main Function To Fire on Window Load
	// ----------------------------------------------------------------------------
/*
	function onPageLoad() {
	}
*/


	// backToTop: When Product Grid reaches top of page
	// ----------------------------------------------------------------------------
	function backToTop() {

		// instead of tracking the position of #product_grid:
		// we can safely assume that if the user has scrolled 560px, toggle the back-to-top link

		var scrollPos = window.pageYOffset;

		// if we have scrolled to or past 560px AND topLink does not yet have the class "active"...
		if ( scrollPos >= 560 && !topLink.classList.contains('active') ) {
			topLink.classList.add('active');
		} else if ( scrollPos < 560 && topLink.classList.contains('active') ) {
			topLink.classList.remove('active');
		}

	}


	// modalToggle: Hide / Show Modals
	// ----------------------------------------------------------------------------
	function modalToggle() {

		var modalOpen  = document.querySelectorAll('.modal_open'),
			modalClose = document.querySelectorAll('.modal_close');

		// find each .modal_open link on the page
		for (var i = 0; i < modalOpen.length; i++) {
			openModal(modalOpen[i]);
		}

		// find each .modal_close link on the page
		for (var i = 0; i < modalClose.length; i++) {
			closeModal(modalClose[i]);
		}

		// reveal a modal that is already on the page but hidden
		function openModal(currentTarget) {

			currentTarget.addEventListener('click', function(e) {

				// capture the href of the clicked element, remove the # prefix
				var targetModal = this.getAttribute('href').substring(1);

				// use the captured href to match the ID of the desired modal and add 'visible' class
				document.getElementById(targetModal).classList.add('visible');

				e.preventDefault();

			}, false);

		}

		// hide the modal that is currently revealed
		function closeModal(currentTarget) {

			currentTarget.addEventListener('click', function(e) {

				var currentParent = this.parentNode;
				// var parentCount   = 0;

				// cycle upwards from the closest parent of the clicked element,
				// until we find an element with the attr 'data-modal'
				while ( !currentParent.getAttribute('data-modal') ) {
					currentParent = currentParent.parentNode;
					// parentCount++;
				}

				// once we have found the desired parent element, remove its 'visible' class
				currentParent.classList.remove('visible');

				e.preventDefault();

			}, false);

		}



/*
		function findParentNode(parentName, childObj) {

			var testObj = childObj.parentNode,
				count   = 1;

			while (testObj.getAttribute('name') != parentName) {
				alert('My name is ' + testObj.getAttribute('name') + '. Let\'s try moving up one level to see what we get.');
				testObj = testObj.parentNode;
				count++;
			}

			// now you have the object you are looking for - do something with it
			alert('Finally found ' + testObj.getAttribute('name') + ' after going up ' + count + ' level(s) through the DOM tree');

		}
*/



	}


	// selectDropdown: Pair each <select> element with its <ul> counter-part
	// ----------------------------------------------------------------------------
	function selectDropdown() {

		var filterForm  = document.getElementById('filter_form'),
			filterLabel = filterForm.querySelectorAll('.filter_label');

		// assign the click event to each .filter_label found in the filterForm
		for (var i = 0; i < filterLabel.length; i++) {
			dropdownToggle(filterLabel[i]);
		}

		// function for toggling dropdowns
		function dropdownToggle(currentTarget) {

			// need to consider the fact that this is a touch enabled device...
			// typically, the dropdowns should close on "click outside" of 'this'...
			// but user scrolling could trigger a dropdown close, which probably is not ideal
			currentTarget.addEventListener('click', function(e) {

				// run through each filterLabel...
				for (var i = 0; i < filterLabel.length; i++) {

					// and if this is NOT the dropdown we have clicked on...
					if ( filterLabel[i] != currentTarget ) {
						filterLabel[i].classList.remove('toggled'); // remove the 'toggled' class
					}

				}

				// allow for class toggling on the clicked dropdown
				this.classList.toggle('toggled');

				e.preventDefault();

			}, false);

		}

		// function for passing <ul> values to the corresponding <select>
		function passSelectValue() {

			// dropdownList  = document.querySelectorAll('.dropdown_link');
			var dropdownLinks = filterForm.querySelectorAll('.dropdown_link'),
				selectOptions = filterForm.getElementsByTagName('option');

			// assign the click event to each .dropdown_link found in the filterForm
			for (var i = 0; i < dropdownLinks.length; i++) {
				filterChange(dropdownLinks[i]);
			}

			function filterChange(currentFilter) {

				currentFilter.addEventListener('click', function(e) {

					// http://stackoverflow.com/questions/7373058/how-to-change-the-selected-option-of-html-select-element

					var selectedValue = this.getAttribute('data-value');

					// toggle selected class

					console.log(selectedValue);

					var matchedOption = filterForm.querySelector('[value="' + selectedValue + '"]');

					console.log(matchedOption);

					matchedOption.selected = true;

					// need to verify if this is in fact working
					// filterForm.submit();

					e.preventDefault();

				}, false);

			}

		}

		// does this load a new page or do we refresh the results with AJAX?
		// if AJAX, we will need to display the selected option as the label
		passSelectValue();

	}


	// Window Events: On - Scroll, Resize
	// ----------------------------------------------------------------------------
	window.addEventListener('scroll', function(e) {

		backToTop();

	}, false);


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------

	// onPageLoad();

	if ( elBody.classList.contains('page_product-departments') ) {
		modalToggle();
	}

	if ( elBody.classList.contains('page_product-products') ) {
		selectDropdown();
	}


	// initialize smoothScroll plugin
	smoothScroll.init({
		speed: 400,
		easing: 'easeInOutQuint',
		updateURL: false
	});


}, false);