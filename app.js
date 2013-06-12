//TODO: look at "Operational Transformation" libraries
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
    })
    return state;
  },
  cardMove: function (state, event) {
    var fromCards = state.columns[event.cardMove.fromColumnIndex].cards
    var toCards = state.columns[event.cardMove.toColumnIndex].cards

    var fromPos = event.cardMove.fromCardIndex
    var toPos = event.cardMove.toCardIndex
   
    // splice out of fromCards into toCards
    toCards.splice.apply(toCards, [toPos, 0].concat(
      fromCards.splice(fromPos, 1)
    ))

    return state;
    
  } 
}

var kanbanApp = function (state, event) {
  if (event.newCard) {
    state = eventHandlers.newCard(state, event)
  }

  if (event.cardMove) {
    state = eventHandlers.cardMove(state, event)
  } 

  return state
}

io.sockets.on('connection', function (socket) {
  socket.emit('state', state);
  socket.on('appEvent', function (event) {
    io.sockets.emit('state', kanbanApp(state, event)) 
  });
});


