(function (window, undefined) {
  var Shark = window.Shark;
  
  var Text = Shark.Core.Entity.extend({
    constructor: function(text, x, y, font) {
      this.base(x, y);
      text.font = "50pt Arial";
      this.text = text;
      
    },
    setText: function(ntext) {
      this.text = ntext || this.text;
      return this.text;
    },
    append: function(ntext) {
      this.text += ntext;
      return this.text;
    },
    draw: function(update) {
      this.update = update || this.update;
      if (this.update) { 
      this.canvas.clear();
        this.canvas.context().strokeText(this.text, this.position.x, this.position.y);
     }
    }
  });
  
    var Texts = {
      name: 'Texts',
      Text: Text
    };
    
    Shark.Texts = Texts;
  
}) (window, undefined);
