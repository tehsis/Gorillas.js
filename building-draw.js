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
    };
    return funBuild;
  }
  
  window.draws = window.draws || {};
  window.draws.building = fBuilding;
})();
