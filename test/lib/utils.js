var _ = require('underscore'),
    chalk = require('chalk'),
    util = require('util');

///////////////////////
// PRIVATE FUNCTIONS //
///////////////////////

//para usar en compareJsons y validateJson
function isComparable (algo) {
    return (algo !== undefined && algo !== null && algo !== '');
}

//función que quita las propiedades "vacías" (null, "", undefined) de la raíz del objeto
function cleanObject (obj) {
    for (var prop in obj) {
        if (!this.isComparable(obj[prop]))
            delete obj[prop];
    }
}


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

/**
 * función que compara dos jsons. Por defecto ordena los arrays simples por orden alfbético.
 * Para arrays de objetos, busca los objetos del array del expected en el array del actual
 * filtrando por las propiedades definidas en camposClave en el parámetro options.
 * @param  {object}  actual         json encontrado
 * @param  {object}  expected       json esperado
 * @param  {object}  options        opcional. objeto con los siguientes parámetros opcionales
 *         {boolean} dontSortArrays indica que NO se ordenen los arrays de tipo SIMPLE
 *         {array}   camposClave    campos por los que, para arrays de objetos, se realizará la
 *                                  búsqueda de objetos del expected en el array de objetos
 *                                  correspondiente del actual
 *         {string}  rootName       nombre del objeto raíz, útil para el log de comparaciones
 *                                  parciales de objetos
 *         {boolean} strict         indica si se van a comparar también los campos vacíos que
 *                                  existan en el objeto esperado
 * @param  {string}  field          campo usado en la recursividad para construir la cadena de log
 * @return {boolean}                true si ha habido un error en la comparación
 */
function compareJsons (actual, expected, options, field) {
    //parámetros posibles de options
    var dontSortArrays,
        camposClave,
        rootName,
        strict;
    //inicialización de parámetros si options no es undefined
    if (options) {
        dontSortArrays = options.dontSortArrays;
        camposClave = options.camposClave || [];
        rootName = options.rootName;
        strict = options.strict;
    }

    //si estamos en el objeto raíz
    if (!field) {
        //si expected o actual son undefined o no son objetos o son objetos vacíos o son arrays,
        //los envolvemos con compareJsonsWrapper para poder compararlos
        if (expected === undefined || actual === undefined ||
                typeof expected !== 'object' || typeof actual !== 'object' ||
                Object.keys(expected).length === 0 || Object.keys(actual).length === 0 ||
                expected.constructor === Array || actual.constructor === Array) {
            expected = {compareJsonsWrapper: expected};
            actual = {compareJsonsWrapper: actual};
        }
    }

    var error = false;
    var localError = false;
    var self = this;
    var campo = field || (rootName ? rootName : '<object>');
    var strLog;

    //recorremos todas las propiedades del objeto esperado
    for (var property in expected) {
        var campoLog;
        var actualProperty = (actual === undefined) ? undefined : actual[property];
        var expectedProperty = (expected === undefined) ? undefined : expected[property];
        //sólo validamos campos no vacíos del expected
        if ( strict || this.isComparable(expectedProperty)) {
            //si expectedProperty es un objeto limpiamos las propiedades vacías para evitar problemas con los objetos plantilla
            if (!strict && typeof expectedProperty == 'object' && expectedProperty.constructor !==  Array) {
                this.cleanObject(expectedProperty);
            }
            //si es un array de arrays
            if ( (actualProperty !== undefined && actualProperty !== null && actualProperty.constructor ===  Array && actualProperty.length > 0 && actualProperty[0].constructor === Array) && (expectedProperty !== undefined && expectedProperty !== null && expectedProperty.constructor ===  Array && expectedProperty.length > 0 && expectedProperty[0].constructor === Array)) {
                //comparamos posición a posición (si a alguien se le ocurre cómo mantener el orden en arrays de arrays de profundidad desconocida, adelante)
                //recorremos el más largo
                var len = (expectedProperty.length < actualProperty.length) ? actualProperty.length : expectedProperty.length;
                for (var n = 0; n < len; n++) {
                    campoLog = campo + '.' + property + '[' + n + ']';
                    var objA = actualProperty[n];
                    var objE = expectedProperty[n];
                    //recursividad menos cuando el expected sea vacío
                    if (objE !== undefined) {
                        //creamos wrappers para que compareJsons pueda tratarlo
                        objA = {compareJsonsWrapper: objA};
                        objE = {compareJsonsWrapper: objE};
                        if (this.compareJsons(objA, objE, options, campoLog)) error = true;
                    //si expected es vacío, logamos
                    } else {
                        try {
                            expect(objA).to.deep.equal(objE);
                        } catch (err) {
                            //si no es un AssertionError lo relanzamos
                            if (err.stack.indexOf('AssertionError') == -1) throw err;
                            if (!error) error = true;
                            console.log(); //salto de línea
                            //quitamos del log el objeto wrapper que creamos para la comparación de los arrays de arrays
                            campoLog = campoLog.replace(/\.compareJsonsWrapper/g,"");
                            if (!process.env.qm_AttachmentsFile) console.log("  ┌── " + campoLog + " ──┐");
                            else console.log("  I-- " + campoLog + " --I");
                            console.log(chalk.green("Expected:\t" + util.inspect(err.expected)));
                            console.log(chalk.red("Actual:\t\t" + util.inspect(err.actual)));
                            if (!process.env.qm_AttachmentsFile) strLog = "  └───";
                            else strLog = "  I---";
                            for(var m = campoLog.length; m > 0; m--) {
                                if (!process.env.qm_AttachmentsFile) strLog += "─";
                                else strLog += "-";
                            }
                            if (!process.env.qm_AttachmentsFile) strLog += "───┘\n";
                            else strLog += "---I\n";
                            console.log(strLog);
                        }
                    }
                }
            //si es un array de objetos
            } else if ( (actualProperty !== undefined && actualProperty !== null && actualProperty.constructor ===  Array && typeof actualProperty[0]  == 'object') && (expectedProperty !== undefined && expectedProperty !== null && expectedProperty.constructor ===  Array && typeof expectedProperty[0] == 'object') ) {
                //obtenemos los campos para la querys con las propiedades de camposClave presentes en los objetos del array del expected
                var camposQuery = [];
                camposClave.forEach(function (campo) {
                    if (campo in expectedProperty[0]) camposQuery.push(campo);
                });
                //para almacenar los índices encotrados y hacer una posterior comparación
                var indices = [];
                //recorremos el array del expected buscando los objetos en el array del actual y lanzando las comparaciones recursivas
                expectedProperty.forEach(function (objE, index) {
                    var objA;
                    //si este campo array no está en el actual, lanzamos comparaciones contra undefined
                    if (camposQuery.length > 0) {
                        //buscamos sólo si hay algún campo clave
                        campoLog = campo + '.' + property + '{';
                        var queryLog = '';
                        //generamos la query
                        var query = {};
                        camposQuery.forEach(function (campo) {
                            var valor = objE[campo];
                            query[campo] = valor;
                            if (queryLog) queryLog += ', ';
                            if (typeof valor === "string")
                                //logamos comillas si el campo es un string
                                valor = '"' + valor + '"';
                            else if (typeof valor === "object")
                                //logamos corchetes si el campo es un array (objeto)
                                valor = '[' + valor + ']';
                            queryLog += campo + ': ' + valor;
                        });
                        campoLog += queryLog + '}';
                        //buscamos con una función personalizada por si alguno de los campos clave es un array
                        objA = _.find(actualProperty, function (obj, index) {
                            var found = true;
                            //recorremos la query
                            for (var campoClave in query) {
                                if (query[campoClave] !== null && typeof query[campoClave] == 'object') {
                                    //si el campo clave es un array (objeto), comprobamos que no haya diferencias
                                    if ( (query[campoClave].length !== obj[campoClave].length) || (_.difference(query[campoClave], obj[campoClave]).length > 0) ) {
                                        found = false;
                                        break;
                                    }
                                } else {
                                    //comparamos como si fuese un tipo simple
                                    if (query[campoClave] !== obj[campoClave]) {
                                        found = false;
                                        break;
                                    }
                                }
                            }
                            if (found) indices.push(index);
                            return found;
                        });
                    } else {
                        //si no hay campos clave, comparamos posición a posición
                        campoLog = campo + '.' + property + '[' + index + ']';
                        objA = actualProperty[index];
                    }
                    //comparamos los objetos del array
                    if (self.compareJsons(objA, objE, options, campoLog)) error = true;
                });
                //comprobamos longitudes del array (queda por comprobar elementos que estén en el actual y no en el expected)
                if ( (camposQuery.length > 0 && (indices.length !== actualProperty.length || indices.length !== expectedProperty.length)) || (camposQuery.length === 0 && actualProperty.length > expectedProperty.length) ) {
                    //el índice empieza en 0 para comparaciones con búsqueda y en la longitud del expected para comparaciones por posición
                    for(var i = (camposQuery.length > 0) ? 0 : expectedProperty.length; i < actualProperty.length; i++) {
                        //lo logamos como comparaciones contra undefined
                        if (camposQuery.length === 0 || indices.indexOf(i) === -1) {
                            if (camposQuery.length === 0) {
                                campoLog = campo + '.' + property + '[' + i + ']';
                            //si se ha hecho una búsqueda por campos clave, lo logamos igual que antes
                            } else {
                                campoLog = campo + '.' + property + '{';
                                var queryLog = '';
                                camposQuery.forEach(function (campo) {
                                    var valor = actualProperty[i][campo];
                                    if (queryLog) queryLog += ', ';
                                    if (typeof valor === "string")
                                        //logamos comillas si el campo es un string
                                        valor = '"' + valor + '"';
                                    else if (typeof valor === "object")
                                        //logamos corchetes si el campo es un array (objeto)
                                        valor = '[' + valor + ']';
                                    queryLog += campo + ': ' + valor;
                                });
                                campoLog += queryLog + '}';
                            }

                            if (!error) error = true;
                            console.log(); //salto de línea
                            //quitamos del log el objeto wrapper que creamos para la comparación de los arrays de arrays
                            campoLog = campoLog.replace(/\.compareJsonsWrapper/g,"");
                            if (!process.env.qm_AttachmentsFile) console.log("  ┌── " + campoLog + " ──┐");
                            else console.log("  I-- " + campoLog + " --I");
                            console.log(chalk.green("Expected:\tundefined"));
                            console.log(chalk.red("Actual:\t\t" + util.inspect(actualProperty[i])));
                            if (!process.env.qm_AttachmentsFile) strLog = "  └───";
                            else strLog = "  I---";
                            for(var j = campoLog.length; j > 0; j--) {
                                if (!process.env.qm_AttachmentsFile) strLog += "─";
                                else strLog += "-";
                            }
                            if (!process.env.qm_AttachmentsFile) strLog += "───┘\n";
                            else strLog += "---I\n";
                            console.log(strLog);
                        }
                    }
                }
            } else {
                //si no es un array y es un objeto no vacío
                if ( (actualProperty !== undefined && actualProperty !== null && actualProperty.constructor !==  Array && typeof actualProperty === 'object' && Object.keys(actualProperty).length !== 0) && (expectedProperty !== undefined && expectedProperty !== null && expectedProperty.constructor !==  Array && typeof expectedProperty === 'object' && Object.keys(expectedProperty).length !== 0) ) {
                    campoLog = campo + '.' + property;
                    //nos metemos al objeto
                    if (this.compareJsons(actualProperty, expectedProperty, options, campoLog)) error = true;
                } else {
                    //si es un array de tipos simples, lo ordenamos antes de la comparación si procede
                    if ( !dontSortArrays && (actualProperty !== undefined && actualProperty !== null && actualProperty.constructor ===  Array) && (expectedProperty !== undefined && expectedProperty !== null && expectedProperty.constructor ===  Array) ) {
                        expectedProperty.sort();
                        actualProperty.sort();
                    }
                    //si es un tipo simple, un objeto vacío o los tipos de actual y expected no coinciden, comparamos
                    try {
                        //en caso de que actual o expected sean vacíos, comparamos padres
                        if (actual === undefined || expected === undefined)
                            expect(actual).to.deep.equal(expected);
                        else {
                            //si nos llegan precios y son distintos, establecemos un margen de error
                            //en el json de pedido van precios como números, así que metemos el céntimo de margen en todas las comparaciones numéricas
                            if (expectedProperty !== actualProperty && ( (typeof expectedProperty == 'string' && typeof actualProperty == 'string' && expectedProperty.indexOf('EUR') > 1 && actualProperty.indexOf('EUR') > 1) || (typeof expectedProperty == 'number' && typeof actualProperty == 'number') )) {
                                var numA, numE;
                                //si los precios son strings los convertimos
                                if (typeof expectedProperty == 'string') {
                                    numA = parseFloat(actualProperty.replace("EUR", "").replace(",", ".").trim());
                                    numE = parseFloat(expectedProperty.replace("EUR", "").replace(",", ".").trim());
                                } else {
                                    numA = actualProperty;
                                    numE = expectedProperty;
                                }
                                var errMargin = 0.03;
                                //ponemos en el expected el valor del actual si procede
                                if (numE >= parseFloat((numA - errMargin).toFixed(2)) && numE <= parseFloat((numA + errMargin).toFixed(2)))
                                    expectedProperty = actualProperty;
                            }
                            expect(actualProperty).to.deep.equal(expectedProperty);
                        }
                    } catch (err) {
                        //si no es un AssertionError lo relanzamos
                        if (err.stack.indexOf('AssertionError') == -1) throw err;
                        if (!error) error = true;
                        if (!localError) {
                        localError = true;
                        console.log(); //salto de línea
                        if (campo) {
                            //quitamos del log el objeto wrapper que creamos para la comparación de los arrays de arrays
                            campo = campo.replace(/\.compareJsonsWrapper/g,"");
                            if (!process.env.qm_AttachmentsFile) console.log("  ┌── " + campo + " ──┐");
                            else console.log("  I-- " + campo + " --I");
                        }
                        }

                        //no logamos propiedades hijas si actual es undefined (estamos comparando padres) o la propiedad es el wrapper
                        if ( actual !== undefined && property !== "compareJsonsWrapper" && (!("compareJsonsWrapper" in actual) || actual.compareJsonsWrapper !== undefined) ) {
                            console.log("\t** " + property + " **");
                        }
                        console.log(chalk.green("Expected:\t" + util.inspect(err.expected)));
                        console.log(chalk.red("Actual:\t\t" + util.inspect(err.actual)));
                        //cuando actual es undefined, cortocircuitamos el bucle por las propiedades del expected
                        if (actual === undefined) break;
                    }
                }
            }
        }
    }
    //si ha habido error, cerramos sección (para que quede bonito)
    if (localError) {
        strLog = "";
        if (localError && campo) {
            if (!process.env.qm_AttachmentsFile) strLog = "  └───";
            else strLog = "  I---";
            for(var k = campo.length; k > 0; k--) {
                if (!process.env.qm_AttachmentsFile) strLog += "─";
                else strLog += "-";
            }
            if (!process.env.qm_AttachmentsFile) strLog += "───┘\n";
            else strLog += "---I\n";
        }
        console.log(strLog);
    }
    return error;
}

module.exports = {
    compareJsons: compareJsons
};