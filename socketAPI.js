const cookieParser = require("cookie-parser"),
  cookie = require("cookie"),
  serverConfig = require("./serverConfig.json");

/**
 * Module to wrap a socket IO system.
 * @param io provide the pre-initialized socket.IO object.
 * @param store provide the pre-initialized redis store object.
 * @returns {{API OBJECT}|*}
 */
module.exports = (io, store) => {

  // API object to return after import.
  const API = {};

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
    console.log("New Client Connected!");

    /**
     * Provide authorization for a client to connect to a specific session.
     */
    socket.on("JOIN_SESSION", (sessionId) => {

      // Authorize user for this room.
      getUserId(socket.handshake, (err, userId) => {
        if (err) {
          return;
        }

        db.isUserAuthorized(userId, sessionId, (err, yes) => {
          if (err) {
            console.error(new Error("userId %d not authorized: %s", userId, err));
            socket.emit("ER_NOT_AUTHORIZED");
            return;
          }

          if (yes) {
            socket.join(sessionId);
          }
        });
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
      _cb("ER_NO_MSG");
      return;
    }

    console.log(`Emitting to room: ${sessionId} Message: ${msg}`);
    io.sockets.in(sessionId).emit(msg);
  };

  /**
   * Gets the userId from the socket handshake cookies.
   * @param handshake proved socket.handshake object.
   * @param _cb callback(err, userId)
   */
  let getUserId = (handshake, _cb) => {

    const cookies = cookie.parse(handshake.headers.cookie);
    const cookieSessionId = cookieParser.signedCookie(cookies.id, serverConfig.secret);

    store.get(cookieSessionId, (err, data) => {
      if (err) {
        return _cb("ER_NOT_LOGGED_IN");
      }
      if (!data) {
        return _cb("ER_NOT_LOGGED_IN");
      }
      if (data.userId) {
        const userId = data.userId;
        console.log(`User: ${userId} authorized on socket`);
        return _cb(null, userId);
      }
    });
  };

  return API;
};
