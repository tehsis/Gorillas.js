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
    
    // New collision detection method
    checkGorillaCollision: function(gorilla) {
        // Define collision boxes
        const bananaLeft = this.position.x;
        const bananaRight = this.position.x + 20;
        const bananaTop = this.position.y;
        const bananaBottom = this.position.y + 20;
        
        const gorillaLeft = gorilla.position.x;
        const gorillaRight = gorilla.position.x + 40;
        const gorillaTop = gorilla.position.y;
        const gorillaBottom = gorilla.position.y + 40;
        
        // Check for overlap
        return !(bananaLeft > gorillaRight || 
                bananaRight < gorillaLeft || 
                bananaTop > gorillaBottom ||
                bananaBottom < gorillaTop);
    }
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
        nBuilding.drawFunction = nFBuilding;
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
    var opponent = (gorilla === Vm.entity("gorilla1")) ? Vm.entity("gorilla2") : Vm.entity("gorilla1");
    var buildings = Vm.get('buildings').building;
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

    var outOfScreen = banana.throwing(gorilla, to, velocity, angle, startTime, actualTime, gravity);

    // Only check collisions after banana has moved away from throwing gorilla
    if (actualTime - startTime > 0.5) {
        // Simple distance-based collision check with both gorillas
        const gorillas = [Vm.entity("gorilla1"), Vm.entity("gorilla2")];
        
        for (let hitGorilla of gorillas) {
            const dx = banana.position.x - hitGorilla.position.x;
            const dy = banana.position.y - hitGorilla.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30) {
                // Create explosion effect
                var explosionRadius = 20;
                var explosionDuration = 500;
                var startTime = Date.now();
                
                function drawExplosion(context) {
                    const progress = (Date.now() - startTime) / explosionDuration;
                    const currentRadius = explosionRadius * (1 - progress);
                    
                    if (progress <= 1) {
                        context.beginPath();
                        context.arc(0, 0, currentRadius, 0, Math.PI * 2);
                        context.fillStyle = '#FFA500';
                        context.fill();
                    }
                }

                // Add explosion effect at gorilla's position
                hitGorilla.addEffect(drawExplosion, explosionDuration);
                
                // Hide banana
                banana.position.x = -100;
                banana.position.y = -100;
                banana.update = true;
                
                // Set winner as the other gorilla using Vm.entity()
                Vm.set('winner', hitGorilla === Vm.entity("gorilla1") ? Vm.entity("gorilla2") : Vm.entity("gorilla1"));
                Vm.set('looser', hitGorilla);
                next = "onWin";
                break;
            }
        }
    }

    var collision = checkBuildingCollision(banana.position.x, banana.position.y, buildings);
    if (collision.hit) {
        createExplosion(banana, collision);
        next = 'changeTurn';
        Vm.del('startTime');
        Vm.del('vel');
        Vm.del('angle');
    }

    if (outOfScreen) {
        next = 'changeTurn';
        Vm.del('startTime');
        Vm.del('vel');
        Vm.del('angle');
    }

    banana.draw(true, Vm.getTicks() * 10);
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
    var build2 = buildings.position(2);
    var build9 = buildings.position(7);
    
    // Create gorillas with proper collision size
    var gorilla1 = new Shark.Assets.DSprite(build2.x+30, build2.y-45, 40, 40, drawGor);
    var gorilla2 = new Shark.Assets.DSprite(build9.x+30, build9.y-45, 40, 40, drawGor);
    
    // Create banana with proper collision size
    var banana = new Banana(build2.x+30, build2.y-45, 20, 20, fBanana);

    // Explicitly set collision sizes
    gorilla1.size = { width: 40, height: 40 };
    gorilla2.size = { width: 40, height: 40 };
    banana.size = { width: 20, height: 20 };
    
    // Rest of initialization...
    var sun = new Shark.Assets.DSprite(400, 20, 20, 20, fSun);
    var angleText = new Shark.Texts.Text('Angle: ', 20, 20);
    var velocityText = new Shark.Texts.Text('Velocity: ', 20, 40);

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
    var banana = Vm.entity('banana');
    var currentPhase = Vm.actualPhase;  // Get current game phase
  
    gorilla1.draw();
    gorilla2.draw();
    buildings.draw();
    sun.draw();
    
    // Only draw banana during 'throwing' phase
    if (currentPhase === 'throwing' && banana && banana.position.x > -100) {
        banana.draw(true, Vm.getTicks() * 10);
    }
  });

  function checkBuildingCollision(bananaX, bananaY, buildings) {
      const x = Math.floor(bananaX);
      const y = Math.floor(bananaY);

      for (let building of buildings) {
          if (!building || typeof building.x !== 'function' || typeof building.y !== 'function') {
              continue;
          }

          const buildingX = building.x();
          const buildingY = building.y();
          const buildingWidth = 100;
          const buildingHeight = 700 - buildingY;
          
          const isColliding = 
              x >= buildingX &&
              x <= buildingX + buildingWidth &&
              y >= buildingY &&
              y <= buildingY + buildingHeight;
          
          if (isColliding) {
              const localX = x - buildingX;
              const localY = y - buildingY;
              
              // Check if the collision point is in a damaged area
              if (building.drawFunction && building.drawFunction.damages) {
                  const isDamaged = building.drawFunction.damages.some(damage => {
                      const dx = localX - damage.x;
                      const dy = localY - damage.y;
                      const distance = Math.sqrt(dx * dx + dy * dy);
                      return distance < 20;  // Same radius as damage area
                  });
                  
                  // If the area is already damaged, don't count it as a collision
                  if (isDamaged) {
                      continue;
                  }
              }
              
              return {
                  hit: true,
                  building: building,
                  x: localX,
                  y: localY
              };
          }
      }

      return {
          hit: false
      };
  }

  function createExplosion(banana, collision) {
    console.log('Creating explosion:', collision);
    
    if (collision.building.drawFunction) {
        console.log('Building draw function:', collision.building.drawFunction);
        collision.building.drawFunction.addDamage(collision.x, collision.y);
        collision.building.update = true;
    }

    var explosionRadius = 20;
    var explosionDuration = 500;
    var startTime = Date.now();
    
    function drawExplosion(context) {
        const progress = (Date.now() - startTime) / explosionDuration;
        const currentRadius = explosionRadius * (1 - progress);
        
        if (progress <= 1) {
            context.beginPath();
            context.arc(0, 0, currentRadius, 0, Math.PI * 2);
            context.fillStyle = '#FFA500';
            context.fill();
        }
    }

    banana.addEffect(drawExplosion, explosionDuration);

    banana.position.x = -100;
    banana.position.y = -100;
    
    banana.update = true;
    collision.building.update = true;
  }

  Vm.start();
})(window);
