var currList = '';

document.addEventListener('DOMContentLoaded', function() {
  var listname = document.getElementById("list");
  var listitem = document.getElementById("addBox");

  chrome.storage.sync.get('list', function(result) {
    if (undefined != result.list) {
      var listData = JSON.parse(reqGobbles("https://gogobbles.com/api/get/" + result.list));
      populateList(listData);
      currList = result.list;
      listname.value = currList;
    } else {
      listitem.style.display = 'none';
    }
  });

  listname.onkeypress = getList;
  listitem.onkeypress = addTodo;
}, false);

function reqGobbles(url) {
  xh = new XMLHttpRequest();
  xh.open("GET", url, false);
  xh.send();
  return xh.responseText;
}

function getList(event) {
  input = document.getElementById("list");
  if (event.keyCode == 13 && input.value.length > 0) {
    if (! /^[a-zA-Z0-9~!@$\^&\*\(\)\{\}\[\]\+\-\=\_\,\<\>\"\'\:\;\`\|]+$/.test(input.value)) {
      return;
    } else if (input.value.length > 80) {
      return;
    }
    currList = input.value;
    chrome.storage.sync.set({'list': currList}, null);

    var listData = JSON.parse(reqGobbles("https://gogobbles.com/api/get/" + input.value));
    populateList(listData);
    document.getElementById("addBox").style.display = 'initial';
  }
}

function populateList(listData) {
  var list = document.getElementById('theList');
  list.innerHTML = '';

  for (var i = 0; i < listData.Count; i++) {
    var entry = document.createElement('div');
    var newTodo = document.createElement('span');
    var newBut = document.createElement('img');
    var thisId = listData.Todos[i].Id;
    var text = listData.Todos[i].Text;

    if (text.length > 38) {
      text = text.slice(0, 35);
      text += "...";
    }

    entry.className = 'entry col c12';
    newTodo.id = 'todo' + thisId;
    newTodo.className = 't';
    newBut.id = 'but' + thisId;
    newBut.className = 'x';
    newBut.src = 'icons/circlex.png';
    newBut.onclick = function() {
      removeTodo(this.id.substr(3));
    };

    newTodo.appendChild(document.createTextNode(text));
    entry.appendChild(newBut);
    entry.appendChild(newTodo);
    list.appendChild(entry);
    entry.className += ' load col c12';
  }
}

function removeTodo(itemId) {
  reqGobbles("https://gogobbles.com/api/remove/" + currList + "/" + itemId);

  var todoItem = document.getElementById('todo' + itemId);
  var todoBut = document.getElementById('but' + itemId);
  todoItem.parentNode.classList.add('horizTranslate');
  setTimeout(function() {
    todoItem.parentNode.classList.add('shrink');
    setTimeout(function() {
      todoBut.parentNode.parentNode.removeChild(todoBut.parentNode)
      todoItem.parentNode.removeChild(todoItem);
      todoBut.parentNode.removeChild(todoBut);
    }, 400);
  }, 400);
}

function addTodo(event) {
  var inputOrig = document.getElementById("addBox").value;
  if (event.keyCode == 13 && inputOrig.length > 0) {
    document.getElementById("addBox").value = '';
    addElem(inputOrig);
    document.getElementById("list").value = currList;
  }
}

redifyHold = false;

function addElem(text, refId) {
  var box = document.getElementById("addBox");
  thisId = refId;

  if (arguments.length == 1) {
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://gogobbles.com/api/add/" + currList + "/" + text, false);
    xmlHttp.send(null);
    if (xmlHttp.status != 200) {
      if (redifyHold == true) {
        return;
      }
      redifyHold = true;
      box.classList.add('redify-helper');
      box.parentNode.classList.add('redify');
      setTimeout(function() {
        box.parentNode.classList.remove('redify');
        box.parentNode.classList.add('unredify');
        setTimeout(function() {
          box.classList.remove('redify-helper');
          box.parentNode.classList.remove('unredify');
          redifyHold = false;
        }, 350);
      }, 450);
      return;
    }
    thisId = xmlHttp.responseText;
    box.className = 'inputbox col c12';
  }

  if (text.length > 38) {
    text = text.slice(0, 35);
    text += "...";
  }

  var list = document.getElementById('theList');
  var entry = document.createElement('div');
  var newTodo = document.createElement('span');
  var newBut = document.createElement('img');

  entry.className = 'entry col c12'
  newTodo.id = 'todo' + thisId
  newTodo.className = 't'
  newBut.id = 'but' + thisId
  newBut.className = 'x'
  newBut.src = 'icons/circlex.png'
  newBut.onclick = function() { removeTodo(newBut.id.substr(3)); };

  newTodo.appendChild(document.createTextNode(text));
  entry.appendChild(newBut);
  entry.appendChild(newTodo);
  list.appendChild(entry);
  setTimeout(function() {
    entry.className += ' load col c12';
  }, 10);
}

setInterval(function() {
    resp = JSON.parse(reqGobbles("https://gogobbles.com/api/get/" + currList, false));
    for (var i = 0; i < resp.Count; i++) {
      var obj = resp.Todos[i].Id;
      var text = resp.Todos[i].Text;
      var todoItem = document.getElementById('todo' + obj);
      if (todoItem == null) {
        addElem(text, obj);
      }
    }
}, 3000);
