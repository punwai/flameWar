const { body, validationResult } = require('express-validator/check'),
      { sanitizeBody } = require('express-validator/filter'),
      dabe = require('./db.js');
dbName = 'Flamewar'

// 
// exports.room_create_post = [
//
//   body('topic', 'Topic required').isLength({ min: 1}).trim(),
//   sanitizeBody('topic').trim().escape(),
//
//   (req, res, next) => {
//     const errors = validationResult(req);
//
//     var room = { topic : req.body.topic, onlineUsers: []}
//     if(!errors.isEmpty()){
//       res.render('room_create_form', {room: room, errors:errors.array()});
//     }else{
//       let collection = dabe.get().collection('rooms');
//       collection.insertOne(room, (err, res) => {
//         console.log('1 Room Created!');
//       })
//
//
//
//
//   }
// ]

exports.room_create_get = (req,res,next) => {
  res.render('room_create_form');
}
