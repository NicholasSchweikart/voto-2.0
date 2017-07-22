
var navbar, fullscreenButton;

$(document).ready( function(){

  $('.button-collapse').sideNav()

  navbar = $('#navbar')

  fullscreenButton = $('#fullscreenButton');

  fullscreenButton.click( function(){
    navbar.toggleClass("hide")
  });

});
