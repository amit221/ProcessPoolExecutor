const images = require("images");
const {readdirSync} = require("fs");
const {resolve} = require("path");
const {ProcessPoolExecutor} = require("../dist/production/ProcessPoolExecutor");

images.setLimit(99999, 99999);
const imagesDirFullPath = resolve(__dirname, "./Images");
const allFiles = readdirSync(imagesDirFullPath);
const cover = allFiles.filter(x => x.toLowerCase().indexOf(".png") > -1)[0];
const imagesFiles = allFiles.filter(x => x !== cover && x.toLowerCase().indexOf(".jpg") > -1);
const coverAbsoluteFilePath = `${imagesDirFullPath}/${cover}`;

console.log();
console.log("Test Case: Heavy Image processing on the following Images", imagesFiles);
console.log();

const regularUsage = () => {
    const start = new Date().getTime();
    console.log("Starting WITHOUT process-pool-executor");

    for (let img of imagesFiles) {
        const imgAbsoluteFileName = `${imagesDirFullPath}/${img}`;
        const original = images(imgAbsoluteFileName);
        original
            .draw(
                images(coverAbsoluteFilePath)
                    .size(original.width(), original.height()), 0, 0
            );
    }

    const end = new Date().getTime();
    console.log(`Finished WITHOUT process-pool-executor in ${(end - start) / 1000} seconds`);
};

const processPoolExectorUsage = () => {
    const start = new Date().getTime();
    console.log("Starting WITH process-pool-executor");
    const promises = imagesFiles.map(img => {
        return ProcessPoolExecutor.execute(`node ${resolve(__dirname, "./external-script.js")} --image="${imagesDirFullPath}/${img}" --cover="${coverAbsoluteFilePath}"`);
    });

    Promise.all(promises).then(() => {
        const end = new Date().getTime();
        console.log(`Finished WITH process-pool-executor in ${(end - start) / 1000} seconds`);
    });
};

//regularUsage();
console.log("==========================");
processPoolExectorUsage();
