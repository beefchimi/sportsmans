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

			// only if on a checkout page
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

			// only if on a checkout page
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

		// cart-checkout only: find the target TR and remove it
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

			// moved emptyCartMessage from here

			cycleParentCloseModal(this);

			e.preventDefault();

		}

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

		var elFilterForm   = document.getElementById('filter_form');

		// check if #filter_form does not exists
		if (elFilterForm == null) {
			return;
		}

		// #filter_form exists, so lets grab all of the filter labels
		var arrFilterLabel = elFilterForm.querySelectorAll('.filter_label');

		// assign the click event to each .filter_label found in the filterForm
		for (var i = 0; i < arrFilterLabel.length; i++) {
			dropdownToggle(arrFilterLabel[i]);
		}

		// function for toggling dropdowns
		function dropdownToggle(thisFilterLabel) {

			// need to consider the fact that this is a touch enabled device...
			// typically, the dropdowns should close on "click outside" of 'this'...
			// but user scrolling could trigger a dropdown close, which may not be ideal (requires testing)
			thisFilterLabel.addEventListener('click', function(e) {

				// run through each filterLabel...
				for (var i = 0; i < arrFilterLabel.length; i++) {

					// and if this is NOT the dropdown we have clicked on...
					if ( arrFilterLabel[i] != thisFilterLabel ) {
						arrFilterLabel[i].classList.remove('toggled'); // remove the 'toggled' class
					}

				}

				// allow for class toggling on the clicked dropdown
				this.classList.toggle('toggled');

				e.preventDefault();

			}, false);

		}

		// function for passing <ul> values to the corresponding <select>
		function passSelectValue() {

			var arrDropdownLinks = elFilterForm.querySelectorAll('.dropdown_link');
			// var arrSelectOptions = elFilterForm.getElementsByTagName('option');

			// assign the click event to each .dropdown_link found in the filterForm
			for (var i = 0; i < arrDropdownLinks.length; i++) {
				filterChange(arrDropdownLinks[i]);
			}

			function filterChange(thisDropdownLink) {

				thisDropdownLink.addEventListener('click', function(e) {

					// http://stackoverflow.com/questions/7373058/how-to-change-the-selected-option-of-html-select-element

					var selectedValue = this.getAttribute('data-value');

					// toggle selected class

					console.log(selectedValue);

					var matchedOption = elFilterForm.querySelector('[value="' + selectedValue + '"]');

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

		var arrQuantityInput = document.querySelectorAll('.adjust_number');

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

			// if clicking the 'minus' button
			elQuantityDecrease.addEventListener('click', function(e) {

				// currently not allowed to be set to 0...
				// removing an item can only be achieved by using the 'remove' link
				// since there is no 'update cart' button, this seems like the logical approach

				// as long as thisQuantityInput value is greater than the allowed minimun, decrement value
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

	if (isProdIndv) {
		selectDropdown();
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