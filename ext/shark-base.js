(function() {
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

  var Fun = Base.extend({
    constructor: function(name, f) {
	  this.name = name;
	  this.f = f;
	},
	run: function() {
	  this.f();
	}
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

   var Shark = Base.extend({
     constructor: function(id, width, height, message, undefined) {
	   this.screen = new Canvas(id, width, height, message);
     }
   });
   
   var Base = {
     Shark: Shark,
    };
		    
    // if Shark is not defined, we do it.
	if (window.Shark === undefined) {
	  window.Shark = {};   
	}
		  
    // And for my next trick... I'll move these classes to the global context.
	window.shark.Base = Base;
}) (window);





