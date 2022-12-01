const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set("view engine", "ejs");



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

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
  const shortURL = req.params.id;
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: undefined };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const shortURL = req.params.id;
  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL],
    user
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const ID = generateRandomString();
  urlDatabase[ID] = longURL;
  // Log the POST request body to the console
  res.redirect(`/urls/${ID}`); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  // const longURL
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  // we need the object and the key
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.render("This does not exist");
  }
});

app.get("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
const templateVars ={
  user: undefined
}
  res.render("urls_registration", templateVars);

});

app.get("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const templateVars ={
    user: undefined
  }

  res.render("urls_login", templateVars);

});

app.post("/url/:id/delete", (req, res) => {

  const ID = req.params.id;

  delete urlDatabase[ID];

  res.redirect('/urls');

});

app.post("/url/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
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

  users[id] = {
    id,
    email,
    password,
  };
  if (!email || !password) {
    return res.status(400).send("Please provide a valid email and password");
  }
  let userFound = null;
  for (const userKey in users) {
    const user = users[id];
    if (user.email === email) {
      userFound = user;
      return res.status(400).send("Email already exists");
    }
  }


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






















