
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImZpcnN0TmFtZSI6IkJvYiIsImxhc3ROYW1lIjoiVG9vbCIsInVzZXJOYW1lIjoiTmljYmlsbHkiLCJjcmVhdGlvbkRhdGUiOiIyMDE3LTA4LTIzVDEyOjMyOjI4LjAwMFoiLCJ0eXBlIjoiUyIsImVtYWlsIjoibWVAbWUuY29tIiwiaWF0IjoxNTEzODE3OTM2LCJleHAiOjE1MTM5MDQzMzZ9.AjLSYdQH317Sa2JV5az9QceQcTR2rACpyBKK44psNNk"

const io = require('socket.io-client');

let socket = io.connect(`http://localhost:8080/?token=${token}`);

socket.on('connected',()=>{
  console.log('connected!')
});

socket.on('new-session', (sessionId)=>{
  console.log(sessionId)
});

socket.on('session-active', (sessionId)=>{
  console.log('New active session: ' + sessionId)
});

socket.on('error', (error)=>{
  console.log('ERR: ' + error);
});

socket.emit('subscribe-to-sessions-student');


