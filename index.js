const express = require("express");
const sessions = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongodb = require("mongodb");
const config = require("./config.json");

const PORT = 21448;

var db;
const dbname = config.dbname;
const url = config.mongo_url;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("static"))
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

var session;

app.use(sessions({
    secret: config.session_secret,
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 60},
    resave: true,
    rolling: true
}));

mongodb.MongoClient.connect(url, function (err, client) {
    if (err) return console.log(err)
    db = client.db(dbname);
    console.log("DB connect OK");
});

app.listen(PORT, function () {
    console.log("Server started on http://localhost:" + PORT + "/");
});

app.get("/", function (req, res, next) {
    session = req.session;

    var options = {
        userId: session.userid,
        darkMode: session.darkMode
    };

    var filename = "index.ejs";

    res.render(filename, options);
});

app.get("/login", function (req, res, next) {
    session = req.session;

    var options = {
        darkMode: session.darkMode
    }

    if (session.userid) {
        res.status(401);
        res.send("Jesteś już zalogowany!");
        return;
    }

    var filename = "login.ejs";

    res.render(filename, options);
});

app.post("/login", function (req, res) {
    session = req.session;
    console.log("received login attempt: ", req.body);

    if (session.userid) {
        res.status(401);
        res.send("Jesteś już zalogowany!");
        return;
    }
    if (!req.body.username || !req.body.password) {
        res.status(400);
        res.send("Brak nazwy użytkownika lub hasła!");
        return;
    }
    if (req.body.username.trim() == "" || req.body.password.trim() == "") {
        res.status(401);
        res.send("Nazwa użytkownika lub hasło puste!");
        return;
    }
    db.collection("creds").findOne(req.body, function (err, result) {
        if (err) return console.log(err);
        if (!result) {
            console.log("user not found!");
            res.status(401);
            res.send("Błędna nazwa użytkownika lub hasło!");
            return;
        }
        console.log("user logged in: ", result);
        session.userid = req.body.username;
        getUserPrefs().then(function (options) {
            console.log(req.session);
            res.sendStatus(200);
        });
    });
});

app.post("/register", function (req, res) {
    session = req.session;

    if (!req.body.username || !req.body.password) {
        res.status(400);
        res.send("Brak nazwy użytkownika lub hasła!");
        return;
    }
    if (req.body.username.trim() == "" || req.body.password.trim() == "") {
        res.status(401);
        res.send("Nazwa użytkownika lub hasło puste!");
        return;
    }
    db.collection("creds").findOne({username: req.body.username}, function (err, result) {
        if (err) return console.log(err);
        if (result) {
            res.status(401);
            res.send("Użytkownik o tej nazwie już istnieje!");
            return;
        }

        db.collection("creds").insertOne(req.body, function (err, result) {
            if (err) return console.log(err)
            console.log("registered new user: ", req.body);
            session.userid = req.body.username;
            res.sendStatus(200);
        });
    });
});

app.get("/logout", function (req, res) {
    session = req.session;
    session.destroy();
    res.redirect('/');
});

app.post("/changePassword", function (req, res) {
    session = req.session;
    if (!session.userid) {
        res.status(401);
        res.send("Nie jesteś zalogowany!");
        return;
    }
    if (!req.body.newPassword || !req.body.oldPassword) {
        res.status(400);
        res.send("Brak hasła!");
        return;
    }
    if (req.body.newPassword.trim() == "" || req.body.oldPassword.trim() == "") {
        res.status(401);
        res.send("Hasło puste!");
        return;
    }


    db.collection("creds").findOne({username: session.userid}, function (err, result) {
        if (err) return console.log(err);
        if (result.password != req.body.oldPassword) {
            res.status(401);
            res.send("Stare hasło błędne!");
            return;
        }

        if (req.body.newPassword.trim() === req.body.oldPassword.trim()) {
            res.status(401);
            res.send("Hasła nie mogą być takie same!");
            return;
        }

        db.collection("creds").updateOne({username: session.userid}, {$set: {password: req.body.newPassword}}, function (error, _result) {
            if (error) return console.log(error);
            console.log("Password updated for: ", session.userid);
            res.sendStatus(200);
        });
    });
});

var defaultPreferences = {darkMode: false};

app.get("/preferences", function (req, res) {
    session = req.session;

    if (!session.userid) {
        res.status(401);
        res.send("Nie jesteś zalogowany!");
        return;
    }

    var filename = "preferences.ejs";

    getUserPrefs().then(function (options) {
        res.render(filename, options);
    });
})

app.post("/preferences", function (req, res) {
    session = req.session;
    if (!session.userid) {
        res.status(401);
        res.send("Nie jesteś zalogowany!");
        return;
    }

    if (typeof req.body.darkMode === 'undefined') {
        res.sendStatus(400);
    }

    var newUserPrefs = {userid: session.userid, darkMode: req.body.darkMode};

    db.collection("prefs").findOne({userid: session.userid}, function (err, _result) {
        if (!_result) {
            db.collection("prefs").insertOne(newUserPrefs, function (err, result) {
                if (err) return console.log(err);
                console.log("Created preferences: ", newUserPrefs);
            });
            res.sendStatus(200);
            return;
        }

        db.collection("prefs").replaceOne(_result, newUserPrefs, function (error, result) {
            if (error) return console.log(error);
            console.log("Replaced preferences: ", newUserPrefs);
        });
        res.sendStatus(200);
    });
});

app.get("/animation", function (req, res) {
    session = req.session;
    var filename = "animation.ejs";

    var options = {
        userId: session.userid,
        darkMode: session.darkMode
    }

    if (!session.userid) {
        res.render(filename);
        return;
    }

    db.collection("anim").findOne({userid: session.userid}, function (err, result) {
        if (err) return console.log(err);

        if (!result) {
            res.render(filename, options);
            return;
        }

        console.log("Found user animation data");

        options.height = result.height;
        options.angle = result.angle;
        options.speed = result.speed;
        options.animationSpeed = result.animationSpeed;

        res.render(filename, options);
    });
});

app.post("/animation", function (req, res) {
    session = req.session;
    if (!session.userid) {
        res.status(401);
        res.send("Nie jesteś zalogowany!");
        return;
    }

    if (!req.body.height || !req.body.angle || !req.body.speed || !req.body.animationSpeed) {
        res.status(400);
        res.send("Brak parametrów!");
        return;
    }

    var newData = {
        userid: session.userid,
        height: req.body.height,
        angle: req.body.angle,
        speed: req.body.speed,
        animationSpeed: req.body.animationSpeed
    }

    db.collection("anim").findOne({userid: session.userid}, function (err, result) {
        if (err) return console.log(err);

        if (!result) {
            db.collection("anim").insertOne(newData, function (error, _result) {
                if (error) return console.log(error);
                console.log("Created animation data: ", newData);
            });
            res.sendStatus(200);
            return;
        }

        db.collection("anim").replaceOne(result, newData, function (error, _result) {
            if (error) return console.log(error);
            console.log("Replaced animation data: ", _result);
        });
        res.sendStatus(200);
    });
});

app.get("/about", function (req, res) {
    session = req.session;

    var options = {
        userId: session.userid,
        darkMode: session.darkMode
    };

    var filename = "about.ejs";

    res.render(filename, options);
});

async function getUserPrefs() {
    var options;
    try {
        options = await db.collection("prefs").findOne({userid: session.userid});
    } catch (err) {
        console.log(err);
    }
    if (!options) {
        options = {darkMode: defaultPreferences.darkMode};
        var result = defaultPreferences;
        result.userid = session.userid;
        db.collection("prefs").insertOne(result, function (err, _result) {
            if (err) return console.log(err);
            console.log("Created default preferences: ", result);
        });
    }

    console.log("Preferences found: ", options);

    options.userId = session.userid;

    session.darkMode = options.darkMode;
    return options;
}
