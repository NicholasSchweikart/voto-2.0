const
  redis = require('socket.io-redis'),
  userDb = require('./bin/userDB'),
  jwt = require('jsonwebtoken'),
  serverConfig = require('./serverConfig'),
  presentationsDb = require("./bin/presentationsDB.js"),
  slidesDb = require('./bin/slidesDB');

const api = {};

module.exports = (io) => {

  api.emitUserResponse = (response, adminId) => {
    console.log(`Emitting to teacher socketId: ${adminId} update: ${JSON.stringify(response)}`);
    io.sockets.in(adminId).emit("user-response", response);
  };

  api.emitSlideActive = (slideId, classId) => {
    console.log(`Emitting slide activation for presentationId ${slideId} classId ${classId}`);
    //io.sockets.in(`classId_${classId}`).emit("presentation-active", presentationId);
  };

  api.emitPresentationActive = (presentationId, classId) => {
    console.log(`Emitting presentation activation for presentationId ${presentationId} classId ${classId}`);
    //io.sockets.in(`classId_${classId}`).emit("presentation-active", presentationId);
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

    console.log(`userId[${socket.user.userId}] connected to socket.io!`);

    socket.on("subscribe-to-class-channels", () => {

      let userId = socket.user.userId;
      console.log(`Checking authorizations for userId [${userId}]`);

      userDb.getAuthorizedClasses(userId, (err, authorizedClasses) => {
        if (err) {
          return new Error(err);
        }
        console.log(`User authorized for ${authorizedClasses}`);
        authorizedClasses.map((classId) => {
          console.log(`joining channel for classId: ${classId}`);
          socket.join(`classId_${classId}`);
        });
      });
    });

    socket.on('toggle-presentation', (presentationId, state) =>{

      presentationsDb.togglePresentation(socket.user.userId, presentationId, state, (err, classId) => {

        if (err) {
          return new Error(`${err}`);
        }

        // Set array for socket.io operations to happen without DB interaction.
        if (classId) {

          // Alert sockets
          console.log(`Emitting presentation activation for presentationId ${presentationId} classId ${classId}`);
          io.sockets.in(`classId_${classId}`).emit("presentation-active", presentationId);
        }
      });
    });

    socket.on('toggle-slide', (slideId, state)=>{

      slidesDb.toggleSlide(socket.user.userId, slideId, state, (err, slide) => {

        if (err) {
          console.log(`Error toggle slide: ${err}`);
          return new Error(err);
        }

        // Set array for socket.io operations to happen without DB interaction.
        if (slide) {

          // Alert sockets
          console.log(`Emitting slide activation for slideId ${slide.slideId} classId ${slide.classId}`);
          io.sockets.in(`classId_${slide.classId}`).emit("slide-active", slide);
        }
      });
    });

    socket.on('submit-response',(response) => {

    });

    socket.on("error", (err) => {
      console.error(new Error(`Socket Error: ${err}`));
    });

    socket.on("disconnect", (reason) => {
      console.log(`socket.id = [${socket.id}] disconnected`);
    });
  });

  io.on("error", (err) => {
    console.error(new Error(`SocketAPI error: ${err}`));
  });
};
module.exports.api = api;