(function (window, undefined) {

  var Shark = window.Shark || {};	

  var Vm = Shark.Core.App.extend({
    constructor: function(parent, width, height, clock) {
      this.base(parent, width, height, clock);
      this.eventQueue = [];
      this.listeningEvents = [];
      this.onListening = function(evt) {
        var nevent = {};
        switch (evt.type) {
          case 'keydown':
            switch(true) {
            case evt.which === 13:
              nevent.type = 'key';
            nevent.value = 'enter';
            break;
            case (evt.which >= 48 && evt.which <= 57):
              nevent.type = 'numericKey';
              nevent.value = String.fromCharCode(evt.which);
            break;
            case (evt.which >= 65 && evt.which <= 90) || (evt.which >= 97 && evt.which <= 122):
              nevent.type = 'alphaKey';
              nevent.value = String.fromCharCode(evt.which);
            break;
            default:
              nevent.type = 'unknow';
              nevent.value =  evt.which; 
          }  
        }

        this.eventQueue.push(nevent);	
      };
    },  
    listenEvent: function (event) {
      if (this.listeningEvents.indexOf(event) === -1) {
        this.listeningEvents.push(event);
        document.addEventListener(event, this.onListening.bind(this), false);
      }
    },
    flushEvents: function() {
      this.eventQueue = [];
    },
    stopListening: function() {
      this.listeningEvents = [];
    },
    getEvent: function() {
      var lastEvent = this.eventQueue.shift();
      return lastEvent;	
    }
  });

  window.Shark.Core.App = Vm;
}) (window, undefined);
