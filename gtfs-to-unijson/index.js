const transportData = require("./gtfs.json");
const fileDownload = require("file-download");
const unzipper = require("unzipper");
const { rm, access, readdir, readFile, writeFile } = require("fs").promises;
const { existsSync, createReadStream, createWriteStream } = require("fs");
const path = require('path');
const references = require("./ref.json");

let totalLines = 0;
const outputPath = path.join(__dirname, "..", "UniJSON");
const tempDirPath = path.join(__dirname, "temp");

async function startProcess() {
    try {
        await cleanTempDir();
        await downloadAndProcess();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function cleanTempDir() {
    try {
        if (await existsSync(tempDirPath)) {
            await rm(tempDirPath, { recursive: true });
            console.log("[TempCleaner] Temp Folder succesfully deleted.");
        } else {
            console.log("[TempCleaner] No temp folder detected.")
        }
    } catch (error) {
        console.error("[TempCleaner] Error cleaning up temp folder:", error);
    }
}

async function downloadAndProcess() {
    const transportAgencies = transportData.agencies;

    for (const agency of transportAgencies) {
        let fileCount = 0;

        for (const url of agency.urls) {
            fileCount++;
            const fileName = agency.name + fileCount + ".zip";
            const tempOutputDir = path.join(tempDirPath, agency.name);
            await downloadFile(url, agency.name, fileName, tempOutputDir);
            await extractAndConvert(tempOutputDir, fileName, outputPath, references);
        }
    }
}

async function downloadFile(url, name, fileName, tempDirOutput) {
    try {
        console.log("[Downloader] Downloading " + fileName + " from " + url);
        const downloadOptions = {
            directory: tempDirOutput,
            filename: fileName
        };
        await downloadFileAsync(url, downloadOptions);
    } catch (error) {
        console.error("[Downloader] Error downloading", fileName, ":", error);
    }
}

async function downloadFileAsync(url, options) {
    return new Promise((resolve, reject) => {
        fileDownload(url, options, (err) => {
            if (err) {
                reject(`[Downloader] Unable to download: ${options.filename}`);
            } else {
                console.log(`[Downloader] Downloaded successfully: ${options.filename}`);
                resolve();
            }
        });
    });
}

async function extractAndConvert(dir, fileName, output) {
    try {
        const jsonData = {};
        const extractedFolder = path.join(dir, fileName.split(".")[0]);
        const shortFileName = fileName.split(".")[0];

        await createReadStream(path.join(dir, fileName))
            .pipe(
                unzipper.Extract({
                    path: extractedFolder
                })
            )
            .on('entry', entry => entry.autodrain())
            .promise();
            
        console.log('[Unzipper] Extracted: ' + fileName);

        await rm(path.join(dir, fileName));

        const filesInDir = await readdir(extractedFolder);

        for (const file of filesInDir) {
            const filePath = path.join(extractedFolder, file);
            const fileType = file.split(".")[0];

            const fileContent = await readFile(filePath, 'utf-8');

            console.log("[DataProcessor] Found " + fileType + " for " + shortFileName);

            await processFile(fileContent, references, fileType, path.join(output, shortFileName + ".json"), jsonData);
        }
        console.log("[DataProcessor] ", totalLines, "lines of data treated")
    } catch (error) {
        console.error("Error in extractAndConvert:", error);
    }

    cleanTempDir();
}

async function processFile(content, references, type, out, jsonData) {
    try {
        let lines = content.split("\r\n");
        
        let refData = references[type]

        if (!refData) {
            console.log("[DataProcessor] No reference has been found for the type", type, ", Can't proceed.")
            return
        }

        console.log("[DataProcessor] Found", lines.length, "lines in", type);
        totalLines += lines.length;
        let fileData = [];
        lines.forEach(line => {
            fileData.push(line.split(","));
        });

        let hasReference = false

        fileData[0].forEach(item => {
            refData.forEach(reference => {
                if (!hasReference) {
                    if (reference == item) {
                        hasReference = true
                        console.log("[DataProcessor] At least 1 reference is present, no need to add them.")
                    }
                }
            })
        })
        if (!hasReference) {
            fileData.unshift(refData)

            console.log("[DataProcessor] No reference has been found in this file, they have been added, misinterpretation can happen")
        }

        let processedData = [];

        for (let i = 1; i < fileData.length - 1; i++) {
            let temp = {};
            if (!fileData[0].length) {
                console.log("Error for", type)
                console.log(fileData[0])
            }

            for (let j = 0; j < fileData[0].length - 0; j++) {
                temp[fileData[0][j].replace(/[^a-z_]/g, "")] = fileData[i][j]
            }

            processedData.push(temp);
        }

        if (!jsonData[type]) {
            jsonData[type] = [];
        } else {
            console.log("how")
        }

        jsonData[type] = jsonData[type].concat(processedData);

        await writeFile(out, JSON.stringify(jsonData), 'utf-8');
    } catch (err) {
        console.log("Error in processFile:", err);
    }
}

startProcess(); // Commence le processus principal
