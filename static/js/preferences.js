const xhr = new XMLHttpRequest();

function _savePreferences(form) {
    var preferences = {};
    preferences.darkMode = form.darkMode.checked;
    var txt = JSON.stringify(preferences);

    xhr.open("POST", "/preferences", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.addEventListener("load", e => {
        if (xhr.status === 200) {
            window.location.reload();
        }
        document.getElementById('responseInfo').innerHTML = xhr.response;
    });

    xhr.send(txt);
}
