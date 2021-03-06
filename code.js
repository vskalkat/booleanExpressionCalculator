var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
app.use(bodyParser.json());

app.use("", express.static(__dirname + ""));


var newCourse = {
  "syde322":
     {"name":"Software Design",
         "description":"Software requirements specification; software architecture; design patterns; software testing and quality assurance; software maintenance; design of efficient algorithms and methods for their analysis, mathematical algorithms, string processing algorithms, geometrical algorithms, exhaustive search and traversal techniques, introduction to lower bound theory and NP-completeness. Case studies and engineering examples.",
         "prereq":"CS 240 or ECE 250 or MTE 140 or SYDE 223 or Level at least 3B Systems Design Engineering.",
         "antireq":""
    }
}

app.get('/', (req, res) => { //anonymous function
  console.log("GET request received for root");
  res.sendFile(__dirname + '/calculator.html');
})

app.get('/courses', (req, res) => { //anonymous function
  console.log("GET request received");
  fs.readFile(__dirname + "/" + "courses.json", 'utf8', function(err, data){
    if(err && err.code == "ENOENT") { // anonymous callback function
      console.error("Invalid filename provided")
      return;
    }
    res.end(data);
  });
})

app.post('/courses', (req, res) => { // anonymous function
  console.log("POST request received");
  fs.readFile(__dirname + "/" + "courses.json", 'utf8', function (err, data) { // using function construct
    if (err && err.code == "ENOENT") { // anonymous callback function
      console.error("Invalid filename provided");
      return;
    }
    try {
      var courses = JSON.parse(data);
      var newCourse = req.body;
      courses = Object.assign(courses, newCourse);
      res.end(JSON.stringify(courses));

    } catch (err) {
      res.status(400).json({ error: "Invalid service request" });
      console.error("Invalid service request");
      return;
    }
  });
})


app.get('simplify/steps', (req, res) => { //anonymous function
  console.log("GET request received");
  fs.readFile(__dirname + "/" + "courses.json", 'utf8', function(err, data){
    if(err && err.code == "ENOENT") { // anonymous callback function
      console.error("Invalid filename provided")
      return;
    }
    res.end(data);
  });
})

app.post('/simplify/result', function (req, res) {
  var input = req.body.inputexp;
  res.send(JSON.stringify(simplifyExpression(input)));
})

var server = app.listen(8042, function(){
  var port = server.address().port
  console.log('Node.js server running at localhost:%s', port)
})


var simplifyFacade = new function(){

  this.simplifyExpression = function(expression){
    return ""
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

    var find_prime_implicants = function(data) {
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
            IM = IM.concat(find_prime_implicants(im2));
        }

        IM.sort();
        return IM;
    }

    function simplifyExpression(input) {
      input = firstSimplification(input);
      // var minterms2 = ['0000', '0100', '1000', '0101', '1100', '0111', '1011', '1111'];

      return JSON.stringify(extractMinTerms(input));
    }

    function extractMinTerms(input) {
      var uniqueChars = unique_char(input);
      uniqueChars.sort();

      var tokens = input.split("+");
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
      }
      console.log("min terms be");
      console.log(minTerms);
      var simplifiedTerms = find_prime_implicants(minTerms)
      var simplifiedExpression = makeExpression(simplifiedTerms, uniqueChars)

      return simplifiedExpression;
    }

    function makeExpression(simplifiedTerms, uniqueChars) {
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

    function firstSimplification(inputexp) {

      inputexp = inputexp.replace(/\s/g, '');

    //Reverse input string to to account for A+1 and 1+A (both orders)
      inputexp = inputexp.split("").reverse().join("");
      inputexp = simplify(inputexp);

      inputexp = inputexp.split("").reverse().join("");
      inputexp = simplify(inputexp);
      return inputexp
    }

    function simplify(inputexp) {

      do {
        console.log("input express is " + inputexp)
        var matchFound = false;
        var match = inputexp.match(/[a-z]\+[1]\s*?/i);
        matchFound = matchFound || match != null;
        if(match){
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1 + "+1", "1");
        }

        match = inputexp.match(/[a-z]\+[0]\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1 + "+0", letter1);
        }

        match = inputexp.match(/[a-z]\.[1]\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1 + ".1", letter1);
        }

        match = inputexp.match(/[a-z]\.[0]\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1 + ".0", "0");
        }

        match = inputexp.match(/1\+1\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          inputexp = inputexp.replace("1+1", "1");
        }

        match = inputexp.match(/1\+0\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          inputexp = inputexp.replace("1+0", "1");
        }

        match = inputexp.match(/1\.1\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          inputexp = inputexp.replace("1.1", "1");
        }

        match = inputexp.match(/1\.0\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          inputexp = inputexp.replace("1.0", "0");
        }

        match = inputexp.match(/[a-z]\.[a-z]\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          var letter1 = inputexp.charAt(0);
          var letter2 = inputexp.charAt(2);
          if(letter1 == letter2) {
            inputexp = inputexp.replace(letter1 + "." + letter2, letter1);
          }
        }
      } while(matchFound)

      return inputexp;
    }
} 

