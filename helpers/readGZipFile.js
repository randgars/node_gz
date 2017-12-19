// const fs = require("fs");
// const zlib = require('zlib');

// module.exports = (filename) => {
//   return new Promise((resolve, reject) => {
//       fs.readFile(filename, (err, buf) => {
//           if(err) {
//               reject(err);
//               return;
//           }
//           zlib.gunzip(buf, (err, buf) => {
//               if(err) {
//                   reject(err);
//                   return;
//               }
//               resolve(buf);
//           });
//       });
//   });
// }