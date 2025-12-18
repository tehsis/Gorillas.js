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
    throwing: function(gorilla, to, velocity, angle, startTime, actualTime, gravity, wind) {
      var g = gravity;
      var t = actualTime - startTime;
      var v = velocity;
      var a = (angle)*(3.14/180);
      var vx = v * Math.cos(a);
      var v0y = v * Math.sin(a);
      var hmax = ((v0y*v0y) / (2*g));
      this.position.y = gorilla.position.y - (v0y*t - ((g*t*t)/2));

      // Apply wind effect (wind affects horizontal movement)
      var windEffect = wind * t;

      if (to === 'right') {
        this.position.x = gorilla.position.x - (vx * t) - 20 + windEffect;
      } else {
        this.position.x = gorilla.position.x + (vx * t) + 20 + windEffect;
      }
      var outOfScreen = (this.position.x >= width) || (this.position.x < -20) || (this.position.y > height);
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

    // Reset banana position to current player's gorilla
    var currentTurn = Vm.get('turn');
    var gorilla = Vm.entity('gorilla' + currentTurn);
    var banana = Vm.entity('banana');
    banana.position.x = gorilla.position.x;
    banana.position.y = gorilla.position.y;

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
    var buildings = Vm.get('buildings');
    var sun = Vm.entity('sun');
    var wind = Vm.get('wind', 0);

    // Check collision with opponent gorilla
    if (banana.hasCollisionedWith(opponent)) {
      Vm.set('explosionX', banana.position.x + 10);
      Vm.set('explosionY', banana.position.y + 10);
      Vm.set('explosionType', 'gorilla');
      Vm.set('winner', gorilla);
      Vm.set('looser', opponent);
      next = 'exploding';
    }

    // Check collision with buildings
    if (!next || next === 'throwing') {
      var i;
      for (i = 0; i < buildings.building.length; i++) {
        var building = buildings.building[i];
        if (banana.hasCollisionedWith(building)) {
          Vm.set('explosionX', banana.position.x + 10);
          Vm.set('explosionY', banana.position.y + 10);
          Vm.set('explosionType', 'building');
          Vm.set('hitBuilding', i);
          next = 'exploding';
          break;
        }
      }
    }

    // Check collision with sun
    if ((!next || next === 'throwing') && banana.hasCollisionedWith(sun)) {
      Vm.set('explosionX', banana.position.x + 10);
      Vm.set('explosionY', banana.position.y + 10);
      Vm.set('explosionType', 'sun');
      Vm.set('sunHit', true);
      next = 'exploding';
    }

    // Check if banana went off screen
    if (banana.throwing(gorilla, to, velocity, angle, startTime, actualTime, gravity, wind)) {
      next = 'changeTurn';
      Vm.del('startTime');
      Vm.del('vel');
      Vm.del('angle');
    }

    banana.draw(true, Vm.getTicks()*10);
    return next;
  }

  function onExploding() {
    var explosionStartTime = Vm.get('explosionStartTime', Vm.getTicks());
    var currentTime = Vm.getTicks();
    var explosionDuration = 30; // frames
    var elapsed = currentTime - explosionStartTime;
    var explosionX = Vm.get('explosionX');
    var explosionY = Vm.get('explosionY');
    var explosionType = Vm.get('explosionType');
    var maxRadius = (explosionType === 'gorilla') ? 40 : 25;

    // Animation: expand then contract
    var progress = elapsed / explosionDuration;
    var radius;
    if (progress < 0.5) {
      // Expanding phase
      radius = (progress * 2) * maxRadius;
    } else {
      // Contracting phase
      radius = ((1 - progress) * 2) * maxRadius;
    }

    // Draw explosion as a filled circle
    var mainCanvas = document.querySelector('.shark-main');
    if (mainCanvas) {
      var ctx = mainCanvas.getContext('2d');

      // Clear previous explosion frame
      if (Vm.get('lastExplosionRadius')) {
        var lastRadius = Vm.get('lastExplosionRadius');
        ctx.clearRect(explosionX - lastRadius - 5, explosionY - lastRadius - 5,
                     (lastRadius + 5) * 2, (lastRadius + 5) * 2);
      }

      // Draw explosion circle
      ctx.fillStyle = '#FF6600';
      ctx.beginPath();
      ctx.arc(explosionX, explosionY, radius, 0, Math.PI * 2);
      ctx.fill();

      Vm.set('lastExplosionRadius', radius);
    }

    var next = 'exploding';

    // When animation is done
    if (elapsed >= explosionDuration) {
      // Clear explosion
      if (mainCanvas) {
        var ctx = mainCanvas.getContext('2d');
        ctx.clearRect(explosionX - maxRadius - 5, explosionY - maxRadius - 5,
                     (maxRadius + 5) * 2, (maxRadius + 5) * 2);
      }

      // Apply building damage if hit a building
      if (explosionType === 'building') {
        var hitBuildingIndex = Vm.get('hitBuilding');
        var buildings = Vm.get('buildings');
        if (buildings && buildings.building[hitBuildingIndex]) {
          buildings.building[hitBuildingIndex].addBreakedPoint({
            x: explosionX - buildings.building[hitBuildingIndex].position.x,
            y: explosionY - buildings.building[hitBuildingIndex].position.y,
            radius: maxRadius
          });
        }
      }

      // Reset sun color if it was hit
      if (explosionType === 'sun') {
        Vm.set('sunHit', false);
      }

      // Clear banana
      var banana = Vm.entity('banana');
      banana.clear();

      // Clean up explosion variables
      Vm.del('explosionStartTime');
      Vm.del('explosionX');
      Vm.del('explosionY');
      Vm.del('explosionType');
      Vm.del('hitBuilding');
      Vm.del('lastExplosionRadius');
      Vm.del('startTime');
      Vm.del('vel');
      Vm.del('angle');

      // Determine next phase
      if (Vm.get('winner')) {
        next = 'onWin';
      } else {
        next = 'changeTurn';
      }
    }

    return next;
  }

  function onWin() {
    var looserGorilla = Vm.get('looser');
    var winnerGorilla = Vm.get('winner');

    // Update scores
    var player1Score = Vm.get('player1Score', 0);
    var player2Score = Vm.get('player2Score', 0);

    if (winnerGorilla === Vm.entity('gorilla1')) {
      player1Score++;
      Vm.set('player1Score', player1Score);
    } else {
      player2Score++;
      Vm.set('player2Score', player2Score);
    }

    // Check if someone won the match (best of 3)
    if (player1Score >= 3 || player2Score >= 3) {
      return 'matchWin';
    }

    // Clear the losing gorilla
    looserGorilla.clear();

    // Reset for next round
    Vm.del('winner');
    Vm.del('looser');

    return 'onInit';
  }

  function onMatchWin() {
    var player1Score = Vm.get('player1Score', 0);
    var player2Score = Vm.get('player2Score', 0);
    var winner = (player1Score >= 3) ? 'Player 1' : 'Player 2';

    // Display victory message
    var mainCanvas = document.querySelector('.shark-main');
    if (mainCanvas) {
      var ctx = mainCanvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(winner + ' Wins!', width / 2, height / 2 - 50);
      ctx.font = '24px monospace';
      ctx.fillText('Score: ' + player1Score + ' - ' + player2Score, width / 2, height / 2);
      ctx.fillText('Press ENTER to play again', width / 2, height / 2 + 50);
    }

    // Wait for enter key
    var evt = Vm.getEvent();
    if (evt && evt.type === 'key' && evt.value === 'enter') {
      Vm.set('player1Score', 0);
      Vm.set('player2Score', 0);
      return 'onInit';
    }

    return 'matchWin';
  }

  function initGame(){
    Vm.reset();

    // Set random wind (-5 to 5)
    var wind = Math.floor(Math.random() * 11) - 5;
    Vm.set('wind', wind);

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
    Vm.addPhase('exploding', onExploding);
    Vm.addPhase('changeTurn', onChangeTurn);
    Vm.addPhase('onWin', onWin);
    Vm.addPhase('matchWin', onMatchWin);
  });

  Vm.onLoop(function () {
    Vm.phase();
    var gorilla1 = Vm.entity('gorilla1');
    var gorilla2 = Vm.entity('gorilla2');
    var buildings = Vm.get('buildings');
    var sun = Vm.entity('sun');

    // Always redraw buildings to show damage
    if (buildings) {
      var i;
      for (i = 0; i < buildings.building.length; i++) {
        Vm.entity('building' + i).draw(true);
      }
    }

    gorilla1.draw();
    gorilla2.draw();

    // Draw sun (shocked if hit)
    if (Vm.get('sunHit')) {
      // Temporarily change sun drawing to shocked version
      var originalDrawing = sun.drawingFunctions[0];
      sun.drawingFunctions[0] = window.draws.sunShocked;
      sun.draw(true);
      sun.drawingFunctions[0] = originalDrawing;
    } else {
      sun.draw();
    }

    // Draw score and wind
    var mainCanvas = document.querySelector('.shark-main');
    if (mainCanvas && Vm.actualPhase !== 'matchWin') {
      var ctx = mainCanvas.getContext('2d');
      var player1Score = Vm.get('player1Score', 0);
      var player2Score = Vm.get('player2Score', 0);
      var wind = Vm.get('wind', 0);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('P1: ' + player1Score, 10, height - 10);
      ctx.textAlign = 'right';
      ctx.fillText('P2: ' + player2Score, width - 10, height - 10);

      // Draw wind indicator in center
      ctx.textAlign = 'center';
      var windText = 'Wind: ' + wind;
      if (wind > 0) {
        windText += ' →';
      } else if (wind < 0) {
        windText += ' ←';
      }
      ctx.fillText(windText, width / 2, height - 10);
    }
  });

  Vm.start();
})(window);
