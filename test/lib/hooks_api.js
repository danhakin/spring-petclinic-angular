var chai = require('chai'),
    argv = require('minimist')(process.argv.slice(2)),
    config = require('../config/config.js');


///////////////////////
// PRIVATE FUNCTIONS //
///////////////////////

function initGlobals() {
    //load environment data file
    global.TEST_DATA = require('../data/_env.js');

    //expect method available globally
    if (!global.expect) {global.expect = chai.expect;}
}

//clean global scope
function cleanUp() {
    delete global.expect;
    delete global.TEST_DATA;
    delete global.DEBUG_CONSOLE;
}

function loadParameters () {
    var debugConsole = argv.console || config.debugConsole;
    if (debugConsole === 'true') {global.DEBUG_CONSOLE = true;}
    else {global.DEBUG_CONSOLE = false;}
}


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

function before() {
    loadParameters();
    //initialize globals
    initGlobals();

    //don't reject unsafe connections
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

function afterEach(test) {
    if (test.state === 'failed' || test.state === 'warning') {
        throw test.err;
    }
}

function after(tcname) {
    return cleanUp();
}


module.exports = {
    before: before,
    afterEach: afterEach,
    after: after
};