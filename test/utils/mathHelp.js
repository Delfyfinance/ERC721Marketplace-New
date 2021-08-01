const BigNumber = require("bignumber.js");

const toBNumber = (value) => new BigNumber(value);

const expandToEthers = (n) => toBNumber(n).times(toBNumber(10).pow(18));

const addNumbers = (val, val1) => toBNumber(val).plus(toBNumber(val1));
const subNumbers = (val, val1) => toBNumber(val).minus(toBNumber(val1));

module.exports = { expandToEthers, addNumbers, subNumbers, toBNumber };
