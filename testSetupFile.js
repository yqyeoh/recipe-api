require('jest-extended');
const testContainObject = require('./tests/custom/jest-toContainObject');

expect.extend(testContainObject);
