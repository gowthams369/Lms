const crypto = require('crypto');

// Generate a 32-byte random secret and convert it to base64
const secret = crypto.randomBytes(32).toString('base64');

console.log(secret);
