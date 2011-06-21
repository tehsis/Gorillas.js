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

  var Vm = Base.extend({
    constructor: function(parent, width, height, clock) {
      this.entities = [];
      this.loop;
      this.init = [];
      this.phases = {};
      this.actualPhase;
      this.variables = {};
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
    addPhase: function(name, f, isDefault) {
      // Each function phase must return the next phase
      // to be executed.
      // TODO: provide a way to handle undefined phases.
      this.phases[name] = f;
      if (isDefault) {
        this.actualPhase = name;	  
      };
    },
    phase: function() {
      var executingPhase = this.phases[this.actualPhase];
      var next = executingPhase();
      this.actualPhase = next;	  
    },
    set: function(name, value) {
      this.variables[name] = value;	
    },
    get: function(name, defaultValue) {
      value = this.variables[name] || defaultValue;
      return value;
    },
    del: function(name) { 
      this.variables[name] = undefined;	
    },
    onLoop: function(f) {
      this.loop = f;	
    },
    onInit: function(f) {
      this.init = f;
    },
    addEntity: function (name, entity) {
    	entity.onAttach(this.mainCanvas);
    	this.entities[name] = entity;
    },
    entity: function(name) {
      return this.entities[name]; 	
    },
    getTicks: function() {
      return this.ticks;	
    },
    start: function() {
      this.init();	  
      that = this;
      function looping() { 
        that.clearScreen();
        that.loop();
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
	context: function() {
	  return this.canvas.context();	
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


