document.addEventListener('DOMContentLoaded', function() {


	// Global Variables
	// ----------------------------------------------------------------------------

	// --- Objects and Initial Setup --- \\

	// common objects
	var elBody       = document.body;


	// onPageLoad: Main Function To Fire on Window Load
	// ----------------------------------------------------------------------------
/*
	function onPageLoad() {
	}
*/


	// selectReplace: Replace <select> elements for styling
	// ----------------------------------------------------------------------------
	function selectReplace() {

		var filterLabel = document.querySelectorAll('.filter_label');

		for (var i = 0; i < filterLabel.length; i++) {
			dropdownToggle(filterLabel[i]);
		}


		// function for toggling dropdowns
		function dropdownToggle(currentTarget) {

			currentTarget.addEventListener('click', function(e) {

/*
				if (this.className == 'active') {
					this.className = '';
				} else {
					this.className = 'active';
				}
*/

				this.classList.toggle('toggled');

				e.preventDefault();

			}, false);

		}


	}


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------


	// onPageLoad();

	selectReplace();


/*
	// smoothScroll();
	smoothScroll.init({
		speed: 400,
		easing: 'easeInOutQuint',
		updateURL: false
	});
*/


}, false);