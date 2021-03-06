var Matrix = require("ml-matrix");
const EVD = Matrix.DC.EVD;
const SVD = Matrix.DC.SVD;
const Stat = require('ml-stat').matrix;
const mean = Stat.mean;
const stdev = Stat.standardDeviation;

/* 
 var testDataset = [
        [3.38156266663556, 3.38911268489207],
        [4.52787538040321, 5.85417810116941],
        [2.65568186873946, 4.41199471748479],
        [2.76523467422508, 3.71541364974329],
        [2.84656010622109, 4.17550644951439] ];
 var pca = new PCA(testDataset, {
        scale: true 
 });
 // get matrix back
 var currentU = pca.getEigenvectors();
 // get vector back
 var currentS = pca.getEigenvalues();

*/  


var pca = pca || {};

const defaultOptions = {
    isCovarianceMatrix: false,
    center: true,
    scale: false
};

class PCA {
    constructor(dataset, options) {
        if (dataset === true) {
            const model = options;
            this.center = model.center;
            this.scale = model.scale;
            this.means = model.means;
            this.stdevs = model.stdevs;
            this.U = Matrix.checkMatrix(model.U);
            this.S = model.S;
            return;
        }

        options = Object.assign({}, defaultOptions, options);

        this.center = false;
        this.scale = false;
        this.means = null;
        this.stdevs = null;

        if (options.isCovarianceMatrix) { // user provided a covariance matrix instead of dataset
            this._computeFromCovarianceMatrix(dataset);
            return;
        }

        var useCovarianceMatrix;
        if (typeof options.useCovarianceMatrix === 'boolean') {
            useCovarianceMatrix = options.useCovarianceMatrix;
        } else {
            useCovarianceMatrix = dataset.length > dataset[0].length;
        }

        if (useCovarianceMatrix) { // user provided a dataset but wants us to compute and use the covariance matrix
            dataset = this._adjust(dataset, options);
            const covarianceMatrix = dataset.transposeView().mmul(dataset).div(dataset.rows - 1);
            this._computeFromCovarianceMatrix(covarianceMatrix);
        } else {
            dataset = this._adjust(dataset, options);
            var svd = new SVD(dataset, {
                computeLeftSingularVectors: false,
                computeRightSingularVectors: true,
                autoTranspose: true
            });

            this.U = svd.rightSingularVectors;

            const singularValues = svd.diagonal;
            const eigenvalues = new Array(singularValues.length);
            for (var i = 0; i < singularValues.length; i++) {
                eigenvalues[i] = singularValues[i] * singularValues[i] / (dataset.length - 1);
            }
            this.S = eigenvalues;
        }
    }

    /**
     * Load a PCA model from JSON
     * @param {Object} model
     * @return {PCA}
     */
    static load(model) {
        if (model.name !== 'PCA')
            throw new RangeError('Invalid model: ' + model.name);
        return new PCA(true, model);
    }

    /**
     * Project the dataset into the PCA space
     * @param {Matrix} dataset
     * @return {Matrix} dataset projected in the PCA space
     */
    predict(dataset) {
        dataset = new Matrix(dataset);

        if (this.center) {
            dataset.subRowVector(this.means);
            if (this.scale) {
                dataset.divRowVector(this.stdevs);
            }
        }

        return dataset.mmul(this.U);
    }

    /**
     * Returns the proportion of variance for each component
     * @return {[number]}
     */
    getExplainedVariance() {
        var sum = 0;
        for (var i = 0; i < this.S.length; i++) {
            sum += this.S[i];
        }
        return this.S.map(value => value / sum);
    }

    /**
     * Returns the cumulative proportion of variance
     * @return {[number]}
     */
    getCumulativeVariance() {
        var explained = this.getExplainedVariance();
        for (var i = 1; i < explained.length; i++) {
            explained[i] += explained[i - 1];
        }
        return explained;
    }

    /**
     * Returns the Eigenvectors of the covariance matrix
     * @returns {Matrix}
     */
    getEigenvectors() {
        return this.U;
    }

    /**
     * Returns the Eigenvalues (on the diagonal)
     * @returns {[number]}
     */
    getEigenvalues() {
        return this.S;
    }

    /**
     * Returns the standard deviations of the principal components
     * @returns {[number]}
     */
    getStandardDeviations() {
        return this.S.map(x => Math.sqrt(x));
    }

    /**
     * Returns the loadings matrix
     * @return {Matrix}
     */
    getLoadings() {
        return this.U.transpose();
    }

    /**
     * Export the current model to a JSON object
     * @return {Object} model
     */
    toJSON() {
        return {
            name: 'PCA',
            center: this.center,
            scale: this.scale,
            means: this.means,
            stdevs: this.stdevs,
            U: this.U,
            S: this.S,
        };
    }

    _adjust(dataset, options) {
        this.center = !!options.center;
        this.scale = !!options.scale;

        dataset = new Matrix(dataset);

        if (this.center) {
            const means = mean(dataset);
            const stdevs = this.scale ? stdev(dataset, means, true) : null;
            this.means = means;
            dataset.subRowVector(means);
            if (this.scale) {
                for (var i = 0; i < stdevs.length; i++) {
                    if (stdevs[i] === 0) {
                        throw new RangeError('Cannot scale the dataset (standard deviation is zero at index ' + i);
                    }
                }
                this.stdevs = stdevs;
                dataset.divRowVector(stdevs);
            }
        }

        return dataset;
    }

    _computeFromCovarianceMatrix(dataset) {
        const evd = new EVD(dataset, {assumeSymmetric: true});
        this.U = evd.eigenvectorMatrix;
        for (var i = 0; i < this.U.length; i++) {
            this.U[i].reverse();
        }
        this.S = evd.realEigenvalues.reverse();
    }
}

pca.getMatrix = function(rows,columns) { return new Matrix(rows, columns); };

module.exports = PCA;
if (typeof window !== 'undefined') { // we are running in node
  window.PCA = PCA;
}
