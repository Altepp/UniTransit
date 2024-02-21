let searchInput = document.getElementById("search-input");
let searchBar = document.getElementById("search-bar");
let filterDiv = document.getElementById("filters")
let filterType = document.getElementById("filter-type")
let filterDistance = document.getElementById("filter-distance")
let exempleSearchResult = document.getElementById("exemple-result")
// Initialise le border radius
searchBar.style.borderBottomLeftRadius = "5px";
filterDiv.style.height = "0px"
filterDiv.style.display = "none"
let focused = false
let focusLocked = false

searchInput.addEventListener("focus", (ev) => {
    focused = true
    searchBar.style.borderBottomLeftRadius = "0px";
    searchBar.style.borderBottomRightRadius = "0px";
    showFilter()
});

// Ajoute un écouteur d'événement pour le focusout
searchInput.addEventListener("focusout", (ev) => {
    searchBar.style.borderBottomLeftRadius = "5px";
    searchBar.style.borderBottomRightRadius = "5px";
    hideFilter()
});


filterDiv.addEventListener("click", () => {
    focusLocked = true
})
filterType.addEventListener("focus", () => {
    focusLocked = true
})

filterDistance.addEventListener("focus", () => {
    focusLocked = true
})



function showFilter() {
    filterDiv.style.height = "50px"
    filterDiv.style.display = "flex"
}

async function hideFilter() {
    focused = false

    await wait(1000)

    if(!focused && !focusLocked) {
        filterDiv.style.height = "0px"
        filterDiv.style.display = "none"
    }


}

searchInput.addEventListener("input", (ev) => {

    search(ev)

})

filterType.addEventListener("input", (ev)=> {
    search(ev)
})

filterDistance.addEventListener("input", (ev) => {
    search(ev)
})


function wait(milliseconds) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
  }

function search(ev) {
    let searchValue = searchInput.value
    if (searchValue.length < 4) return console.log("search to short")

    var xhr = new XMLHttpRequest();


    xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log(this.responseText);
        }
    });

    xhr.open("GET", "http://localhost:3000/api/lines/search?search=" + searchValue + "&type=" + filterType.value + "&lat=" + map.getCenter().lat + "&lng=" + map.getCenter().lng + "&dist=" + filterDistance.value);
    xhr.setRequestHeader("yo", "mec");

    xhr.send();
}