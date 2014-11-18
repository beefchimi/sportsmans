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
		topLink        = document.getElementById('back-to-top'),
		// formQuantity   = document.getElementsByClassName('has-quantity')[0],
		isProdIndv     = elBody.classList.contains('page_prod-indv'),
		isViewGrid     = elBody.classList.contains('view_grid'),
		isCartCheckout = elBody.classList.contains('page_cart-checkout'),
		isQuantityForm = elBody.classList.contains('view_quantity-form');

	var cartForm = document.getElementById('cart_form');

	// check if the cart_form exists
	if ( typeof(cartForm) != 'undefined' && cartForm != null ) {
		var numTaxPercent = parseFloat( cartForm.getAttribute('data-tax') ) / 100;
	}


/*
	// isInt: Helper function for determining if a value is an integer
	// ----------------------------------------------------------------------------
	function isInt(n) {
		return Number(n)===n && n%1===0;
	}
*/


/*
	// fadeOutRemove: Helper function for fading an element to 0
	// ----------------------------------------------------------------------------
	function fadeOutRemove(element) {

		var opacity  = 1;

		function fade() {

			opacity -= 0.05; // reduce by 5%

			if (opacity <= 0){
				element.style.opacity = 0;
				element.innerHTML = '';
				return true;
			}

			element.style.opacity = opacity;
			requestAnimationFrame(fade);

		}

		fade();

	}
*/


	// backToTop: When Product Grid reaches top of page
	// ----------------------------------------------------------------------------
	function backToTop() {

		// instead of tracking the position of #product_grid:
		// we can safely assume that if the user has scrolled 560px, toggle the back-to-top link

		var scrollPos = window.pageYOffset; // may need to be a global variable...

		// if we have scrolled to or past 560px AND topLink does not yet have the class "active"...
		if ( scrollPos >= 560 && !topLink.classList.contains('active') ) {
			topLink.classList.add('active');
		} else if ( scrollPos < 560 && topLink.classList.contains('active') ) {
			topLink.classList.remove('active');
		}

	}


	// searchOptions: Toggle advanced options for the search input
	// ----------------------------------------------------------------------------
	function searchOptions() {

		var searchToggle = document.getElementById('toggle_search-options');

		searchToggle.addEventListener('click', function(e) {

			this.classList.toggle('toggled');

			e.preventDefault();

		}, false);

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
		function openModal(thisModalOpen) {

			thisModalOpen.addEventListener('click', function(e) {

				// capture the href of the clicked element, remove the # prefix
				var targetModal = this.getAttribute('href').substring(1);

				// use the captured href to match the ID of the desired modal and add 'visible' class
				document.getElementById(targetModal).classList.add('visible');

				e.preventDefault();

			}, false);

		}

		// hide the modal that is presently visible
		function closeModal(thisModalClose) {

			thisModalClose.addEventListener('click', function(e) {

				var desiredParent = this.parentNode;

				// cycle upwards from the closest parent of the clicked element,
				// until we find an element with the attr 'data-modal'
				while ( !desiredParent.getAttribute('data-modal') ) {
					desiredParent = desiredParent.parentNode;
				}

				// once we have found the desired parent element, remove its 'visible' class
				desiredParent.classList.remove('visible');

				e.preventDefault();

			}, false);

		}

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
		function dropdownToggle(thisFilterLabel) {

			// need to consider the fact that this is a touch enabled device...
			// typically, the dropdowns should close on "click outside" of 'this'...
			// but user scrolling could trigger a dropdown close, which may not be ideal (requires testing)
			thisFilterLabel.addEventListener('click', function(e) {

				// run through each filterLabel...
				for (var i = 0; i < filterLabel.length; i++) {

					// and if this is NOT the dropdown we have clicked on...
					if ( filterLabel[i] != thisFilterLabel ) {
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

			function filterChange(thisDropdownLink) {

				thisDropdownLink.addEventListener('click', function(e) {

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


	// quantityAdjust: Increase / Decrease product quantity
	// ----------------------------------------------------------------------------
	function quantityAdjust() {

		var quantityInput = document.querySelectorAll('.adjust_number');

		// for each input[type="number"] found on the cart page
		for (var i = 0; i < quantityInput.length; i++) {
			quantityIncrements(quantityInput[i]);
		}

		function quantityIncrements(thisQuantityInput) {

			var thisID           = thisQuantityInput.getAttribute('name'),
				thisMin          = parseInt( thisQuantityInput.getAttribute('min') ),
				thisMax          = parseInt( thisQuantityInput.getAttribute('max') ),
				thisValue        = parseInt( thisQuantityInput.value ),
				quantityDecrease = thisQuantityInput.previousElementSibling,
				quantityIncrease = thisQuantityInput.nextElementSibling,
				enteredValue;

			// if clicking the 'minus' button
			quantityDecrease.addEventListener('click', function(e) {

				// currently not allowed to be set to 0...
				// removing an item can only be achieved by using the 'remove' link
				// since there is no 'update cart' button, this seems like the logical approach

				// as long as thisQuantityInput value is greater than the allowed minimun, decrement value
				if (thisValue != thisMin) {

					thisValue--;
					thisQuantityInput.value = thisValue;
					thisQuantityInput.setAttribute('value', thisValue);

					if (isCartCheckout) {
						updateCart(thisID, thisValue);
					}

				}

				e.preventDefault();

			}, false);

			// if clicking the 'plus' button
			quantityIncrease.addEventListener('click', function(e) {

				// as long as the thisQuantityInput value is not equal to the allowed maximum, increment value
				if (thisValue != thisMax) {

					thisValue++;
					thisQuantityInput.value = thisValue;
					thisQuantityInput.setAttribute('value', thisValue);

					if (isCartCheckout) {
						updateCart(thisID, thisValue);
					}

				}

				e.preventDefault();

			}, false);

			// if manually entering a value
			thisQuantityInput.addEventListener('change', function() { // input

				// need to recapture the input value
				enteredValue = parseInt(thisQuantityInput.value);

				// as long as the user has not entered a value less than or greater than the allowed limit
				if ( enteredValue < thisMin || enteredValue > thisMax || isNaN(enteredValue) ) {

					thisValue = thisValue;
					thisQuantityInput.value = thisValue;
					thisQuantityInput.setAttribute('value', thisValue);

				} else {

					thisValue = enteredValue;
					thisQuantityInput.value = thisValue; // only to accomodate situations where a user has entered a floating point number
					thisQuantityInput.setAttribute('value', thisValue);

					if (isCartCheckout) {
						updateCart(thisID, thisValue);
					}

				}

			});

		}

	}


	// updateCart: Update cart values and product rows
	// ----------------------------------------------------------------------------
	function updateCart(passed_thisID, passed_thisValue) {

		// CURRENTLY NOT HANDLING: product total, ship & hand, tax, order total
		// need to know more about tax + shipping & handling ... last I heard they may not be included

		var rowSelected   = document.getElementById('row_' + passed_thisID),
			rowPriceValue = parseFloat(rowSelected.getElementsByClassName('wrap_price')[0].innerHTML).toFixed(2),
			updatedTotal  = passed_thisValue * rowPriceValue;

		rowSelected.getElementsByClassName('wrap_price')[1].innerHTML = updatedTotal.toFixed(2);

		if (isCartCheckout) {
			calculateTotals();
		}

	}


	// calculateTotals: Add up the totals on the checkout page
	// ----------------------------------------------------------------------------
	function calculateTotals() {

		var elTotalItems      = document.getElementsByClassName('product_total'),
			elTotalBeforeTax  = document.getElementById('cell_product-total').getElementsByClassName('wrap_price')[0],
			elTotalAfterTax   = document.getElementById('cell_order-total').getElementsByClassName('wrap_price')[0],
			elTaxValue        = document.getElementById('cell_tax').getElementsByClassName('wrap_price')[0],
			numTotalBeforeTax = 0,
			numTotalAfterTax  = 0,
			numTaxValue       = 0,
			numCalcTotal      = 0;

		for (var i = 0; i < elTotalItems.length; i++) {
			numCalcTotal += parseFloat(elTotalItems[i].getElementsByClassName('wrap_price')[0].innerHTML);
		}

		numTotalBeforeTax = numCalcTotal;

		numTaxValue = numCalcTotal * numTaxPercent;

		numTotalAfterTax = numTotalBeforeTax + numTaxValue;

		elTotalBeforeTax.innerHTML = numTotalBeforeTax.toFixed(2);
		elTaxValue.innerHTML = numTaxValue.toFixed(2);
		elTotalAfterTax.innerHTML = numTotalAfterTax.toFixed(2);

	}


	// removeItem: Remove a product row from the cart table
	// ----------------------------------------------------------------------------
	function removeItem() {

		var removeLink = document.querySelectorAll('.remove_this');

		// for each a.remove_link found on the cart page
		for (var i = 0; i < removeLink.length; i++) {
			updateTable(removeLink[i]);
		}

		function updateTable(thisRemoveLink) {

			thisRemoveLink.addEventListener('click', function(e) {

				var desiredParent = this.parentNode;

				// cycle upwards from the closest parent of the clicked element,
				// until we find the <tr> element (tag names must be uppercase)
				while (desiredParent.tagName != 'TR') {
					desiredParent = desiredParent.parentNode;
				}

				// get calculated height of table row
				var rowHeight = desiredParent.offsetHeight;

				// get immediate children (TDs) of this row
				var rowCells = desiredParent.children;

				function beginAnimation() {

					// transition row opacity
					var fadeOut = desiredParent.animate([
						{opacity: '1'},
						{opacity: '0'}
					], 400);

					// once fadeOut transition has finished...
					fadeOut.onfinish = function(e) {

						desiredParent.style.opacity = 0; // .animate() will jump back to opacity: 1; otherwise
						rowCells[0].style.padding = 0; // remove padding on first table cell so height can be collapsed

						// empty out each table cell
						for (var i = 0; i < rowCells.length; i++) {
							rowCells[i].innerHTML = '';
						}

						// transition calculated row height to 0px
						var collapseHeight = desiredParent.animate([
							{height: rowHeight + 'px'},
							{height: '0px'}
						], 400);

						// once collapseHeight transition has finished...
						collapseHeight.onfinish = function(e) {
							desiredParent.style.height = '0px'; // .animate() will jump back to original height otherwise
							desiredParent.remove(); // now safe to delete this node
							calculateTotals(); // recalculate totals after removed product
						}

					}

				}

				// run the remove animation and update cart total
				beginAnimation();

				e.preventDefault();

			}, false);

		}

	}


	// Window Events: On - Scroll, Resize
	// ----------------------------------------------------------------------------
	window.addEventListener('scroll', function(e) {

		backToTop();

	}, false);

	// if (isViewGrid) {}


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------

	searchOptions();

	// will be changed to a different page...
	if ( elBody.classList.contains('page_prod-dept') ) {
		modalToggle();
	}

	if (isProdIndv) {
		selectDropdown();
	}

	if (isQuantityForm) {
		quantityAdjust();
	}

	if (isCartCheckout) {
		removeItem();
	}

	// initialize smoothScroll plugin
	smoothScroll.init({
		speed: 400,
		easing: 'easeInOutQuint',
		updateURL: false
	});


}, false);