(function() {
  function fBuilding(bwidth, bheight) {
    var colors = [
      "#ac0204",
      "#04aaac",
      "#acaaac"
    ];
    var n = Math.floor(Math.random()*3);
    var i;
    var j;
    var windowsColors = [
      "#545654",
      "#FCFE54"
    ];
    var windows = [];
    var damages = [];

    for(i=0;i<(bwidth)/15;i++) {
      for(j=1;j<bheight;j++) {
        var p = Math.floor(Math.random()*2);
        var windowColor = windowsColors[p];
        var win = {};
        win.color = windowColor;
        win.PosX = 15+i*10;
        win.PosY = 0+j*20;
        windows.push(win);
      }  
    }

    var funBuild = function(context) {
      var color = colors[n]; 
      context.fillStyle = color;
      
      for(let y = 0; y < bheight; y += 10) {
        for(let x = 0; x < bwidth; x += 10) {
          let isDamaged = false;
          for(let damage of damages) {
            const dx = x - damage.x;
            const dy = y - damage.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if(distance < 20) {
              isDamaged = true;
              break;
            }
          }
          
          if (!isDamaged) {
            context.fillRect(x, y, 10, 10);
          }
        }
      }

      for (i=0;i<windows.length;i++) {
        win = windows[i];
        var x = win.PosX;
        var y = win.PosY;
        
        let isDamaged = false;
        for(let damage of damages) {
          const dx = x - damage.x;
          const dy = y - damage.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if(distance < 20) {
            isDamaged = true;
            break;
          }
        }

        if (!isDamaged) {
          context.save();
          context.fillStyle = win.color;
          context.fillRect(x, y, 5, 10);
          context.restore();
        }
      }
    };

    funBuild.addDamage = function(x, y) {
      console.log('Adding damage at:', x, y);
      damages.push({ x: x, y: y });
      return true;
    };

    funBuild.damages = damages;

    return funBuild;
  }
  
  window.draws = window.draws || {};
  window.draws.building = fBuilding;
})();
