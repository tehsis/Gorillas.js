// The first implementation of Shark. Reference only

var shark = function (elementId, width, height, time, message, undefined) {
    var context;
    var id;
    var canvasElement;
    var message = message || "Your browser doesn't supports HTML5.";
    var init = [];
    var loop = [];
    var variables = [];
    var eventQueue = [];
    var images = [];
    var sprites = [];
    var ticks = 0; // Acts as a timer. The number of times the loops functions have been execute
    // This works as a constructor for the object.
    (function(document, elementId, width, height) {
      date = new Date();
      id = date.getTime();
      canvasElement = createCanvas(document, id, width, height);
      context = canvasElement.getContext('2d');
	  element = document.getElementById(elementId);
	  element.appendChild(canvasElement);
	}) (window.document, elementId, width, height);

    // Private methods
	function createCanvas(document, id, width, height) {
		var ncanvas = document.createElement('canvas');
		ncanvas.width = width;
		ncanvas.height = height;
		ncanvas.id = 'sharkCanvas-' + id;
		return ncanvas;
	}
	
	function resetCanvas(context) {
      context.clearRect(0,0,width, height);
	}
	
	function updateTicks() {
	  ticks++;	
	}
    
	return  {
		// Public functions
		context: function () { 
			return context;
		},
		onInit: function(f) {
		  init.push(f);
	    },
		
	    onLoop: function(f) {
	      loop.push(f);
	    },
	    
	    listenEvent: function(evt) {
	      var nevent = {};
	      if (evt.target.form) {
	        nevent.type = "formEvent";
	        nevent.form = {};
	        var formElements = evt.target.form.elements;
	        for (var i=0;i<formElements.length;i++) {
	          if (formElements[i].name) {
	            nevent.form[formElements[i].name] = formElements[i].value;
	          }
	        }
	       
	      }
	      eventQueue.push(nevent);	
	    },
	    
	    eventQueue: function() {
	    	return eventQueue.shift();
	    },
	    
	    getTicks: function() {
		  return ticks;
	    },
	
	    canvas: function() {
		  return canvasElement;
	    },
	    
	    addImage: function(id, source, width, height) {
	      img = image(id, source, width, height);
		  images.push(img);
		  return img;
		},
		
		set: function(name, value) {
		  variables[name] = value;
		  return variables[name];
		},
		
		get: function(name) {
			return variables[name];
		},
		
	    Image: function(id) {
	      var i;
	      var selectedImage = null;
	      for (i=0; i<images.length;i++) {
	        if (images[i].id() == id) {
	          selectedImage = images[i];
	          break;
	        }  
	      }
	      return selectedImage;
	    },
	    
	    addSprite: function(id, imageSource, cursorWidth, cursorHeight, cantImages) {
		      spr = sprite(id, imageSource, cursorWidth, cursorHeight, cantImages);
			  sprites.push(spr);
			  return spr;
		},
		
	    Sprite: function(id) {
		      var i;
		      var selectedSprite = null;
		      for (i=0; i<sprites.length;i++) {
		        if (sprites[i].id() == id) {
		          selectedSprite = sprites[i];
		          break;
		        }  
		      }
		      return selectedSprite;
		},
		
	    start: function() {
	      var i;
	      for (i=0; i<init.length;i++) {
	    	  init[i]();
	      }
		  setInterval(function() {
			  resetCanvas(context);
			  for (i=0; i<loop.length; i++) {
			    loop[i]();
			  }
			  updateTicks();
			}, 
			  time);
	    }
	};
};