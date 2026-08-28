// NYCKELN SKULLE OCKSÅ LIGGA PÅ SERVERN!
const key = "LÄGG IN DIN KEY HÄR!";

async function checkToken(){
    let token = (localStorage.getItem("token") == null) ? setToken() : JSON.parse(localStorage.getItem("token"));
    let timeLeft = (new Date() - new Date(token.time)) / 1000;
    console.log(timeLeft)
    if(timeLeft > token.expires_in) {
        console.log("old")
        token = await setToken();
    }else{
        console.log("still fresh");
    }
    return token;
}


async function setToken(){ //SKULLE LIGGA PÅ EN SERVER!!!!
        let deviceId = genHexString(16);
        let url = "https://ext-api.vasttrafik.se/token";
        let res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization" :"Basic " + key
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                scope: "device_" + deviceId
            })
        })
        data = await res.json();
        data.time = new Date();
        localStorage.setItem("token", JSON.stringify(data));
        return data;

}




function genHexString(len) {
    const hex = '0123456789ABCDEF';
    let output = '';
    for (let i = 0; i < len; ++i) {
        output += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    return output;
}