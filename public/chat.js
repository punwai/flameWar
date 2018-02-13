$(document).ready(function() {
  room = JSON.parse($("#inforoom").val());
  console.log(room);
  var socket = io.connect('http://localhost:3000' +'/'+room['_id'])
  var $usernameInput = $('#usernameInput')
  var $inputMessage = $('#m')
  var $currentInput = $usernameInput.focus();
  var $chatPage = $('.chat.page');
  var $loginPage = $('.login.page');
  var $window = $(window);
  var username;
  var currentUsers;
  var currentSide = 'neutral';

  sideColor = {for:'rgb(176, 203, 255)',
  neutral:'rgb(213, 213, 213)',
  against:'rgb(245, 106, 106)'}

  function updateColor(element){
    newBg = element.color;
    newText = element.background;
    console.log('inverting');
    console.log($(element));
    element.css({
      'color': newText,
      'background-color': newBg
    })
  }
  $('.sideButtonGroup button').click(function(){
    console.log(this.id);
    console.log(typeof(this.id));
    currentSide = this.id
    updateColor($(this));
  })

  setUsername = () => {
    username = cleanInput($usernameInput.val().trim());

    if(username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();
      console.log('trying to emit '+username);
      socket.emit('user connect', username)
    }
  }

  cleanInput = (input) => {
    return $('<div/>').text(input).html();
  }

  sendMessage = () => {
    var message = $inputMessage.val();

    message = cleanInput(message);
    if(message){
      $inputMessage.val('');
      socket.emit('chat message', {'username' : username, 'side': currentSide,'message': message});
      var n = $('#messagediv');
      $('#messagediv').animate({ scrollTop: n.prop('scrollHeight')}, 'fast')
    }
  }



  socket.on('chat message', (msg) => {
    console.log('<li style='
    +'"{background:'
    +sideColor[msg['side']]
    +'}">');
    $('#messages').append($('<li style='
    +'"background:'
    +sideColor[msg['side']]
    +'">').text(msg['username']+': '+msg['message']))
  })


//SOCKET ACTIONS.
  socket.on('user connect', (user) => {
    $('#oulist').append($('<li>').text(user))
  })

  socket.on('onlineUsers', (userslist) => {
    console.log('console userslists: '+ userslist);
    if (userslist != null) {
      console.log('passed null');
      console.log(userslist.length);
      for(let index = 0; index < userslist.length; index++){
        console.log('inloop');
        console.log(index);
        console.log(userslist[index]);
        $('#oulist').append($('<li>').text(userslist[index]))
      }
    }

  })
  socket.on('user disconnect', (disconnecteduser) => {
    console.log(disconnecteduser);
    console.log($('#oulist li'));
    $("#oulist li").filter( function(){
      return $(this).text() === disconnecteduser;
    })[0].remove();


  })
  $('form').submit(function(){
    // socket.emit('chat message', $('#m').val());
    // $('#m').val('');
    return false;
  });


  //TYPING
  $window.keydown(function (event) {
    if(!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }

    if(event.which === 13) {
      if (username) {
        sendMessage()
      } else {
        setUsername()
      }
    }
  })

})
