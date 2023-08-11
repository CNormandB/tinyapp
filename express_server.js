const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString(length) {
  let result = '';
  let counter = 0;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length -1;
  while (counter < length) {
    result += characters.charAt(Math.random() * charactersLength);
    counter += 1;
  }
  console.log(result);
  return result;
}

app.use(express.urlencoded({ extended: true }));

//render "Create New URL" page with urls_new.ejs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//render "My URL's" page using the urlDatabase object and urls_index.ejs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//creating a new random Short URL ID
app.post("/urls", (req, res) => {
  let randomString = generateRandomString(6)
  urlDatabase[randomString]= req.body.longURL
  res.redirect(`/urls/${randomString}`);
});

//render individual pages for each  ID (access by adding the short URL after /urls/)
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

/*
Goal: update long url in URLDatabase
variables: 
  req.params.id (key)
  urlDatabase (where the long url is held)
  req.body.longURL (access the new longURL)
*/
app.post("/urls/:id", (req, res) => {
  console.log(req.params.id);
  console.log(urlDatabase);
  console.log(req.body.longURL);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

//Delete URLs
app.post("/urls/:id/delete", (req, res) => {
delete urlDatabase[req.params.id];
res.redirect("/urls");
});


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//say hello on / page
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});