const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());
app.set("view engine", "ejs");

app.use(function(req, res, next){
  res.locals.user = users[req.cookies["user_id"]];
  next();
});

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {
  "123abc": {id: "123abc", email: "user@email.com", password: "123456"}
};

app.get("/", (req, res) => {
  res.redirect("/urls/new");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    // username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
    // username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/create", (req, res) => {
  let fakeUrl = generateRandomString();
  urlDatabase[fakeUrl] = req.body['longURL'];
  res.redirect('/urls/' + fakeUrl);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL  = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let emailRes = findUserEmail(email);
  let passRes = findUserPass(password);

  if(!emailRes) {
    res.redirect(403);
  }

  if(!passRes) {
    res.redirect(403);
  }

  if(emailRes && passRes) {
    res.cookie('user_id', emailRes);
  }

  res.redirect('/');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/');
});

app.get("/register", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
    // username: req.cookies["username"]
  };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  let userId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;

  res.cookie('user_id', userId);

  let result = findUserEmail(email);
  // console.log(result);
  if(result) {
    res.redirect(400);
  } else {
    users[userId] = {"id": userId, "email": req.body.email, "password": req.body.password};
  }
  console.log(users);
  res.redirect("/");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function findUserEmail(email) {
  for (let user in users) {
    if(users[user].email === email) {
      return users[user].id;
    }
  }
}

function findUserPass(password) {
  for (let user in users) {
    if(users[user].password === password) {
      return users[user].id;
    }
  }
}

function generateRandomString() {
  var letNum = ['1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','e','f','j','k','l','m','n','o','p'];
  var fakeShortUrl = ''

  for(var i = 0; i < letNum.length; i+=5){
    if(fakeShortUrl.length <= 5) {
      var fakeNum = Math.floor(Math.random()*letNum.length);
      fakeShortUrl += letNum[fakeNum];
    }
  }
  return fakeShortUrl;
}