const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

app.use(cookieParser());
app.set("view engine", "ejs");



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
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "abcd",
  },
};

app.use(express.urlencoded({ extended: true }));

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
  const id = req.cookies["user_id"];
  if (!id) {
    return res.status(401).send("You need to register or login");
  }
  const user = users[id];
  const urlObj = urlsForUser(id);
  const templateVars = { user, urls: urlObj };

  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];

  if (!user_id) {
    return res.redirect("/login");
  }
  const user = users[user_id];

  const templateVars = { user };
  res.render("urls_new", templateVars);

});

app.get("/urls/:id", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const shortURL = req.params.id;
  const userUrls = urlsForUser(id, urlDatabase);
  if (!urlDatabase[shortURL]) {
    return res.status(400).send("There is no url with provided id in our database");
  } if (!id || userUrls[shortURL]) {
    res.status(400).send("You are not authorized to access this page");
  }

  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user
  };
  res.render("urls_show", templateVars);

});

app.post("/urls", (req, res) => {
  // const email = req.body.email;
  // // const user_id = req.cookies['user_id'];
  // const password = req.body.password;
  
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"];
  if (longURL) {
    const ID = generateRandomString();
    urlDatabase[ID] = {
      longURL: longURL,
      userID: userID
    }
    // Log the POST request body to the console
    res.redirect(`/urls/${ID}`); // Respond with 'Ok' (we will replace this)
  } else {
    res.status(401).send("Login with a valid email to shorten urls");
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
  const id = req.cookies["user_id"];
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
  const userId = req.cookies["user_id"];
  const ID = req.params.id;
  if (userId && userId === urlDatabase[shortURL].userID) {
  delete urlDatabase[ID];

  res.redirect('/urls');
  }else {
    res.status(401).send("You are not authorized");
  }

});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = longURL;
  const id = req.cookies["user_id"];
  if (id && id === urlDatabase[shortURL].userID) {
    res.redirect("/urls");
  } else {
    res.status(401).send("You are not authorised");
  }
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  for (const id in users) {
    const user = users[id];
    if (user.email === email && user.password === password) {
      res.cookie("user_id", id);
      return res.redirect("/urls");
    }
  }
  return res.status(403).send("Please provide a valid email and/or password");

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});


app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  
  if (!email || !password) {
    return res.status(400).send("Please provide a valid email and password");
  }
  let userFound = null;
  for (const userKey in users) {
    const user = users[userKey];
    if (user.email === email) {
      userFound = user;
      return res.status(400).send("Email already exists");
    }
  }
  users[id] = {
    id,
    email,
    password,
  };

  // console.log(users);
  res.cookie("user_id", id);
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


function generateRandomString() {
  return (Math.random() + 1).toString(36).slice(2, 8);

}


function urlsForUser(id) {
  const urlObj = {};
  for (let key in urlDatabase) {
    if (key.userID === id) {
      let NewObj = {
        longURL: urlDatabase[key].longURL,
        userID: urlDatabase[key].userID

      };
      urlObj[key] = NewObj;

    }
  }
  return urlObj;
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

















