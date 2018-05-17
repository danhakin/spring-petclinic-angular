var chai = require('chai'),
    utils = require('./utils_webdriver.js'),
    chalk = require('chalk'),
    Q = require('q');


///////////////////////
// PRIVATE FUNCTIONS //
///////////////////////

function initGlobals () {
    //load environment data file
    global.TEST_DATA = require('../data/_env.js');

    //expect method available globally
    if (!global.expect) {global.expect = chai.expect;}
}

//clean global scope
function cleanUp () {
    delete global.expect;
    delete global.TEST_DATA;
    //driver cleanup
    return driver.quit().catch(function (err) {
        console.log('\n\tError while quitting driver: "' + err.message + '"\n');
        return Q();
    });
}


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

function before () {
    //initialize globals
    initGlobals();

    //don't reject unsafe connections
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    //initialize phantomjs driver
    //delete existing driver and define a new global one
    if (global.driver) {delete global.driver;}
    return utils.createFirefoxDriver()
        .then(function (newDriver) {
            global.driver = newDriver;
        });
}

function afterEach (test, tcname) {
    if (test.state === 'failed' || test.state === 'warning') {
        return utils.screenshot(tcname, 'ERROR')
            .then(function () {
                return Q.reject(test.err);
            }, function (err) {
                console.log(chalk.yellow("\t\tError while generating screenshot: " + err.message));
                return Q.reject(test.err);
            });
    } else {
        return utils.screenshot(tcname, test.title.replace(/\s/g, '_'))
            .catch(function (err) {
                console.log(chalk.yellow("\t\tError while generating screenshot: " + err.message));
                return Q();
            });
    }
}

function after (tcname) {
    return cleanUp();
}


module.exports = {
    before: before,
    afterEach: afterEach,
    after: after
};