# Numerical fitting

Helper functions used for client-site curve fitting in javascript. Source code part of this repository was initially created by [andcastillo](https://www.npmjs.com/~andcastillo) in his optimization npm package.

The major function exposed in this library right now is to implement Levenberg and Marquardt's method for non-linear curve fitting. Here is a toy example on how to use the library:
```
// the function to fit
var func = function(x, k) {
    var result = new Matrix(x.rows, x.columns);
    for (var i = 0; i < x.rows; i++)
      result[i][0] = 1/(1+(x[i][0]*k[0]));
    return result;
}
// create some toy data
var data = [[1, 0.9765625], [7, 0.7578125], [30.44, 0.6015625], [91.32, 0.5078125], [365.25, 0.4296875], [1826.25, 0.2734375]];

// do the curve fit using Levenberg Marquardts method
cf.curve_fit( data, func,  [ -2 ], [ 2 ]);

// show results
console.log('Chi-Squared: ' + cf.X2);
console.log('Estimated parameters (d:' + cf.params.length + '): ' + cf.params.join(","));
console.log('Number of iterations: ' + cf.iterations);
```

### Setup 

This projects depends on the ml-matrix package (use npm to install).

Use browserify to create a javascript version of this library.

```
browserify curve_fit.js -o curve_fit_bundle.js -d
```

### Tests

You can use nodejs to test the functionality. An example program is provided in test.js.
```
node driver.js
```

### Funding Message

This software was created with support by the National Institute On Drug Abuse of the National Institutes of Health under Award Number U24DA041123. The content is solely the responsibility of the authors and does not necessarily represent the official views of the National Institutes of Health.
