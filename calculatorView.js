$(document).ready(function(){
    
    var Iterator = function(arr){ return {
        index : -1,
        hasNext : function(){ return this.index <= arr.length; },
        hasPrevious: function(){ return this.index > 0; },

        current: function(){ return arr[ this["index"] ]; },

        next : function(){
            if(this.hasNext()){
                this.index = this.index + 1;            
                return this.current();
            } 
            return false;
        },

        previous : function(){
            if(this.hasPrevious()){
                this.index = this.index - 1
                return this.current();
            }
            return false;
        }
      }   
    };


    $("#expressionField").keydown(function (e) {
        // Allow: backspace, delete, escape, ., +
        if ($.inArray(e.keyCode, [46, 8, 27, 13, 190, 43, 187, 57]) !== -1 ||
             // Allow: Ctrl+A, Command+A
            (e.keyCode >= 65 && e.keyCode <= 90) ||
            (e.keyCode >= 97 && e.keyCode <= 122) ||
             // Allow: home, end, left, right, down, up
            (e.keyCode >= 35 && e.keyCode <= 40)) {
                 // let it happen, don't do anything
                 return;
        }
        console.log("key code is " + e.keyCode)
        // Ensure that it is a number and stop the keypress
        if (e.keyCode >= 50 && e.keyCode <= 57) {
            e.preventDefault();
        }
    });
    
    var ProxySingleton = (function(){
      function ProxySingleton() {
          //do stuff
      }
      var instance;
      return {
          getInstance: function(){
              if (instance == null) {
                  instance = new ProxySingleton();
                  // Hide the constructor so the returned objected can't be new'd...
                  instance.constructor = null;
              }
              return instance;
          }
     };
   })();

    $("#historyBtn").click(function(){
      console.log("history !" );
       var request = $.ajax({
          url: "/simplify/history",
          type: "GET",
          dataType: "json",
          contentType: 'application/json; charset=utf-8'
        }).done(function(data) {
                console.log("history back !" );

          listHistory(data.history);
        }).fail(function( data ) {

        });
    });

    $("#simplifyBtn").click(function(){
      console.log('submit button pressed.');
      var inputexp = $("#expressionField").val();
      inputexp = inputexp.replace(/\s/g, '');

      if(inputexp in ProxySingleton.getInstance()) {
        var data = ProxySingleton.getInstance()[inputexp]
        $("#output").html(data.simplifiedExpression);
        createMintermTable(data.minTerms, data.uniqueChars);
        listHistory(data.steps);

      } else {
        var request = $.ajax({
          url: "/simplify/result",
          type: "POST",
          dataType: "json",
          contentType: 'application/json; charset=utf-8',
          data: JSON.stringify({ inputexp : inputexp })
        }).done(function(data) {
          ProxySingleton.getInstance()[inputexp]= data
          $("#output").html(data.simplifiedExpression);
          createMintermTable(data.minTerms, data.uniqueChars);
          listHistory(data.steps);
        }).fail(function( data ) {

        });
      }

      function createMintermTable(minterms, chars) {
        $("#mindtermsTable thead tr").html("<th scope='col'></th>");
        $("#mindtermsTable tbody").html("");
        //make the table header with the unique characters in the expression
        if( chars ) {
          chars.forEach(function(char){
            $("#mindtermsTable thead tr").append("<th scope=col>" + char + "</th>");
          });
        }
        //add the minterms to the table
        if(minterms){
          //add the minterm term
          for (i = 0 ; i<minterms.length ; i++){
            $("#mindtermsTable tbody").append("<tr><th scope='row'> m" + i + "</th><tr>");
              //add the terms of the nth minterm
              for (j=0 ; j<minterms[i].length ; j++) {
                $("#mindtermsTable tbody tr:nth-last-child(2)").append("<td>" + minterms[i][j] + "</td>");
              }
          }
        }
      }

    });
  //Lists the simplification process of the expression
    function listHistory(steps) {
      $(".list-group").html("");

      var iter = Iterator(steps);
      while(iter.hasNext()){
          var item = iter.next();
          if(item && item.length > 0) {
            $(".list-group").append("<li class='list-group-item' >" + item + "</li>");
          }
      }
    }
});
