const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');


const app = express();

const PORT = 8080; // default port 8080

app.use(cookieSession({
  name: 'session',
  keys: ["ILoveSecureThingsThey'reSoSecure"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.ca", userID: "user2RandomID" }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};


app.use(express.urlencoded({ extended: true }));

//render "Create New URL" page with urls_new.ejs
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//render "My URL's" page using the urlDatabase object and urls_index.ejs
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    user: users[userID],
    urls: urls
  };
  res.render("urls_index", templateVars);
});

//creating a new random Short URL ID  + redirect to /urls/${randomString}
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let randomString = generateRandomString(6);
    urlDatabase[randomString] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect(`/urls/${randomString}`);
  } else {
    res.status(401);
    res.send("<h1>Please log in to Shorten a URL.</h1>");
  }

});

//render individual pages for each  ID (access by adding the short URL after /urls/)
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const item = urlDatabase[req.params.id];
  if (!userID) {
    res.status(401);
    res.send("<h1>Must be logged in to view URLs</h1>");
  } else if (userID !== item.userID) {
    res.status(400);
    res.send("Either the URL in question does not exist, or you do not have permission to view it!");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      id: req.params.id, longURL: item.longURL
    };
    res.render("urls_show", templateVars);
  }
});

/*
Goal: update long url in URLDatabase
variables:
  req.params.id (key)
  urlDatabase (where the long url is held)
  req.body.longURL (access the new longURL)
   + redirect to /urls
*/
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const item = urlDatabase[req.params.id];
  if (!userID) {
    res.status(401);
    res.send("Must be logged in to edit URLs!");
  } else if (userID !== item.userID) {
    res.status(400);
    res.send("Either the URL in question does not exist, or you do not have permission to view it!");
  } else {
    item.longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

//Delete selected URL + redirect to /urls
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const item = urlDatabase[req.params.id];
  if (!userID) {
    res.status(401);
    res.send("Must be logged in to edit URLs!");
  } else if (userID !== item.userID) {
    res.status(400);
    res.send("Either the URL in question does not exist, or you do not have permission to view it!");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

//redirecting to a long url based on a shortened url
// TODO: Possible issue with non valid longURL causing the else to trigger
app.get("/u/:id", (req, res) => {
  if (req.params.id in urlDatabase) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.status(404);
    res.send("<h1>ID does not exist</h1>");
  }
});

//It should remove the cookie named user_id + redirect to /urls
app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.redirect("/login");
});

//render /register page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("user_registration");
  }
});

//enables registration form for new users
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //checks for incomplete forms and sends error 400 if incomplete
  if (!email || !password) {
    res.status(400);
    res.send("Please fill out both the email and password boxes!");
  }
  if (getUserByEmail(email, users)) {
    res.status(400);
    res.send("email is already in use");
  }

  let newUserID = generateRandomString(13);
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.user_id = newUserID;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("user_login");
  }
});

//check for matching email and password - 403 if incorect, - set cookie + redirect if matching
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user = getUserByEmail(email, users);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403);
    res.send("email or password is incorrect");
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
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