//TODO: look at "Operational Transformation" libraries
// todo playback

_ = require("./underscore.js")
var io = require('socket.io').listen(8011);
var fs = require("fs")

var sites = JSON.parse(fs.readFileSync("./saved.json"))

var defaultState = {"columns":[{"title":"todo","id":"todo","cards":[{"title":"Rearrange Columns"},{"title":"save to disc"}]},{"title":"in progress","id":"in-progress","cards":[{"title":"cleanup ui"}]},{"title":"done","id":"done","cards":[{"title":"syncing"},{"title":"adding tasks"}]}]}


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
  moveCardOver: function (state, event) {
    var columnIndex = event.moveCardOver.columnIndex
    var cardIndex = event.moveCardOver.cardIndex
   
    var oldColumn = state.columns[columnIndex]
    var newColumn = state.columns[columnIndex + 1]
    if (!newColumn) {
      newColumn = state.columns[0]
    }
    
    newColumn.cards.push(oldColumn.cards.splice(cardIndex, 1)[0]) 
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

  if (event.moveCardOver) {
    state = eventHandlers.moveCardOver(state, event)
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

var saveInterval = 1000 * 5
var saveToDisc = function () {
  fs.writeFile("./saved.json", JSON.stringify(sites, null, " "), function () {
    setTimeout(saveToDisc, saveInterval)
  })
}

saveToDisc();


process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  return false; 
});
