const xhr_changePassword = new XMLHttpRequest();

function _changePassword(form) {
    var pass = {};
    pass.oldPassword = form.oldPassword.value;
    pass.newPassword = form.newPassword.value;
    var txt = JSON.stringify(pass);

    xhr_changePassword.open("POST", "/changePassword", true);
    xhr_changePassword.setRequestHeader("Content-Type", "application/json");

    xhr_changePassword.addEventListener("load", e => {
        document.getElementById('changeInfo').innerHTML = xhr_changePassword.response;

        if (xhr_changePassword.status === 200) {
            window.location = "/logout";
        }
    });

    xhr_changePassword.send(txt);
}
