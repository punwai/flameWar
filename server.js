//MODULES
var express = require('express'),
      app = express(),
      http = require('http').Server(app),
      io = require('socket.io')(http),
      ObjectId = require('mongodb').ObjectId,
      dabe = require('./db.js'),
      MongoClient = require('mongodb').MongoClient,
      assert = require('assert'),
      room_controller = require('./room_controller'),
      bodyParser = require('body-parser'),
      path = require('path'),
      { body, validationResult } = require('express-validator/check'),
      { sanitizeBody } = require('express-validator/filter'),
      utils = require('./utils.js');


//DATABASE
const url = 'mongodb://localhost:27017'
dbName = 'Flamewar'



//FUNCTIONS
var isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
}

//SETS
app.set('view engine', 'pug');
app.use('/static', express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

//MIDDLEWARE


//Query

//CONNECT TO DB
dabe.connect(url,dbName,() => {
  console.log('im in!');
  connectSockets();
})

onlineUsers = {}

//SOCKETS CONNECT
connectSockets = () => {
  dabe.get().collection('rooms').find().toArray((err, result) => {
    for(let i = 0; i < result.length; i++){
      onlineUsers[result[i]['_id']] = Array();
      console.log(result[i]['_id']);
      let curr_onlineUsers = onlineUsers[result[i]['_id']];

      //connection
      let chat = io
      .of('/'+result[i]['_id'])
      .on('connection', (socket) => {
        let socketusername = null;
        console.log('user connected from room with id:' + result[i]['_id'] +' and topic:'+ result[i]['topic']);
        // console.log('a user connected to room with id: ' + result[i]['_id'] + ' topic: ' + result[i]['topic']);
        // console.log(socket);
        console.log('curr before sending' + curr_onlineUsers);
        socket.emit('onlineUsers', curr_onlineUsers);

        socket.on('chat message', (msg) => {
          chat.emit('chat message', msg);
        })


        socket.on('disconnect', () => {
          dabe.get().collection('rooms')
          console.log('user disconnected');
          console.log(socketusername + " left");
          if (socketusername != null) {
            console.log('deleting: '+curr_onlineUsers[curr_onlineUsers.indexOf(socketusername)]);
            chat.emit('user disconnect', socketusername);
            curr_onlineUsers.splice(curr_onlineUsers.indexOf(socketusername),1);
          }
        })

        //username sent
        socket.on('user connect', (username) => {
          console.log('user ' + username +' is waiting to connect');
          if(socketusername != null){

          }else{
            socketusername = username;
            console.log('user '+ socketusername + ' connected');
            curr_onlineUsers.push(username);
            console.log('onlineUsers: '+curr_onlineUsers);
            chat.emit('user connect', username);
          }
        })
      })

    }
  })
}


//ROUTING

//INDEX!!
app.route('/')
  .get((req, res, next) => {
    //RENDER!!!
    var callback2 = () => {
      rooms = new Array();
      ids = new Array();
      onlineCount = new Array();
      for(room in roomz){
        rooms.push(roomz[room]['topic']);
        ids.push(roomz[room]['_id'].toString());
      }
      console.log(ids);
      for(id in ids){
        // console.log(ids[id]);
        if(onlineUsers[ids[id]] != undefined){
          onlineCount.push(onlineUsers[ids[id]].length);
          console.log(onlineUsers[ids[id]].length);
        } else {
          onlineCount.push('unknown')
        }
      }
      res.render('index', {
        roomz: roomz,
        rooms: rooms,
        roomIDs: ids,
        count: onlineCount
      });
    }

    var roomz = ''
    dabe.findTopRooms(dabe.get(), (rooms) => {
      roomz = rooms;
      callback2();
    })

  });


//ROOM CREATE
app.route('/publicchat/createRoom')
  .get(() => {
      res.render('room_create_form');
  })
  .post(
      body('topic', 'Topic required').isLength({ min: 1}).trim(),
      sanitizeBody('topic').trim().escape(),

        (req, res, next) => {
          const errors = validationResult(req);

          var room = { topic : req.body.topic, onlineUsers: []}
          if(!errors.isEmpty()){
            res.render('room_create_form', {room: room, errors:errors.array()});
          }else{
            let collection = dabe.get().collection('rooms');
            collection.insertOne(room, (err, result) => {
              console.log('1 Room Created!');
              res.redirect('/');
              onlineUsers[result.ops[0]['_id']] = Array();
              curr_onlineUsers = onlineUsers[result.ops[0]['_id']]
              if(!err){
                io
                .of('/'+result.ops[0]['_id'])
                .on('connection', (socket) => {
                  let socketusername = null;
                  console.log('user connected from room with id:' + result[i]['_id'] +' and topic:'+ result[i]['topic']);
                  // console.log('a user connected to room with id: ' + result[i]['_id'] + ' topic: ' + result[i]['topic']);
                  // console.log(socket);
                  console.log('curr before sending' + curr_onlineUsers);
                  socket.emit('onlineUsers', curr_onlineUsers);

                  socket.on('chat message', (msg) => {
                    chat.emit('chat message', msg);
                  })


                  socket.on('disconnect', () => {
                    dabe.get().collection('rooms')
                    console.log('user disconnected');
                    console.log(socketusername + " left");
                    if (socketusername != null) {
                      console.log('deleting: '+[curr_onlineUsers.indexOf(socketusername)]);
                      chat.emit('user disconnect', socketusername);
                      curr_onlineUsers.splice(curr_onlineUsers.indexOf(socketusername),1);
                    }
                  })

                  //username sent
                  socket.on('user connect', (username) => {
                    console.log('user ' + username +' is waiting to connect');
                    if(socketusername != null){

                    }else{
                      socketusername = username;
                      console.log('user '+ socketusername + ' connected');
                      curr_onlineUsers.push(username);
                      console.log('onlineUsers: '+curr_onlineUsers);
                      chat.emit('user connect', username);
                    }
                  })
                })
              }
            })
          }
        })

//ROOMS
app.route('/publicchat/room-:roomID')
  .get((req, res, next) => {

    let db = dabe.get()
    let collection = db.collection('rooms');

    // collection.findOne({  "_id" : ObjectId("5a74ea6824d2f12b9d0c7443")}, (result) => {
    //   // if (err) throw err;
    //   // Id = result;
    //   console.log(result);
    //   res.send(req.params.roomID);
    // })
    collection.find({  "_id" : ObjectId(req.params.roomID)}).toArray((err,result) => {
      if(utils.isEmpty(result)){
        res.send('Sorry, Room ID is invalid, please go back.')
      }else{
        res.render('chat_room', { roomInfo: JSON.stringify(result[0])});
      }
    })

    // collection.find({'topic' : "Why Bernie?"}).toArray((err,result) => {
    //   console.log(result);
    //   res.send(result);
    // })

//     if() {
// ``
//     }
  })

app.route('/about')
  .get((req, res, next) => {
    res.render('about')
  })

http.listen('3000', () => {
  console.log('listening on 3000!');
});
