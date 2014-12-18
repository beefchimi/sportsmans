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

		window.addEventListener('scroll', function() {

			// instead of tracking the position of #product_grid:
			// we can safely assume that if the user has scrolled 560px, toggle the back-to-top link

			var numScrollPos = window.pageYOffset;

			// if we have scrolled to or past 560px AND header data-scrolled is not 'yes'
			if (numScrollPos >= 560 && elHeader.getAttribute('data-scrolled') == 'no') {
				elHeader.setAttribute('data-scrolled', 'yes'); // toggle button
			} else if (numScrollPos < 560 && elHeader.getAttribute('data-scrolled') == 'yes') {
				elHeader.setAttribute('data-scrolled', 'no'); // disable button
			}

		}, false);

	}


	// searchOptions: Toggle advanced options for the search input
	// ----------------------------------------------------------------------------
	function searchOptions() {

		var elSearchInput = document.getElementById('search_text');

		// check if input#search_text does not exist
		if (elSearchInput == null) {
			return;
		}

		// our input#search_text DOES exist...
		var elSearchCheckbox     = document.getElementById('search_checkbox'),
			dataInputPlaceholder = elSearchInput.getAttribute('data-placeholder');

		elSearchCheckbox.addEventListener('change', function() {

			if (elSearchCheckbox.checked) {
				elSearchInput.setAttribute('placeholder', 'Search All Departments'); // if #search_checkbox is now :checked
			} else {
				elSearchInput.setAttribute('placeholder', dataInputPlaceholder); // otherwise, if #search_checkbox is no longer :checked
			}

		}, false);

	}


	// modalToggle: Hide / Show Modals
	// ----------------------------------------------------------------------------
	function modalToggle() {

		// modals should really be created and appended to the DOM when needed...
		// preferably using createDocumentFragment()
		// will defer to TW as to what they would prefer to do

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

			var dataTargetModal = this.getAttribute('href').substring(1), // capture the href of the clicked element, remove the # prefix
				elTargetModal   = document.getElementById(dataTargetModal); // get the modal we need to open

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

			var dataTargetRow = this.getAttribute('href').substring(1),
				elTargetRow   = document.getElementById(dataTargetRow);

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

		// form.has-dropdown DOES exist, so lets grab all of the dropdown articles
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

						thisDropdownArticle.classList.toggle('toggled');

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
				arrScrollWrap[i].style.height = numMaxHeight + 'px';
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

		// form.has-dropdown DOES exist, so lets get the popout button / label
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

		// only define variables if this is a cart page
		if (isCartCheckout || isCartCSR) {

			var elButtonUpdate    = document.getElementById('button_update'),
				elButtonFinalize  = document.getElementById('button_finalize'),
				arrValuesOriginal = [],
				arrValuesNew      = [];

		}

		// for each input[type="number"] found on the cart page
		for (var i = 0; i < arrQuantityInput.length; i++) {
			quantityIncrements(arrQuantityInput[i], i);
		}

		function quantityIncrements(thisQuantityInput, thisIndex) {

			var thisID             = thisQuantityInput.getAttribute('name'),
				thisMin            = parseInt( thisQuantityInput.getAttribute('min') ),
				thisMax            = parseInt( thisQuantityInput.getAttribute('max') ),
				thisValue          = parseInt( thisQuantityInput.value ),
				elQuantityDecrease = thisQuantityInput.nextElementSibling,
				elQuantityIncrease = elQuantityDecrease.nextElementSibling,
				enteredValue;

			// if cart page, push captured quantity values to our arrays
			if (isCartCheckout || isCartCSR) {
				arrValuesOriginal.push(thisValue);
				arrValuesNew.push(thisValue);
			}

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

					elQuantityIncrease.classList.remove('disabled');

					compareValues();

				} else {

					this.classList.add('disabled');

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

					elQuantityDecrease.classList.remove('disabled');

					compareValues();

				} else {

					this.classList.add('disabled');

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

					compareValues();

				} else {

					thisValue = enteredValue;
					thisQuantityInput.value = thisValue; // only to accomodate situations where a user has entered a floating point number
					thisQuantityInput.setAttribute('value', thisValue);

					elQuantityDecrease.classList.remove('disabled');
					elQuantityIncrease.classList.remove('disabled');

					compareValues();

				}

			});

			// compare the updated values against the originals
			function compareValues() {

				// currently does not account for deleted rows...
				// but this may not matter - TW might require the cart to be updated after a removal anyways... will require their input

				if (isCartCheckout || isCartCSR) {

					arrValuesNew[thisIndex] = thisValue;

					var isSame = arrValuesOriginal.length == arrValuesNew.length && arrValuesOriginal.every(function(element, index) {
						return element === arrValuesNew[index];
					});

					if (isSame) {

						elButtonUpdate.classList.add('disabled');
						elButtonFinalize.classList.remove('disabled');

					} else {

						elButtonUpdate.classList.remove('disabled');
						elButtonFinalize.classList.add('disabled');

					}

				}

			}

		}

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


	// gallerySlider: PDP page gallery functions
	// ----------------------------------------------------------------------------
	function gallerySlider() {

		var elGallerySlider  = document.getElementById('gallery_slider');

		// check if ul.gallery_slider does not exist
		if (elGallerySlider == null) {
			return;
		}

		// ul.gallery does exist... so let's get our variables
		var elGalleryThumbs  = document.getElementById('gallery_thumbs'),
			arrSlides        = elGallerySlider.getElementsByTagName('li'),
			arrThumbs        = elGalleryThumbs.getElementsByTagName('li'),
			arrSlideLinks    = elGalleryThumbs.getElementsByTagName('a'),
			numCurrentSlide  = 1,
			numSlideMin      = 1,
			numSlideMax      = arrSlides.length,
			numThumbs        = arrThumbs.length,
			numVisibleThumbs = 5,
			elSlidePrev      = document.getElementById('gallery_prev'),
			elSlideNext      = document.getElementById('gallery_next');

		// iterate through each gallery_thumbs link
		for (var i = 0; i < arrSlideLinks.length; i++) {

			// if this is a image thumb, assign click event
			if ( arrSlideLinks[i].getAttribute('data-thumb') ) {
				galleryThumbs(arrSlideLinks[i]);
			}

		}

		// if the number of slide thumbs is greater than 5...
		if (numThumbs > numVisibleThumbs) {

			var numThumbWidth  = 84, // the width of each individual thumb
				numThumbMargin = 18, // the margin-right of each thumb (last LI has no margin)
				numComboWidth  = numThumbWidth + numThumbMargin, // add width and margin to get total width
				numTotalWidth  = numComboWidth * numThumbs - numThumbMargin, // final slide has 0 margin, so subtract 18 from the total width
				numCutOffInt   = numThumbs - numVisibleThumbs,
				numCutOffWidth = numCutOffInt * numComboWidth,
				numThreshold   = 2, // two is the magic number, was using: Math.ceil( numCutOffInt / 2 )
				theMath;

			// set the calculated width on the ul.gallery_slider
			elGalleryThumbs.style.width = numTotalWidth + 'px';

		}

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

			elGallerySlider.setAttribute('data-index', numCurrentSlide);

			// if the number of slide thumbs is greater than 5...
			if (numThumbs > numVisibleThumbs) {

				// we don't want to end up with a negative number, so we check if the current slide is >= the threshold
				if (numCurrentSlide >= numThreshold) {

					theMath = (numCurrentSlide - numThreshold) * numComboWidth;

					// then we make sure theMath doesn't exceed the allowed maximum -margin
					if (theMath <= numCutOffWidth) {
						elGalleryThumbs.style.marginLeft = '-' + theMath + 'px';
					} else {
						elGalleryThumbs.style.marginLeft = '-' + numCutOffWidth + 'px';
					}

				} else {

					elGalleryThumbs.style.marginLeft = '0px';

				}

			}

		}

	}


	// maskPhoneInput: Use formatter.js to force valid input on 'tel' inputs
	// ----------------------------------------------------------------------------
	function maskPhoneInput() {

		// makes the assumption that there can only be 1 'tel' input per page
		var elPhoneInput = document.querySelectorAll('input[type="tel"]')[0];

		// check if input[type="tel"] does not exist
		if (elPhoneInput == null) {
			return;
		}

		// our input[type="tel"] DOES exist..
		var formatted = new Formatter(elPhoneInput, {
			'pattern': '{{999}}-{{999}}-{{9999}}'
		});

	}


	// errorClose: Temporary function for closing the error alert
	// ----------------------------------------------------------------------------
	function errorClose() {

		var elErrorClose = document.getElementById('error_close');

		// check if #error_close does not exist
		if (elErrorClose == null) {
			return;
		}

		elErrorClose.addEventListener('click', function(e) {

			// remove the 'visible' class from aside.error_alert
			this.parentNode.parentNode.classList.remove('visible');

			e.preventDefault();

		});

	}


	// ageConfirm: Temporary function for displaying age confirm errors
	// ----------------------------------------------------------------------------
	function ageConfirm() {

		var elConfirmAge = document.getElementById('confirm_age');

		// check if #confirm_age does not exist
		if (elConfirmAge == null) {
			return;
		}

		var elCartForm       = document.getElementById('cart_form'),
			elAgeCheck       = document.getElementById('age_checkbox'),
			elButtonFinalize = document.getElementById('button_finalize'),
			scrollOptions    = {speed: 800, easing: 'easeInOutQuint', updateURL: false};

		elButtonFinalize.addEventListener('click', function(e) {

			if (elAgeCheck.checked) {
				// allow submission to go through
				console.log('life is good, let us continue');
			} else {
				// you have not checked the age confirm!
				elCartForm.classList.add('error_age');
				elButtonFinalize.classList.add('error_message');
				smoothScroll.animateScroll(null, '#confirm_age', scrollOptions);
				e.preventDefault();
			}

		});

		elAgeCheck.addEventListener('click', function() {

			elCartForm.classList.remove('error_age');
			elButtonFinalize.classList.remove('error_message');

		});

	}


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------

	// TEMP: will be changed to a different page...
	if ( elBody.classList.contains('page_prod-dept') ) {
		modalToggle();
	}

	if (isViewGrid) {
		backToTop();
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
		ageConfirm();
	}

	if (isCartCSR) {
		deleteOrder();
	}

	maskPhoneInput();
	errorClose();

	// initialize smoothScroll plugin
	smoothScroll.init({
		speed: 400,
		easing: 'easeInOutQuint',
		updateURL: false
	});


}, false);