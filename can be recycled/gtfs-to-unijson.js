let path = require ("path")
let {rename, readFile, writeFile} = require("fs")
let {readdir} = require("fs/promises")

import("gtfs-to-geojson/lib/gtfs-to-geojson.js").then(module => {
    const gtfsToGeoJSON = module.default;
  
    let config = require("../gtfs-config.json");
  
    gtfsToGeoJSON(config)
        .then(() => {
            console.log('\nGénération GeoJSON réussie');
            let geoJsonsPath = path.join(__dirname, "geojson")

            readdir(geoJsonsPath).then(dirs => dirs.forEach( dir => {
            

            
                let geoJsonPath = path.join(geoJsonsPath, dir, dir + ".geojson")
                let jsonPath = path.join(__dirname, "geojson", dir, dir + ".json")
                rename(geoJsonPath, jsonPath, (err) => {
                    if (err) {
                        console.log("Unable to rename " + dir + ".geojson to " + dir + ".json")
                    } else {
                        console.log("Renamed " + dir + ".geojson to " + dir + ".json")

                        TranformToUniJSON(jsonPath, dir)
                    }
                })
            
            }))

        })
        .catch((err) => {
            console.error(err);
        });

        
}).catch(error => {
    console.error("Erreur lors de l'importation du module : ", error);
})

function TranformToUniJSON(path, agency) {
    let file = require(path)
    let newFile = {
        routes: [],
        stops : []
    }
    let i = 0
    let j = 0
    let k = 0
    file.features.forEach(element => {
        i++
        if(element.properties["route_id"]) {
            k++

            if (element.properties.route_color) {
                element.properties.route_color = undefined
            }
            if (element.properties.route_text_color) {
                element.properties.route_text_color = undefined
            }

            newFile.routes.push(element)

        } else if (element.properties["stop_id"]) {
            
            j++

            element.properties.routes.forEach(route => {
                if (route.route_color) {
                    route.route_color = undefined
                }
                if (route.route_text_color) {
                    route.route_text_color = undefined
                }
            });

            
            


            newFile.stops.push(element)

        }
    });

    writeFile(path, JSON.stringify(newFile), (err) => {
        if (err) {
            
        }
    })

    console.log(i + " features found for " + agency)
    console.log(j + " stops found for " + agency)
    console.log(k + " routes found for " + agency)


}