/*jslint forin: true*/
/*global console, window*/


(function debug() {
    'use strict';
    /**
     * Assigns nested attributes
     * @param {object} obj Object.
     * @param {array} pathElements Elements array.
     * @param {object} value Object.
     */
    function assignNested(obj, pathElements, value) {
        var i, key = pathElements.pop();
        // check the path
        for (i = 0; i < pathElements.length; i += 1) {
            // if empty create an empty object here
            obj = obj[pathElements[i]] = obj[pathElements[i]] || {};
        }
        obj[key] = value;
    }

    window.debug = {
        modules: null,
        m: {},
        listeners: function listeners(name) {
            var i, n, names = this.m.core.event.getListeners(name), keys = [];
            for (n in names) {
                if (names.hasOwnProperty(n)) {
                    keys.push(n);
                }
            }
            keys.sort();
            for (i = 0; i < keys.length; i += 1) {
                n = keys[i];
                console.log(n + ': [' + names[n].join(', ') + ']');
            }
        },
        init: function init(modules) {
            var name;

            if (!modules) {
                console.error('debug: modules not defined!');
                return;
            }
            this.modules = modules;

            for (name in modules) {
                // nested objects for cleaner syntax
                assignNested(
                    this.m,
                    name.split('/'),
                    this.modules[name].instance
                );
            }

        }
    };
}());
