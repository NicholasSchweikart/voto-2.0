const io = require('socket.io-client');

let socket = {}, api = {};

module.exports.initSocket = (token)=>{
  socket = io.connect(`http://localhost:8080/?token=${token}`);
  registerListeners();
};

module.exports.togglePresentation = (presentationId, state) => {
  socket.emit('toggle-presentation',presentationId, state);
};

module.exports.toggleSlide =(slideId, state)=> {
  socket.emit('toggle-slide',slideId, state);
};

module.exports.registerForClasses = () => {
  socket.emit('subscribe-to-class-channels');
};

function registerListeners() {
  socket.on('connected',()=>{
    console.log('connected!');

    socket.on('slide-active', (slideId)=>{
      console.log('slideID[%d] active',slideId)
    });

    socket.on('presentation-active', (presentationId)=>{
      console.log('presentationID[%d] active', presentationId);
    });

    socket.on('error', (error)=>{
      console.log('ERR: ' + error);
    });
  });
}
