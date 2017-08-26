const cookieParser = require("cookie-parser"),
  cookie = require("cookie"),
  serverConfig = require("./serverConfig.json"),
  http = require("http"),
  server = http.createServer(),
  io = require("socket.io").listen(server);

let store = {};

exports.emitUserResponse = (response, userId) => {

  console.log(`Emitting to teacher userId: ${userId} update: ${response}`);
  io.sockets.in(userId).emit('user-response',response);
};

exports.emitNewQuestion = (questionId, sessionId) => {

  console.log(`Emitting to sessionId: ${sessionId} new questionId: ${questionId}`);
  io.sockets.in(sessionId).emit('new-question', questionId);
};

exports.emitSessionActivated = (sessionId) =>{

  console.log(`Emitting session activation for sessionId ${sessionId}`);
  io.sockets.in(sessionId).emit('session-active', sessionId);
};

exports.emitSessionDeactivated = (sessionId) => {

  console.log(`Emitting session de-activation for sessionId ${sessionId}`);
  io.sockets.in(sessionId).emit('DE_ACTIVATED', sessionId);
};

/**
 * Set up socket authorization for all new connections.
 */
io.set("authorization", (handshake, accept) => {
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

/**
 * Handle the connection of a new socket client.
 */
io.on("connection", (socket) => {
  console.log("New client connected to socket.io!");

  /**
   * Provide authorization for a student to connect to a specific session.
   */
  socket.on("subscribe-to-session-student", (sessionId) => {

    // Authorize this user and then add them to the room for this sessionId.
    getAuthorizedSessionId(socket.handshake, (err, authorizedSessionId) => {

      if (err) {
        return;
      }
      //TODO maybe change this to only use the cookie.
      if (authorizedSessionId === sessionId) {
        socket.join(sessionId);
      }
    });
  });

  /**
   * Authorize and then open a room for an active session. Teacher ONLY
   */
  socket.on('subscribe-to-active-session-teacher', (sessionId) => {

    getActiveSessionId(socket.handshake, (err, activeSessionId) => {
      if(err)return;

      if(sessionId === activeSessionId){

        // Create room based on their userId
        getUserId(socket.handshake, (err, userId) => {
          if(err)return;
          socket.join(userId);
        });
      }
    });
  });

  socket.on('error',(err)=>{
    console.error(new Error(`Socket: ${err}`));
  });
});

io.on('error',(err)=>{
  console.error(new Error(`IO: ${err}`));
});

/**
 * Gets the userId from the socket handshake cookies.
 * @param handshake proved socket.handshake object.
 * @param _cb callback(err, credentials)
 */
let getUserId = (handshake, _cb) => {

  const cookies = cookie.parse(handshake.headers.cookie),
    user_id = cookieParser.signedCookie(cookies.id, serverConfig.secret);

  store.get(user_id, (err, data) => {
    if (err) {
      console.error(new Error(`Retrieving userId from redis: ${err}`));
      return _cb("ER_REDIS_FAILURE");
    }
    if (!data) {
      return _cb("ER_NOT_LOGGED_IN");
    }
    if (data.userId) {
      return _cb(null, data.userId);
    }
  });
};

/**
 * Gets the userId from the socket handshake cookies.
 * @param handshake proved socket.handshake object.
 * @param _cb callback(err, authorizedSessionId)
 */
let getAuthorizedSessionId = (handshake, _cb) => {

  const cookies = cookie.parse(handshake.headers.cookie),
    auth_session_id = cookieParser.signedCookie(cookies.authorizedSessionId, serverConfig.secret);

  store.get(auth_session_id, (err, data) => {
    if (err) {
      console.error(new Error(`Retrieving userId from redis: ${err}`));
      return _cb("ER_REDIS_FAILURE");
    }
    if (!data) {
      return _cb("ER_NOT_LOGGED_IN");
    }
    if (data.authorizedSessionId) {
      return _cb(null, data.authorizedSessionId);
    }
  });
};

/**
 * Gets the userId from the socket handshake cookies.
 * @param handshake proved socket.handshake object.
 * @param _cb callback(err, activeSessionId)
 */
let getActiveSessionId = (handshake, _cb) => {

  const cookies = cookie.parse(handshake.headers.cookie),
    auth_session_id = cookieParser.signedCookie(cookies.activeSessionId, serverConfig.secret);

  store.get(auth_session_id, (err, data) => {
    if (err) {
      console.error(new Error(`Retrieving userId from redis: ${err}`));
      return _cb("ER_REDIS_FAILURE");
    }
    if (!data) {
      return _cb("ER_NO_ACTIVE_SESSION_SET");
    }
    if (data.activeSessionId) {
      return _cb(null, data.activeSessionId);
    }
  });
};
server.listen(1212);