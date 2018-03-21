$(document).ready(function(){

  $("#signUpBtn").click(function(){
    console.log("signUp button clicked!" );

    var username = $("#emailField").val();
    var password = $("#passwordField").val();

    var isPremiumRegistration = $('#premiumOption').prop( "checked" );

    userCredentials = {
      "username" : username,
      "password" : password,
      "isPremiumRegistration" : isPremiumRegistration
    };

    console.log(userCredentials);

     var request = $.ajax({
        url: "/signUp",
        type: "POST",
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
