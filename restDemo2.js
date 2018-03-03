var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
app.use(bodyParser.json());

app.use("", express.static(__dirname + ""));

app.get('/', (req, res) => { //anonymous function
  console.log("GET request received for root");
  res.sendFile(__dirname + '/calculator.html');
})

app.post('/simplify/result', function (req, res) {
  var input = req.body.inputexp;

  //res.send(JSON.stringify(simplifyFacade.simplifyExpression(input)));
  var contentToSend = simplifyFacade.simplifyExpression(input);
  console.log("Send CONTENT: " + contentToSend.minTerms);
  res.send(JSON.stringify(simplifyFacade.simplifyExpression(input)));
})

var server = app.listen(8042, function(){
  var port = server.address().port
  console.log('Node.js server running at localhost:%s', port)
})

var simplifyFacade = new function(){

  this.simplifyExpression = function(expression){
    
    var finalMinTerms = []
    var finalUniqueChars = []
    var finalSteps = []

    // while(match) { 
      // var innerExpression = match[match.length - 1].substring(1, match[match.length - 1].length -2);
      var inputStruct = firstSimplification(expression); // Initial basic simplification
      input = inputStruct.inputexp
      var minTermStruct = extractMinTerms(input);  // Simplifies using Quine Mccluskey algorithm
      var minTerms = minTermStruct.minTerms;
      var uniqueChars = minTermStruct.uniqueChars
      var nonVariableTerms = minTermStruct.nonVariableTerms
      var simplifiedTerms = find_prime_implicants(minTerms)
      var simplifiedExpression = makeExpression(simplifiedTerms, uniqueChars)
      for (var i = nonVariableTerms.length - 1; i >= 0; i--) {
        if (simplifiedExpression.length != 0) {
          simplifiedExpression += " + "
        }
        simplifiedExpression += nonVariableTerms[i]
      }
      // expression.replace("(" + innerExpression + ")" , simplifiedExpression)
      // match = expression.match("/(\(([^()]|(?R))*\))/i");
      finalSteps.concat(inputStruct.steps)
      finalUniqueChars.concat(uniqueChars)
      finalMinTerms.concat(minTerms)
    // }



    var output = {
      uniqueChars : finalUniqueChars,
      minTerms : finalMinTerms,
      steps : finalSteps,
      simplifiedExpression : simplifiedExpression,

    };

    return output;
  }

  this.findSteps = function(expression){
    input = firstSimplification(expression); // Initial basic simplification
    var minTermStruct = extractMinTerms(input);  // Simplifies using Quine Mccluskey algorithm
    var minTerms = minTermStruct.minTerms;
    var uniqueChars = minTermStruct.uniqueChars
    var simplifiedTerms = find_prime_implicants(minTerms)
    var simplifiedExpression = makeExpression(simplifiedTerms, uniqueChars)
    return simplifiedExpression
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

    function extractMinTerms(input) {
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

    function addIfDifferent(steps, input, oldInput) {
      if(input.valueOf() != oldInput.valueOf()) {
        steps.push(oldInput)
        console.log(" ADD difference check "  + input + " " + oldInput + " while steps be at " + steps)
      } else {
        console.log(" DONT ADD difference check "  + input + " " + oldInput + " while steps be at " + steps)
      }

      return steps;
    }

    function firstSimplification(inputexp) {

      inputexp = inputexp.replace(/\s/g, '');

    //Reverse input string to to account for A+1 and 1+A (both orders)
      inputexp = inputexp.split("").reverse().join("");
      var inputexpStruct = simplify(inputexp);
      inputexp = inputexpStruct.inputexp
      var steps = inputexpStruct.steps
      console.log("steps be ")
      console.log(steps)
      inputexp = inputexp.split("").reverse().join("");
      inputexpStruct = simplify(inputexp);
      inputexp = inputexpStruct.inputexp
      steps.concat(inputexpStruct.steps)

      console.log("steps be 2 ")
      console.log(steps)

      return {
        inputexp : inputexp,
        steps : steps
      }
    }

    function simplify(inputexp) {
      steps = []
      var oldInputExp = inputexp
      do {
        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

        var matchFound = false;
        var match = inputexp.match(/[a-z]\+[1]\s*?/i);
        matchFound = matchFound || match != null;
        if(match){
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1 + "+1", "1");
        }
        
        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp


        match = inputexp.match(/[a-z]\+[0]\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1 + "+0", letter1);
        }

        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

        match = inputexp.match(/[a-z]\.[1]\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1 + ".1", letter1);
        }

        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

        match = inputexp.match(/[a-z]\.[0]\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1 + ".0", "0");
        }

        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

        match = inputexp.match(/1\+1\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          inputexp = inputexp.replace("1+1", "1");
        }

        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

        match = inputexp.match(/1\+0\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          inputexp = inputexp.replace("1+0", "1");
        }

        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

        match = inputexp.match(/1\.1\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          inputexp = inputexp.replace("1.1", "1");
        }

        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

        match = inputexp.match(/1\.0\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          inputexp = inputexp.replace("1.0", "0");
        }

        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

        match = inputexp.match(/[a-z]0/i);
        matchFound = matchFound || match != null;
        if (match) {
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1+"0", "0");
        }

        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

        match = inputexp.match(/[A-Z]0/i);
        matchFound = matchFound || match != null;
        if (match) {
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1+"0", "0");
        }

        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

        match = inputexp.match(/[a-z]1/i);
        matchFound = matchFound || match != null;
        if (match) {
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1+"1", "1");
        }

        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

        match = inputexp.match(/[A-Z]1/i);
        matchFound = matchFound || match != null;
        if (match) {
          var letter1 = match[0].charAt(0);
          inputexp = inputexp.replace(letter1+"1", "1");
        }

        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

        match = inputexp.match(/[a-z]\.[a-z]\s*?/i);
        matchFound = matchFound || match != null;
        if (match) {
          var letter1 = match[0].charAt(0);
          var letter2 = match[0].charAt(2);
          if(letter1 == letter2) {
            inputexp = inputexp.replace(letter1 + "." + letter2, letter1);
          }
        }

        steps = addIfDifferent(steps, inputexp, oldInputExp);
        oldInputExp = inputexp

      } while(matchFound)

      return {
        inputexp: inputexp,
        steps: steps
      }
    }
}
