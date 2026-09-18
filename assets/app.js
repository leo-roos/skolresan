// localStorage.setItem("homeGID", "9021014017153000");
// localStorage.setItem("schoolGID", "9021014004380000");
let journeysDiv;
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

async function updateJourneyUI() {
    journeysDiv.innerHTML = `Loading trips...`;

    const token = await checkToken();
    // getStops(token);
    const journeysData = await getJourneys(token);
    const results = journeysData.results;
    const journeys = [];

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
            } else if (index2 == result.tripLegs.length - 1) {
                arrivalTime = arrival
            }
            
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
                    planned: new Date(departureConnection.planned - arrivalConnection.planned),
                    actual: new Date(departureConnection.actual - arrivalConnection.actual)
                }
                
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

        let departureAccessLink;
        if (result.departureAccessLink) {
            const departure = {
                planned: new Date(result.departureAccessLink.plannedDepartureTime),
                actual: new Date(result.departureAccessLink.plannedDepartureTime)
            }
            const arrival = {
                planned: new Date(result.departureAccessLink.plannedArrivalTime),
                actual: new Date(result.departureAccessLink.plannedArrivalTime)
            }
            const differenceTime = {
                planned: new Date(departure.planned - arrival.planned),
                actual: new Date(departure.actual - arrival.actual)
            };

            departureTime = departure

            departureAccessLink = {
                departure: departure,
                arrival: arrival,
                time: differenceTime,
                stopArea: {
                    name: result.departureAccessLink.origin.name
                },
                line: {
                    direction: {
                        name: result.departureAccessLink.destination.stopPoint.stopArea.name,
                        platform: result.departureAccessLink.destination.stopPoint.platform
                    },
                    style: {
                        backgroundColor: "#000",
                        borderColor: "#fff",
                        foregroundColor: "#fff",
                    },
                    designation: result.departureAccessLink.transportMode,
                    type: result.departureAccessLink.transportMode,
                },

                walkDistanceMeters: result.departureAccessLink.distanceInMeters,
            }
        }

        const differenceTime = {
            planned: new Date(arrivalTime.planned - departureTime.planned),
            actual: new Date(arrivalTime.actual - departureTime.actual)
        }

        journeys.push({
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            time: differenceTime,
            departureAccessLink: departureAccessLink,
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
<div class="total-time">${plannedDepartureTimeFormatted} - ${plannedArrivalTimeFormatted}, ${getMinutesDate(journey.time.planned)} min</div>`;

        let serviceInnerHTML = ``;
        let serviceInfoInnerHTML = ``;
        function createTripLegDiv(tripLeg) {
            let label;
            if (tripLeg.line.type == "train") {
                label = `${tripLeg.line.designation} ${tripLeg.line.direction.shortName}`;
            } else {
                label = `${tripLeg.line.designation}`;
            }

            const plannedDepartureTimeFormatted = new Intl.DateTimeFormat('sv-SE', { timeStyle: 'short' }).format(tripLeg.departure.planned);
            const plannedArrivalTimeFormatted = new Intl.DateTimeFormat('sv-SE', { timeStyle: 'short' }).format(tripLeg.arrival.planned);

            serviceInnerHTML += `
<div class="service ${tripLeg.line.type}"
    ${tripLeg.line.style != null ? `style="background-color: ${tripLeg.line.style.backgroundColor}; border-color: ${tripLeg.line.style.borderColor}; color: ${tripLeg.line.style.foregroundColor};"` : ""}
    >
    <div class="departure">${plannedDepartureTimeFormatted}</div>
    <div class="label">${label} ${tripLeg.walkDistanceMeters != null ? `${tripLeg.walkDistanceMeters}m` : ""} (${getMinutesDate(tripLeg.time.planned)} min)</div>
    <div class="arrive">${plannedArrivalTimeFormatted}</div>
</div>`;

            serviceInfoInnerHTML += `
<div class="service">${plannedDepartureTimeFormatted}, ${tripLeg.stopArea.name}${tripLeg.stopArea.platform != null ? `, ${tripLeg.stopArea.platform}` : ""}, ${tripLeg.line.designation}, ${tripLeg.line.direction.name}, ${tripLeg.line.direction.platform} (${getMinutesDate(tripLeg.time.planned)} min)</div>`;
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
            if (servicesInfoDiv.style.display === "none" || servicesInfoDiv.style.display === "") {
                servicesInfoDiv.style.display = "flex";
            }
            else {
                servicesInfoDiv.style.display = "none";
            }
        })

        return journeyDiv
    }

    journeysDiv.innerHTML = "";
    for (let index = 0; index < journeys.length; index++) {
        const journey = journeys[index];

        const journeyDiv = createJourneyDiv(journey, index);
        
        journeysDiv.append(journeyDiv);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    journeysDiv = document.querySelector(".journeys");

    const schoolButton = document.querySelector(".options #school")
    const homeButton = document.querySelector(".options #home")
    schoolButton.addEventListener("click", function() {
        trip = "school";
        updateJourneyUI();
    })
    homeButton.addEventListener("click", function() {
        trip = "home";
        updateJourneyUI();
    })

    updateJourneyUI();
})

async function getJourneys(token) {
    const url = new URL("https://ext-api.vasttrafik.se/pr/v4/journeys");

    if (trip == "home") {
        url.searchParams.append("originGid", schoolGID);
        url.searchParams.append("destinationGid", homeGID);
    } else {
        url.searchParams.append("originGid", homeGID);
        url.searchParams.append("destinationGid", schoolGID);
    }
    url.searchParams.append("limit", "10");
    url.searchParams.append("includeNearbyStopAreas", true);
    url.searchParams.append("includeOccupancy", true);
    url.searchParams.append("useRealTimeMode", true);

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
    console.log(data);
}