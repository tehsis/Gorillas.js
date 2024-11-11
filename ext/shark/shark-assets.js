// An Asset is any resource which could be idetified by and id
// and which has a source to look for it.

(function (window) {
   // An Asset is kind of an abstract class so we
   // let it out of the Assets types provided by sharkAssets.
    
    // An DSprite (Dynamic Sprite) is an sprite
    // drawed using functions from a JS Canvas context.
    var DSprite = window.Shark.Core.Entity.extend({
       constructor: function(x, y, width, height, baseF) {
         this.base(x, y, width, height);
         this.addFunction(baseF);
         this.frame = 0;
         this.breakedPoints = [];
         this.effects = []; // Add effects array
       },
       draw: function(update, time) {
         this.update = update || this.update;
         if(this.update) { 
           this.canvas.clear();
           var context = this.canvas.bufferCtx;
           context.save();
           context.translate(this.position.x, this.position.y); 
           
           // Draw main sprite
           this.drawingFunctions[this.frame](context, time);
           
           // Draw any active effects
           this.effects = this.effects.filter(effect => {
             if (effect.isActive()) {
               effect.draw(context);
               return true;
             }
             return false;
           });
           
           context.restore();
           this.frame = (this.drawingFunctions.length-1 < this.frame) ?
             this.frame + 1 : 0;
           this.canvas.context().drawImage(this.canvas.bufferCanvas, 0, 0);
           this.update = false;
         }
       },

       addEffect: function(drawFunction, duration) {
         const startTime = Date.now();
         this.effects.push({
           draw: drawFunction,
           isActive: function() {
             return (Date.now() - startTime) < duration;
           }
         });
         this.update = true;
       },

       addBreakedPoint: function(point) {
         this.breakedPoints.push(point);
       },
          
       // Each drawing function must have a context and a position 
       addFunction: function(f) {
         this.drawingFunctions = this.drawingFunctions || [];
         this.drawingFunctions.push(f);   
       },
    });

   var Assets = {
     Name : "Assets",
     DSprite: DSprite,
   };
    
   window.Shark.Assets = Assets;
}) (window);
