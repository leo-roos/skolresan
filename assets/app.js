// localStorage.setItem("homeGID", "9021014017153000")
// localStorage.setItem("schoolGID", "9021014004380000")
const homeGID = "9021014017153000"
const schoolGID = "9021014004380000"


document.addEventListener('DOMContentLoaded', async function() {
    const token = await checkToken();
    console.log(token)
    // getStops(token);
    getJourneys(token);
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
    console.log(data)
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