_ = require("./underscore.js")
var io = require('socket.io').listen(8011);

var state = {
  columns: [
    {
      title: "todo",
      id: "todo",
      cards: [
        { title: "Make kanban board networked", id: 1}, 
        { title: "Style kanban board" , id: 2},
        { title: "sync with redis" , id: 3},
      ]
      
    },
    {
      title: "in progress",
      id: "in-progress",
      cards: [ {title: "make kanban board locally", id: 4}]
    
    },
    {
      title: "done",
      id: "done",
      cards: [{title: "create github project for kanban board", id: 5}, {title: "listen to enya", id: 6}]
    },
    /*{
      title: "yo",
      id: "yo",
      cards: [{title: "create github project for kanban board", id: 5}, {title: "listen to enya", id: 6}]
    }
    */
  ]
}


var eventHandlers = {
  newCard: function (state, event) {
    state.columns[event.newCard.columnIndex].cards.push({
      title: event.newCard.title, 
      id: _.uniqueId("card")
    })
    return state;
  }    
}

var kanbanApp = function (state, event) {
  if (event.newCard) {
    state = eventHandlers.newCard(state, event)
  }  
  return state
}

io.sockets.on('connection', function (socket) {
  socket.emit('state', state);
  socket.on('appEvent', function (event) {
    io.sockets.emit('state', kanbanApp(state, event)) 
  });
});


