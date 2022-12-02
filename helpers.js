const getUserByEmail = function(email, database) {
  for (let key in database) {
    // console.log(database[key])
    if (database[key].email === email) {

      return database[key];
    }
  }
  return undefined;
};


function generateRandomString() {
  return (Math.random() + 1).toString(36).slice(2, 8);

}

// const urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "aJ48lW",
//   },
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "aJ48lW",
//   },
// };

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