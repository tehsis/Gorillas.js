(function (window, undefined) {
  // If Shark.Core has been already loaded there is no need to do so.
  var Canvas = Base.extend({
    constructor: function(classText, width, height, parent) {
	  this.elem = document.createElement('canvas');
	  this.elem.class = classText;
	  this.elem.innerHTML = 'Shark needs a browser with HTML5 support.'; 
	  this.elem.width = width;
	  this.elem.height = height;
	  this.elem.style.position = "absolute";
	  this.ctx = this.elem.getContext('2d');
	  this.parent = parent;
	  parentElm = document.getElementById(parent);
	  parentElm.appendChild(this.elem);
	  return this.elem;
	},
	parent: function() {
      return this.parent;
	},
	element: function() {
	  return this.elem;
	},
	context: function() {
	  return this.ctx;
	},
	clear: function() {
	  this.ctx.clearRect(0, 0, this.elem.width, this.elem.height);
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
    constructor: function(parent, width, height, clock) {
      this.entities = [];
      this.loop = [];
      this.init = [];
      this.clock = clock;
      this.ticks = 0;
      this.mainCanvas = new Canvas('shark-main', width, height, parent); 
      this.clearScreen = function() {
        var i;
        this.mainCanvas.clear();
        for (i=0; i<this.entities.length; i++) {
          this.entities[i].clear();	
        };
      };
    },
    onLoop: function(f) {
      this.loop.push(f);	
    },
    onInit: function(f) {
      this.init.push(f);
    },
    addEntity: function (entity) {
    	entity.onAttach(this.mainCanvas);
    	this.entities.push(entity);
    },
    getTicks: function() {
      return this.ticks;	
    },
    start: function() {
      var i;
      for (i=0; i<this.init.length; i++) {
        this.init[i]();	  
      }
      that = this;
      function looping() { 
        that.clearScreen();
        for (i=0; i<that.loop.length; i++) {
          that.loop[i]();	  
        }; 
        that.ticks++;
        return that.clock;
      };
      (function() {
    	  var clock = looping();
    	  setTimeout(arguments.callee, clock);
      }) ();
   },
  });
  
  // An Entity is kind of an abstract class
  var Entity = Base.extend({
    constructor : function(x, y) {
      this.position = {};
      this.position.x = x;
      this.position.y = y;
	},
    x: function(x) {
      this.position.x = x || this.position.x;
      return this.position.x;
    },
	y: function(y) {
	  this.position.y = y || this.position.y;
	  return this.position.y;
	},
	show: function() {
	},
	// This should be ONLY executed by the vm
	// when the entity is attached to it.
	onAttach: function(backCanvas) {
	  this.canvas = new Canvas(
	    'entity',
	    backCanvas.element().width,
	    backCanvas.element().height,
	    backCanvas.parent
	  ); 
	},
	clear: function() {
	  this.canvas.clear();
	}
   });
   
   var Core = {
	 Name: "Shark",
	 Entity: Entity,
     App: Vm,
   };
   // And for my next trick... I'll move these classes to the global context.
   window.Shark.Core = Core;
}) (window, undefined);



