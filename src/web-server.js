const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathName = parsedUrl.pathname;

    console.log(`Requested URL: ${pathName}`);




    if (pathName.startsWith('/app') && !pathName.startsWith("/api")) {
        let filePath = path.join(__dirname, "..", "app", parsedUrl.path.slice(5))

        if (filePath.endsWith(".ico")) {
            console.log("icon file request: Denied")
            res.writeHead(404)
            res.end()
            return
        }

        if(pathName == "/app/phone") {
            const redirectTo = '/app/phone/'
            console.log(`Redirecting to: ${redirectTo}`);
            res.writeHead(302, { 'Location': redirectTo });
            res.end();
            return
        }

        if(
            (
                !filePath.endsWith("\\") ||  
                filePath.endsWith("\\")
            )
                && 
            !(
                filePath.endsWith(".svg") || 
                filePath.endsWith(".html") ||
                filePath.endsWith(".css") || 
                filePath.endsWith(".js")
            )
            
            ) {
            console.log("[FolderChecker] Requested Folder, So index.html was given: " + filePath)
            filePath = path.join(filePath, "index.html")
        }

        if(filePath.endsWith(".svg")) {
            res.writeHead(200, {"Content-Type": "image/svg+xml"});
        } else if (filePath.endsWith(".html")) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        } else {
            res.writeHead(200)
        }



        console.log(`Requested file: ${filePath}`);

        let file

        try {
            file = await fs.readFileSync(filePath,'utf-8',  (err, data) => {
                if (err) {
                    console.log("Error: 404 File not dound")
                    return res.end("404 not found " + err + filePath);
                    
                } 
            })

            res.end(file)

        }
        catch (e) {
            console.log("Error: 500 Internal Server Error")

            res.end("500 Internal Server Error");
        }


        
        
    } else if (pathName.startsWith('/api')) {

    
        // Extrait le premier segment après "/api/"
        const segments = pathName.split('/').slice(2);

        let param = await getParams(req.url)

        console.log(param)
        let head = req.headers

        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Headers", "*")
        res.writeHead(200, {"Content-Type": "application/json"})



        let apiRunner

        try {
            apiRunner = require(path.join(__dirname, "api" , segments[0], segments[1])) 

            let response = await apiRunner.run(req, param, head)

            res.end(JSON.stringify(response))
        } catch (e) {

            if (e.stack.startsWith("Error: Cannot find module")) {
                res.end("418 I'm a teapot (aka invalid API call)")
            } else if (true == true){
                res.end(e.stack)
            } else  {
                res.end("500 Internal Server Error")
            }
            return
        }
        
        //apiRunner.run()
    } else {
        // Redirection vers "/app" si l'URL est invalide
        const redirectTo = '/app' + parsedUrl.path
        console.log(`Redirecting to: ${redirectTo}`);
        res.writeHead(302, { 'Location': redirectTo });
        res.end();
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});


function getParams(url) {

    if (!url.split("?")[1]) return {}
    let tempParam = url.split("?")[1].split("&")
    let param = {}
    tempParam.forEach(element => {
        let valueAndName = element.split("=")

        param[valueAndName[0]] = decodeURIComponent(valueAndName[1])
    });

    

    console.log(param)
    return param
}