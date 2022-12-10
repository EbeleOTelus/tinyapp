const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

// Helper Functions
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");


app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['EBELE'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(express.urlencoded({ extended: true }));


// Database for URLS
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};



// Database for users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$MBZPR.2CbXmPlLxD5OsM0.tGx1/kMlv8ZMnyXK2vjuunml4iTKUk6",
  },

  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$GpaYx6hLCCw316NlGv5m6e/pdqBL03nR.GED8Q6szc4P6i3w5i2uG",
  },
};


/*  ROUTES  */
// Rendering home page
app.get("/", (req, res) => {
  const user_id = req.session['user_id'];

  if (!user_id) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// URLS Page: GET route
app.get("/urls", (req, res) => {
  const id = req.session.user_id;

  if (!id) {
    return res.status(401).send(`<h1>You need to register or login!<h1> <a href ="/login">Back to Login</a>`);
  }
  const user = users[id];
  const urlObj = urlsForUser(id, urlDatabase);
  const templateVars = { user, urls: urlObj };
  res.render("urls_index", templateVars);
});

//Urls/new: GET route
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.redirect("/login");
  }
  const user = users[user_id];
  const templateVars = { user };
  res.render("urls_new", templateVars);

});

//Urls/ID: Get route
app.get("/urls/:id", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const shortURL = req.params.id;

  if (!id) {  //This checks if the user is logged in
    return res.status(400).send(`<h1>You have to login!<h1> <a href ="/login">Back to Login</a>`);
  }

  if (!urlDatabase[shortURL]) { //This checks if the shortcode is in the urldatabase
    return res.status(400).send(`<h1>This shortcode url does not exist!<h1> <a href ="/urls">Back to main page.</a>`);
  }

  if (urlDatabase[shortURL].userID !== id) {  //checks if the the userID is same as user's id
    return res.status(400).send(`<h1>This shortcode url belongs to another user!<h1> <a href ="/urls">Back to main page.</a>`);
  }

  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user
  };
  return res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(400).send(`<h1>This short url does not exist!<h1> <a href ="/urls">Back to main page</a>`);
  }
});

//Register: GET Route
app.get("/register", (req, res) => {
  const id = req.session.user_id;

  if (id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: undefined
    };
    res.render("urls_registration", templateVars);
  }
});

//Login: GET Route
app.get("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email && password) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: undefined
    };
    res.render("urls_login", templateVars);
  }
});



//Endpoint URLS: POST
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  if (longURL) {
    const ID = generateRandomString();
    urlDatabase[ID] = {
      longURL: longURL,
      userID: userID
    };
    return res.redirect(`/urls/${ID}`);
  } else {
    return res.status(401).send("Login with a valid email to shorten urls");
  }
});

//delete U: Post
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(400).send(`<h1>You have to login first!<h1> <a href ="/login">Back to Login</a>`);
  }
  const ID = req.params.id;
  if (urlDatabase[ID].userID !== userId) {
    return res.status(400).send(`<h1>This is not your shortcode!<h1> <a href ="/urls">Back to main page.</a>`);
  }
  delete urlDatabase[ID];
  res.redirect("/urls");
});

//URLS/id:POST
app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  const id = req.session.user_id;
  if (!id) {
    return res.status(401).send("You are not authorised");
  }
  urlDatabase[shortURL] = { longURL, userID: id };
  return res.redirect("/urls");
});

//Login:POST
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  const userPassword = user ? user.password : null;
  if (!email || !password) {
    return res.status(400).send(`<h1>You have to provide a valid email and password to login!<h1> <a href ="/login">Back to Login</a>`);
  }

  if (!bcrypt.compareSync(password, userPassword)) {
    return res.status(403).send(`<h1>You have to provide a valid email and password to login!<h1> <a href ="/login">Back to Login</a>`);
  }
  req.session.user_id = user.id;
  return res.redirect("/urls");
});

//Logout endpoint
app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect("/login");
});

//Register endpoint: POST
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    return res.status(400).send(`<h1>Please provide a valid email and password!<h1> <a href ="/register">Back to Register</a>`);
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send(`<h1>Email already exists!<h1> <a href ="/login">Back to Login</a>`);
  }
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  req.session.user_id = id;
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
























