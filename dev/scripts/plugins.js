// smooth-scroll v5.2.0 | copyright Chris Ferdinandi | http://github.com/cferdinandi/smooth-scroll | Licensed under MIT: http://gomakethings.com/mit/
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
		var anchorElem = document.querySelector(anchor);
		var fixedHeader = document.querySelector('[data-scroll-header]'); // Get the fixed header
		var headerHeight = fixedHeader === null ? 0 : (fixedHeader.offsetHeight + fixedHeader.offsetTop); // Get the height of a fixed header if one exists
		var startLocation = root.pageYOffset; // Current location on the page
		var endLocation = getEndLocation( anchorElem, headerHeight, parseInt(settings.offset, 10) ); // Scroll to location
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
				anchorElem.focus();
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



// formatter.js v0.1.5 | copyright 2014 First Opinion | https://github.com/firstopinion/formatter.js | Licensed under MIT: http://gomakethings.com/mit/
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.returnExportsGlobal = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Formatter'] = factory();
  }
}(this, function () {


/*
 * pattern.js
 *
 * Utilities to parse str pattern and return info
 *
 */
var pattern = function () {
    // Define module
    var pattern = {};
    // Match information
    var DELIM_SIZE = 4;
    // Our regex used to parse
    var regexp = new RegExp('{{([^}]+)}}', 'g');
    //
    // Helper method to parse pattern str
    //
    var getMatches = function (pattern) {
      // Populate array of matches
      var matches = [], match;
      while (match = regexp.exec(pattern)) {
        matches.push(match);
      }
      return matches;
    };
    //
    // Create an object holding all formatted characters
    // with corresponding positions
    //
    pattern.parse = function (pattern) {
      // Our obj to populate
      var info = {
          inpts: {},
          chars: {}
        };
      // Pattern information
      var matches = getMatches(pattern), pLength = pattern.length;
      // Counters
      var mCount = 0, iCount = 0, i = 0;
      // Add inpts, move to end of match, and process
      var processMatch = function (val) {
        var valLength = val.length;
        for (var j = 0; j < valLength; j++) {
          info.inpts[iCount] = val.charAt(j);
          iCount++;
        }
        mCount++;
        i += val.length + DELIM_SIZE - 1;
      };
      // Process match or add chars
      for (i; i < pLength; i++) {
        if (mCount < matches.length && i === matches[mCount].index) {
          processMatch(matches[mCount][1]);
        } else {
          info.chars[i - mCount * DELIM_SIZE] = pattern.charAt(i);
        }
      }
      // Set mLength and return
      info.mLength = i - mCount * DELIM_SIZE;
      return info;
    };
    // Expose
    return pattern;
  }();
/*
 * utils.js
 *
 * Independent helper methods (cross browser, etc..)
 *
 */
var utils = function () {
    // Define module
    var utils = {};
    // Useragent info for keycode handling
    var uAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
    //
    // Shallow copy properties from n objects to destObj
    //
    utils.extend = function (destObj) {
      for (var i = 1; i < arguments.length; i++) {
        for (var key in arguments[i]) {
          destObj[key] = arguments[i][key];
        }
      }
      return destObj;
    };
    //
    // Add a given character to a string at a defined pos
    //
    utils.addChars = function (str, chars, pos) {
      return str.substr(0, pos) + chars + str.substr(pos, str.length);
    };
    //
    // Remove a span of characters
    //
    utils.removeChars = function (str, start, end) {
      return str.substr(0, start) + str.substr(end, str.length);
    };
    //
    // Return true/false is num false between bounds
    //
    utils.isBetween = function (num, bounds) {
      bounds.sort(function (a, b) {
        return a - b;
      });
      return num > bounds[0] && num < bounds[1];
    };
    //
    // Helper method for cross browser event listeners
    //
    utils.addListener = function (el, evt, handler) {
      return typeof el.addEventListener !== 'undefined' ? el.addEventListener(evt, handler, false) : el.attachEvent('on' + evt, handler);
    };
    //
    // Helper method for cross browser implementation of preventDefault
    //
    utils.preventDefault = function (evt) {
      return evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
    };
    //
    // Helper method for cross browser implementation for grabbing
    // clipboard data
    //
    utils.getClip = function (evt) {
      if (evt.clipboardData) {
        return evt.clipboardData.getData('Text');
      }
      if (window.clipboardData) {
        return window.clipboardData.getData('Text');
      }
    };
    //
    // Loop over object and checking for matching properties
    //
    utils.getMatchingKey = function (which, keyCode, keys) {
      // Loop over and return if matched.
      for (var k in keys) {
        var key = keys[k];
        if (which === key.which && keyCode === key.keyCode) {
          return k;
        }
      }
    };
    //
    // Returns true/false if k is a del keyDown
    //
    utils.isDelKeyDown = function (which, keyCode) {
      var keys = {
          'backspace': {
            'which': 8,
            'keyCode': 8
          },
          'delete': {
            'which': 46,
            'keyCode': 46
          }
        };
      return utils.getMatchingKey(which, keyCode, keys);
    };
    //
    // Returns true/false if k is a del keyPress
    //
    utils.isDelKeyPress = function (which, keyCode) {
      var keys = {
          'backspace': {
            'which': 8,
            'keyCode': 8,
            'shiftKey': false
          },
          'delete': {
            'which': 0,
            'keyCode': 46
          }
        };
      return utils.getMatchingKey(which, keyCode, keys);
    };
    // //
    // // Determine if keydown relates to specialKey
    // //
    // utils.isSpecialKeyDown = function (which, keyCode) {
    //   var keys = {
    //     'tab': { 'which': 9, 'keyCode': 9 },
    //     'enter': { 'which': 13, 'keyCode': 13 },
    //     'end': { 'which': 35, 'keyCode': 35 },
    //     'home': { 'which': 36, 'keyCode': 36 },
    //     'leftarrow': { 'which': 37, 'keyCode': 37 },
    //     'uparrow': { 'which': 38, 'keyCode': 38 },
    //     'rightarrow': { 'which': 39, 'keyCode': 39 },
    //     'downarrow': { 'which': 40, 'keyCode': 40 },
    //     'F5': { 'which': 116, 'keyCode': 116 }
    //   };
    //   return utils.getMatchingKey(which, keyCode, keys);
    // };
    //
    // Determine if keypress relates to specialKey
    //
    utils.isSpecialKeyPress = function (which, keyCode) {
      var keys = {
          'tab': {
            'which': 0,
            'keyCode': 9
          },
          'enter': {
            'which': 13,
            'keyCode': 13
          },
          'end': {
            'which': 0,
            'keyCode': 35
          },
          'home': {
            'which': 0,
            'keyCode': 36
          },
          'leftarrow': {
            'which': 0,
            'keyCode': 37
          },
          'uparrow': {
            'which': 0,
            'keyCode': 38
          },
          'rightarrow': {
            'which': 0,
            'keyCode': 39
          },
          'downarrow': {
            'which': 0,
            'keyCode': 40
          },
          'F5': {
            'which': 116,
            'keyCode': 116
          }
        };
      return utils.getMatchingKey(which, keyCode, keys);
    };
    //
    // Returns true/false if modifier key is held down
    //
    utils.isModifier = function (evt) {
      return evt.ctrlKey || evt.altKey || evt.metaKey;
    };
    //
    // Iterates over each property of object or array.
    //
    utils.forEach = function (collection, callback, thisArg) {
      if (collection.hasOwnProperty('length')) {
        for (var index = 0, len = collection.length; index < len; index++) {
          if (callback.call(thisArg, collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        for (var key in collection) {
          if (collection.hasOwnProperty(key)) {
            if (callback.call(thisArg, collection[key], key, collection) === false) {
              break;
            }
          }
        }
      }
    };
    // Expose
    return utils;
  }();
/*
* pattern-matcher.js
*
* Parses a pattern specification and determines appropriate pattern for an
* input string
*
*/
var patternMatcher = function (pattern, utils) {
    //
    // Parse a matcher string into a RegExp. Accepts valid regular
    // expressions and the catchall '*'.
    // @private
    //
    var parseMatcher = function (matcher) {
      if (matcher === '*') {
        return /.*/;
      }
      return new RegExp(matcher);
    };
    //
    // Parse a pattern spec and return a function that returns a pattern
    // based on user input. The first matching pattern will be chosen.
    // Pattern spec format:
    // Array [
    //  Object: { Matcher(RegExp String) : Pattern(Pattern String) },
    //  ...
    // ]
    function patternMatcher(patternSpec) {
      var matchers = [], patterns = [];
      // Iterate over each pattern in order.
      utils.forEach(patternSpec, function (patternMatcher) {
        // Process single property object to obtain pattern and matcher.
        utils.forEach(patternMatcher, function (patternStr, matcherStr) {
          var parsedPattern = pattern.parse(patternStr), regExpMatcher = parseMatcher(matcherStr);
          matchers.push(regExpMatcher);
          patterns.push(parsedPattern);
          // Stop after one iteration.
          return false;
        });
      });
      var getPattern = function (input) {
        var matchedIndex;
        utils.forEach(matchers, function (matcher, index) {
          if (matcher.test(input)) {
            matchedIndex = index;
            return false;
          }
        });
        return matchedIndex === undefined ? null : patterns[matchedIndex];
      };
      return {
        getPattern: getPattern,
        patterns: patterns,
        matchers: matchers
      };
    }
    // Expose
    return patternMatcher;
  }(pattern, utils);
/*
 * inpt-sel.js
 *
 * Cross browser implementation to get and set input selections
 *
 */
var inptSel = function () {
    // Define module
    var inptSel = {};
    //
    // Get begin and end positions of selected input. Return 0's
    // if there is no selectiion data
    //
    inptSel.get = function (el) {
      // If normal browser return with result
      if (typeof el.selectionStart === 'number') {
        return {
          begin: el.selectionStart,
          end: el.selectionEnd
        };
      }
      // Uh-Oh. We must be IE. Fun with TextRange!!
      var range = document.selection.createRange();
      // Determine if there is a selection
      if (range && range.parentElement() === el) {
        var inputRange = el.createTextRange(), endRange = el.createTextRange(), length = el.value.length;
        // Create a working TextRange for the input selection
        inputRange.moveToBookmark(range.getBookmark());
        // Move endRange begin pos to end pos (hence endRange)
        endRange.collapse(false);
        // If we are at the very end of the input, begin and end
        // must both be the length of the el.value
        if (inputRange.compareEndPoints('StartToEnd', endRange) > -1) {
          return {
            begin: length,
            end: length
          };
        }
        // Note: moveStart usually returns the units moved, which
        // one may think is -length, however, it will stop when it
        // gets to the begin of the range, thus giving us the
        // negative value of the pos.
        return {
          begin: -inputRange.moveStart('character', -length),
          end: -inputRange.moveEnd('character', -length)
        };
      }
      //Return 0's on no selection data
      return {
        begin: 0,
        end: 0
      };
    };
    //
    // Set the caret position at a specified location
    //
    inptSel.set = function (el, pos) {
      // Normalize pos
      if (typeof pos !== 'object') {
        pos = {
          begin: pos,
          end: pos
        };
      }
      // If normal browser
      if (el.setSelectionRange) {
        el.focus();
        el.setSelectionRange(pos.begin, pos.end);
      } else if (el.createTextRange) {
        var range = el.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos.end);
        range.moveStart('character', pos.begin);
        range.select();
      }
    };
    // Expose
    return inptSel;
  }();
/*
 * formatter.js
 *
 * Class used to format input based on passed pattern
 *
 */
var formatter = function (patternMatcher, inptSel, utils) {
    // Defaults
    var defaults = {
        persistent: false,
        repeat: false,
        placeholder: ' '
      };
    // Regexs for input validation
    var inptRegs = {
        '9': /[0-9]/,
        'a': /[A-Za-z]/,
        '*': /[A-Za-z0-9]/
      };
    //
    // Class Constructor - Called with new Formatter(el, opts)
    // Responsible for setting up required instance variables, and
    // attaching the event listener to the element.
    //
    function Formatter(el, opts) {
      // Cache this
      var self = this;
      // Make sure we have an element. Make accesible to instance
      self.el = el;
      if (!self.el) {
        throw new TypeError('Must provide an existing element');
      }
      // Merge opts with defaults
      self.opts = utils.extend({}, defaults, opts);
      // 1 pattern is special case
      if (typeof self.opts.pattern !== 'undefined') {
        self.opts.patterns = self._specFromSinglePattern(self.opts.pattern);
        delete self.opts.pattern;
      }
      // Make sure we have valid opts
      if (typeof self.opts.patterns === 'undefined') {
        throw new TypeError('Must provide a pattern or array of patterns');
      }
      self.patternMatcher = patternMatcher(self.opts.patterns);
      // Upate pattern with initial value
      self._updatePattern();
      // Init values
      self.hldrs = {};
      self.focus = 0;
      // Add Listeners
      utils.addListener(self.el, 'keydown', function (evt) {
        self._keyDown(evt);
      });
      utils.addListener(self.el, 'keypress', function (evt) {
        self._keyPress(evt);
      });
      utils.addListener(self.el, 'paste', function (evt) {
        self._paste(evt);
      });
      // Persistence
      if (self.opts.persistent) {
        // Format on start
        self._processKey('', false);
        self.el.blur();
        // Add Listeners
        utils.addListener(self.el, 'focus', function (evt) {
          self._focus(evt);
        });
        utils.addListener(self.el, 'click', function (evt) {
          self._focus(evt);
        });
        utils.addListener(self.el, 'touchstart', function (evt) {
          self._focus(evt);
        });
      }
    }
    //
    // @public
    // Add new char
    //
    Formatter.addInptType = function (chr, reg) {
      inptRegs[chr] = reg;
    };
    //
    // @public
    // Apply the given pattern to the current input without moving caret.
    //
    Formatter.prototype.resetPattern = function (str) {
      // Update opts to hold new pattern
      this.opts.patterns = str ? this._specFromSinglePattern(str) : this.opts.patterns;
      // Get current state
      this.sel = inptSel.get(this.el);
      this.val = this.el.value;
      // Init values
      this.delta = 0;
      // Remove all formatted chars from val
      this._removeChars();
      this.patternMatcher = patternMatcher(this.opts.patterns);
      // Update pattern
      var newPattern = this.patternMatcher.getPattern(this.val);
      this.mLength = newPattern.mLength;
      this.chars = newPattern.chars;
      this.inpts = newPattern.inpts;
      // Format on start
      this._processKey('', false, true);
    };
    //
    // @private
    // Determine correct format pattern based on input val
    //
    Formatter.prototype._updatePattern = function () {
      // Determine appropriate pattern
      var newPattern = this.patternMatcher.getPattern(this.val);
      // Only update the pattern if there is an appropriate pattern for the value.
      // Otherwise, leave the current pattern (and likely delete the latest character.)
      if (newPattern) {
        // Get info about the given pattern
        this.mLength = newPattern.mLength;
        this.chars = newPattern.chars;
        this.inpts = newPattern.inpts;
      }
    };
    //
    // @private
    // Handler called on all keyDown strokes. All keys trigger
    // this handler. Only process delete keys.
    //
    Formatter.prototype._keyDown = function (evt) {
      // The first thing we need is the character code
      var k = evt.which || evt.keyCode;
      // If delete key
      if (k && utils.isDelKeyDown(evt.which, evt.keyCode)) {
        // Process the keyCode and prevent default
        this._processKey(null, k);
        return utils.preventDefault(evt);
      }
    };
    //
    // @private
    // Handler called on all keyPress strokes. Only processes
    // character keys (as long as no modifier key is in use).
    //
    Formatter.prototype._keyPress = function (evt) {
      // The first thing we need is the character code
      var k, isSpecial;
      // Mozilla will trigger on special keys and assign the the value 0
      // We want to use that 0 rather than the keyCode it assigns.
      k = evt.which || evt.keyCode;
      isSpecial = utils.isSpecialKeyPress(evt.which, evt.keyCode);
      // Process the keyCode and prevent default
      if (!utils.isDelKeyPress(evt.which, evt.keyCode) && !isSpecial && !utils.isModifier(evt)) {
        this._processKey(String.fromCharCode(k), false);
        return utils.preventDefault(evt);
      }
    };
    //
    // @private
    // Handler called on paste event.
    //
    Formatter.prototype._paste = function (evt) {
      // Process the clipboard paste and prevent default
      this._processKey(utils.getClip(evt), false);
      return utils.preventDefault(evt);
    };
    //
    // @private
    // Handle called on focus event.
    //
    Formatter.prototype._focus = function () {
      // Wrapped in timeout so that we can grab input selection
      var self = this;
      setTimeout(function () {
        // Grab selection
        var selection = inptSel.get(self.el);
        // Char check
        var isAfterStart = selection.end > self.focus, isFirstChar = selection.end === 0;
        // If clicked in front of start, refocus to start
        if (isAfterStart || isFirstChar) {
          inptSel.set(self.el, self.focus);
        }
      }, 0);
    };
    //
    // @private
    // Using the provided key information, alter el value.
    //
    Formatter.prototype._processKey = function (chars, delKey, ignoreCaret) {
      // Get current state
      this.sel = inptSel.get(this.el);
      this.val = this.el.value;
      // Init values
      this.delta = 0;
      // If chars were highlighted, we need to remove them
      if (this.sel.begin !== this.sel.end) {
        this.delta = -1 * Math.abs(this.sel.begin - this.sel.end);
        this.val = utils.removeChars(this.val, this.sel.begin, this.sel.end);
      } else if (delKey && delKey === 46) {
        this._delete();
      } else if (delKey && this.sel.begin - 1 >= 0) {
        // Always have a delta of at least -1 for the character being deleted.
        this.val = utils.removeChars(this.val, this.sel.end - 1, this.sel.end);
        this.delta -= 1;
      } else if (delKey) {
        return true;
      }
      // If the key is not a del key, it should convert to a str
      if (!delKey) {
        // Add char at position and increment delta
        this.val = utils.addChars(this.val, chars, this.sel.begin);
        this.delta += chars.length;
      }
      // Format el.value (also handles updating caret position)
      this._formatValue(ignoreCaret);
    };
    //
    // @private
    // Deletes the character in front of it
    //
    Formatter.prototype._delete = function () {
      // Adjust focus to make sure its not on a formatted char
      while (this.chars[this.sel.begin]) {
        this._nextPos();
      }
      // As long as we are not at the end
      if (this.sel.begin < this.val.length) {
        // We will simulate a delete by moving the caret to the next char
        // and then deleting
        this._nextPos();
        this.val = utils.removeChars(this.val, this.sel.end - 1, this.sel.end);
        this.delta = -1;
      }
    };
    //
    // @private
    // Quick helper method to move the caret to the next pos
    //
    Formatter.prototype._nextPos = function () {
      this.sel.end++;
      this.sel.begin++;
    };
    //
    // @private
    // Alter element value to display characters matching the provided
    // instance pattern. Also responsible for updating
    //
    Formatter.prototype._formatValue = function (ignoreCaret) {
      // Set caret pos
      this.newPos = this.sel.end + this.delta;
      // Remove all formatted chars from val
      this._removeChars();
      // Switch to first matching pattern based on val
      this._updatePattern();
      // Validate inputs
      this._validateInpts();
      // Add formatted characters
      this._addChars();
      // Set value and adhere to maxLength
      this.el.value = this.val.substr(0, this.mLength);
      // Set new caret position
      if (typeof ignoreCaret === 'undefined' || ignoreCaret === false) {
        inptSel.set(this.el, this.newPos);
      }
    };
    //
    // @private
    // Remove all formatted before and after a specified pos
    //
    Formatter.prototype._removeChars = function () {
      // Delta shouldn't include placeholders
      if (this.sel.end > this.focus) {
        this.delta += this.sel.end - this.focus;
      }
      // Account for shifts during removal
      var shift = 0;
      // Loop through all possible char positions
      for (var i = 0; i <= this.mLength; i++) {
        // Get transformed position
        var curChar = this.chars[i], curHldr = this.hldrs[i], pos = i + shift, val;
        // If after selection we need to account for delta
        pos = i >= this.sel.begin ? pos + this.delta : pos;
        val = this.val.charAt(pos);
        // Remove char and account for shift
        if (curChar && curChar === val || curHldr && curHldr === val) {
          this.val = utils.removeChars(this.val, pos, pos + 1);
          shift--;
        }
      }
      // All hldrs should be removed now
      this.hldrs = {};
      // Set focus to last character
      this.focus = this.val.length;
    };
    //
    // @private
    // Make sure all inpts are valid, else remove and update delta
    //
    Formatter.prototype._validateInpts = function () {
      // Loop over each char and validate
      for (var i = 0; i < this.val.length; i++) {
        // Get char inpt type
        var inptType = this.inpts[i];
        // Checks
        var isBadType = !inptRegs[inptType], isInvalid = !isBadType && !inptRegs[inptType].test(this.val.charAt(i)), inBounds = this.inpts[i];
        // Remove if incorrect and inbounds
        if ((isBadType || isInvalid) && inBounds) {
          this.val = utils.removeChars(this.val, i, i + 1);
          this.focusStart--;
          this.newPos--;
          this.delta--;
          i--;
        }
      }
    };
    //
    // @private
    // Loop over val and add formatted chars as necessary
    //
    Formatter.prototype._addChars = function () {
      if (this.opts.persistent) {
        // Loop over all possible characters
        for (var i = 0; i <= this.mLength; i++) {
          if (!this.val.charAt(i)) {
            // Add placeholder at pos
            this.val = utils.addChars(this.val, this.opts.placeholder, i);
            this.hldrs[i] = this.opts.placeholder;
          }
          this._addChar(i);
        }
        // Adjust focus to make sure its not on a formatted char
        while (this.chars[this.focus]) {
          this.focus++;
        }
      } else {
        // Avoid caching val.length, as they may change in _addChar.
        for (var j = 0; j <= this.val.length; j++) {
          // When moving backwards there are some race conditions where we
          // dont want to add the character
          if (this.delta <= 0 && j === this.focus) {
            return true;
          }
          // Place character in current position of the formatted string.
          this._addChar(j);
        }
      }
    };
    //
    // @private
    // Add formattted char at position
    //
    Formatter.prototype._addChar = function (i) {
      // If char exists at position
      var chr = this.chars[i];
      if (!chr) {
        return true;
      }
      // If chars are added in between the old pos and new pos
      // we need to increment pos and delta
      if (utils.isBetween(i, [
          this.sel.begin - 1,
          this.newPos + 1
        ])) {
        this.newPos++;
        this.delta++;
      }
      // If character added before focus, incr
      if (i <= this.focus) {
        this.focus++;
      }
      // Updateholder
      if (this.hldrs[i]) {
        delete this.hldrs[i];
        this.hldrs[i + 1] = this.opts.placeholder;
      }
      // Update value
      this.val = utils.addChars(this.val, chr, i);
    };
    //
    // @private
    // Create a patternSpec for passing into patternMatcher that
    // has exactly one catch all pattern.
    //
    Formatter.prototype._specFromSinglePattern = function (patternStr) {
      return [{ '*': patternStr }];
    };
    // Expose
    return Formatter;
  }(patternMatcher, inptSel, utils);


return formatter;


}));