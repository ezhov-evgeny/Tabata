/*global define, console, localStorage*/

/**
 * Storage module
 */

define({
    name: 'core/storage/localstorage',
    def: function coreStorage() {
        'use strict';

        /**
         * Gets value for given key from local storage.
         * @param {string} key Key.
         * @return {object?} Json object.
         */
        function get(key) {
            var storageStr = localStorage.getItem(key);
            if (storageStr) {
                try {
                    return JSON.parse(storageStr);
                } catch (error) {
                    console.warn('core/storage', 'Parse error:', error);
                    return null;
                }
            }
            return null;
        }

        /**
         * Sets value for given key to local storage.
         * @param {string} key Key.
         * @param {object} val Value object.
         * @return {bool}
         */
        function set(key, val) {
            var json = null;
            try {
                json = JSON.stringify(val);
            } catch (error) {
                console.warn('Stringify error', error);
            }

            if (json !== null) {
                localStorage.setItem(key, json);
                return true;
            }

            return false;
        }

        /**
         * Removes value for given key from local storage.
         * @param {string} key Key.
         */
        function remove(key) {
            localStorage.removeItem(key);
        }

        return {
            get: get,
            add: set,
            set: set,
            remove: remove
        };
    }
});
