/*
// Avoid 'console' errors in browsers that lack a console.
(function() {
	var method;
	var noop = function () {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}
}());
*/


// smooth-scroll v5.1.4 | copyright Chris Ferdinandi | http://github.com/cferdinandi/smooth-scroll | Licensed under MIT: http://gomakethings.com/mit/
(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define('smoothScroll', factory(root));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.smoothScroll = factory(root);
	}
})(window || this, function (root) {

	'use strict';

	//
	// Variables
	//

	var smoothScroll = {}; // Object for public APIs
	var supports = !!document.querySelector && !!root.addEventListener; // Feature test
	var settings;

	// Default settings
	var defaults = {
		speed: 500,
		easing: 'easeInOutCubic',
		offset: 0,
		updateURL: true,
		callbackBefore: function () {},
		callbackAfter: function () {}
	};


	//
	// Methods
	//

	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	var forEach = function (collection, callback, scope) {
		if (Object.prototype.toString.call(collection) === '[object Object]') {
			for (var prop in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, prop)) {
					callback.call(scope, collection[prop], prop, collection);
				}
			}
		} else {
			for (var i = 0, len = collection.length; i < len; i++) {
				callback.call(scope, collection[i], i, collection);
			}
		}
	};

	/**
	 * Merge defaults with user options
	 * @private
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 * @returns {Object} Merged values of defaults and options
	 */
	var extend = function ( defaults, options ) {
		var extended = {};
		forEach(defaults, function (value, prop) {
			extended[prop] = defaults[prop];
		});
		forEach(options, function (value, prop) {
			extended[prop] = options[prop];
		});
		return extended;
	};

	/**
	 * Get the closest matching element up the DOM tree
	 * @param {Element} elem Starting element
	 * @param {String} selector Selector to match against (class, ID, or data attribute)
	 * @return {Boolean|Element} Returns false if not match found
	 */
	var getClosest = function (elem, selector) {
		var firstChar = selector.charAt(0);
		for ( ; elem && elem !== document; elem = elem.parentNode ) {
			if ( firstChar === '.' ) {
				if ( elem.classList.contains( selector.substr(1) ) ) {
					return elem;
				}
			} else if ( firstChar === '#' ) {
				if ( elem.id === selector.substr(1) ) {
					return elem;
				}
			} else if ( firstChar === '[' ) {
				if ( elem.hasAttribute( selector.substr(1, selector.length - 2) ) ) {
					return elem;
				}
			}
		}
		return false;
	};

	/**
	 * Escape special characters for use with querySelector
	 * @private
	 * @param {String} id The anchor ID to escape
	 * @author Mathias Bynens
	 * @link https://github.com/mathiasbynens/CSS.escape
	 */
	var escapeCharacters = function ( id ) {
		var string = String(id);
		var length = string.length;
		var index = -1;
		var codeUnit;
		var result = '';
		var firstCodeUnit = string.charCodeAt(0);
		while (++index < length) {
			codeUnit = string.charCodeAt(index);
			// Note: there’s no need to special-case astral symbols, surrogate
			// pairs, or lone surrogates.

			// If the character is NULL (U+0000), then throw an
			// `InvalidCharacterError` exception and terminate these steps.
			if (codeUnit === 0x0000) {
				throw new InvalidCharacterError(
					'Invalid character: the input contains U+0000.'
				);
			}

			if (
				// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
				// U+007F, […]
				(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
				// If the character is the first character and is in the range [0-9]
				// (U+0030 to U+0039), […]
				(index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
				// If the character is the second character and is in the range [0-9]
				// (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
				(
					index === 1 &&
					codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
					firstCodeUnit === 0x002D
				)
			) {
				// http://dev.w3.org/csswg/cssom/#escape-a-character-as-code-point
				result += '\\' + codeUnit.toString(16) + ' ';
				continue;
			}

			// If the character is not handled by one of the above rules and is
			// greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
			// is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
			// U+005A), or [a-z] (U+0061 to U+007A), […]
			if (
				codeUnit >= 0x0080 ||
				codeUnit === 0x002D ||
				codeUnit === 0x005F ||
				codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
				codeUnit >= 0x0041 && codeUnit <= 0x005A ||
				codeUnit >= 0x0061 && codeUnit <= 0x007A
			) {
				// the character itself
				result += string.charAt(index);
				continue;
			}

			// Otherwise, the escaped character.
			// http://dev.w3.org/csswg/cssom/#escape-a-character
			result += '\\' + string.charAt(index);

		}
		return result;
	};

	/**
	 * Calculate the easing pattern
	 * @private
	 * @link https://gist.github.com/gre/1650294
	 * @param {String} type Easing pattern
	 * @param {Number} time Time animation should take to complete
	 * @returns {Number}
	 */
	var easingPattern = function ( type, time ) {
		var pattern;
		if ( type === 'easeInQuad' ) pattern = time * time; // accelerating from zero velocity
		if ( type === 'easeOutQuad' ) pattern = time * (2 - time); // decelerating to zero velocity
		if ( type === 'easeInOutQuad' ) pattern = time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time; // acceleration until halfway, then deceleration
		if ( type === 'easeInCubic' ) pattern = time * time * time; // accelerating from zero velocity
		if ( type === 'easeOutCubic' ) pattern = (--time) * time * time + 1; // decelerating to zero velocity
		if ( type === 'easeInOutCubic' ) pattern = time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; // acceleration until halfway, then deceleration
		if ( type === 'easeInQuart' ) pattern = time * time * time * time; // accelerating from zero velocity
		if ( type === 'easeOutQuart' ) pattern = 1 - (--time) * time * time * time; // decelerating to zero velocity
		if ( type === 'easeInOutQuart' ) pattern = time < 0.5 ? 8 * time * time * time * time : 1 - 8 * (--time) * time * time * time; // acceleration until halfway, then deceleration
		if ( type === 'easeInQuint' ) pattern = time * time * time * time * time; // accelerating from zero velocity
		if ( type === 'easeOutQuint' ) pattern = 1 + (--time) * time * time * time * time; // decelerating to zero velocity
		if ( type === 'easeInOutQuint' ) pattern = time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * (--time) * time * time * time * time; // acceleration until halfway, then deceleration
		return pattern || time; // no easing, no acceleration
	};

	/**
	 * Calculate how far to scroll
	 * @private
	 * @param {Element} anchor The anchor element to scroll to
	 * @param {Number} headerHeight Height of a fixed header, if any
	 * @param {Number} offset Number of pixels by which to offset scroll
	 * @returns {Number}
	 */
	var getEndLocation = function ( anchor, headerHeight, offset ) {
		var location = 0;
		if (anchor.offsetParent) {
			do {
				location += anchor.offsetTop;
				anchor = anchor.offsetParent;
			} while (anchor);
		}
		location = location - headerHeight - offset;
		return location >= 0 ? location : 0;
	};

	/**
	 * Determine the document's height
	 * @private
	 * @returns {Number}
	 */
	var getDocumentHeight = function () {
		return Math.max(
			document.body.scrollHeight, document.documentElement.scrollHeight,
			document.body.offsetHeight, document.documentElement.offsetHeight,
			document.body.clientHeight, document.documentElement.clientHeight
		);
	};

	/**
	 * Convert data-options attribute into an object of key/value pairs
	 * @private
	 * @param {String} options Link-specific options as a data attribute string
	 * @returns {Object}
	 */
	var getDataOptions = function ( options ) {
		return !options || !(typeof JSON === 'object' && typeof JSON.parse === 'function') ? {} : JSON.parse( options );
	};

	/**
	 * Update the URL
	 * @private
	 * @param {Element} anchor The element to scroll to
	 * @param {Boolean} url Whether or not to update the URL history
	 */
	var updateUrl = function ( anchor, url ) {
		if ( history.pushState && (url || url === 'true') ) {
			history.pushState( {
				pos: anchor.id
			}, '', window.location.pathname + anchor );
		}
	};

	/**
	 * Start/stop the scrolling animation
	 * @public
	 * @param {Element} toggle The element that toggled the scroll event
	 * @param {Element} anchor The element to scroll to
	 * @param {Object} settings
	 * @param {Event} event
	 */
	smoothScroll.animateScroll = function ( toggle, anchor, options ) {

		// Options and overrides
		var settings = extend( settings || defaults, options || {} );  // Merge user options with defaults
		var overrides = getDataOptions( toggle ? toggle.getAttribute('data-options') : null );
		settings = extend( settings, overrides );
		anchor = '#' + escapeCharacters(anchor.substr(1)); // Escape special characters and leading numbers

		// Selectors and variables
		var fixedHeader = document.querySelector('[data-scroll-header]'); // Get the fixed header
		var headerHeight = fixedHeader === null ? 0 : (fixedHeader.offsetHeight + fixedHeader.offsetTop); // Get the height of a fixed header if one exists
		var startLocation = root.pageYOffset; // Current location on the page
		var endLocation = getEndLocation( document.querySelector(anchor), headerHeight, parseInt(settings.offset, 10) ); // Scroll to location
		var animationInterval; // interval timer
		var distance = endLocation - startLocation; // distance to travel
		var documentHeight = getDocumentHeight();
		var timeLapsed = 0;
		var percentage, position;

		// Update URL
		updateUrl(anchor, settings.updateURL);

		/**
		 * Stop the scroll animation when it reaches its target (or the bottom/top of page)
		 * @private
		 * @param {Number} position Current position on the page
		 * @param {Number} endLocation Scroll to location
		 * @param {Number} animationInterval How much to scroll on this loop
		 */
		var stopAnimateScroll = function (position, endLocation, animationInterval) {
			var currentLocation = root.pageYOffset;
			if ( position == endLocation || currentLocation == endLocation || ( (root.innerHeight + currentLocation) >= documentHeight ) ) {
				clearInterval(animationInterval);
				settings.callbackAfter( toggle, anchor ); // Run callbacks after animation complete
			}
		};

		/**
		 * Loop scrolling animation
		 * @private
		 */
		var loopAnimateScroll = function () {
			timeLapsed += 16;
			percentage = ( timeLapsed / parseInt(settings.speed, 10) );
			percentage = ( percentage > 1 ) ? 1 : percentage;
			position = startLocation + ( distance * easingPattern(settings.easing, percentage) );
			root.scrollTo( 0, Math.floor(position) );
			stopAnimateScroll(position, endLocation, animationInterval);
		};

		/**
		 * Set interval timer
		 * @private
		 */
		var startAnimateScroll = function () {
			settings.callbackBefore( toggle, anchor ); // Run callbacks before animating scroll
			animationInterval = setInterval(loopAnimateScroll, 16);
		};

		/**
		 * Reset position to fix weird iOS bug
		 * @link https://github.com/cferdinandi/smooth-scroll/issues/45
		 */
		if ( root.pageYOffset === 0 ) {
			root.scrollTo( 0, 0 );
		}

		// Start scrolling animation
		startAnimateScroll();

	};

	/**
	 * If smooth scroll element clicked, animate scroll
	 * @private
	 */
	var eventHandler = function (event) {
		var toggle = getClosest(event.target, '[data-scroll]');
		if ( toggle && toggle.tagName.toLowerCase() === 'a' ) {
			event.preventDefault(); // Prevent default click event
			smoothScroll.animateScroll( toggle, toggle.hash, settings, event ); // Animate scroll
		}
	};

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	smoothScroll.destroy = function () {
		if ( !settings ) return;
		document.removeEventListener( 'click', eventHandler, false );
		settings = null;
	};

	/**
	 * Initialize Smooth Scroll
	 * @public
	 * @param {Object} options User settings
	 */
	smoothScroll.init = function ( options ) {

		// feature test
		if ( !supports ) return;

		// Destroy any existing initializations
		smoothScroll.destroy();

		// Selectors and variables
		settings = extend( defaults, options || {} ); // Merge user options with defaults

		// When a toggle is clicked, run the click handler
		document.addEventListener('click', eventHandler, false);

	};


	//
	// Public APIs
	//
	return smoothScroll;

});
document.addEventListener('DOMContentLoaded', function() {


	// Global Variables
	// ----------------------------------------------------------------------------
	var elBody         = document.body,
		elHeader       = document.getElementsByTagName('header')[0],
		isViewGrid     = elBody.classList.contains('view_grid'),
		isProdIndv     = elBody.classList.contains('page_prod-indv'),
		isProdDisp     = elBody.classList.contains('page_prod-disp'),
		isCartCheckout = elBody.classList.contains('page_cart-checkout'),
		isCartCSR      = elBody.classList.contains('page_csr-cart'),
		isQuantityForm = elBody.classList.contains('view_quantity-form');


	// backToTop: When Product Grid reaches top of page
	// ----------------------------------------------------------------------------
	function backToTop() {

		// instead of tracking the position of #product_grid:
		// we can safely assume that if the user has scrolled 560px, toggle the back-to-top link

		var numScrollPos = window.pageYOffset; // may need to be a global variable...

		// if we have scrolled to or past 560px AND header data-scrolled is not 'yes'
		if ( numScrollPos >= 560 && elHeader.getAttribute('data-scrolled') == 'no' ) {

			elHeader.setAttribute('data-scrolled', 'yes');

		} else if ( numScrollPos < 560 && elHeader.getAttribute('data-scrolled') == 'yes' ) {

			elHeader.setAttribute('data-scrolled', 'no');

		}

	}


	// searchOptions: Toggle advanced options for the search input
	// ----------------------------------------------------------------------------
	function searchOptions() {

		var elSearchInput            = document.getElementById('search_text'),
			elSearchCheckbox         = document.getElementById('search_checkbox'),
			originalInputPlaceholder = elSearchInput.getAttribute('data-placeholder');

		elSearchCheckbox.addEventListener('change', function() {

			if (elSearchCheckbox.checked) {

				// if #search_checkbox is now :checked
				elSearchInput.setAttribute('placeholder', 'Search All Departments');

			} else {

				// otherwise, if #search_checkbox is no longer :checked
				elSearchInput.setAttribute('placeholder', originalInputPlaceholder);

			}

		}, false);

	}


	// modalToggle: Hide / Show Modals
	// ----------------------------------------------------------------------------
	function modalToggle() {

		// modals should really be created and appended to the DOM when needed...
		// preferably using createDocumentFragment()...
		// if I have the time, I would love to revisit this

		var arrModalOpen  = document.querySelectorAll('.modal_open'),
			arrModalClose = document.querySelectorAll('.modal_close'),
			elRemoveLink  = document.getElementById('cart-remove_remove'); // only used if on cart-checkout page

		// find each .modal_open link on the page
		for (var i = 0; i < arrModalOpen.length; i++) {
			arrModalOpen[i].addEventListener('click', openModal, false);
		}

		// find each .modal_close link on the page
		for (var i = 0; i < arrModalClose.length; i++) {
			arrModalClose[i].addEventListener('click', closeModal, false);
		}

		// reveal a modal that is already on the page but hidden
		function openModal(e) {

			var hrefTargetModal = this.getAttribute('href').substring(1), // capture the href of the clicked element, remove the # prefix
				elTargetModal   = document.getElementById(hrefTargetModal); // get the modal we need to open

			elTargetModal.classList.add('visible');

			// CART / CSR CHECKOUT ONLY
			if (isCartCheckout || isCartCSR) {

				var dataParentID = this.getAttribute('data-parent'); // get the value from data-parent

				elRemoveLink.setAttribute('href', '#row_' + dataParentID);
				elRemoveLink.addEventListener('click', removeCartRow, false);

			}

			e.preventDefault();

		}

		// hide the modal that is presently visible
		function closeModal(e) {

			cycleParentCloseModal(this);

			// CART / CSR CHECKOUT ONLY
			if (isCartCheckout || isCartCSR) {
				elRemoveLink.removeEventListener('click', removeCartRow, false);
			}

			e.preventDefault();

		}

		// used to cycle through parent elements until the data-modal is found
		function cycleParentCloseModal(passed_This) {

			var elDesiredParent = passed_This.parentNode;

			// cycle upwards from the closest parent of the clicked element,
			// until we find an element with the attr 'data-modal'
			while ( !elDesiredParent.getAttribute('data-modal') ) {
				elDesiredParent = elDesiredParent.parentNode;
			}

			// once we have found the desired parent element, remove its 'visible' class
			elDesiredParent.classList.remove('visible');

		}

		// CART / CSR CHECKOUT ONLY
		// find the target TR and remove it
		function removeCartRow(e) {

			var hrefTargetRow = this.getAttribute('href').substring(1),
				elTargetRow   = document.getElementById(hrefTargetRow);

			// get calculated height of table row
			var numRowHeight = elTargetRow.offsetHeight;

			// get immediate children (TDs) of this row
			var arrRowCells = elTargetRow.children;

			function beginAnimation() {

				// transition row opacity
				var fadeOut = elTargetRow.animate([
					{opacity: '1'},
					{opacity: '0'}
				], 400);

				// once fadeOut transition has finished...
				fadeOut.onfinish = function(e) {

					elTargetRow.style.opacity = 0; // .animate() will jump back to opacity: 1; otherwise
					arrRowCells[0].style.padding = 0; // remove padding on first table cell so height can be collapsed

					// empty out each table cell
					for (var i = 0; i < arrRowCells.length; i++) {
						arrRowCells[i].innerHTML = '';
					}

					// transition calculated row height to 0px
					var collapseHeight = elTargetRow.animate([
						{height: numRowHeight + 'px'},
						{height: '0px'}
					], 320);

					// once collapseHeight transition has finished...
					collapseHeight.onfinish = function(e) {
						elTargetRow.style.height = '0px'; // .animate() will jump back to original height otherwise
						elTargetRow.remove(); // now safe to delete this node
						emptyCartMessage();
					}

				}

			}

			beginAnimation(); // execute begin animation

			cycleParentCloseModal(this);

			e.preventDefault();

		}

		// IMPORTANT!
		// if prod-disp... closing modal must: player.stopVideo();

	}


	// emptyCartMessage: If the checkout cart is empty, let the user know
	// ----------------------------------------------------------------------------
	function emptyCartMessage() {

		var arrTableRows = document.querySelectorAll('.remove_this').length;

		if (arrTableRows <= 0) {
			document.getElementById('cart_form').classList.add('empty-cart');
		}

	}


	// selectDropdown: Pair each <select> element with its <ul> counter-part
	// ----------------------------------------------------------------------------
	function selectDropdown() {

		var elDropdownForm = document.getElementsByClassName('has-dropdown')[0];

		// check if form.has-dropdown does not exist
		if (elDropdownForm == null) {
			return;
		}

		// form.has-dropdown exists, so lets grab all of the dropdown articles
		var arrDropdownArticle = elDropdownForm.getElementsByTagName('article');

		// assign the click event to each .dropdown_label found in form.has-dropdown
		for (var i = 0; i < arrDropdownArticle.length; i++) {
			dropdownToggle(arrDropdownArticle[i]);
		}

		// function for toggling dropdowns
		function dropdownToggle(thisDropdownArticle) {

			var thisDropdownLabel = thisDropdownArticle.getElementsByTagName('h6')[0],
				thisParentArticle;

			thisDropdownLabel.addEventListener('click', function(e) {

				thisParentArticle = this.parentNode;

				// run through each dropdown article...
				for (var i = 0; i < arrDropdownArticle.length; i++) {

					// and if this is NOT the parent dropdown we have clicked on...
					if (arrDropdownArticle[i] != thisParentArticle) {
						arrDropdownArticle[i].classList.remove('toggled'); // remove the 'toggled' class
					}

				}

				// if this is the filter form, we need to handle things differently...
				if ( elDropdownForm.classList.contains('filter_form') ) {

					var elDefaultOption = thisDropdownArticle.querySelector('option[value=""]'),
						elSelectedLI    = thisDropdownArticle.querySelector('li.selected');

					// if we have clicked on a h6 that already has a value
					if (thisParentArticle.getAttribute('data-selected') != "") {

						// reset selected data
						elDefaultOption.selected = true;
						this.innerHTML = elDefaultOption.innerHTML;
						elSelectedLI.classList.remove('selected');
						thisDropdownArticle.setAttribute('data-selected', '');
						thisDropdownArticle.classList.remove('toggled');

					} else {

						thisDropdownArticle.classList.add('toggled');

					}

				} else {

					// allow for class toggling on the clicked dropdown
					thisDropdownArticle.classList.toggle('toggled');

				}

				e.preventDefault();

			}, false);

			// need to consider the fact that this is a touch enabled device...
			// typically, the dropdowns should close on "click outside" of 'this'...
			// but user scrolling could trigger a dropdown close, which may not be ideal... REQUIRES TESTING!

			// click outside of element to close dropdown
			document.addEventListener('click', function(e) {

				// if this is not the currently toggled dropdown
				if (e.target != thisDropdownLabel) {

					// ignore this event if preventDefault has been called
					if (e.defaultPrevented) {
						return;
					}

					thisDropdownArticle.classList.remove('toggled');

				}

			}, false);

		}

		// function for passing <ul> values to the corresponding <select>
		function passSelectValue() {

			var arrDropdownLinks = elDropdownForm.getElementsByClassName('dropdown_link');

			// assign the click event to each .dropdown_link found in the form.has-dropdown
			for (var i = 0; i < arrDropdownLinks.length; i++) {
				optionChange(arrDropdownLinks[i]);
			}

			function optionChange(thisDropdownLink) {

				thisDropdownLink.addEventListener('click', function(e) {

					var dataValue        = this.getAttribute('data-value'),
						dataLabel        = this.childNodes[1].innerHTML, // first child is an empty text node
						elParentLI       = this.parentNode,
						elParentUL       = elParentLI.parentNode,
						elSiblingLabel   = elParentUL.parentNode.previousElementSibling,
						elParentArticle  = elSiblingLabel.parentNode,
						elMatchedOption  = elParentArticle.querySelector('option[value="' + dataValue + '"]'),
						dataPrevSelected = elParentArticle.getAttribute('data-selected'),
						elPrevSelected   = elParentUL.querySelector('a[data-value="' + dataPrevSelected + '"]');

					// define the correct <option> as :selected
					elMatchedOption.selected = true;

					// set 'data-selected' to new value
					elParentArticle.setAttribute('data-selected', dataValue);

					// replace h6.dropdown_label innerHTML with the selected option text
					elSiblingLabel.innerHTML = dataLabel;

					// remove 'selected' class from previous <li>, if it exists...
					if (elPrevSelected != null) {
						elPrevSelected.parentNode.classList.remove('selected');
					}

					// then add 'selected' class to parent <li> of newly chosen a[data-value]
					elParentLI.classList.add('selected');

					// remove 'toggled' class from parent article
					elParentArticle.classList.remove('toggled');

					// THIS SHOULD BE RECONSIDERED! THERES GOT TO BE A BETTER WAAY!
					// Should probably leave the remainder of this function up to TW, as I do not know the specifics of the form submission

					// if we are on the PDP page and we have 2 select options (1. Color / 2. Size)...
					if (elParentArticle.classList.contains('wrap_option-color')) {

						// remove 'disabled' class from article.wrap_option-size
						elParentArticle.nextElementSibling.classList.remove('disabled');

					}

					// IMPORTANT: if Color value is changed after Size has been selected, we need to reset Size <select>:
					// data-selected = "" | remove :selected from <option> | h6.dropdown_label = "2. Select Size" | li.dropdown_option remove class "selected"

/*
					// TEMP: log the selected data-value and matched <option> to inspect
					console.log('selected data-value: "' + dataValue + '", followed by matched <option>:');
					console.log(elMatchedOption);

					// TEST: need to verify everything is working as expected
					elDropdownForm.submit();
*/

					e.preventDefault();

				}, false);

			}

		}

		// does this load a new page or do we refresh the results with AJAX?
		// if AJAX, we will need to display the selected option as the label
		passSelectValue();

	}


	// applyScrollable: Measure dropdown height and determine if it requires scrolling
	// ----------------------------------------------------------------------------
	function applyScrollable() {

		var arrScrollWrap = document.getElementsByClassName('wrap_scroll-list'),
			numMaxHeight;

		for (var i = 0; i < arrScrollWrap.length; i++) {

			numMaxHeight = parseInt( arrScrollWrap[i].getAttribute('data-maxheight') );

			// if the total height of this element exceeds the data-maxheight value
			if (arrScrollWrap[i].offsetHeight > numMaxHeight) {
				arrScrollWrap[i].classList.add('scrollable');
			}

		}

	}


	// popoutToggle: Open / Close popout product table
	// ----------------------------------------------------------------------------
	function popoutToggle() {

		var elPopoutForm = document.getElementsByClassName('has-popout')[0];

		// check if form.has-popout does not exist
		if (elPopoutForm == null) {
			return;
		}

		// form.has-dropdown exists, so lets get the popout button / label
		var elPopoutLabel     = document.getElementById('popout_label'),
			elPopoutClose     = document.getElementById('popout_close'),
			arrPopoutQuantity = elPopoutForm.getElementsByClassName('adjust_number');

		// popout_label can be clicked to toggle the popout
		elPopoutLabel.addEventListener('click', function() {

			// no need to preventDefault, since this is an h6
			elPopoutForm.classList.toggle('visible');
			calcSum();

		}, false);

		// popout_close will remove the 'visible' class
		elPopoutClose.addEventListener('click', function(e) {

			elPopoutForm.classList.remove('visible');
			calcSum();

			e.preventDefault();

		}, false);

		function calcSum() {

			var numTotalItems = 0,
				strItemText;

			for (var i = 0; i < arrPopoutQuantity.length; i++) {
				numTotalItems += parseInt( arrPopoutQuantity[i].getAttribute('value') );
			}

			if (numTotalItems <= 0) {

				// remove 'populated' class and reset innerHTML of h6#popout_label
				elPopoutLabel.classList.remove('populated');
				elPopoutLabel.innerHTML = elPopoutLabel.getAttribute('data-label');

			} else {

				// determine whether or not to pluraize Items by checkign if numTotalItems is greater than 1
				strItemText = numTotalItems > 1 ? ' Items' : ' Item';

				// add 'populated' class and update innerHTML of h6#popout_label
				elPopoutLabel.classList.add('populated');
				elPopoutLabel.innerHTML = numTotalItems + strItemText;

			}

		}

	}


	// quantityAdjust: Increase / Decrease product quantity
	// ----------------------------------------------------------------------------
	function quantityAdjust() {

		var arrQuantityInput = document.querySelectorAll('.adjust_number');

/*
		var arrValuesOriginal = [],
			arrValuesNew      = [];
*/

		// for each input[type="number"] found on the cart page
		for (var i = 0; i < arrQuantityInput.length; i++) {
			quantityIncrements(arrQuantityInput[i]);
		}

		function quantityIncrements(thisQuantityInput) {

			var thisID             = thisQuantityInput.getAttribute('name'),
				thisMin            = parseInt( thisQuantityInput.getAttribute('min') ),
				thisMax            = parseInt( thisQuantityInput.getAttribute('max') ),
				thisValue          = parseInt( thisQuantityInput.value ),
				elQuantityDecrease = thisQuantityInput.nextElementSibling,
				elQuantityIncrease = elQuantityDecrease.nextElementSibling,
				// elQuantityTracker  = thisQuantityInput.parentNode,
				enteredValue;

/*
			arrValuesOriginal.push(thisValue);
			arrValuesNew.push(thisValue);
*/

			// if clicking the 'minus' button
			elQuantityDecrease.addEventListener('click', function(e) {

				// currently not allowed to be set to 0...
				// removing an item can only be achieved by using the 'remove' link...
				// if we want to allow for a 0 value, then updating the cart will remove that product

				// as long as thisQuantityInput value is greater than the allowed minimum, decrement value
				if (thisValue != thisMin) {

					thisValue--;
					thisQuantityInput.value = thisValue;
					thisQuantityInput.setAttribute('value', thisValue);

				}

				e.preventDefault();

			}, false);

			// if clicking the 'plus' button
			elQuantityIncrease.addEventListener('click', function(e) {

				// as long as the thisQuantityInput value is not equal to the allowed maximum, increment value
				if (thisValue != thisMax) {

					thisValue++;
					thisQuantityInput.value = thisValue;
					thisQuantityInput.setAttribute('value', thisValue);

				}

				e.preventDefault();

			}, false);

			// if manually entering a value (using 'input' instead of 'change' to immediately prevent invalid input)
			thisQuantityInput.addEventListener('input', function() {

				// need to recapture the input value
				enteredValue = parseInt(this.value);

				// as long as the user has not entered a value less than or greater than the allowed limit
				if ( enteredValue < thisMin || enteredValue > thisMax || isNaN(enteredValue) ) {

					thisValue = thisValue;
					thisQuantityInput.value = thisValue;
					thisQuantityInput.setAttribute('value', thisValue);

				} else {

					thisValue = enteredValue;
					thisQuantityInput.value = thisValue; // only to accomodate situations where a user has entered a floating point number
					thisQuantityInput.setAttribute('value', thisValue);

				}

			});

		}

/*
		arrValuesOriginal.push(8);
		arrValuesNew.push('test');

		document.getElementById('row_order-total').addEventListener('click', function(e) {

			console.log(arrValuesOriginal);
			console.log(arrValuesNew);

		}, false);
*/

	}


	// deleteOrder: CSR Delete Order Button Functionality
	// ----------------------------------------------------------------------------
	function deleteOrder() {

		var elDeleteButton  = document.getElementById('button_delete'),
			elDeleteText    = elDeleteButton.getElementsByClassName('wrap_text')[0],
			txtOriginalText = elDeleteText.innerHTML, // can likely be removed for final kiosk version
			arrDeleteStages = ['null', 'waiting', 'deleting'],
			numDeleteStages = arrDeleteStages.length - 1,
			numClickCount   = 0;

		elDeleteButton.addEventListener('click', function(e) {

			// if we have exceeded the number of Delete stages
			if (numClickCount >= numDeleteStages) {

				numClickCount = 0; // reset click value to 0

			// if we are just before the final stage
			} else if (numClickCount >= numDeleteStages - 1) {

				elDeleteText.innerHTML = 'Deleting...'; // replace tooltip text
				numClickCount++; // increment click count

			} else {

				elDeleteText.innerHTML = txtOriginalText; // reset tooltip text... this step can be removed for final kiosk version
				numClickCount++; // increment click count

			}

			// update data-delete attribute
			this.setAttribute('data-delete', arrDeleteStages[numClickCount]);

			e.preventDefault();

		}, false);

		// click outside of element to reset Delete Order
		document.addEventListener('click', function(e) {

			// if this is not the Delete Button
			if (e.target != elDeleteButton) {

				// ignore this event if preventDefault has been called
				if (e.defaultPrevented) {
					return;
				}

				elDeleteText.innerHTML = txtOriginalText; // reset tooltip text... this step can be removed for final kiosk version
				elDeleteButton.setAttribute('data-delete', arrDeleteStages[0]);
				numClickCount = 0; // reset click value to 0

			}

		}, false);

	}


/*
	// disableButton: Disable the left or right arrow of the footer
	// ----------------------------------------------------------------------------
	function disableButton() {

		var elFooter     = document.getElementsByTagName('footer')[0],
			elArrowLeft  = elFooter.getElementsByClassName('arrow_left')[0],
			elArrowRight = elFooter.getElementsByClassName('arrow_right')[0];

		// need to get an array of all of the quantity values
		// duplicate the array to track changes, update values upon change

		// iterate through each array and compare values,
		// if they do not match exactly, we need to update the cart

		// if a row is deleted, we need to remove that index from both arrays

		if (newQuantityValues ==  originalQuantityValues) {
			elArrowLeft.classList.remove('disabled');
			elArrowRight.classList.add('disabled');
		} else {
			elArrowLeft.classList.add('disabled');
			elArrowRight.classList.remove('disabled');
		}

	}
*/


	// gallerySlider: PDP page gallery functions
	// ----------------------------------------------------------------------------
	function gallerySlider() {

		var elGallerySlider = document.getElementById('gallery_slider'),
			elGalleryThumbs = document.getElementById('gallery_thumbs'),
			arrSlides       = elGallerySlider.getElementsByTagName('li'),
			arrThumbs       = elGalleryThumbs.getElementsByTagName('li'),
			arrSlideLinks   = elGalleryThumbs.getElementsByTagName('a'),
			numCurrentSlide = 1,
			numSlideMin     = 1,
			numSlideMax     = arrSlides.length,
			elSlidePrev     = document.getElementById('gallery_prev'),
			elSlideNext     = document.getElementById('gallery_next');

		// assign click to each a.link_slide
		for (var i = 0; i < arrSlideLinks.length; i++) {
			galleryThumbs(arrSlideLinks[i]);
		}

/*
		for (var i = 0; i < arrThumbs.length; i++) {

			console.log(arrThumbs[i]);
			console.log(arrThumbs[i].offsetWidth);

		}
*/

		var count   = arrThumbs.length,
			widths  = count * 84,
			margins = (count - 1) * 18,
			total   = widths + margins;


		console.log(total);


		elGalleryThumbs.style.width = total + 'px';



		// previous slide button
		elSlidePrev.addEventListener('click', function(e) {

			if (numCurrentSlide <= numSlideMin) {
				numCurrentSlide = numSlideMax;
			} else {
				numCurrentSlide--;
			}

			adjustSlider();
			e.preventDefault();

		}, false);

		// next slide button
		elSlideNext.addEventListener('click', function(e) {

			if (numCurrentSlide >= numSlideMax) {
				numCurrentSlide = numSlideMin;
			} else {
				numCurrentSlide++;
			}

			adjustSlider();
			e.preventDefault();

		}, false);

		function galleryThumbs(thisSlideLink) {

			thisSlideLink.addEventListener('click', function(e) {

				numCurrentSlide = this.getAttribute('data-thumb');

				adjustSlider();
				e.preventDefault();

			}, false);

		}

		function adjustSlider() {

			elGallerySlider.setAttribute('data-slide', numCurrentSlide);

		}


	}


	// Window Events: On - Scroll, Resize
	// ----------------------------------------------------------------------------

	// important we specific exactly where to call this...
	// otherwise, I will need to separate standard and csr headers with a class or ID
	if (isViewGrid) {

		window.addEventListener('scroll', function(e) {

			backToTop();

		}, false);

	}


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------

	// TEMP: will be changed to a different page...
	if ( elBody.classList.contains('page_prod-dept') ) {
		modalToggle();
	}

	if (isViewGrid || isProdDisp) {
		searchOptions();
	}

	if (isProdIndv || isProdDisp) {
		selectDropdown();
		applyScrollable();
	}

	if (isProdDisp) {
		gallerySlider();
		modalToggle();
		popoutToggle();
		applyScrollable();
	}

	if (isQuantityForm) {
		quantityAdjust();
	}

	if (isCartCheckout || isCartCSR) {
		emptyCartMessage();
		modalToggle();
	}

	if (isCartCSR) {
		deleteOrder();
	}

	// initialize smoothScroll plugin
	smoothScroll.init({
		speed: 400,
		easing: 'easeInOutQuint',
		updateURL: false
	});


}, false);