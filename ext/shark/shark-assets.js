// An Asset is any resource which could be idetified by and id
// and which has a source to look for it.// and which has a source to look for it.

(function (window) {
   // An Asset is kind of an abstract class so we
   // let it out of the Assets types provided by sharkAssets.
    var Image = Shark.Core.Entity.extend({
	  constructor : function(id, source, width, height) {
	    this.base(id, source);
        this.img = new window.Image();
		this.width = width;
		this.height = height;
		this.img.src = this.source;
		this.img.onload = function() {
		  this.img.width = width || this.img.clientWidth || this.img.width;
		  this.img.height = height || this.img.clientHeight || this.img.height;
		};
      },
	  draw : function(context, x, y) {
	    context.drawImage(this.img, x, y);
	  }
    });
	
    var Sprite = Image.extend({
	  constructor : function(id, source, imgWidth, imgHeight, cursorWidth, 
			  cursorHeight) {
	    this.base(id, source, imgWidth, imgHeight);
		this.cursorWidth = cursorWidth;
		this.cursorHeight = cursorHeight;
		this.numberOfImages = (this.cursorWidth / this.width);
		this.position = 0;
      },
	  draw : function(context, x, y) {
	    context.drawImage(this.img, position * cursorWidth, 0, cursorWidth, 
	    		cursorHeight, x, y, cursorWidth, cursorHeight);
		  position = (position < cantImages) ? position + 1 : 0;
		}
	  });
    
    // An DSprite (Dynamic Sprite) is an sprite
    // drawed using functions from a JS Canvas context.
    // This is not an image so it doesn't extend
    // from it.
    var DSprite = Shark.Core.Entity.extend({
       constructor: function(x, y, baseF) {
         this.base(x, y);
         this.drawingFunctions = [];
         this.drawingFunctions.push(baseF);
         this.frame = 0;
       },
       
       draw: function(update, time) {
         this.update = update || this.update;
         if(this.update) { 
           this.canvas.clear();
    	   var context = this.canvas.context();
    	   context.save();
    	   context.translate(this.position.x, this.position.y); 
           this.drawingFunctions[this.frame](context, time);
           context.restore();
           this.frame = (this.drawingFunctions.length-1 < this.frame)?
        		 this.frame + 1:0;
           this.update = false;
         };
         },
           // Each drawing function must have a context and a position 
           addFunction: function(f) {
             this.drawingFunctions.push(f);   
           },
    });
    
   var Assets = {
	 Name : "Assets",
     Image: Image,
     Sprite: Sprite,
     DSprite: DSprite,
   };
    
   Shark.Assets = Assets;
}) (window);
