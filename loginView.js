$(document).ready(function(){

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
            console.log("login responsed!" );
            var token = data.token;
            console.log("Token: " + data.token);
      }).fail(function( data ) {
      });
  });

});
