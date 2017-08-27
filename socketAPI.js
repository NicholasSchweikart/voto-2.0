const cookieParser = require("cookie-parser"),
  cookie = require("cookie"),
  serverConfig = require("./serverConfig.json");
const api = {};
module.exports = (io, store) => {

  api.emitUserResponse = (response, userId) => {

    console.log(`Emitting to teacher userId: ${userId} update: ${response}`);
    io.sockets.in(userId).emit('user-response', response);
  };

  api.emitNewQuestion = (questionId, sessionId) => {

    console.log(`Emitting to sessionId: ${sessionId} new questionId: ${questionId}`);
    io.sockets.in(sessionId).emit('new-question', questionId);
  };

  api.emitSessionActivated = (sessionId) => {

    console.log(`Emitting session activation for sessionId ${sessionId}`);
    io.sockets.in(sessionId).emit('session-active', sessionId);
  };

  api.emitSessionDeactivated = (sessionId) => {

    console.log(`Emitting session de-activation for sessionId ${sessionId}`);
    io.sockets.in(sessionId).emit('session-de-activated', sessionId);
  };

  /**
   * Set up socket authorization for all new connections.
   */
  io.set("authorization", (handshake, accept) => {
    getUserSession(handshake, (err, session) => {
      if (err) {
        return accept(err);
      }
      if (!session.userId) {
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

      console.log(`subscribing new user for sessionId ${sessionId}`);

      // Authorize this user and then add them to the room for this sessionId.
      getUserSession(socket.handshake, (err, session) => {

        if (err) {
          console.log(`error on subscription: ${err}`);
          return;
        }

        socket.join(session.authorizedSessionId);
        console.log(`socket authorized for ${session.authorizedSessionId}`);

      });
    });

    /**
     * Authorize and then open a room for an active session. Teacher ONLY
     */
    socket.on('subscribe-to-active-session-teacher', (sessionId) => {

      getUserSession(socket.handshake, (err, session) => {
        if (err) return;

        // Create room based on their userId
        socket.join(session.userId);
      });
    });

    socket.on('error', (err) => {
      console.error(new Error(`Socket: ${err}`));
    });
  });

  io.on('error', (err) => {
    console.error(new Error(`IO: ${err}`));
  });

  /**
   * Gets the userId from the socket handshake cookies.
   * @param handshake proved socket.handshake object.
   * @param _cb callback(err, credentials)
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
        return _cb(null, session);
      }
    });
  };
};
module.exports.api = api;
