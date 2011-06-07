(function (window) {
  var Canvas = Base.extend({
    constructor: function(id, width, height, message) {
	  this.elem = document.createElement('canvas');
	  this.elem.id = id;
	  this.elem.innerHTML = message || 'Shark needs a browser with HTML5 support.'; 
	  this.elem.width = width;
	  this.elem.height = height;
	  this.ctx = this.elem.getContext('2d');
	  return this.elem;
	},
	element: function() {
	  return this.elem;
	},
	context: function() {
	  return this.ctx;
	}
  });

  // This class is just a wrapper for a function. It is not funny at all.
  var Fun = Base.extend({
    constructor: function(name, f) {
	  this.name = name;
	  this.f = f;
	},
	run: this.f, 	
  });

  var Vm = Base.extend({
    constructor: function(clock) {
	  this.clock = clock;
	  this.Init = [];
	  this.Loop = [];
	  this.Clean = [];
	  this.Exit = [];
	},
	onInit: function(name, f) {
	  this.Init.push(new Fun(name, f));	  
	},
	onLoop: function(name, f) {
	  this.Loop.push(new Fun(name, f));  
	},
	onClean: function(name, f) {
	  this.Clean.push(new Fun(name, f));	  
	},
	exec: function() {
	  var i;
	  for(i=0;i<this.Init.length; i++) {
	    this.Init[i]();
	  };
	  (function() {
	    for(i=0;i<this.Loop.length;i++) {
		  this.Loop[i]();         
		 };
		 setTimeOut(arguments.callee, this.clock);
	   }) ();
	}
   });
  
  // An Asset is kind of an abstract class so we
  // let it out of the Assets types provided by sharkAssets.
  var Asset = Base.extend({
    constructor : function(id, source) {
	   this.id = id;
	   this.source = source;
	 }
   });
   
   var Core = {
	 Name: "Shark",
     App: Vm,
   };
		  
    // And for my next trick... I'll move these classes to the global context.
	window.Shark.Core = Core;
}) (window);



