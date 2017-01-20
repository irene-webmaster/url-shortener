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

const urlDatabase = {};
// Example
// const urlDatabase = {
//   "123abc": [
//     {surl: "b2xVn2", lurl: "http://www.lighthouselabs.ca"},
//     {surl: "9sm5xK", lurl: "http://www.google.com"}
//   ]
// };

const users = {
  "123abc": {id: "123abc", email: "user@email.com", password: "123456"}
};

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/urls/new", (req, res) => {
  if(res.locals.user === undefined) {
    res.redirect("/");
    return;
  }
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let arrUrls = urlDatabase[req.cookies["user_id"]];
  let templateVars = {
    urls: arrUrls
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let arrUrls = urlDatabase[req.cookies["user_id"]];
  let shortURL = req.params.id;

  let templateVars = {
    shortURL: shortURL,
    longURL: arrUrls.find((entry) => entry.surl == shortURL).lurl
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/create", (req, res) => {
  let fakeUrl = generateRandomString();
  //urlDatabase[user_id]
  urlDatabase[req.cookies["user_id"]].push({"surl": fakeUrl, "lurl": req.body['longURL']});
  res.redirect("/urls/" + fakeUrl);
});

app.get("/u/:shortURL", (req, res) => {
  let arrUrls = urlDatabase[req.cookies["user_id"]];
  let shortURL = req.params.shortURL;

  let longURL = arrUrls.find((entry) => entry.surl == shortURL).lurl;
  console.log(arrUrls);
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let arrUrls = urlDatabase[req.cookies["user_id"]];
  let shortURL = req.params.id;

  urlDatabase[req.cookies["user_id"]] = arrUrls.filter((entry) => entry.surl != shortURL);
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL  = req.body.longURL;
  let arrUrls = urlDatabase[req.cookies["user_id"]];

  let data = arrUrls.find(function(entry) { return entry.surl == shortURL })
  data.lurl = longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if(!email || !password) {
    res.redirect("/login");
    return
  }

  let emailRes = findUserEmail(email);
  let passRes = findUserPass(password);

  if(!emailRes || !passRes) {
    res.redirect(403);
  } else {
    res.cookie("user_id", emailRes);
  }

  res.redirect('/urls/new');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/");
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

  if(!email || !password) {
    res.redirect("/register");
    return
  }

  res.cookie("user_id", userId);

  let result = findUserEmail(email);
  if(result) {
    res.redirect(400);
  } else {
    users[userId] = {"id": userId, "email": req.body.email, "password": req.body.password};
  }

  urlDatabase[userId] = [];
  res.redirect("/urls/new");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function findUserEmail(email) {
  return findUserField("email", email)
}

function findUserPass(password) {
  return findUserField("password", password)
}

function findUserField(field, value) {
  for (let user in users) {
    if(users[user][field] === value) {
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