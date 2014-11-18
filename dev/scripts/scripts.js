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