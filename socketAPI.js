
module.exports = (io)=>{
    API = {};

    io.on('connection', (socket)=>{

        console.log('Client Connected! ' + socket);

        socket.on('room',(sessionId)=>{
            socket.join(sessionId);
        });
    });

    /**
     * Emit a message to an entire IO room. The room number will be the sessionId.
     * @param sessionId the sessionId room to emit too.
     * @param msg the message for the room
     * @param _cb callback
     */
    API.emitToRoom = (sessionId,msg,_cb)=>{

        if(!sessionId){
            _cb("ER_NO_SESSION_ID");
            return;
        }

        if(!msg){
            _cb("ER_NO_SESSION_ID");
            return;
        }

        console.log('Emitting to room: ' + sessionId + " Message: " + msg);
        io.sockets.in(sessionId).emit(msg);
    };
    return API;
};
