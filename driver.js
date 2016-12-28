
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


// use browserify to create an include for the client from pca.js by
//    browserify pca.js -o pca_bundle.js -d
var PCA = require('./pca.js');
// var Matrix = require('ml-matrix');

console.log('a test program to show how to use the pca function...');

var data = [
       [3.38156266663556, 3.38911268489207],
       [4.52787538040321, 5.85417810116941],
       [2.65568186873946, 4.41199471748479],
       [2.76523467422508, 3.71541364974329],
       [2.84656010622109, 4.17550644951439],
       [3.89067195630921, 6.48838087188621],
       [3.47580524144079, 3.63284876204706],
];
var pca = new PCA( data, {
    isCovarianceMatrix: false,
    center: true,
    scale: true
});

console.log('Eigenvectors:' + JSON.stringify(pca.getEigenvectors()) + '\nEigenvalues: ' + JSON.stringify(pca.getEigenvalues()));

process.exit();







process.exit();
