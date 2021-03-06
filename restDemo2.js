var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var app = express();

var bcrypt = require('bcrypt');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'pakistan',
  database : 'my_db'
});


createSchema(connection);


app.use(bodyParser.json());

app.use("", express.static(__dirname + ""));

app.get('/', (req, res) => { //anonymous function
  console.log("GET request received for root");
  res.sendFile(__dirname + '/loginView.html');
})

app.get('/calculator', (req, res) => { //anonymous function
  console.log("GET request received for calculator page");
  res.sendFile(__dirname + '/calculator.html');
})

var history = []

const saltRounds = 10;


app.post('/simplify/result', function (req, res) {
  var input = req.body.inputexp;
  retrieveExpression(input, connection, function(result) {
      if(result && result.length > 0) {
          res.send(result[0]['steps']);
      }
      else {
          var contentToSend = simplifyFacade.simplifyExpression(input);
          history.push(input + " : " + contentToSend.simplifiedExpression)

          insertExpression(input, contentToSend.simplifiedExpression, JSON.stringify(contentToSend), connection);

          res.send(JSON.stringify(contentToSend));
      }
  });

})


function insertExpression(input, simplified, steps, con) {
    var sql = "INSERT INTO expressions (user_email, input_exp, simplified_exp, steps) VALUES ('banchot@hotmail.com', '" + input + "','" + simplified + "', '" + steps + "');";
    connection.query(sql, function (err, result) {
      console.log("Expression added " + result + " with err " + err);
    });
}

function retrieveExpression(input, con, listener) {
    var sql = "SELECT * FROM expressions WHERE input_exp = '" + input + "'";
    connection.query(sql, function (err, result) {

      if(err) {
        listener(false);
        console.log("errored out " + err);
        return;
      } else {
         listener(result);
         console.log("Expression retrieved " + result + " with err " + err + " where query was " + sql);
      }


    });
}

function addUser(user, connection) {
    var sql = "INSERT INTO users (email, password, is_premium, fav_teacher) VALUES ('"+ user.email + "', '" + user.password + "', " + user.is_premium + ", '" + user.fav_teacher + "');";
    connection.query(sql, function (err, result) {
      console.log("Banchot added " + result + " result : " + sql + " with err " + err);
    });
}

function retrieveUser(email, connection, listener) {
    var sql = "SELECT * FROM users WHERE email = '" + email + "'";
    connection.query(sql, function (err, result) {

      if(err) {
        listener(false);
        console.log("errored out " + err);
        return;
      } else {
         listener(result);
         console.log("User successfully retreived " + result + " with err " + err + " where query was " + sql);
      }


    });
}

function createDefaultUsers(connection) {
    var sql = "INSERT INTO users (email, password, is_premium) VALUES ('banchot@hotmail.com', 'password', true, 'igor');";
    connection.query(sql, function (err, result) {
      console.log("Banchot added " + result);
    });
}

function createSchema(con) {
      con.query("CREATE DATABASE IF NOT EXISTS my_db", function (err, result) {
        if (err) throw err;
        console.log("Database created");
      });

      var sql = "CREATE TABLE IF NOT EXISTS users (email VARCHAR(255) PRIMARY KEY, password VARCHAR(255), is_premium BOOLEAN, fav_teacher VARCHAR(255))";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("User Table created");
      });

      sql = "CREATE TABLE IF NOT EXISTS expressions (id INT PRIMARY KEY AUTO_INCREMENT, user_email VARCHAR(255), input_exp VARCHAR(255) UNIQUE, simplified_exp VARCHAR(255), steps VARCHAR(255))";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Expression Table created");
      });

      createDefaultUsers(con);
}

app.get('/simplify/history', function (req, res) {
  var historyStruct = { "history" : history};
  res.send(JSON.stringify(historyStruct));
})


app.post('/login', function (req, res) {
  var email = req.body.userCredentials.username;
  var password = req.body.userCredentials.password;

  retrieveUser(email, connection, function(result) {
      if(result && result.length > 0) {
          user = result[0];
          console.log(user);
         

          bcrypt.compare(password, user.password, function(err, response) {
              if(response) {
                const token = jwt.sign({}, 'my_secret_key', {expiresIn: '60000'});
                var contentToSend = {
                  "token" : token
                };

                res.send(JSON.stringify(contentToSend));
                console.log("login succeeded");
              } else {
                var contentToSend = {"message" : "login failed, wrong password"};
                res.send(JSON.stringify(contentToSend));
              }

          });
      }
      else {
          var contentToSend = {"message" : "login failed, no user."};
          res.send(JSON.stringify(contentToSend));
      }
  });

})

//do stuff that requires authentication privlidges here
app.get('/protected', ensureToken, function(req, res){
  var tokenVerified = false;
  jwt.verify(req.headers["authorization"], 'my_secret_key', function(err, data){
    if(err){
      console.log("Error in token verification:" + err);
      tokenVerified = false;
      res.sendStatus(403);
    } else {
      console.log('token verification: SUCCESS.');
      tokenVerified = true;
      res.json({
        tokenVerified : tokenVerified
      });
    }
  })
})

function ensureToken(req, res, next){
  console.log("ensuring token...");
  const bearerHeader = req.headers["authorization"];
  if(typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

app.post('/signUp', function (req, res) {
  var email = req.body.userCredentials.email;
  var password = req.body.userCredentials.password;
  var isPremiumRegistration = req.body.userCredentials.isPremiumRegistration;
  var fav_teacher = req.body.userCredentials.fav_teacher;

  var user = {
    email: email,
    password: password,
    is_premium: isPremiumRegistration,
    fav_teacher: fav_teacher
  };

  if (isValidEmail(email)){
    const token = jwt.sign({}, 'my_secret_key', {expiresIn: '60000'});
    var contentToSend = {
      "token" : token
    };
    res.send(JSON.stringify(contentToSend)); // this is a 200
    console.log("SignUp POST request hit! 1 success ");

    //add new user to database
    bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {

          bcrypt.hash(fav_teacher, salt, function(err, fav_enc) {
            user.password = hash;
            user.fav_teacher = fav_enc;
            addUser(user, connection);
          });
      });
    });

  } else {
    res.sendStatus(403);
  }

})


function isValidEmail(email){
  return (email && email.length > 0);
}

var server = app.listen(8042, function(){
  var port = server.address().port
  console.log('Node.js server running at localhost:%s', port)
})

function validateCredentials(user, password){

  if(!user) return false;

  bcrypt.compare(password, user.password, function(err, res) {
      return res
  });
}

var simplifyFacade = new function(){

  function BasicSimplifier(){
  }

  // Add methods like this.  All Person objects will be able to invoke this
  BasicSimplifier.prototype.firstSimplification = function(inputexp){

      inputexp = inputexp.replace(/\s/g, '');

    //Reverse input string to to account for A+1 and 1+A (both orders)
      inputexp = inputexp.split("").reverse().join("");
      // inputexp = inputexp.replace("~~", "");
      var inputexpStruct = simplify(inputexp);
      inputexp = inputexpStruct.inputexp
      inputexp = inputexp.split("").reverse().join("");
      inputexpStruct = simplify(inputexp);
      inputexp = inputexpStruct.inputexp

      return {
        inputexp : inputexp
      }
  };

  function regexSimplify(inputexp, matchReg, replaceLetterSt, replacementStr) {
      var match = inputexp.match(matchReg);
      if(match){
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1 + replaceLetterSt, replacementStr);
          return inputexp;
      }
        
      return false
  }

  function regexSimplifyReversed(inputexp, matchReg, replaceLetterSt, replacementStr) {
      var match = inputexp.match(matchReg);
      if(match){
          var letter1 = match[0].charAt(1);
          inputexp = inputexp.replace(replaceLetterSt + letter1, replacementStr);
          return inputexp;
      }
        
      return false
  }

  function regexSimplifyLetterReplace(inputexp, matchReg, replaceLetterSt) {
      var match = inputexp.match(matchReg);
      if(match){
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1 + replaceLetterSt, letter1);
          return inputexp;
      }
        
      return false
  }



  function simplify(inputexp) {
      do {
        var initialInput = inputexp;
       
        var nextSimplification = regexSimplify(inputexp, /[a-z]\+[1]\s*?/i, "+1", "1");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }

        nextSimplification = regexSimplifyLetterReplace(inputexp, /[a-z]\+[0]\s*?/i, "+0");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }

        nextSimplification = regexSimplifyLetterReplace(inputexp, /[a-z]\.[1]\s*?/i,  ".1");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }

        nextSimplification = regexSimplify(inputexp, /[a-z]\.[0]\s*?/i, ".0", "0");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }

        nextSimplification = regexSimplify(inputexp, /1\+1\s*?/i, "1+1", "1");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }

        nextSimplification = regexSimplify(inputexp, /1\+0\s*?/i, "1+0", "1");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }


        nextSimplification = regexSimplify(inputexp, /1\.1\s*?/i, "1.1", "1");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }

        nextSimplification = regexSimplify(inputexp, /1\.0\s*?/i, "1.0", "0");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }


        nextSimplification = regexSimplify(inputexp, /[a-z]0/i, "0", "0");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }

        nextSimplification = regexSimplify(inputexp, /~[a-z]/i, "~", "1");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }

        nextSimplification = regexSimplify(inputexp, /~[A-Z]/i, "~", "1");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }

        nextSimplification = regexSimplify(inputexp, /[A-Z]0/i, "0", "0");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }

        nextSimplification = regexSimplify(inputexp, /[a-z]1/i, "1", "1");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }

        nextSimplification = regexSimplify(inputexp, /[A-Z]1/i, "1", "1");
        if(nextSimplification) {
          inputexp = nextSimplification;
        }


        match = inputexp.match(/[a-z]\.[a-z]\s*?/i);
        if (match) {
          var letter1 = match[0].charAt(0);
          var letter2 = match[0].charAt(2);
          if(letter1 == letter2) {
            inputexp = inputexp.replace(letter1 + "." + letter2, letter1);
          }
        }

        inputexp = inputexp.replace("(a)", "a");
        inputexp = inputexp.replace("(b)", "b");
        inputexp = inputexp.replace("(c)", "c");
        inputexp = inputexp.replace("(d)", "d");
        inputexp = inputexp.replace("(e)", "e");
        inputexp = inputexp.replace("(f)", "f");
        inputexp = inputexp.replace("(g)", "g");
        inputexp = inputexp.replace("(h)", "h");
        inputexp = inputexp.replace("(i)", "i");
        inputexp = inputexp.replace("(j)", "j");
        inputexp = inputexp.replace("(k)", "k");
        inputexp = inputexp.replace("(l)", "l");
        inputexp = inputexp.replace("(m)", "m");
        inputexp = inputexp.replace("(n)", "n");
        inputexp = inputexp.replace("(o)", "o");
        inputexp = inputexp.replace("(p)", "p");
        inputexp = inputexp.replace("(q)", "q");
        inputexp = inputexp.replace("(r)", "r");
        inputexp = inputexp.replace("(s)", "s");
        inputexp = inputexp.replace("(t)", "t");
        inputexp = inputexp.replace("(u)", "u");
        inputexp = inputexp.replace("(v)", "v");
        inputexp = inputexp.replace("(x)", "x");
        inputexp = inputexp.replace("(y)", "y");
        inputexp = inputexp.replace("(z)", "z");

      } while(initialInput.length != inputexp.length)

      return {
        inputexp: inputexp
      }
    }

  function QuineMccluskeySimplifier(){
  }

  this.simplifyExpression = function(expression){

    var finalMinTerms = []
    var finalUniqueChars = []
    var basicSimplifier = new BasicSimplifier();
    var quineMccluskeySimplifier = new QuineMccluskeySimplifier();

    var inputStruct = basicSimplifier.firstSimplification(expression) // Initial basic simplification

    input = inputStruct.inputexp

    var minTermStruct = quineMccluskeySimplifier.extractMinTerms(input);  // Simplifies using Quine Mccluskey algorithm
    var minTerms = minTermStruct.minTerms;
    var uniqueChars = minTermStruct.uniqueChars
    var nonVariableTerms = minTermStruct.nonVariableTerms
    var simplifiedTerms = quineMccluskeySimplifier.find_prime_implicants(minTerms)
    var simplifiedExpression = quineMccluskeySimplifier.makeExpression(simplifiedTerms, uniqueChars)
    for (var i = nonVariableTerms.length - 1; i >= 0; i--) {
      if (simplifiedExpression.length != 0) {
        simplifiedExpression += " + "
      }
      simplifiedExpression += nonVariableTerms[i]
    }
    finalUniqueChars.concat(uniqueChars)
    finalMinTerms.concat(minTerms)
    var output = {
      uniqueChars : uniqueChars,
      minTerms : minTerms,
      simplifiedExpression : simplifiedExpression

    };

    return output;
  }


   var combine = function (m, n) {
        var a = m.length, c = '', count = 0, i;
        for (i = 0; i < a; i++) {
            if (m[i] === n[i]) {
                c += m[i];
            } else if (m[i] !== n[i]) {
                c += '-';
                count += 1;
            }
        }

        if (count > 1) {
            return "";
        }

        return c;
    };

    var repeatelem = function(elem, count) {
        var accu = [],
            addOneAndRecurse = function(remaining) { accu.push(elem); if (remaining > 1) { addOneAndRecurse(remaining - 1); } };
        addOneAndRecurse(count);
        return accu;
    };

    //https://stackoverflow.com/questions/7537125/quine-mccluskey-algorithm-in-python
    QuineMccluskeySimplifier.prototype.find_prime_implicants = function(data) {
        var newList = [].concat(data),
            size = newList.length,
            IM = [],
            im = [],
            im2 = [],
            mark = repeatelem(0, size),
            mark2,
            m = 0,
            i,
            j,
            c,
            p,
            n,
            r,
            q;
        for (i = 0; i < size; i++) {
            for (j = i + 1; j < size; j++) {
                c = combine(newList[i], newList[j]);
                if (c !== "") {
                    im.push(c);
                    mark[i] = 1;
                    mark[j] = 1;
                }
            }
        }

        mark2 = repeatelem(0, im.length);
        for (p = 0; p < im.length; p++) {
            for (n = p + 1; n < im.length; n++) {
                if (p !== n && mark2[n] === 0 && im[p] === im[n]) {
                    mark2[n] = 1;
                }
            }
        }

        for (r = 0; r < im.length; r++) {
            if (mark2[r] === 0) {
                im2.push(im[r]);
            }
        }

        for (q = 0; q < size; q++) {
            if (mark[q] === 0) {
                IM.push(newList[q]);
                m = m + 1;
            }
        }

        if (m !== size && size !== 1) {
            IM = IM.concat(this.find_prime_implicants(im2));
        }

        IM.sort();
        return IM;
    }

    QuineMccluskeySimplifier.prototype.extractMinTerms = function(input) {
      var uniqueChars = unique_char(input);
      uniqueChars.sort();
      var tokens = input.split("+");

      var nonVariableTerms = []
      var minTerms = [];

      for(var x = 0; x < tokens.length; x++) {
         var token = tokens[x];
         var minTerm = "";
         for(var y = 0; y < uniqueChars.length; y++) {
            var index = token.indexOf(uniqueChars[y]);
            if(index != -1) {
               minTerm += ((y == token.length -1) || token.charAt(index + 1) != '\'') ? "1" : "0";
            } else {
               minTerm += "x"
            }
         }
         minTerms.push(minTerm);
         if(minTerm.length == 0 && token.length != 0) {
           nonVariableTerms.push(token)
         }
      }
      console.log("min terms be");
      console.log(minTerms);

      return {
        minTerms: minTerms,
        uniqueChars: uniqueChars,
        nonVariableTerms: nonVariableTerms
      }
    }

    QuineMccluskeySimplifier.prototype.makeExpression = function (simplifiedTerms, uniqueChars) {
      var terms = ""
      for(var x = 0; x < simplifiedTerms.length; x++) {
         var term = simplifiedTerms[x]
         var convertedTerm = "";
         for(var y = 0; y < term.length; y++) {
            if ( term.charAt(y) == '1' ) {
               convertedTerm += uniqueChars[y]
            } else if (term.charAt(y) == '0') {
               convertedTerm += uniqueChars[y] + '\''
            }
         }
         if(x != 0) {
          terms += "+"
         }

         terms += convertedTerm
      }
      return terms;
    }

    function unique_char(str1) {
     var str=str1;
     var uniql= [];
     for (var x=0;x < str.length;x++) {
       if((str.charAt(x).match(/[A-Z]/i) || str.charAt(x).match(/[a-z]/i)) && uniql.indexOf(str.charAt(x))==-1){
          uniql.push(str[x]);
       }
     }
     return uniql;
    }

}
