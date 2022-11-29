const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id
  const templateVars = { id: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const ID = generateRandomString()
  urlDatabase[ID] = longURL
  // Log the POST request body to the console
  res.redirect(`/urls/${ID}`); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  // const longURL
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  // we need the object and the key
  if (longURL){
  res.redirect(longURL);
  } else {
    res.render("This does not exist");
  }
});

app.post("/url/:id/delete",(req, res) => {

  const ID = req.params.id
  
  delete urlDatabase[ID];
  
  res.redirect('/urls')
  
  });

  app.post("/url/:id", (req, res) => {
    const longURL = req.body.longURL;
    const shortURL = req.params.id;
    urlDatabase[shortURL] = longURL
res.redirect("/urls")
  });
  


// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
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






















