const { readFile } = require("fs");
let http = require("http");
const { join } = require("path");
const { stringify } = require("querystring")
let ErrorCode = require("../../ErrorCode")
const { readdir } = require('fs').promises;
let path = require("path");
const { isCoordinateWithinZone } = require("../../utils");

module.exports = {
    run: async (req, param, head) => {
        let res = { routes: [], stops: [] };

        let jsonsPath = join(__dirname, "../../..", "UniJSON");

        let searchParam = param["search"]
        let typeParam = param["type"]
        let lat = param["lat"]
        let lng = param["lng"]
        let distance = param["dist"]
        if (!typeParam || typeParam != "stops") return {message: "invalid type", error: ErrorCode.ErrorCode.Client.WrongUse}

        if (!searchParam) {
            return {"message": "no search field provided"}
        }

        try {
            const files = await readdir(jsonsPath);

            let isFound;

            let routeFound = []
            let stopsFound = []
            let busFound = []

            for (let file of files) {
                let json = require(path.join(jsonsPath, file))

                json.stops.forEach(stop => {
  
                    if (stop.stop_name.toLowerCase().startsWith(searchParam.toLowerCase())) {
                        if(isCoordinateWithinZone(lat, lng, distance, stop.stop_lat, stop.stop_lon)) return stopsFound.push(stop)
                    }


                    stop.stop_name.split(" ").forEach(dividedName => {
                        if (dividedName.toLowerCase().startsWith(searchParam.toLowerCase())) {
                            if(isCoordinateWithinZone(lat,lng, distance, stop.stop_lat, stop.stop_lon)) return stopsFound.push(stop)
                        }

                    })


                });
            }


            res.routes = routeFound
            res.stops = stopsFound






            
            
        } catch (error) {
            // Gérer l'erreur pour la lecture du répertoire
            console.error(error);
        }

        return res;
    }
};
