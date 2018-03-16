$(document).ready(function(){

  if(document.cookie){
      window.location.href = 'http://localhost:8042/calculator';
  }

  $("#loginBtn").click(function(){
    console.log("login button clicked!" );

    var username = $("#emailField").val();
    var password = $("#passwordField").val();

    userCredentials = {
      "username" : username,
      "password" : password,
    };

    console.log(userCredentials);

     var request = $.ajax({
        url: "/login",
        type: "GET",
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ userCredentials : userCredentials })
      }).done(function(data) {
            document.cookie = data.token;
            window.location.href = 'http://localhost:8042/calculator';
      }).fail(function( data ) {
      });

  });

});
