//TODO: look at "Operational Transformation" libraries
// todo playback

_ = require("./underscore.js")
var io = require('socket.io').listen(8011);

var sites = {
}

var defaultState = {
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

  deleteCard: function (state, event) {
    var pos = event.deleteCard.cardIndex
    state.columns[event.deleteCard.columnIndex].cards.splice(pos, 1)
    return state;
  },
  deleteColumn: function (state, event) {
    var pos = event.deleteColumn.columnIndex
    state.columns.splice(pos, 1)
    return state;
  },
  addColumn: function (state, event) {
    state.columns.push({
      title: event.addColumn.title,
      id: event.addColumn.title.replace(/ /g, "-"),
      cards: []
    })
    return state;
  },
  cardMove: function (state, event) {
    var fromColumnIndex = event.cardMove.fromColumnIndex
    var toColumnIndex = event.cardMove.toColumnIndex
    
    var fromCards = state.columns[fromColumnIndex].cards
    var toCards = state.columns[toColumnIndex].cards

    var fromPos = event.cardMove.fromCardIndex
    var toPos = event.cardMove.toCardIndex

    if (fromColumnIndex == toColumnIndex && toPos >= fromPos) {
      toPos = toPos - 1
    }

   
    // splice out of fromCards into toCards
    toCards.splice.apply(toCards, [toPos, 0].concat(
      fromCards.splice(fromPos, 1)
    ))

    return state;
    
  } 
}

var kanbanApp = function (state, event) {
  // TODO: clean up all these ifs into object ----------

  if (event.newCard) {
    state = eventHandlers.newCard(state, event)
  }

  if (event.deleteCard) {
    state = eventHandlers.deleteCard(state, event)
  }

  if (event.deleteColumn) {
    state = eventHandlers.deleteColumn(state, event)
  }


  if (event.cardMove) {
    state = eventHandlers.cardMove(state, event)
  } 

  if (event.addColumn) {
    state = eventHandlers.addColumn(state, event)
  } 
  state.otherBoards = _.keys(sites)
  return state
}

io.sockets.on('connection', function (socket) {
  //socket.emit('state', state);
  socket.on('appEvent', function (event) {
    var state = sites[event.site]
    if (!state) {
      sites[event.site] = JSON.parse(JSON.stringify(defaultState));
      state = sites[event.site]
    } 
    io.sockets.emit(event.site, kanbanApp(state, event)) 
  });
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  return false; 
});
