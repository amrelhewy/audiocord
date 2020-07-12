const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
let server = app.listen(PORT, () =>
  console.log(`socket microservice running ...`)
);
let io = require("socket.io")(server);
let loggedinUsers = [];
io.on("connection", (socket) => {
  socket.on("LoggedIn", (data) => {
    if (
      loggedinUsers.indexOf({ username: data.username, socketid: socket.id }) ==
      -1
    ) {
      loggedinUsers.push({ username: data.username, socketid: socket.id });
    }
  });
  socket.on("LoggedOut", (data) => {
    loggedinUsers = loggedinUsers.filter(
      (user) => user.username != data.username
    );
  });
  socket.on("addthedude", (data) => {
    const adder = loggedinUsers.find((user) => user.username === data.adder);
    const reciever = loggedinUsers.find((user) => user.username === data.me);
    if (adder && reciever) {
      io.sockets.connected[reciever.socketid].emit("addhimnow", {
        friend: data.adder,
      });
      io.sockets.connected[adder.socketid].emit("addhimnow", {
        friend: data.me,
      });
    }
  });
  socket.on("declinedCall",(data)=>{
    let gu = loggedinUsers.find(
        (user) => user.username === data.from
      );
      if(gu){
        io.sockets.connected[gu.socketid].emit('otherGuyBusy');
      }

  })
  socket.on("CallUser", (data) => {
    let guytoCall = loggedinUsers.find(
      (user) => user.username === data.userToCall
    );
    
    if(guytoCall){
        io.sockets.connected[guytoCall.socketid].emit("hey", {
            signal: data.signalData,
            from: data.caller,
          });
        

    }
    else{
        io.sockets.connected[socket.id].emit('userOffline');
    }
 
  });

  socket.on('endcall',(data)=>{
    let guytoCall = loggedinUsers.find(
      (user) => user.username === data.to
    );
    if(guytoCall){
      io.sockets.connected[guytoCall.socketid].emit('endedcall');

    }
  })
socket.on("callimsodone",(data)=>{
  let guytoCall = loggedinUsers.find(
    (user) => user.username === data.userToCall
  );
  if(guytoCall){
    io.sockets.connected[guytoCall.socketid].emit('stopringingpls');
  }
})
  socket.on("acceptCall",(data)=>{
    let gu = loggedinUsers.find(
      (user) => user.username === data.from
    );
    if(gu){
      io.sockets.connected[gu.socketid].emit('callAccepted',data.signal);
      io.sockets.connected[gu.socketid].emit('starttimer');
      io.sockets.connected[socket.id].emit('starttimer');


    }
  })
  socket.on("SendFriendRequest", ({ fromuser, touser }) => {
    const reciever = loggedinUsers.find((user) => user.username === touser);
    if (reciever) {
      io.sockets.connected[reciever.socketid].emit("NewFriendRequest", {
        adder: fromuser,
      });
    }
  });
  socket.on("disconnect", () => {
    loggedinUsers = loggedinUsers.filter((user) => user.socketid != socket.id);
  });
});
