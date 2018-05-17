var Q = require('q'),
    config = require('../config/config.js'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    webdriver = require('selenium-webdriver'),
    firefox = require('selenium-webdriver/firefox'),
    chalk = require('chalk');
    defaultTimeout = 3000;

///////////////////////
// PRIVATE FUNCTIONS //
///////////////////////

function getDateObject() {
var now = new Date();
    return {
        year: now.getFullYear().toString(),
        month: ('00' + (now.getMonth() + 1)).slice(-2),
        day: ('00' + now.getDate()).slice(-2),
        hour: ('00' + now.getHours()).slice(-2),
        minutes: ('00' + now.getMinutes()).slice(-2),
        seconds: ('00' + now.getSeconds()).slice(-2),
        now: now.toString()
    };
}

//set timeout for webdriver actions. If no argument is passed, resets timeout to default value
function setWaitTimeout(timeout) {
    driver.manage().timeouts().implicitlyWait(timeout || defaultTimeout);
}


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

//creates PhantomJS driver
function createPhantomJsDriver() {
    //setup custom phantomJS capability
    var customPhantom = webdriver.Capabilities.phantomjs();
    customPhantom.set("phantomjs.binary.path", require('phantomjs').path);

    //build custom phantomJS driver
    var newDriver = new webdriver.Builder().withCapabilities(customPhantom).build();
    return newDriver.manage().timeouts().implicitlyWait(defaultTimeout)
        .then(function () {
            return newDriver.manage().window().maximize();
        })
        .then(function () {
            return Q(newDriver);
        });
}

//creates Firefox driver
function createFirefoxDriver() {
    var profile = new firefox.Profile();

    //profile options to ignore certificates
    profile.setAssumeUntrustedCertIssuer(true);
    profile.setAcceptUntrustedCerts(true);

    //driver creation
    var options = new firefox.Options().setProfile(profile);
    var newDriver = new firefox.Driver(options);

    //timeout and window maximize
    return newDriver.manage().timeouts().implicitlyWait(defaultTimeout)
        .then(function () {
            return newDriver.manage().window().maximize();
        })
        .then(function () {
            return Q(newDriver);
        });
}

//creates a folder path
function createFolders(folderPath) {
  var deferred = Q.defer();
  mkdirp(folderPath, function(err) {
    if (err) {deferred.reject(err);}
    else {deferred.resolve();}
  });
  return deferred.promise;
}

//pantallazo creando un archivo en la carpeta screenshots con nombre tcname_result y la fecha actual (si no recibe nada, solo con la fecha)
function screenshot(tcname, result) {
    var deferred = Q.defer(),
        date = getDateObject(),
        folder = date.year + date.month + date.day,
        dateformatted = date.year + date.month + date.day + date.hour + date.minutes + date.seconds,
        filename = '';
    if (tcname) {filename = tcname + '_';}
    if (result) {filename += result + '_';}
    filename += dateformatted;
    var scrPath = config.screenshotsPath + folder;
    //create folders if necessary
    createFolders(scrPath)
        .then(function() {
            return driver.takeScreenshot()
                .then(function(data) {
                    fs.writeFile(scrPath + '/' + filename + '.png',
                        data.replace(/^data:image\/png;base64,/, ''), 'base64',
                        function (err) {
                            if (err) {
                                deferred.reject(err);
                            } else {
                                console.log(chalk.grey('       Screenshot for ' + result + ' at ' + filename + '.png'));
                                deferred.resolve(scrPath);
                            }
                        });
                });
        })
        .catch(deferred.reject);
    return deferred.promise;
}

//waits for an element to be visible
//timeout specifies the time to wait for it to be visible
function waitElementVisible(locator, timeout) {
    var time = timeout || defaultTimeout;
    setWaitTimeout(500);
    return driver.wait(function () {
            return driver.findElement(locator)
                .then(function (webElement) {
                    return webElement.isDisplayed();
                })
                .catch(function () {return Q(false);});
        },
        time, 'TIMEOUT: ' + JSON.stringify(locator) + ' not present or not visible after ' + time + 'ms')
        .then(function (result) {
            //implicit wait reset
            setWaitTimeout();
            return Q(result);
        })
        .catch(function (err) {
            //implicit wait reset
            setWaitTimeout();
            return Q.reject(err);
        });
}

//waits for an element to be visible and clicks on it
function click (locator, timeout) {
    return waitElementVisible(locator, timeout)
        .then(function () {
            return driver.findElement(locator).click();
        });
}

//waits for an element to be visible and sets its text
function setText (locator, text, timeout) {
    return waitElementVisible(locator, timeout)
        .then(function () {
            return driver.findElement(locator)
                .then(function (webElement) {
                    return webElement.clear()
                        .then(function () {
                            return webElement.sendKeys(text);
                        });
                });
        });
}

//checks inner text of an element
function checkText (locator, expectedText, fieldNameArg, timeout) {
    var fieldName = fieldNameArg || JSON.stringify(locator);
    return waitElementVisible(locator, timeout)
        .then(function () {
            return driver.findElement(locator).getText()
                .then(function (actualText) {
                    expect(actualText, fieldName).equal(expectedText);
                });
        });
}

//waits until an element stops existing
function waitElementNotExists (locator, timeout) {
    var time = timeout || defaultTimeout;
    setWaitTimeout(500);
    return driver.wait(function () {
            return driver.findElement(locator)
                .then(function () {return Q(false);})
                .catch(function () {return Q(true);});
        },
        time, 'TIMEOUT: ' + JSON.stringify(locator) + ' still exists after ' + time + 'ms')
        .then(function (result) {
            //implicit wait reset
            setWaitTimeout();
            return Q(result);
        })
        .catch(function (err) {
            //implicit wait reset
            setWaitTimeout();
            return Q.reject(err);
        });
}

module.exports = {
    createPhantomJsDriver: createPhantomJsDriver,
    createFirefoxDriver: createFirefoxDriver,
    createFolders: createFolders,
    screenshot: screenshot,
    waitElementVisible: waitElementVisible,
    click: click,
    setText: setText,
    checkText: checkText,
    waitElementNotExists: waitElementNotExists
};