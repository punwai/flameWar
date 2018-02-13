mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
  topic: {
    type: String,
  },
  onlineUsers: {
    type: Number,
  },
})

var Room = mongoose.model('Room', roomSchema);

room = new Room({topic: 'Is trump improving America?', onlineUsers: 0});
console.log(room);
room.save()
console.log(room);
