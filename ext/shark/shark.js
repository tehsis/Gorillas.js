//Include the load.js mf (https://github.com/chriso/load.js)
/* Copyright (c) 2010 Chris O'Hara <cohara87@gmail.com>. MIT Licensed */
//Include the chain.js microframework (http://github.com/chriso/chain.js)
(function(a){a=a||{};var b={},c,d;c=function(a,d,e){var f=a.halt=!1;a.error=function(a){throw a},a.next=function(c){c&&(f=!1);if(!a.halt&&d&&d.length){var e=d.shift(),g=e.shift();f=!0;try{b[g].apply(a,[e,e.length,g])}catch(h){a.error(h)}}return a};for(var g in b){if(typeof a[g]==="function")continue;(function(e){a[e]=function(){var g=Array.prototype.slice.call(arguments);if(e==="onError"){if(d){b.onError.apply(a,[g,g.length]);return a}var h={};b.onError.apply(h,[g,g.length]);return c(h,null,"onError")}g.unshift(e);if(!d)return c({},[g],e);a.then=a[e],d.push(g);return f?a:a.next()}})(g)}e&&(a.then=a[e]),a.call=function(b,c){c.unshift(b),d.unshift(c),a.next(!0)};return a.next()},d=a.addMethod=function(d){var e=Array.prototype.slice.call(arguments),f=e.pop();for(var g=0,h=e.length;g<h;g++)typeof e[g]==="string"&&(b[e[g]]=f);--h||(b["then"+d.substr(0,1).toUpperCase()+d.substr(1)]=f),c(a)},d("chain",function(a){var b=this,c=function(){if(!b.halt){if(!a.length)return b.next(!0);try{null!=a.shift().call(b,c,b.error)&&c()}catch(d){b.error(d)}}};c()}),d("run",function(a,b){var c=this,d=function(){c.halt||--b||c.next(!0)},e=function(a){c.error(a)};for(var f=0,g=b;!c.halt&&f<g;f++)null!=a[f].call(c,d,e)&&d()}),d("defer",function(a){var b=this;setTimeout(function(){b.next(!0)},a.shift())}),d("onError",function(a,b){var c=this;this.error=function(d){c.halt=!0;for(var e=0;e<b;e++)a[e].call(c,d)}})})(this);

addMethod('load', function (args, argc) {
    for (var queue = [], i = 0; i < argc; i++) {
        (function (i) {
            queue.push(function (next, error) {
                loadScript(args[i], next, error);
            });
        }(i));
    }
    this.call('run', queue);
});
var head = document.getElementsByTagName('head')[0] || document.documentElement;

function loadScript(src, onload, onerror) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = onload;
    script.onerror = onerror;
    script.onreadystatechange = function () {
        var state = this.readyState;
        if (state === 'loaded' || state === 'complete') {
            script.onreadystatechange = null;
            onload();
        }
    };
    head.insertBefore(script, head.firstChild);
}

// Base.js ----------------------------------------------

/*
Base.js, version 1.1a
Copyright 2006-2010, Dean Edwards
License: http://www.opensource.org/licenses/mit-license.php
*/

var Base = function() {
// dummy
};

Base.extend = function(_instance, _static) { // subclass
var extend = Base.prototype.extend;

// build the prototype
Base._prototyping = true;
var proto = new this;
extend.call(proto, _instance);
proto.base = function() {
// call this method from any other method to invoke that method's ancestor
};
delete Base._prototyping;

// create the wrapper for the constructor function
//var constructor = proto.constructor.valueOf(); //-dean
var constructor = proto.constructor;
var klass = proto.constructor = function() {
	if (!Base._prototyping) {
		if (this._constructing || this.constructor == klass) { // instantiation
			this._constructing = true;
			constructor.apply(this, arguments);
			delete this._constructing;
		} else if (arguments[0] != null) { // casting
			return (arguments[0].extend || extend).call(arguments[0], proto);
		}
	}
};

// build the class interface
klass.ancestor = this;
klass.extend = this.extend;
klass.forEach = this.forEach;
klass.implement = this.implement;
klass.prototype = proto;
klass.toString = this.toString;
klass.valueOf = function(type) {
	//return (type == "object") ? klass : constructor; //-dean
	return (type == "object") ? klass : constructor.valueOf();
};
extend.call(klass, _static);
// class initialisation
if (typeof klass.init == "function") klass.init();
return klass;
};

Base.prototype = {	
extend: function(source, value) {
	if (arguments.length > 1) { // extending with a name/value pair
		var ancestor = this[source];
		if (ancestor && (typeof value == "function") && // overriding a method?
			// the valueOf() comparison is to avoid circular references
			(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
			/\bbase\b/.test(value)) {
			// get the underlying method
			var method = value.valueOf();
			// override
			value = function() {
				var previous = this.base || Base.prototype.base;
				this.base = ancestor;
				var returnValue = method.apply(this, arguments);
				this.base = previous;
				return returnValue;
			};
			// point to the underlying method
			value.valueOf = function(type) {
				return (type == "object") ? value : method;
			};
			value.toString = Base.toString;
		}
		this[source] = value;
	} else if (source) { // extending with an object literal
		var extend = Base.prototype.extend;
		// if this object has a customised extend method then use it
		if (!Base._prototyping && typeof this != "function") {
			extend = this.extend || extend;
		}
		var proto = {toSource: null};
		// do the "toString" and other methods manually
		var hidden = ["constructor", "toString", "valueOf"];
		// if we are prototyping then include the constructor
		var i = Base._prototyping ? 0 : 1;
		while (key = hidden[i++]) {
			if (source[key] != proto[key]) {
				extend.call(this, key, source[key]);

			}
		}
		// copy each of the source object's properties to this object
		for (var key in source) {
			if (!proto[key]) extend.call(this, key, source[key]);
		}
	}
	return this;
}
};

//initialise
Base = Base.extend({
constructor: function() {
	this.extend(arguments[0]);
}
}, {
ancestor: Object,
version: "1.1",

forEach: function(object, block, context) {
	for (var key in object) {
		if (this.prototype[key] === undefined) {
			block.call(context, object[key], key, object);
		}
	}
},
	
implement: function() {
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] == "function") {
			// if it's a function, call it
			arguments[i](this.prototype);
		} else {
			// add the interface using the extend method
			this.prototype.extend(arguments[i]);
		}
	}
	return this;
},

toString: function() {
	return String(this.valueOf());
}
});

//------------------------------------------------------------------------
// This code is just for initializing SHARK
(function (window, undefined) {
  var Shark = {};
  // Init brings to the global context all Shark 
  // components specified as parameters.
  var Init = function(components, f) {
	// After initilizing all shark components, the main program
	// is executed
	load.apply(this, components).thenRun(function () {
		f();
	});
  };
  Shark = {
    Init: Init	  
  };
  // And for my next trick, I'll move shark to the global context.
  window.Shark = Shark;
}) (window);
