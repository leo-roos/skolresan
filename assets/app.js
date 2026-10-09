// localStorage.setItem("homeGID", "9021014017153000");
// localStorage.setItem("schoolGID", "9021014004380000");
let journeysDiv;
let loadingText;
let modal;
let modalTitle;
let modalContent;

const homeGID = "9021014017153000";
const schoolGID = "9021014004380000";
let trip = "home";

function createElement(type = "div", className = "", classNames = [], id = "") {
    const element = document.createElement(type);
    if (className != "") {
        element.className = className;
    }
    if (classNames != []) {
        for (let index = 0; index < classNames.length; index++) {
            const _className = classNames[index];
            element.classList.add(_className);
        }
    }
    if (id != "") {
        element.id = id;
    }

    return element;
}

function getMinutesDate(date) {
    return date.getMinutes() + ((date.getHours() - 1) * 60)
}

async function updateJourneyUI(type) {
    let journeysDiv;
    if (type == "home") {
        journeysDiv = document.querySelector("#home-journeys");
    } else {
        journeysDiv = document.querySelector("#school-journeys");
    }

    loadingText.innerHTML = `Loading trips...`;
    journeysDiv.innerHTML = `<div class="title">Till ${(type == "home" ? "hem" : "skolan")}</div>`;

    const token = await checkToken();
    // getStops(token);
    const journeysData = await getJourneys(token, type);
    const results = journeysData.results;
    const journeys = [];
    
    console.log(type);
    console.log(results);

    for (let index = 0; index < results.length; index++) {
        const result = results[index];

        let departureTime, arrivalTime;

        const tripLegs = [];
        for (let index2 = 0; index2 < result.tripLegs.length; index2++) {
            const tripLeg = result.tripLegs[index2];

            const departure = {
                planned: new Date(tripLeg.plannedDepartureTime),
                actual: new Date(tripLeg.plannedDepartureTime)
            }
            const arrival = {
                planned: new Date(tripLeg.plannedArrivalTime),
                actual: new Date(tripLeg.plannedArrivalTime)
            }
            const differenceTime = {
                planned: new Date(arrival.planned - departure.planned),
                actual: new Date(arrival.actual - departure.actual),
            }

            if (index2 == 0) {
                departureTime = departure
            }
            if (index2 == result.tripLegs.length - 1) {
                arrivalTime = arrival
            }

            // console.log(getMinutesDate(differenceTime))

            const connection = result.connectionLinks.find((connection) => connection.journeyLegIndex == (index2 + 1));
            let connectionData;
            if (connection) {
                const departureConnection = {
                    planned: new Date(connection.plannedDepartureTime),
                    actual: new Date(connection.plannedDepartureTime)
                }
                const arrivalConnection = {
                    planned: new Date(connection.plannedArrivalTime),
                    actual: new Date(connection.plannedArrivalTime)
                }
                const differenceTimeConnection = {
                    planned: new Date(arrivalConnection.planned - departureConnection.planned),
                    actual: new Date(arrivalConnection.actual - departureConnection.actual)
                }

                // if (getMinutesDate(differenceTimeConnection.planned) == 0) {
                //     console.log(connection);
                // }
                // console.log(getMinutesDate(differenceTimeConnection.planned));
                
                connectionData = {
                    departure: departureConnection,
                    arrival: arrivalConnection,
                    time: differenceTimeConnection,
                    line: {
                        direction: {
                            name: connection.destination.stopPoint.stopArea.name,
                            platform: connection.destination.stopPoint.platform
                        },
                        designation: connection.transportMode,
                        type: connection.transportMode
                    },
                    stopArea: {
                        name: connection.origin.stopPoint.stopArea.name,
                        platform: connection.origin.stopPoint.platform,
                    },

                    walkDistanceMeters: connection.distanceInMeters,
                }
            }

            tripLegs.push({
                departure: departure,
                arrival: arrival,
                time: differenceTime,
                line: {
                    direction: {
                        name: tripLeg.destination.stopPoint.stopArea.name,
                        shortName: tripLeg.serviceJourney.line.shortName,
                        platform: tripLeg.destination.stopPoint.platform
                    },
                    style: {
                        backgroundColor: tripLeg.serviceJourney.line.backgroundColor,
                        borderColor: tripLeg.serviceJourney.line.borderColor,
                        foregroundColor: tripLeg.serviceJourney.line.foregroundColor,
                    },
                    designation: tripLeg.serviceJourney.line.designation,
                    type: tripLeg.serviceJourney.line.transportMode,
                    operator: tripLeg.serviceJourney.line.operator,
                },
                stopArea: {
                    name: tripLeg.origin.stopPoint.stopArea.name,
                    platform: tripLeg.origin.stopPoint.platform
                },
                connection: connectionData
            })
        }

        let arrivalAccessLink;
        let departureAccessLink;
        const accessLinks = [result.departureAccessLink, result.arrivalAccessLink];
        for (let index = 0; index < accessLinks.length; index++) {
            const accessLink = accessLinks[index];

            if (!accessLink) {
                continue;
            }

            const departure = {
                planned: new Date(accessLink.plannedDepartureTime),
                actual: new Date(accessLink.plannedDepartureTime)
            }
            const arrival = {
                planned: new Date(accessLink.plannedArrivalTime),
                actual: new Date(accessLink.plannedArrivalTime)
            }
            const differenceTime = {
                planned: new Date(arrival.planned - departure.planned),
                actual: new Date(arrival.actual - departure.actual)
            };


            data = {
                departure: departure,
                arrival: arrival,
                time: differenceTime,
                stopArea: {
                    name: accessLink.origin.name
                },
                line: {
                    direction: {
                        name: accessLink.destination.name,
                        platform: accessLink.destination.platform
                    },
                    style: {
                        backgroundColor: "#000",
                        borderColor: "#fff",
                        foregroundColor: "#fff",
                    },
                    designation: accessLink.transportMode,
                    type: accessLink.transportMode,
                },

                walkDistanceMeters: accessLink.distanceInMeters,
            }

            if (index == 0) {
                departureAccessLink = data;
                departureTime = departure;
            } else {
                arrivalAccessLink = data;
                arrivalTime = arrival;
            }
        };

        const differenceTime = {
            planned: new Date(arrivalTime?.planned - departureTime?.planned),
            actual: new Date(arrivalTime?.actual - departureTime?.actual)
        }

        journeys.push({
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            time: differenceTime,
            departureAccessLink: departureAccessLink,
            arrivalAccessLink: arrivalAccessLink,
            tripLegs: tripLegs
        })
    }

    function createJourneyDiv(journey, index) {
        const journeyDiv = createElement(type="div", className="journey");
        journeyDiv.id = `journey-${index}`;
        let innerHTML = ``;

        const plannedDepartureTimeFormatted = new Intl.DateTimeFormat('sv-SE', { timeStyle: 'short' }).format(journey.departureTime.planned);
        const plannedArrivalTimeFormatted = new Intl.DateTimeFormat('sv-SE', { timeStyle: 'short' }).format(journey.arrivalTime.planned);

        innerHTML += `
<div class="total-time">
    <div class="departue">${plannedDepartureTimeFormatted}</div>
    <div class="difference">${getMinutesDate(journey.time.planned)} min</div>
    <div class="arrival">${plannedArrivalTimeFormatted}</div>
</div>`;

        let serviceInnerHTML = ``;

        let serviceInfoInnerHTML = ``;
        let newServiceInfoInnerHTML = ``;
        function createTripLegDiv(tripLeg) {
            let label;
            if (tripLeg.line.type == "train") {
                label = `${tripLeg.line.direction.shortName}`;
            } else {
                label = `${tripLeg.line.designation}`;
            }

            const plannedDepartureTimeFormatted = new Intl.DateTimeFormat('sv-SE', { timeStyle: 'short' }).format(tripLeg.departure.planned);
            const plannedArrivalTimeFormatted = new Intl.DateTimeFormat('sv-SE', { timeStyle: 'short' }).format(tripLeg.arrival.planned);

            serviceInnerHTML += `
<div class="service ${tripLeg.line.type}"
    ${tripLeg.line.style != null ? `style="background-color: ${tripLeg.line.style.backgroundColor}; border-color: ${tripLeg.line.style.borderColor}; color: ${tripLeg.line.style.foregroundColor};"` : ""}
    >
    <div class="label">${label} ${tripLeg.walkDistanceMeters != null ? `${tripLeg.walkDistanceMeters}m` : ""}</div>
</div>`;

            newServiceInfoInnerHTML += `
<div>${label} avgår ${plannedDepartureTimeFormatted} från ${tripLeg.stopArea.name}${tripLeg.stopArea.platform != null ? `, ${tripLeg.stopArea.platform}` : ""} och anländer vid ${tripLeg.line.direction.name}, ${tripLeg.line.direction.platform}</div>
`;
// <div class="service">${plannedDepartureTimeFormatted}, ${tripLeg.stopArea.name}${tripLeg.stopArea.platform != null ? `, ${tripLeg.stopArea.platform}` : ""}, ${tripLeg.line.designation}, ${tripLeg.line.direction.name}, ${tripLeg.line.direction.platform} (${getMinutesDate(tripLeg.time.planned)} min)</div>`;
            const timeDifference = getMinutesDate(tripLeg.time.planned);
            serviceInfoInnerHTML += `<div class="service">`;
            serviceInfoInnerHTML += ``;
            serviceInfoInnerHTML += `${plannedDepartureTimeFormatted} `;
            serviceInfoInnerHTML += `<span class="${timeDifference < 1 ? "warning" : ""}">(${timeDifference} min)</span>, `;
            serviceInfoInnerHTML += `${tripLeg.line.designation}: ${tripLeg.stopArea.name}${tripLeg.stopArea.platform != null ? ` (${tripLeg.stopArea.platform})` : ""} - `;
            if (tripLeg.stopArea.name != tripLeg.line.direction.name) {
                serviceInfoInnerHTML += `${tripLeg.line.direction.name} (${tripLeg.line.direction.platform})`;
            } else {
                serviceInfoInnerHTML += `plattform ${tripLeg.line.direction.platform}`;
            }
            serviceInfoInnerHTML += `</div>`;
        }

        if (journey.departureAccessLink) {
            createTripLegDiv(journey.departureAccessLink);
        };

        for (let index2 = 0; index2 < journey.tripLegs.length; index2++) {
            const tripLeg = journey.tripLegs[index2];
            
            createTripLegDiv(tripLeg);

            if (tripLeg.connection) {
                createTripLegDiv(tripLeg.connection);
            }
        }

        if (journey.arrivalAccessLink) {
            createTripLegDiv(journey.arrivalAccessLink);
        };
        innerHTML += `
<div class="times">
${serviceInnerHTML}
</div>
<div class="services-info">
${serviceInfoInnerHTML}
</div>
`;
        journeyDiv.innerHTML = innerHTML;

        const servicesInfoDiv = journeyDiv.querySelector(".services-info");
        const timesDiv = journeyDiv.querySelector(".times");
        timesDiv.addEventListener("click", function() {
            // if (modal.classList.contains("show")) {
            //     modal.classList.remove("show");
            // } else {
            //     modalTitle.textContent = `Vald resa: ${plannedDepartureTimeFormatted} - ${plannedArrivalTimeFormatted}`;
            //     modalContent.innerHTML = newServiceInfoInnerHTML;
            //     modal.classList.add("show");
            // }

            if (servicesInfoDiv.style.display === "none" || servicesInfoDiv.style.display === "") {
                servicesInfoDiv.style.display = "flex";
            }
            else {
                servicesInfoDiv.style.display = "none";
            }
        })

        return journeyDiv
    }

    loadingText.innerHTML = "";

    for (let index = 0; index < journeys.length; index++) {
        const journey = journeys[index];

        const journeyDiv = createJourneyDiv(journey, index);
        
        journeysDiv.append(journeyDiv);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    if (document.querySelector(".container")?.id != "settings") {
        return;
    }


});

document.addEventListener('DOMContentLoaded', async function() {
    if (document.querySelector(".container")?.id != "index") {
        return;
    }

    journeysDiv = document.querySelector(".journeys");
    loadingText = document.querySelector("#loading-text");

    modal = document.querySelector(".modal");
    modalTitle = document.querySelector(".modal .header .title");
    modalContent = document.querySelector(".modal .content");
   
    // const schoolButton = document.querySelector(".options #school")
    // const homeButton = document.querySelector(".options #home")
    // schoolButton.addEventListener("click", function() {
    //     trip = "school";
    //     updateJourneyUI(trip);
    // })
    // homeButton.addEventListener("click", function() {
    //     trip = "home";
    //     updateJourneyUI(trip);
    // })

    updateJourneyUI("school");
    updateJourneyUI("home");
});

async function getJourneys(token, type) {
    const url = new URL("https://ext-api.vasttrafik.se/pr/v4/journeys");

    const homeLatitude = "57.780657";
    const homeLongitude = "12.288071";
    const schoolLatitude = "57.7086";
    const schoolLongitude = "11.9665";

    if (type == "home") {
        // url.searchParams.append("originGid", schoolGID);
        // url.searchParams.append("destinationGid", homeGID);

        url.searchParams.append("originLatitude", schoolLatitude);
        url.searchParams.append("originLongitude", schoolLongitude);
        url.searchParams.append("destinationLatitude", homeLatitude);
        url.searchParams.append("destinationLongitude", homeLongitude);
    } else {
        // url.searchParams.append("originGid", homeGID);
        // url.searchParams.append("destinationGid", schoolGID);

        url.searchParams.append("originLatitude", homeLatitude);
        url.searchParams.append("originLongitude", homeLongitude);
        url.searchParams.append("destinationLatitude", schoolLatitude);
        url.searchParams.append("destinationLongitude", schoolLongitude);
    }
    url.searchParams.append("limit", "10");
    url.searchParams.append("includeNearbyStopAreas", true);
    url.searchParams.append("includeOccupancy", true);
    url.searchParams.append("useRealTimeMode", true);
    url.searchParams.append("interchangeDurationInMinutes", 4);

    let res = await fetch(url.toString(), {
        headers: {
            "Content-Type": "Application/json",
            "Authorization": "Bearer " + token.access_token
        },
        method: "GET"
    });
    let data = await res.json();

    return data;
}

async function getStops(token) {
    const url = new URL("https://ext-api.vasttrafik.se/pr/v4/stop-areas");
    
    let res = await fetch(url.toString(), {
        headers: {
            "Content-Type": "Application/json",
            "Authorization": "Bearer " + token.access_token
        },
        method: "GET"
    });
    let data = await res.json();
}