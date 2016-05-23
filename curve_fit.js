/* Curve fitting using Levenberg Marquard method 

   Usage: define a function that given one data point returns the values after function evaluation
     import('ml-matrix');
     var func = function(x, k) {
        var result = new Matrix(x.rows, x.columns);
        for (var i = 0; i < x.rows; i++) 
          result[i][0] = 1/(1+(x[i][0]*k[0]));
        return result; 
     }

     fit = new curve_fit();
     // fit the data with the function using -2..2 as the valid range for the parameter k
     fit.curve_fit( data, func, [-2], [2] );
     console.log('number of function evaluations: ' + fit.nfunc);
     console.log('')
     
   Use in browser (exports cf as global variable - window.cf):
     browserify curve_fit.js -o curve-fit-bundle.js 
     
     
*/

var Matrix = require("ml-matrix");
var math = require("./algebra");
var LM = require("./LM");

// var exports = module.exports = {};
var cf = cf || {};

cf.params = [];
cf.sigma_p = [];

cf.curve_fit = function (data, func, p_min, p_max) {
    lm_func = func;

    p_min = p_min || [-5];
    p_max = p_max || [5];

    var nbPoints = data.length;
    var t = math.matrix(nbPoints, 1);//[1:Npnt]';				  // independent variable
    var y_data = math.matrix(nbPoints, 1);
    var sum = 0;
    t[0][0] = data[0][0]; y_data[0][0] = data[0][1];
    var maxY = 0;
    for (var i = 0; i < nbPoints; i++) {
        t[i][0] = data[i][0];
        y_data[i][0] = data[i][1];
        if (data[i][1] > maxY)
            maxY = data[i][1];
    }
    // weighting the values does not work - would prevent elements from becoming too large
    //for (var i = 0; i < nbPoints; i++) {
    //    y_data[i][0] /= maxY
    // }
    var weight = [nbPoints / math.sqrt(y_data.dot(y_data))];
    var opts = [3, 100, 1e-3, 1e-3, 1e-3, 1e-2, 1e-2, 11, 9, 1];
    var consts = [];                         // optional vector of constants

    var p_init = math.matrix([[0.02]]);
    var p_min = math.matrix([p_min]);
    var p_max = math.matrix([p_max]);
    var p_fit = LM.optimize(lm_func, p_init, t, y_data, weight, -0.01, p_min, p_max, consts, opts);
    //cf.sigma_p = p_fit.sigma_p;
    //cf.sigma_y = p_fit.sigma_y;
    cf.X2 = p_fit.X2;
    cf.iterations = p_fit.iteration;
    cf.params = p_fit.p;
    p_fit = p_fit.p;
}

cf.getMatrix = function(rows,columns) { return new Matrix(rows, columns); };

module.exports = cf;
if (typeof window !== 'undefined') { // we are running in node
  window.cf = cf;
}
//module.exports = function() { return cf; }

