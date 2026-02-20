const cashfree = require('cashfree-pg');
const { Cashfree, CFEnvironment } = cashfree;
console.log('CFEnvironment:', CFEnvironment);

const cf = new Cashfree();
console.log('CF instance keys:', Object.keys(cf));

// Check static vs instance
Cashfree.XClientId = 'test';
console.log('Static XClientId:', Cashfree.XClientId);
console.log('Instance XClientId:', cf.XClientId);

