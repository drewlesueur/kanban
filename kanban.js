// our kanbanApp function represents our ap
// it takes an event object which represents the input state and the state of the app
// It returns a new state object

var kanbanApp = function (state, event) {
  return state; 
}


var appTemplate = _.template($("#kanbanTemplate").html())
var render = function (state) {
  // render is our connection to the outside world. the mystic portal awaits.
  $('#kanban').html(appTemplate(state))
}

var bindEvents = function () { 
  $(document).ready(function () {
    //render(kanbanApp(state), {})
  })
}



// flow
// event, state -> kanbanApp -> new state -> render
// if you don't want to render every time (for performace reasons)  have secret methods
// that render things as you "modify" the state
// or store on the new state every thing that changes from the old state,
// and when its time to render, only render what changed.


// also think about
// log of events
// log of state "changes"

// functional programming thought
// dont modify varialbles by using "persistent data structures" like linked lists
// your can modify state but pretend you didn't by not using the old value (faster unless you have to use the old value)
//

