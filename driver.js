
// use browserify to create an include for the client here
var cf = require('./curve_fit.js');
//var math = require('mathjs');
var Matrix = require('ml-matrix');

console.log('a test program (driver) to show how to use the curve_fit function...');

var func = function(x, k) {
    var result = new Matrix(x.rows, x.columns);
    for (var i = 0; i < x.rows; i++) 
      result[i][0] = 1/(1+(x[i][0]*k[0]));
    return result;
}

//var data = [ [0,1], [1,1], [2,2], [2.5, 3] ];
var data = [[1, 0.9765625], [7, 0.7578125], [30.44, 0.6015625], [91.32, 0.5078125], [365.25, 0.4296875], [1826.25, 0.2734375]];
//cf.curve_fit( data, lm_func );
cf.curve_fit( data, func,  [ -2 ], [ 2 ]);

console.log('Chi-Squared: ' + cf.X2);
// these don't exist yet...
//console.log('asymptotic standard error of model parameter: ' + cf.sigma_p);
//console.log('asymptotic standard error of curve fit: ' + cf.sigma_y);
console.log('estimated parameters (d:' + cf.params.length + '): ' + cf.params.join(","));
console.log('number of iterations: ' + cf.iterations);
process.exit();
