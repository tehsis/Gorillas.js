var gorilaz = {};

gorilaz.app = function(doc) {
  var width = 800;
  var height = 600;
  
  var gor = shark('gorilaz', width, height, 50);
 
  function Banana(id, path, height, width) {
	  this.id = id;
	  gor.addSprite(id, path, height, width);	  
  };
  
  Banana.method('throwIt', function (velocity, angle, startTime, gravity) {
    var g = gravity;
	var t = gor.getTicks() - startTime;
	var v = velocity;
	var y;
	var a = (angle)*(3.14/180);
	var vx = v * Math.cos(a); 
	var v0y = v * Math.sin(a);
	var hmax = ((v0y*v0y) / (2*g));
    y = (height-80) - (v0y*t - ((g*t*t)/2));
	var x = (vx * t) + 20;
	gor.Sprite(this.id).draw(x,y);
	outOfScreen = (x >= width) || (y > height);
	return outOfScreen;
  });
  
  var banana = new Banana('banana', 'imgs/banana-sprite.png', 32, 32);
  
  console.log(banana);
  
  gor.onInit(function() {
	  var form = gor.set('form', shootForm(doc, 'myForm'));
	  document.getElementById('shootForm').appendChild(form);
	  gor.set('throwing', false);
	  gor.set('gravity', 9.8);
    }
  );
   
  gor.onLoop( function() {  
	  var event = gor.eventQueue();
	  if (event) {
	    gor.set('throwing', true);
	    gor.get('form').hidden = true;
	    gor.set('startTime', gor.getTicks());
	    gor.set('variables', 
	        {
	           angle: event.form.angle,
	           velocity: event.form.velocity
	        });
      }
	   
	  if (gor.get('throwing')) {
		var angle = gor.get('variables').angle;
		var vel = gor.get('variables').velocity;
		var outOfScreen = banana.throwIt(vel, angle, gor.get('startTime'), gor.get('gravity'));
	    if (outOfScreen) {
	      gor.get('form').hidden = false;
	      gor.set('throwing', false);	
	    }
	  }
	  
  });
  
  
  gor.start();
  
  function shootForm(doc, id) {
  	var form = doc.createElement('form');
  	var angleInput = doc.createElement('input');
  	var velInput = doc.createElement('input');
  	var throwButton = doc.createElement('input');
  	throwButton.type = 'button';
  	throwButton.value = 'Throw';
  	angleInput.name = 'angle';
  	angleInput.type = 'number';
  	angleInput.placeholder = 'Angle';
  	angleInput.autocomplete = 'off';
  	velInput.name = 'velocity';
    velInput.type = 'number';
    velInput.placeholder = 'Velocity';
  	velInput.autocomplete = 'off';
  	throwButton.addEventListener('click', gor.listenEvent, false);
  	form.appendChild(throwButton);
  	form.appendChild(angleInput);
  	form.appendChild(velInput);
  	form.id = id;
  	return form;
  }
  
};




