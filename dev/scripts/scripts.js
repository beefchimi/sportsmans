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


/*
	// may move this to its own function...
	var elCartForm = document.getElementById('cart_form');

	// check if #cart_form exists
	if ( typeof(elCartForm) != 'undefined' && elCartForm != null ) {
		var numTaxPercent = parseFloat( elCartForm.getAttribute('data-tax') ) / 100;
	}
*/


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
/*
	function searchOptions() {

		// not on board with the functionality of this...
		// would LOVE to suggest an alternative...

		var elSearchInput            = document.getElementById('search_text'),
			elSearchOptionsToggle    = document.getElementById('toggle_search-options'),
			elSearchCheckbox         = document.getElementById('search_checkbox'),
			elSearchCheckboxLabel    = elSearchCheckbox.nextElementSibling,
			originalInputPlaceholder = elSearchInput.getAttribute('data-placeholder'),
			originalCheckboxLabel    = elSearchCheckboxLabel.innerHTML;

		elSearchOptionsToggle.addEventListener('click', function(e) {

			this.classList.toggle('toggled');

			e.preventDefault();

		}, false);

		elSearchCheckbox.addEventListener('change', function() {

			// remove 'toggled' class from #toggle_search-options
			elSearchOptionsToggle.classList.remove('toggled');

			if (elSearchCheckbox.checked) {

				// if #search_checkbox is now :checked
				elSearchInput.setAttribute('placeholder', 'Search All Departments');
				elSearchCheckboxLabel.innerHTML = originalInputPlaceholder;

			} else {

				// otherwise, if #search_checkbox is no longer :checked
				elSearchInput.setAttribute('placeholder', originalInputPlaceholder);
				elSearchCheckboxLabel.innerHTML = originalCheckboxLabel;

			}

		}, false);

	}
*/


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

			var thisDropdownLabel = thisDropdownArticle.getElementsByTagName('h6')[0];
			// var thisParentArticle = thisDropdownLabel.parentNode;

			thisDropdownLabel.addEventListener('click', function(e) {

				// run through each dropdown article...
				for (var i = 0; i < arrDropdownArticle.length; i++) {

					// and if this is NOT the parent dropdown we have clicked on...
					if (arrDropdownArticle[i] != this.parentNode) {
						arrDropdownArticle[i].classList.remove('toggled'); // remove the 'toggled' class
					}

				}

				// allow for class toggling on the clicked dropdown
				thisDropdownArticle.classList.toggle('toggled');

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
			// var arrSelectOptions = elDropdownForm.getElementsByTagName('option');

			// assign the click event to each .dropdown_link found in the form.has-dropdown
			for (var i = 0; i < arrDropdownLinks.length; i++) {
				filterChange(arrDropdownLinks[i]);
			}

			function filterChange(thisDropdownLink) {

				thisDropdownLink.addEventListener('click', function(e) {

					// NEED TO HANDLE CLEARING THE SELECTED OPTION
					// AS WELL AS FINISH SELECTED STYLING

					var dataValue       = this.getAttribute('data-value'),
						dataLabel       = this.childNodes[1].innerHTML, // first child is an empty text node
						elParentList    = this.parentNode,
						elSiblingLabel  = elParentList.parentNode.previousElementSibling,
						elParentArticle = elSiblingLabel.parentNode,
						elMatchedOption = elParentArticle.querySelector('[value="' + dataValue + '"]');

					// NEED TO KNOW HOW FORM IS SUBMITTED / VALUES UPDATED...
					// WILL THE PAGE BE REFRESHED OR IS IT DONE WITHOUT?
					// 'selected' CLASS WILL NEED TO BE REMOVED FROM A PREVIOUS OPTION DEPENDING
					// div.wrap_select NEEDS TO UPDATE 'data-select' VALUE (none / chosen)

					elMatchedOption.selected = true;

					// add selected class to parent <li>
					elParentList.classList.add('selected');

					// replace h6.dropdown_label innerHTML with the selected option text
					elSiblingLabel.innerHTML = dataLabel;

					// remove 'toggled' class from parent article
					elParentArticle.classList.remove('toggled');

					// TEMP: log the selected data-value and matched <option> to inspect
					console.log('selected data-value: "' + dataValue + '", followed by matched <option>:');
					console.log(elMatchedOption);

					// TEST: need to verify everything is working as expected
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

		var elGallery        = document.getElementById('gallery_slider'),
			arrSlides        = elGallery.getElementsByTagName('li'),
			arrThumbs        = document.getElementsByClassName('link_slide'),
			numCurrentSlide  = 1,
			numSlideMin      = 1,
			numSlideMax      = arrSlides.length,
			elSlidePrev      = document.getElementById('gallery_prev'),
			elSlideNext      = document.getElementById('gallery_next');

/*
		var numSlideWidth    = 270, // arrSlides[0].offsetWidth,
			numGalleryWidth  = numSlideMax * numSlideWidth,
			numGalleryMargin = 0;

		// set gallery <ul> width to the sum of each <li> width
		// elGallery.style.width = numGalleryWidth + 'px';
*/

		// assign click to each a.link_slide
		for (var i = 0; i < arrThumbs.length; i++) {
			galleryThumbs(arrThumbs[i]);
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

		function galleryThumbs(thisThumb) {

			thisThumb.addEventListener('click', function(e) {

				numCurrentSlide = this.getAttribute('data-thumb');

				adjustSlider();
				e.preventDefault();

			}, false);

		}

		function adjustSlider() {

			// numGalleryMargin = numCurrentSlide * numSlideWidth - numSlideWidth;
			// elGallery.style.marginLeft = '-' + numGalleryMargin + 'px';
			elGallery.setAttribute('data-slide', numCurrentSlide);

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
	}

	if (isProdDisp) {
		gallerySlider();
		modalToggle();
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