document.addEventListener("DOMContentLoaded", function() {
    let choosingCoordinates;
    const startSchoolCoordinates = document.querySelector(".buttons #start-school-coordinates");
    const startHomeCoordinates = document.querySelector(".buttons #start-home-coordinates");

    let homeMarker;
    let schoolMarker;

    var map = L.map('map', {
        center: [57.7011712, 11.9701504],
        zoom: 11
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var popup = L.popup();

    function onMapClick(e) {
        if (choosingCoordinates != undefined) {
            popup
                .setLatLng(e.latlng)
                .setContent(`Du har valt koordinater för ${(choosingCoordinates == "home" ? "hem" : "skolan")} till: ${e.latlng.toString()}`)
                .openOn(map);

            setCoordinates(choosingCoordinates, e.latlng.lat, e.latlng.lng)
            startChoosingCoordinates(undefined);
        }
    }

    map.on('click', onMapClick);

    function startChoosingCoordinates(type) {
        if (choosingCoordinates != undefined || type == undefined) {
            if (choosingCoordinates == "school") {
                startSchoolCoordinates.textContent = "Börja välja Skolans koordinater";
            } else {
                startHomeCoordinates.textContent = "Börja välja Hem koordinater";
            }
            if (choosingCoordinates == type || type == undefined) {
                choosingCoordinates = undefined;
                return;
            }
        }

        if (type == "school") {
            startSchoolCoordinates.textContent = "Sluta välj Skolans koordinater";
        } else {
            startHomeCoordinates.textContent = "Sluta välj Hem koordinater";
        }
        choosingCoordinates = type;
    }

    startSchoolCoordinates.addEventListener("click", function() {
        startChoosingCoordinates("school");
    })
    startHomeCoordinates.addEventListener("click", function() {
        startChoosingCoordinates("home");
    })

    function loadCoordinates(type) {
        const long = localStorage.getItem(`${type}-long`);
        const lat = localStorage.getItem(`${type}-lat`);

        if (!long || !lat) {
            return;
        }
        
        const inputLong = document.querySelector(`form #${type}-longitude`)
        const inputLat = document.querySelector(`form #${type}-latitude`)
        inputLong.value = long;
        inputLat.value = lat;
        var marker = L.marker([lat, long], {
            alt: "test"
        }).addTo(map);
        if (type == "school") {
            schoolMarker = marker;
        } else {
            homeMarker = marker;
        }
    }
    
    function setCoordinates(type, lat, long) {
        const inputLong = document.querySelector(`form #${type}-longitude`)
        const inputLat = document.querySelector(`form #${type}-latitude`)
        inputLong.value = long;
        inputLat.value = lat;

        localStorage.setItem(`${type}-long`, long);
        localStorage.setItem(`${type}-lat`, lat);

        if (type == "school") {
            schoolMarker?.remove();
        } else {
            homeMarker?.remove();
        }
        var marker = L.marker([lat, long], {
            alt: "test"
        }).addTo(map);
        if (type == "school") {
            schoolMarker = marker;
        } else {
            homeMarker = marker;
        }
    }

    loadCoordinates("school");
    loadCoordinates("home");
})