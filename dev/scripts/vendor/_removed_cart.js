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
				elQuantityDecrease = thisQuantityInput.previousElementSibling,
				elQuantityIncrease = thisQuantityInput.nextElementSibling,
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

					if (isCartCheckout) {
						updateCart(thisID, thisValue);
					}

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

					if (isCartCheckout) {
						updateCart(thisID, thisValue);
					}

				}

				e.preventDefault();

			}, false);

			// if manually entering a value (using 'change' instead of 'input' to avoid firing as the user types)
			thisQuantityInput.addEventListener('change', function() {

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

		var elRowSelected   = document.getElementById('row_' + passed_thisID),
			numRowPrice     = parseFloat(elRowSelected.getElementsByClassName('wrap_price')[0].innerHTML).toFixed(2),
			numUpdatedTotal = passed_thisValue * numRowPrice;

		elRowSelected.getElementsByClassName('wrap_price')[1].innerHTML = numUpdatedTotal.toFixed(2);

		if (isCartCheckout) {
			calculateTotals();
		}

	}


	// calculateTotals: Add up the totals on the checkout page
	// ----------------------------------------------------------------------------
	function calculateTotals() {

		var arrTotalItems     = document.getElementsByClassName('product_total'),
			elTotalBeforeTax  = document.getElementById('cell_product-total').getElementsByClassName('wrap_price')[0],
			elTotalAfterTax   = document.getElementById('cell_order-total').getElementsByClassName('wrap_price')[0],
			elTaxValue        = document.getElementById('cell_tax').getElementsByClassName('wrap_price')[0],
			numTaxPercent     = parseFloat( document.getElementById('cart_form').getAttribute('data-tax') ) / 100,
			numTotalBeforeTax = 0,
			numTotalAfterTax  = 0,
			numTaxValue       = 0,
			numCalcTotal      = 0;

		for (var i = 0; i < arrTotalItems.length; i++) {
			numCalcTotal += parseFloat(arrTotalItems[i].getElementsByClassName('wrap_price')[0].innerHTML);
		}

		// assign the total before tax
		numTotalBeforeTax = numCalcTotal;

		// assign the tax amount
		numTaxValue = numCalcTotal * numTaxPercent;

		// add up price before tax with tax ammount
		numTotalAfterTax = numTotalBeforeTax + numTaxValue;

		// output calculated prices (2 decimal places)
		elTotalBeforeTax.innerHTML = numTotalBeforeTax.toFixed(2);
		elTaxValue.innerHTML = numTaxValue.toFixed(2);
		elTotalAfterTax.innerHTML = numTotalAfterTax.toFixed(2);

	}


	// removeItem: Remove a product row from the cart table
	// ----------------------------------------------------------------------------
	function removeItem() {

		var arrRemoveLink = document.querySelectorAll('.remove_this');

		// for each a.remove_link found on the cart page
		for (var i = 0; i < arrRemoveLink.length; i++) {
			updateTable(arrRemoveLink[i]);
		}

		function updateTable(thisRemoveLink) {

			thisRemoveLink.addEventListener('click', function(e) {

				var elDesiredParent = this.parentNode;

				// cycle upwards from the closest parent of the clicked element,
				// until we find the <tr> element (tag names must be uppercase)
				while (elDesiredParent.tagName != 'TR') {
					elDesiredParent = elDesiredParent.parentNode;
				}

				// get calculated height of table row
				var numRowHeight = elDesiredParent.offsetHeight;

				// get immediate children (TDs) of this row
				var arrRowCells = elDesiredParent.children;

				function beginAnimation() {

					// transition row opacity
					var fadeOut = elDesiredParent.animate([
						{opacity: '1'},
						{opacity: '0'}
					], 400);

					// once fadeOut transition has finished...
					fadeOut.onfinish = function(e) {

						elDesiredParent.style.opacity = 0; // .animate() will jump back to opacity: 1; otherwise
						arrRowCells[0].style.padding = 0; // remove padding on first table cell so height can be collapsed

						// empty out each table cell
						for (var i = 0; i < arrRowCells.length; i++) {
							arrRowCells[i].innerHTML = '';
						}

						// transition calculated row height to 0px
						var collapseHeight = elDesiredParent.animate([
							{height: numRowHeight + 'px'},
							{height: '0px'}
						], 320);

						// once collapseHeight transition has finished...
						collapseHeight.onfinish = function(e) {
							elDesiredParent.style.height = '0px'; // .animate() will jump back to original height otherwise
							elDesiredParent.remove(); // now safe to delete this node
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


	if (isQuantityForm) {
		quantityAdjust();
	}

	if (isCartCheckout) {
		removeItem();
	}