$(document).ready(function(){
    $("#expressionField").keydown(function (e) {
        // Allow: backspace, delete, escape, ., +
        if ($.inArray(e.keyCode, [46, 8, 27, 13, 190, 43, 187]) !== -1 ||
             // Allow: Ctrl+A, Command+A
            (e.keyCode >= 65 && e.keyCode <= 90) ||
            (e.keyCode >= 97 && e.keyCode <= 122) ||
             // Allow: home, end, left, right, down, up
            (e.keyCode >= 35 && e.keyCode <= 40)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if (e.keyCode >= 50 && e.keyCode <= 57) {
            e.preventDefault();
        }
    });

    $("#simplifyBtn").click(function(){
      console.log('submit button pressed.');

      var inputexp = $("#expressionField").val();
      inputexp = inputexp.replace(/\s/g, '');

      var request = $.ajax({
        url: "/simplify/result",
        type: "POST",
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ inputexp : inputexp })
      }).done(function(data) {
        $("#output").html(data);
      }).fail(function( data ) {

      });

//Reverse input string to to account for A+1 and 1+A (both orders)
        // inputexp = inputexp.split("").reverse().join("");
        // inputexp = simplify(inputexp);
        //
        // inputexp = inputexp.split("").reverse().join("");
        // inputexp = simplify(inputexp);
        //
        // $("#output").html(inputexp);
    });

});
