(function (window) {
  var width = 800;
  var height = 600;
  var Shark = window.Shark;
  var Vm = new Shark.Core.App('game', width, height, 1),
  fBanana = window.draws.banana,         
  drawGor = window.draws.gorillas,
  fSun = window.draws.sun,
  fBuilding = window.draws.building;

  

  var Banana = Shark.Assets.DSprite.extend({
    throwing: function(gorilla, to, velocity, angle, startTime, actualTime, gravity) {
      var g = gravity;
      var t = actualTime - startTime;
      var v = velocity;
      var a = (angle)*(3.14/180);
      var vx = v * Math.cos(a);
      var v0y = v * Math.sin(a);
      var hmax = ((v0y*v0y) / (2*g));
      this.position.y = gorilla.position.y - (v0y*t - ((g*t*t)/2));
      if (to === 'right') {
        this.position.x = gorilla.position.x - (vx * t) -  20;
      } else {
        this.position.x = gorilla.position.x + (vx * t) +   20;
      }
      var outOfScreen = (this.position.x >= width) || (this.position.y > height);
      return outOfScreen;	 
    },   
  });

  var Buildings = window.Base.extend({
    constructor: function(n) {
      this.cant = n;
      this.building = [];
      var i;
      for(i=0;i<this.cant;i++) {
        var bwidth = 100;
        var bheight = Math.floor(200+Math.random()*300);
        var x = (i*bwidth);
        var y = (700-bheight);
        var nFBuilding = fBuilding(bwidth, bheight);
        var nBuilding = new Shark.Assets.DSprite(x, y, 20, 20, nFBuilding);
        this.building.push(nBuilding);
        Vm.addEntity('building' + i, nBuilding);      
      }
    },
    position: function(n) {
      var selectedBuilding = this.building[n-1];             
      return {
        x: selectedBuilding.x(), 
        y: selectedBuilding.y()
      };	 
    },

    draw: function() {
      var i;
      for(i=0;i<this.building.length;i++) {
        Vm.entity('building' + i).draw();
      }
    }
  });

  function onWaitingAngle() {
    var angleText = Vm.entity('angleText');
    var evt = Vm.getEvent();
    var cantNumbers = Vm.get('cantNumbers', 0);
    var angle = Vm.get('angle', '');
    var next = 'waitingAngle';
    if (cantNumbers >=  2) {
      next = 'waitingVel';
      Vm.del('cantNumbers');
    } 
    if (evt && evt.type === 'numericKey') {
      angleText.append(evt.value);
      Vm.set('angle', angle + evt.value);
      Vm.set('cantNumbers', cantNumbers+1);	
    }
    angleText.draw(true);

    return next;
  }

  function onWaitingVel() {
    var angleText = Vm.entity('angleText');
    var velText = Vm.entity('velocityText');
    var cantNumbers = Vm.get('cantNumbers', 0);
    var vel = Vm.get('vel', '');
    var evt = Vm.getEvent();
    var next = 'waitingVel';
    if (cantNumbers === 2) {
      Vm.del('cantNumbers');
      next ='throwing';
    }

    angleText.draw();
    velText.draw(true);
    if (evt && evt.type === 'numericKey') {
      velText.append(evt.value);
      Vm.set('vel', vel + evt.value);
      Vm.set('cantNumbers', cantNumbers+1);	
    }
    return next;
  }

  function onChangeTurn() {
    var next = 'waitingAngle';
    var angleText = Vm.entity('angleText');
    var velText = Vm.entity('velocityText');
    var turn = Vm.get('turn');
    var textPoisitonX;
    if (turn === 1) {
      textPoisitonX = 720;
      Vm.set('turn', 2);
    } else {
      textPoisitonX = 20;
      Vm.set('turn', 1);
    }
    angleText.setText('Angle: ');
    angleText.x(textPoisitonX);
    velText.setText('Velocity: ');
    velText.x(textPoisitonX);
    next = 'waitingAngle'; 
    return next;
  }

  function onThrowing() {
    var startTime = Vm.get('startTime', Vm.getTicks()) / 10;
    var actualTime = Vm.getTicks() / 10;
    var gravity = 9.8;
    var turn = Vm.get('turn');
    var gorilla = Vm.entity("gorilla" + turn);
    var opponent = (gorilla === Vm.entity("gorilla1"))?Vm.entity("gorilla2"):Vm.entity("gorilla1");
    var to;
    if (turn === 1) {
      to = 'left';
    } else { 
      to = 'right';
    } 
    var next = 'throwing';
    var velocity = parseInt(Vm.get('vel'), 10);
    var angle = parseInt(Vm.get('angle'), 10);
    var banana = Vm.entity('banana');

    if (banana.hasCollisionedWith(opponent)) {
      Vm.set('winner', gorilla);
      Vm.set('looser', opponent);
      next =  "onWin";
    }

    if (banana.throwing(gorilla, to, velocity, angle, startTime, actualTime, gravity)) {
      next = 'changeTurn';  
      Vm.del('startTime');
      Vm.del('vel');
      Vm.del('angle');
    }
    banana.draw(true, Vm.getTicks()*10);
    return next;
  }

  function onWin() {
    var looserGorilla = Vm.get('looser');
    var banana = Vm.entity('banana');

    looserGorilla.clear();
    banana.clear();

    return 'onInit';
  }

  function initGame(){ 
    Vm.reset();
    // Creating buildings
    var buildings = new Buildings(10);
    // Creating Gorillas
    // Getting the position of the 2nd and 9th building
    // in order to put the gorillas on the top.
    var build2 = buildings.position(2);
    var build9 = buildings.position(7);
    var gorilla1 = new Shark.Assets.DSprite(build2.x+30, build2.y-45, 20, 20, drawGor);
    var gorilla2 = new Shark.Assets.DSprite(build9.x+30, build9.y-45, 20, 20, drawGor);
    // Creating banana
    var banana = new Banana(build2.x+30, build2.y-45, 20, 20, fBanana);
    // Creating sun
    var sun = new Shark.Assets.DSprite(400, 20, 20, 20, fSun);
    var angleText = new Shark.Texts.Text('Angle: ', 20, 20);
    var velocityText = new Shark.Texts.Text('Velocity: ', 20, 40);

    // Adding entities and setting variables.
    Vm.set('turn', 1);
    Vm.listenEvent('keydown');
    Vm.set('buildings', buildings);
    Vm.addEntity('gorilla1', gorilla1);
    Vm.addEntity('gorilla2', gorilla2);
    Vm.addEntity('banana', banana);
    Vm.addEntity('sun', sun);
    Vm.addEntity('angleText', angleText);
    Vm.addEntity('velocityText', velocityText);
    
    return 'waitingAngle';
  }

  Vm.onInit(function() {
    Vm.addPhase('onInit', initGame, true);
    Vm.addPhase('waitingAngle', onWaitingAngle);
    Vm.addPhase('waitingVel', onWaitingVel);
    Vm.addPhase('throwing', onThrowing);
    Vm.addPhase('changeTurn', onChangeTurn);
    Vm.addPhase('onWin', onWin);
  });

  Vm.onLoop(function () {   
    Vm.phase();
    var gorilla1 = Vm.entity('gorilla1');
    var gorilla2 = Vm.entity('gorilla2');
    var buildings = Vm.get('buildings');
    var sun = Vm.entity('sun');
    gorilla1.draw();
    gorilla2.draw();
    buildings.draw();
    sun.draw();
  });

  Vm.start();
})(window);
