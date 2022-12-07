//Function that gets user by email address
const getUserByEmail = function(email, database) {
  for (let key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return undefined;
};

//Function that generates random strings
function generateRandomString() {
  return (Math.random() + 1).toString(36).slice(2, 8);
}

//This generates matching userID to the urldatabase id
function urlsForUser(id, urlDatabase) {
  const urlObj = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlObj[key] = urlDatabase[key];
    }
  }
  return urlObj;
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser };