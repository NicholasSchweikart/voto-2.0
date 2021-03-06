const cookieParser = require("cookie-parser"),
  cookie = require("cookie"),
  serverConfig = require("./serverConfig.json"),
  redis = require('socket.io-redis');

const api = {};

module.exports = (io, store) => {

  /**
   * Emits a user response notification event to a teacher userId.
   * @param response the response logged in the system.
   * @param teacherId the userId of the teacher used to find the room.
   */
  api.emitUserResponse = (response, teacherId) => {
    console.log(`Emitting to teacher userId: ${teacherId} update: ${JSON.stringify(response)}`);
    io.sockets.in(teacherId).emit("user-response", response);
  };

  /**
   * Emits a new-question event to all the users in a specific session room.
   * @param questionId the ID of the question being activated.
   * @param sessionId the sessionId to find the room.
   */
  api.emitNewQuestion = (questionId, sessionId) => {
    console.log(`Emitting to sessionId: ${sessionId} new questionId: ${questionId}`);
    io.sockets.in(`sessionId_${sessionId}`).emit("new-question", questionId);
  };

  /**
   * Emits a session-active event to all the users in the session room.
   * @param sessionId the session ID to find the room.
   */
  api.emitSessionActivated = (sessionId) => {
    console.log(`Emitting session activation for sessionId ${sessionId}`);
    io.sockets.in(`sessionId_${sessionId}`).emit("session-active", sessionId);
  };

  /**
   * Emits a session-de-activated event to all clients in the room.
   * @param sessionId the sessionId to find the room.
   */
  api.emitSessionDeactivated = (sessionId) => {
    console.log(`Emitting session de-activation for sessionId ${sessionId}`);
    io.sockets.in(`sessionId_${sessionId}`).emit("session-de-activated", sessionId);
  };

  // Attach to the local redis server for scalability.
  io.adapter(redis({ host: 'localhost', port: 6379 }));

  /**
   *  Sets up authentication for every socket request.
   *  This will add a new object to sockets: socket.session === res.session
   */
  io.use((socket, next)=>{

    getUserSession(socket.handshake, (err, session) => {
      if (err) {
        console.log(`error on subscription: ${err}`);
        next(new Error('NOT_AUTHORIZED'));
      }else{
        console.log(`new socket authorized`);
        socket.session = session;
        next();
      }
    });
  });

  /**
   * Handle the connection of a new socket client.
   */
  io.on("connection", (socket) => {
    console.log("New client connected to socket.io!");

    /**
     * Subscribe a student to the channel for all authorized sessions.
     * These sessions are stored in redis and retrieved from the userSession.
     */
    socket.on("subscribe-to-sessions-student", () => {
      console.log(`socket authorized for ${socket.session.authorizedSessionIds}`);
      socket.session.authorizedSessionIds.map((sessionId)=>{
        console.log(`joining channel for sessionId: ${sessionId}`);
        socket.join(`sessionId_${sessionId}`);
      });
    });

    /**
     * Authorize and then open a room for an active session. Teacher ONLY
     */
    socket.on("subscribe-to-feed-teacher", () => {
      socket.join(socket.session.userId);
      console.log(`teacher userId ${socket.session.userId} has opened a new feed`);
    });

    /**
     * Error handler for all sockets.
     */
    socket.on("error", (err) => {
      console.error(new Error(`Socket Error: ${err}`));
    });
  });

  io.on("error", (err) => {
    console.error(new Error(`SocketAPI error: ${err}`));
  });

  /**
   * Gets the session object from the redis store for this user.
   * @param handshake proved socket.handshake object.
   * @param _cb callback(err, session)
   */
  let getUserSession = (handshake, _cb) => {
    const cookies = cookie.parse(handshake.headers.cookie),
      user_id = cookieParser.signedCookie(cookies.id, serverConfig.secret);

    store.get(user_id, (err, session) => {
      if (err) {
        console.error(new Error(`Retrieving userId from redis: ${err}`));
        return _cb("ER_REDIS_FAILURE");
      }
      if (!session) {
        return _cb("ER_NOT_LOGGED_IN");
      }
      if (session.userId) {
	console.log(`Found the userId of ${session.userId}`);
        return _cb(null, session);
      }
    });
  };
};

module.exports.api = api;