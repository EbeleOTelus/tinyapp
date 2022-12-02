const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");


app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['EBELE'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(express.urlencoded({ extended: true }));

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"

// };

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




const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$MBZPR.2CbXmPlLxD5OsM0.tGx1/kMlv8ZMnyXK2vjuunml4iTKUk6", //1234
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$GpaYx6hLCCw316NlGv5m6e/pdqBL03nR.GED8Q6szc4P6i3w5i2uG", //abcd
  },
};

/*  ROUTES  */


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  // console.log(req.headers);
  // const shortURL = req.params.id;
  const id = req.session.user_id;  //req.cookies["user_id"];
  if (!id) {
    return res.status(401).send("You need to register or login");
  }
  const user = users[id];
  const urlObj = urlsForUser(id, urlDatabase);
  const templateVars = { user, urls: urlObj };
  // console.log({user, urlObj, urlDatabase})

  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id; //req.cookies['user_id'];

  if (!user_id) {
    return res.redirect("/login");
  }
  const user = users[user_id];

  const templateVars = { user };
  res.render("urls_new", templateVars);

});

app.get("/urls/:id", (req, res) => {
  const id = req.session.user_id;  //req.cookies["user_id"];
  const user = users[id];
  const shortURL = req.params.id;
  const userUrls = urlsForUser(id, urlDatabase);
  if (!id) {
    return res.status(400).send("You are not authorized to access this page");
  }
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== id) {
    return res.status(400).send("This URL was not created by you");
  }

  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user
  };
  return res.render("urls_show", templateVars);

});

app.post("/urls", (req, res) => {
  // const email = req.body.email;
  // // const user_id = req.cookies['user_id'];
  // const password = req.body.password;

  const longURL = req.body.longURL;
  const userID = req.session.user_id;  //req.cookies["user_id"];
  if (longURL) {
    const ID = generateRandomString();
    urlDatabase[ID] = {
      longURL: longURL,
      userID: userID
    };
    // Log the POST request body to the console
    return res.redirect(`/urls/${ID}`); // Respond with 'Ok' (we will replace this)
  } else {
    return res.status(401).send("Login with a valid email to shorten urls");
  }
});

app.get("/u/:id", (req, res) => {
  // const longURL
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  // we need the object and the key
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(400).send("This does not exist");
  }
});

app.get("/register", (req, res) => {
  // const email = req.body.email;
  // const password = req.body.password;
  const id = req.session.user_id;  //req.cookies["user_id"];
  if (id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: undefined
    };
    res.render("urls_registration", templateVars);
  }
});

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

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;  //req.cookies["user_id"];
  const ID = req.params.id;
  if (userId && userId !== urlDatabase[ID].user_id) {
    delete urlDatabase[ID];

    return res.redirect('/urls');
  } else {
    return res.status(401).send("You are not authorized");
  }

});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  const id = req.session.user_id;  //req.cookies["user_id"];
  if (!id) {
    return res.status(401).send("You are not authorised");
  }
  urlDatabase[shortURL] = { longURL, userID: id };
  return res.redirect("/urls");

});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  // for (const id in users) {
  //   const user = users[id];
  // console.log({user, email, password})
  if (user && bcrypt.compareSync(password, user.password)) {
    console.log(user);
    req.session.user_id = user.id;  //res.cookie("user_id", id);
    return res.redirect("/urls");

  }
  return res.status(403).send("Please provide a valid email and/or password");

});

app.post("/logout", (req, res) => {
  req.session.user_id = null;  //res.clearCookie("user_id");
  res.redirect("/login");
});


app.post("/register", (req, res) => {

  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  // console.log(password);

  if (!email || !password) {
    return res.status(400).send("Please provide a valid email and password");
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("Email already exists");
  }
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password,
  };
  req.session.user_id = id;  //res.cookie("user_id", id);
  res.redirect("/urls");
});

// const id = req.cookies["user_id"]
// const user = users[id]
// user;

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);()
//  });

//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});







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

















