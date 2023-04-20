const xhr = new XMLHttpRequest();

function _login(form) {
    var user = {};
    user.username = form.username.value;
    user.password = form.password.value;
    var txt = JSON.stringify(user);

    xhr.open("POST", "/login", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.addEventListener("load", e => {
        document.getElementById('loginInfo').innerHTML = xhr.response;

        if (xhr.status === 200) {
            window.location = "/";
        }
    });

    xhr.send(txt);
}

function _register(form) {
    var user = {};
    user.username = form.username.value;
    user.password = form.password.value;
    var txt = JSON.stringify(user);

    xhr.open("POST", "/register", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.addEventListener("load", e => {
        document.getElementById('loginInfo').innerHTML = xhr.response;

        if (xhr.status === 200) {
            window.location = "/";
        }
    });

    xhr.send(txt);
}

window.addEventListener('load', function () {
    var passwordField = document.getElementById("password");
    var usernameField = document.getElementById("username");

    passwordField.addEventListener("keypress", function (evt) {
        if (evt.key === "Enter") {
            evt.preventDefault();
            document.getElementById("loginButton").click();
        }
    });
    usernameField.addEventListener("keypress", function (evt) {
        if (evt.key === "Enter") {
            evt.preventDefault();
            console.log("beep")
            document.getElementById("loginButton").click();
        }
    });
});

