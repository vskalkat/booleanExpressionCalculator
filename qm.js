"use strict";

// from http://stackoverflow.com/a/11454049/309483

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

/*
var minterms = ['1101', '1100', '1110', '1111', '1010', '0011', '0111', '0110'];

var minterms2 = ['0000', '0100', '1000', '0101', '1100', '0111', '1011', '1111'];

var minterms3 = ['0001', '0011', '0100', '0110', '1011', '0000', '1000', '1010', '1100', '1101'];

console.log( 'PI(s):', JSON.stringify(find_prime_implicants(minterms)));

console.log( 'PI2(s):', JSON.stringify(find_prime_implicants(minterms2)));

console.log( 'PI3(s):', JSON.stringify(find_prime_implicants(minterms3)));
*/
