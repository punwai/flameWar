const MongoClient = require('mongodb').MongoClient;
const assert = require('assert')
//DATABASE CONNECTION URL
var state = {
  db: null
}

const findTopRooms = function(db, callback){
  const collection = db.collection('rooms');

  collection.find({}).sort({onlineUsers: -1}).toArray((err, rooms) => {
    assert.equal(err, null);
    callback(rooms)
  })
}



var connect = (url, database, callback) => {
  MongoClient.connect(url, (err, client) => {
    assert.equal(null, err);
    console.log("succesfully connected");
    db = client.db(database);
    state.db = db
    callback()
  });
}

var get = () => {
  return state.db
}

var close = (callback) => {
  if (state.db) {
    state.db.close((err, result) => {
      state.db = null

      callback(err)
    })
  }
}

module.exports = {
  connect,
  close,
  get,
  findTopRooms,
}
