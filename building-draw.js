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
      context.fillRect(0, 0, bwidth, bheight);
      var i;
      for (i=0;i<windows.length;i++) {
        win = windows[i];
        var x = win.PosX;
        var y = win.PosY;
        context.save();
        context.fillStyle = win.color;
        context.fillRect(x, y, 5, 10);
        context.restore();
      }

      // Apply damage (create holes from explosions)
      // Note: 'this' refers to the DSprite entity when called from draw()
      if (this && this.breakedPoints && this.breakedPoints.length > 0) {
        context.globalCompositeOperation = 'destination-out';
        for (i = 0; i < this.breakedPoints.length; i++) {
          var damage = this.breakedPoints[i];
          context.fillStyle = 'rgba(0,0,0,1)';
          context.beginPath();
          context.arc(damage.x, damage.y, damage.radius, 0, Math.PI * 2);
          context.fill();
        }
        context.globalCompositeOperation = 'source-over';
      }
    };
    return funBuild;
  }
  
  window.draws = window.draws || {};
  window.draws.building = fBuilding;
})();
