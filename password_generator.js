const bcrypt = require("bcryptjs");
const password = "abcd"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);
console.log(hashedPassword)