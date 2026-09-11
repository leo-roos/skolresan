// localStorage.setItem("homeGID", "9021014017153000")
// localStorage.setItem("schoolGID", "9021014004380000")
const homeGID = "9021014017153000"
const schoolGID = "9021014004380000"

function getMinutesDate(date) {
    return date.getMinutes() + ((date.getHours() - 1) * 60)
}

document.addEventListener('DOMContentLoaded', async function() {
    const token = await checkToken();
    // getStops(token);
    const journeysData = await getJourneys(token);
    const results = journeysData.results;
    console.log(results)
    const journeys = [];

    for (let index = 0; index < results.length; index++) {
        const result = results[index];

        let departureTime, arrivalTime;

        const tripLegs = [];
        for (let index2 = 0; index2 < result.tripLegs.length; index2++) {
            const tripLeg = result.tripLegs[index2];

            const departure = new Date(tripLeg.plannedDepartureTime);
            const arrival = new Date(tripLeg.plannedArrivalTime);
            const differenceTime = new Date(arrival - departure);
            // console.log(arrival)
            // console.log(departure)
            // console.log(differenceTime)

            if (index2 == 0) {
                departureTime = {
                    planned: departure,
                    actual: departure,
                }
            } else if (index2 == result.tripLegs.length - 1) {
                arrivalTime = {
                    planned: arrival,
                    actual: arrival,
                }
            }
            
            tripLegs.push({
                departure: {
                    planned: departure,
                    actual: departure
                },
                arrival: {
                    planned: arrival,
                    actual: arrival
                },
                time: {
                    planned: differenceTime,
                    actual: differenceTime
                },
                line: {
                    direction: {
                        name: tripLeg.destination.stopPoint.stopArea.name,
                        platform: tripLeg.destination.stopPoint.platform
                    },

                    backgroundColor: tripLeg.serviceJourney.line.backgroundColor,
                    borderColor: tripLeg.serviceJourney.line.borderColor,
                    foregroundColor: tripLeg.serviceJourney.line.foregroundColor,
                    designation: tripLeg.serviceJourney.line.designation,
                    type: tripLeg.serviceJourney.line.transportMode,
                    operator: tripLeg.serviceJourney.line.operator,
                },
                stopArea: {
                    name: tripLeg.origin.stopPoint.stopArea.name
                }
            })
        }

        const differenceTime = new Date(arrivalTime.planned - departureTime.planned);
        const differenceTimeActual = new Date(arrivalTime.actual - departureTime.actual);
        // console.log(arrivalTime.planned)
        // console.log(departureTime.planned)
        // console.log(differenceTime)
        
        journeys.push({
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            time: {
                planned: differenceTime,
                actual: differenceTimeActual,
            },
            tripLegs: tripLegs
        })
    }

    console.log(journeys);

    const journeysDiv = document.querySelector(".journeys");
    journeysDiv.innerHTML = ``;
    for (let index = 0; index < journeys.length; index++) {
        const journey = journeys[index];

        const journeyDiv = document.createElement("div");
        journeyDiv.classList.add("journey");
        journeyDiv.id = `journey-${index}`;
        
        const totalTimeDiv = document.createElement("div");
        totalTimeDiv.classList.add("total-time");

        const timesDiv = document.createElement("div");
        timesDiv.classList.add("times");

        const servicesInfoDiv = document.createElement("div");
        servicesInfoDiv.classList.add("services-info");

        const plannedDepartureTimeFormatted = new Intl.DateTimeFormat('sv-SE', { timeStyle: 'short' }).format(journey.departureTime.planned);
        const plannedArrivalTimeFormatted = new Intl.DateTimeFormat('sv-SE', { timeStyle: 'short' }).format(journey.arrivalTime.planned);
        totalTimeDiv.innerHTML = `${plannedDepartureTimeFormatted} - ${plannedArrivalTimeFormatted}, ${getMinutesDate(journey.time.planned)} min`;

        for (let index2 = 0; index2 < journey.tripLegs.length; index2++) {
            const tripLeg = journey.tripLegs[index2];
            const serviceDiv = document.createElement("div");
            serviceDiv.classList.add("service");

            const departureDiv = document.createElement("div");
            departureDiv.classList.add("departure");
            const plannedDepartureTime = tripLeg.departure.planned;
            const plannedDepartureTimeFormatted = new Intl.DateTimeFormat('sv-SE', { timeStyle: 'short' }).format(plannedDepartureTime);
            departureDiv.innerHTML = `${plannedDepartureTimeFormatted}`;

            const labelDiv = document.createElement("div");
            labelDiv.classList.add("label");

            if (tripLeg.line.type == "train") {
                labelDiv.innerHTML = `${tripLeg.line.designation} V-TÅG`;
            } else {
                labelDiv.innerHTML = `${tripLeg.line.designation}`;
            }
            labelDiv.innerHTML += ` (${getMinutesDate(tripLeg.time.planned)} min)`

            const arriveDiv = document.createElement("div");
            arriveDiv.classList.add("arrive");
            const plannedArrivalTime = tripLeg.arrival.planned;
            const plannedArrivalTimeFormatted = new Intl.DateTimeFormat('sv-SE', { timeStyle: 'short' }).format(plannedArrivalTime);
            arriveDiv.innerHTML = `${plannedArrivalTimeFormatted}`;

            // add to services-info div
            const serviceInfoDiv = document.createElement("div");
            serviceInfoDiv.classList.add("service");
            serviceInfoDiv.innerHTML =
`${plannedDepartureTimeFormatted}, ${tripLeg.stopArea.name}, ${tripLeg.line.designation}, ${tripLeg.line.direction.name}, ${tripLeg.line.direction.platform} (${getMinutesDate(tripLeg.time.planned)} min)`

            servicesInfoDiv.append(serviceInfoDiv);

            serviceDiv.append(departureDiv, labelDiv, arriveDiv);
            timesDiv.append(serviceDiv);
        }

        // <div class="services-info">
        //     <div class="service">12:05 Lerums Kyrka, 531 Lerum Station, B (6 min)</div>
        //     <div class="service">12:11 Byte, Läge 2, Lerum Station (2 min)</div>
        //     <div class="service">12:37 Lerum Station, 2, V-TÅG Göteborg C, 1 (17 min)</div>
        //     <div class="service">12:55 Framme, Lilla Bommen, (6 min)</div>
        // </div>

        journeyDiv.addEventListener("click", function() {
            if (servicesInfoDiv.style.display === "none" || servicesInfoDiv.style.display === "") {
                servicesInfoDiv.style.display = "flex";
            }
            else {
                servicesInfoDiv.style.display = "none";
            }
        })

        journeyDiv.append(totalTimeDiv, timesDiv, servicesInfoDiv);
        journeysDiv.append(journeyDiv);

{/* <div class="journey" id="journey-${index}" onclick="toggleInfo(this)">
        <div class="total-time">
            12:05 - 13:01, 56 min
        </div>

        <div class="times">
            <div class="service">
                <div class="leave">12:05</div>
                <div class="label">531 (6 min)</div>
                <div class="arrive">12:11</div>
            </div>
            <div class="change">
                <div class="leave">12:11</div>
                <div class="label">Läge 3 (2 min)</div>
                <div class="arrive">12:13</div>
            </div>
            <div class="service">
                <div class="leave">12:37</div>
                <div class="label">V-TÅG (17 min)</div>
                <div class="arrive">12:55</div>
            </div>
            <div class="final">
                <div class="leave">12:55</div>
                <div class="label">Framme</div>
                <div class="arrive">13:01</div>
            </div>
        </div>

        <div class="services-info">
            <div class="service">12:05 Lerums Kyrka, 531 Lerum Station, B (6 min)</div>
            <div class="service">12:11 Byte, Läge 2, Lerum Station (2 min)</div>
            <div class="service">12:37 Lerum Station, 2, V-TÅG Göteborg C, 1 (17 min)</div>
            <div class="service">12:55 Framme, Lilla Bommen, (6 min)</div>
        </div>
    </div>
</div> */}
    }
})

async function getJourneys(token) {
    const url = new URL("https://ext-api.vasttrafik.se/pr/v4/journeys");

    url.searchParams.append("originGid", homeGID);
    url.searchParams.append("destinationGid", schoolGID);
    url.searchParams.append("limit", "10");

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
    const url = "https://ext-api.vasttrafik.se/pr/v4/stop-areas";
    
    let res = await fetch(url, {
        headers: {
            "Content-Type": "Application/json",
            "Authorization": "Bearer " + token.access_token
        },
        method: "GET"
    });
    let data = await res.json();
    console.log(data);
}