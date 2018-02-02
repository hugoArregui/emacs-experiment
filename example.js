const os   = require('os');
const path = require('path');

// a comment
function sum(a, b) {
  return a + b;
}

let x = sum(1, 2);

if (x === 3) {
  console.log("x", x);
} else {
  x++;
}
