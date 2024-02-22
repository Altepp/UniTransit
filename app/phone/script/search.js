let searchInput
let baseResult
let results
let incDistance
let decDistance
let distValue
try {
window.onload = () => {
    searchInput = document.getElementById("search-input")
    baseResult = document.getElementsByClassName("result")[0].outerHTML
    results = document.getElementById("results")

    incDistance = document.getElementById("increment-distance")
    decDistance = document.getElementById("decrement-distance")

    distValue = document.getElementById("filter-distance-value")

    searchInput.addEventListener("input", (ev) => {

        search(ev)

    })

    incDistance.addEventListener("click", ev => {

        if (parseInt(distValue.innerHTML) < 100) {
            distValue.innerHTML = (parseInt(distValue.innerHTML) + 5) + " km"

        }
    })


    decDistance.addEventListener("click", ev => {

        if (parseInt(distValue.innerHTML) > 5) {
            distValue.innerHTML = (parseInt(distValue.innerHTML) - 5) + " km"

        }
    })
}


function search(ev) {


    let searchValue = searchInput.value
    if (searchValue.length < 2) {
        results.hidden = true
        results.innerHTML = "";
        return;
    } else {
        results.hidden = false
    }

    var xhr = new XMLHttpRequest();


    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText)
            console.log(JSON.parse(this.responseText));
            applySearch(JSON.parse(this.responseText))

            

        }
    });

    xhr.open("GET", "/api/lines/search?search=" + searchValue + "&type=" + "stops" + "&lat=" + map.getCenter().lat + "&lng=" + map.getCenter().lng + "&dist=" + 5000);
    xhr.setRequestHeader("yo", "mec");

    xhr.send();


}

function applySearch(json) {
    console.log("adding")


    //for demo
    json2 = {
        "routes": [],
        "stops": [{
                "stop_id": "conro1",
                "stop_code": "",
                "stop_name": "Le Rosay",
                "stop_desc": "",
                "stop_lat": "45.477207",
                "stop_lon": "4.76023",
                "zone_id": "",
                "stop_url": "",
                "location_type": "0",
                "parent_station": "",
                "stop_timezone": "",
                "wheelchair_boarding": "1",
                "level_id": "",
                "platform_code": ""
            },
            {
                "stop_id": "conro2",
                "stop_code": "",
                "stop_name": "Le Rosay",
                "stop_desc": "",
                "stop_lat": "45.477306",
                "stop_lon": "4.760347",
                "zone_id": "",
                "stop_url": "",
                "location_type": "0",
                "parent_station": "",
                "stop_timezone": "",
                "wheelchair_boarding": "1",
                "level_id": "",
                "platform_code": ""
            }
        ]
    }

    results.innerHTML = ""

    let hasDuplicated = {
        stops: {},
        routes: {}
    }

    for (let i = 0; i < json.stops.length; i++) {

        results.innerHTML = results.innerHTML + baseResult


        let title = document.getElementsByClassName("search-name")[i]
        title.innerHTML = json.stops[i].stop_name
        let desc = document.getElementsByClassName("search-details")[i]
        desc.innerHTML = json.stops[i].stop_desc
        let resultI = document.getElementsByClassName("result")[i]
        resultI.hidden = true
        let wheelChairBoarding = document.getElementsByClassName("search-chair")[i]
        if (json.stops[i].wheelchair_boarding == "0" || "") {
            wheelChairBoarding.src = "../icon/unknow-wheelchair.svg"
            wheelChairBoarding.hidden = false
        } else if (json.stops[i].wheelchair_boarding == "1") {
            wheelChairBoarding.src = "../icon/wheelchair.svg"
            wheelChairBoarding.hidden = false

        } else if (json.stops[i].wheelchair_boarding == "2") {
            wheelChairBoarding.src = "../icon/no-wheelchair.svg"
            wheelChairBoarding.hidden = false


        }
    }

}



} catch(e) {
    alert("ERROR: " + e)
}