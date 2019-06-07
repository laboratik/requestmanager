(function(root, globalName) {
	function RequestManager() {
		var currentUrl;
		Object.defineProperty(this, 'currentUrl', {
			get: function() {
				return this.checkCurrentUrl(document.location.href);
			},
			set: function(url) {
				return this.checkCurrentUrl(url);
			}
		});
		//function to check if url is to be checked
		//validates if the url is either third party or whitelisted/blacklisted
		//returns boolean
		this.validateUrl = function validateUrl(url) {
			if (!!!url) {
				return false;
			}
			//relative urls are not third parties
			if (url.indexOf('http') == 0) {
				var thisUrlDetails = this.parseUri(url);
				var thisUrlTLD = thisUrlDetails.tld;
				//check if it is a third party url
				if ((this.currentUrl.tld != thisUrlTLD && this.whitelistDomains.indexOf(thisUrlTLD) == -1) || this.blacklistDomains.indexOf(thisUrlDetails.host) > -1) {
					//top level domains do not match... should sanitize
					return true;
				}
			}
			return false;
		};

		//function to handle the checking of url's for dom elements created with javascript
		this.checkUrl = function checkUrl(url) {
			if (this.validateUrl(url)) {
				url = this.sanitizeUrl(url);
			}
			return url;
		};
		this.intercept = function intercept() {
			this.interceptDOM();
			this.interceptXHR();
			this.interceptFetch();
			this.interceptSendBeacon();
		};
		this.restore = function restore() {
			this.restoreDOM();
			this.restoreXHR();
			this.restoreFetch();
			this.restoreSendBeacon();
		};
	}
	var rmproto = RequestManager.prototype;
	rmproto.whitelistKeys = [];
	rmproto.whitelistDomains = [];
	rmproto.blacklistDomains = [];
	rmproto.checkCurrentUrl = function checkCurrentUrl(url) {
		if (!!url) {
			url = this.parseUri(url);
		}
		var outArray = (urlQSArray = hashArray = []);
		//create array of qs parameter/value combos
		!!url.query && (urlQSArray = url.query.split('&'));
		//create array of hash parameter/value combos
		var hash = !!url.anchor ? url.anchor.split('?')[1] : undefined;
		!!hash && hash.length > 0 && hash.indexOf('=') > -1 && (hashArray = hash.split('&'));
		//create a new array with all paramters from qs and hash
		outArray = [].concat(urlQSArray, hashArray);

		//apply the whitelisting on keys
		this.whitelistKeys = this.whitelistKeys || [];
		var newQSList = [];
		for (var index = 0; index < outArray.length; index++) {
			var element = outArray[index];
			if (!!element && element.indexOf('=') > -1) {
				var key = element.replace(/=.*/, '');
				if (this.whitelistKeys.indexOf(key) == -1) {
					newQSList.push(element);
					//add the encoded equivalent also
					newQSList.push(encodeURIComponent(element));
				}
			}
		}
		outArray = newQSList;

		//expose the list
		url.qslist = !!outArray && outArray.length > 0 ? outArray : undefined;
		//construct the regex to use for sanitizing
		var qstring = !!outArray ? '(' + outArray.join('|') + ')' : undefined;
		url.qsrx = !!qstring && qstring != '(|)' && qstring != '()' ? new RegExp(qstring, 'gmi') : undefined;
		return url;
	};
	//function to parse a url into the different components
	rmproto.parseUri = function parseUri(str) {
		var key = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'];
		var m = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(
				str
			),
			uri = {},
			i = 14;
		while (i--) uri[key[i]] = m[i] || '';
		uri['qs'] = {};
		uri['query'].replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
			if ($1) uri['qs'][$1] = $2;
		});
		uri.tld = (function(h) {
			h = !!h ? h.split('.') : [];
			if (h.length > 2) {
				h = [h[h.length - 2], h[h.length - 1]];
			}
			return h.join('.');
		})(uri.host);
		return uri;
	};
	//function removing the qs data from the given url
	rmproto.sanitizeUrl = function sanitizeUrl(url) {
		var outurl = url;
		var regx = this.currentUrl.qsrx;
		if (!!!url) {
			return url;
		}
		if (!!regx) {
			//use the earlier created regex in the replace function.
			// the replace function will execute for every matched key/value pair
			// and will replace the value with an x
			outurl = url.replace(regx, function sanitizeReplace() {
				var value = arguments[0];
				value = value.split(/(%3D|=)/);
				//strip the value, this should be the third part in the array
				value.length == 3 && value.pop();
				//add the placeholder
				value.push('x');
				//reconstruct the value to use as replacement and return it
				value = value.join('');
				return value;
			});
		}

		return outurl;
	};

	//start DOM element handling
	rmproto.interceptDOM = function interceptDOM() {
		//keep reference to the requestmanager 'this' to avoid additional closure creation
		var that = this;
		//check if allready instrumented
		if (!!rmproto._interceptDOM) {
			return true;
		}
		var _interceptDOM = {};
		var DOMELEMENTS = ['HTMLImageElement', 'HTMLIFrameElement', 'HTMLScriptElement'];
		for (var index = 0; index < DOMELEMENTS.length; index++) {
			var element = DOMELEMENTS[index];
			//store the original descriptors so that we can revert back if needed
			_interceptDOM[element] = Object.getOwnPropertyDescriptor(window[element].prototype, 'src');
			//redefine the setter to make sure the url can be filtered
			Object.defineProperty(window[element].prototype, 'src', {
				configurable: true,
				set: srcHandler
			});
		}

		// this is the actual logic to handle the url filtering
		function srcHandler(src) {
			//that refers to the instance of the requestmanager, stored in this closure
			//checkurl will apply the filtering on the url
			var url = that.checkUrl(src);
			//if there is a valid url returned then we set it
			!!url && this.setAttribute('src', url);
		}
		//store the original descriptors on our prototype for later reference
		rmproto._interceptDOM = _interceptDOM;
		return this;
	};
	rmproto.restoreDOM = function restoreDOM() {
		if (!!rmproto._interceptDOM) {
			//loop over the original dom decriptors and set them
			for (var key in rmproto._interceptDOM) {
				if (rmproto._interceptDOM.hasOwnProperty(key)) {
					var element = rmproto._interceptDOM[key];
					Object.defineProperty(window[key].prototype, 'src', element);
				}
			}
		}
	};
	//end DOM element handling
	//start Fetch handling
	rmproto.interceptFetch = function interceptFetch() {
		var that = this;
		if (!('fetch' in window && typeof window.fetch == 'function') || !!this._fetch) {
			//stop when fetch not supported or allready instrumented
			return false;
		}
		rmproto._fetch = window.fetch;
		window.fetch = function interceptFetch(url, options) {
			if (!!url) {
				url = that.checkUrl(url);
			}
			return that._fetch.apply(this, [url, options]);
		};
	};
	rmproto.restoreFetch = function restoreFetch() {
		window.fetch = this._fetch;
	};
	//end Fetch handling
	//start sendBeacon handling
	rmproto.interceptSendBeacon = function interceptSendBeacon() {
		if (!(!!window.navigator && !!window.navigator.sendBeacon && typeof window.navigator.sendBeacon == 'function') || !!this._navigatorSendBeacon) {
			//stop when api not available or already instrumented
			return false;
		}
		var that = this;
		rmproto._navigatorSendBeacon = window.navigator.sendBeacon;
		window.navigator.sendBeacon = function interceptNavigatorSendBeacon(url, data) {
			if (!!url) {
				url = that.checkUrl(url);
			}
			return that._navigatorSendBeacon.apply(this, [url, data]);
		};
	};
	rmproto.restoreSendBeacon = function restoreBeacon() {
		!!this._navigatorSendBeacon && (window.navigator.sendBeacon = this._navigatorSendBeacon);
	};
	//end sendBeacon handling
	//start XHR handling
	rmproto.interceptXHR = function interceptXHR(urlmatch, callback, once) {
		var that = this;
		//store the native functions for later
		rmproto._XHROpen = XMLHttpRequest.prototype.open;
		rmproto._XHRSend = XMLHttpRequest.prototype.send;

		//instrument the open function to sanitize the url before 'opening'
		XMLHttpRequest.prototype.open = function interceptOpen(method, url, async, user, password) {
			// Default value of async is true, sync setting will be deprecated in the  near future, removes the error in devtools
			if (async === undefined) {
				async = true;
			}
			//check the url
			if (!!url) {
				this._originalUrl = url;
				url = that.checkUrl(url);
			}
			//execute the native function
			that._XHROpen.apply(this, [method, url, async, user, password]);
		};
		//instrument the open function to sanitize the url before 'opening'
		XMLHttpRequest.prototype.send = function interceptSend(body) {
			var url = this.responseURL || this._originalUrl;
			//only check string based payload
			if (!!body && typeof body == 'string' && !!url) {
				//only for the domains to check
				if (that.validateUrl(url)) {
					//check the data
					body = that.sanitizeUrl(body);
				}
			}
			//execute the native function
			that._XHRSend.apply(this, [body]);
		};
	};
	rmproto.restoreXHR = function restoreXHR() {
		!!this._XHROpen && (XMLHttpRequest.prototype.open = this._XHROpen);
		!!this._XHRSend && (XMLHttpRequest.prototype.send = this._XHRSend);
	};
	//end XHR handling
	// initialise and make it a global (singleton)
	//the globalName variable allows to use your own variable as a global
	globalName = globalName || '_rqmgr';
	window[globalName] = new RequestManager();
})(window, '_rqmgr');
