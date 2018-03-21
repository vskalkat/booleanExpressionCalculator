$(document).ready(function(){

  $("#signUpBtn").click(function(){
    console.log("signUp button clicked!" );

    var email = $("#emailField").val();
    var password = $("#passwordField").val();

    var isPremiumRegistration = $('#premiumOption').prop( "checked" );

    userCredentials = {
      "email" : email,
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
           window.location.href = 'http://localhost:8042/calculator';
           document.cookie = data.token;
           
      }).fail(function( data ) {
           console.log("sign up failed" );

      });
  });

});
