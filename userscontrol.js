onlineUsers = {}

getOnlineUsers = () => {
  return onlineUsers
}
removeOnlineUser = (roomid, user) => {
  try{

  }
}
addOnlineUser = (roomid, user) => {
  try{
    onlineUsers[roomid].push(user)
    return true
  }
  catch(e):
    return false
}
addRoom = (roomid)=> {

}
removeRoom = (roomid)=> {

}

modules.exports = onlineUsers
