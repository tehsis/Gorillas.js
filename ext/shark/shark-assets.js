// An Asset is any resource which could be idetified by and id
// and which has a source to look for it.// and which has a source to look for it.

function shark_assets() {
   // An Asset is kind of an abstract class so we
   // let it out of the Assets types provided by sharkAssets.
    var Image = Asset.extend({
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
	  constructor : function(id, source, imgWidth, imgHeight, cursorWidth, cursorHeight) {
	    this.base(id, source, imgWidth, imgHeight);
		this.cursorWidth = cursorWidth;
		this.cursorHeight = cursorHeight;
		this.numberOfImages = (this.cursorWidth / this.width);
		this.position = 0;
      },
	  draw : function(context, x, y) {
	    context.drawImage(this.img, position * cursorWidth, 0, cursorWidth, cursorHeight, x, y, cursorWidth, cursorHeight);
		  position = (position < cantImages) ? position + 1 : 0;
		}
	  });
    
   var Assets = {
	 Name : "Assets",
     Image: Image,
     Sprite: Sprite,
   };
    
  return Assets;
};