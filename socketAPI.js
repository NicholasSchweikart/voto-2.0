const cookieParser = require('cookie-parser'),
    cookie = require('cookie'),
    serverConfig = require('./serverConfig.json');

module.exports = (io, store) => {
    API = {};

    io.set('authorization', function (handshake, accept) {

        getUserId(handshake, (err, data) => {
            if (err) {
                return accept(err);
            }
            if (!data) {
                return accept(err);
            }

            return accept(null, true);
        });
    });

    io.on('connection', (socket) => {

        console.log('Client Connected! ');

        socket.on('join room', (sessionId) => {

            // Authorize user for this room.
            getUserId(socket.handshake,(err,userId)=>{
                if(err){
                    return;
                }
                db.isUserAuthorized(userId,(err,yes)=>{
                    if(err){
                        console.error(new Error("userId %d not authorized: %s", userId, err));
                        return;
                    }
                    if(yes){
                        socket.join(sessionId);
                    }
                })
            });
        });
    });

    /**
     * Emit a message to an entire IO room. The room number will be the sessionId.
     * @param sessionId the sessionId room to emit too.
     * @param msg the message for the room
     * @param _cb callback
     */
    API.emitToRoom = (sessionId, msg, _cb) => {

        if (!sessionId) {
            _cb("ER_NO_SESSION_ID");
            return;
        }

        if (!msg) {
            _cb("ER_NO_SESSION_ID");
            return;
        }

        console.log('Emitting to room: ' + sessionId + " Message: " + msg);
        io.sockets.in(sessionId).emit(msg);
    };

    let getUserId = (handshake,_cb)=>{

        let cookies = cookie.parse(handshake.headers.cookie);
        let cookieSessionId = cookieParser.signedCookie(cookies['id'], serverConfig.secret);

        store.get(cookieSessionId, (err, data) => {
            if (err) {
                return _cb("ER_NOT_LOGGED_IN");
            }
            if (!data) {
                return _cb("ER_NOT_LOGGED_IN");
            }
            if (data.userId) {
                let userId = data.userId;
                console.log('User: ' + userId + ' authorized on socket');
                return _cb(null, userId);
            }
        });
    };

    return API;
};
