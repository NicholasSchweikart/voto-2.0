const cookieParser = require("cookie-parser"),
  cookie = require("cookie"),
  redis = require('socket.io-redis'),
  userDb = require('./bin/userDB'),
  jwt = require('jsonwebtoken'),
  serverConfig = require('./serverConfig');

const api = {};

module.exports = (io) => {

  /**
   * Emits a user respon se notification event to a teacher userId.
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
  io.adapter(redis({host: 'localhost', port: 6379}));

  /**
   *  Sets up authentication for every socket request.
   *  This will add a new object to sockets: socket.session === res.session
   */
  io.use((socket, next) => {

    let token = socket.handshake.query.token;

    jwt.verify(token, serverConfig.secret, (err, user) => {
      if (err) {
        console.log(`error on subscription: ${err}`);
        next(new Error('NOT_AUTHORIZED'));
      } else {
        console.log(`new socket authorized`);
        socket.user = user;
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
     */
    socket.on("subscribe-to-class-channels", () => {

      let userId = socket.user.userId;
      console.log(`Checking authorizations for userId [${userId}]`);

      userDb.getAuthorizedClasses(userId, (err, authorizedClasses) => {
        if (err) {
          return res.status(500).json({error: err});
        }
        console.log(`User authorized for ${authorizedClasses}`);
        authorizedClasses.map((classId) => {
          console.log(`joining channel for classId: ${classId}`);
          socket.join(`classId_${classId}`);
        });
      });
    });

    /**
     * Subscribe a student to the channel for a specific presentation.
     */
    socket.on("subscribe-to-presentation-channel", (presenationId) => {

      let userId = socket.user.userId;
      console.log(`Checking authorizations for userId ${userId} for presentationId ${presenationId}`);

      userDb.canUserJoinPresentationChannel(userId, (err, yes) => {
        if (err) {
          return res.status(500).json({error: err});
        }

        if(yes){
          return socket.join(`presentationId_${presenationId}`);
        }
      });
    });

    /**
     * Authorize and then open a room for an active session. Teacher ONLY
     */
    socket.on("subscribe-to-channel-teacher", () => {
      socket.join(socket.user.userId);
      console.log(`teacher userId ${socket.user.userId} has opened a new channel`);
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
};
module.exports.api = api;