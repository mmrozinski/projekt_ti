const xhr = new XMLHttpRequest();

function _saveAnimationData(form) {
    var data = {};
    data.height = form.heightSlider.value;
    data.speed = form.speedSlider.value;
    data.angle = form.angleSlider.value;
    data.animationSpeed = form.animationSpeedSlider.value;
    var txt = JSON.stringify(data);

    xhr.open("POST", "/animation", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.addEventListener("load", e => {
        document.getElementById('dataInfo').innerHTML = xhr.response;
    });

    xhr.send(txt);
}