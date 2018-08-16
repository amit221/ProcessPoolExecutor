if (process.env.NODE_ENV === "production") {
    module.exports = require("./dist/production/ProcessPoolExecutor.js");
} else {
    module.exports = require("./dist/development/ProcessPoolExecutor.js");
}
