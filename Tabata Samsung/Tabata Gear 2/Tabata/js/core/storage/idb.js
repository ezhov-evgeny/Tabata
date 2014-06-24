/*global define, console, indexedDB, window*/

/**
 * Simple storage module, implemented using IndexedDB.
 */

define({
    name: 'core/storage/idb',
    requires: [
        'core/event'
    ],
    def: function coreStorage(e) {
        'use strict';

        var indexedDB = window.webkitIndexedDB || window.indexedDB,
            IDBKeyRange = window.webkitIDBKeyRange || window.IDBKeyRange,
            DB_NAME = 'corestorage',
            STORE_NAME = 'kvstore',
            VERSION = 5, // increment the value when db structure changes
            PREFIX = 'core.storage.',

            // this module fires the following events
            EVENT_OPEN = PREFIX + 'open', // db is open and ready to be used
            EVENT_READ = PREFIX + 'read', // read request completed
            EVENT_WRITE = PREFIX + 'write', // write request completed
            EVENT_REMOVE = PREFIX + 'remove', // remove request completed
            EVENT_COMPLETED = PREFIX + 'completed', // cleared pending requests

            requestsCounter = -1,
            pending = {},
            db = null;

        function isReady() {
            return db !== null;
        }

        /**
         * Add a request to the list of pending requests.
         * @param {string} eventName
         * @param {string} key
         * @param {*?} value
         * @returns {number} unique request ID.
         */
        function addPendingRequest(eventName, key, value) {
            requestsCounter += 1;
            pending[requestsCounter] = {
                eventName: eventName,
                key: key,
                value: value
            };
            return requestsCounter;
        }

        /**
         * Get pending request data.
         *
         * Returns 'undefined' if the request is already completed.
         * @param {number} id
         * @return {object}
         */
        function getPendingRequest(id) {
            return pending[id];
        }

        /**
         * Checks if there are any pending requests.
         * @return {bool}
         */
        function hasPendingRequests() {
            return Object.keys(pending).length !== 0;
        }

        /**
         * Remove a completed request from the list of pending requests.
         *
         * The request should be removed not earlier than all relevant
         * handlers have finished processing.
         * @param {type} id
         */
        function removePendingRequest(id) {
            delete pending[id];
            if (!hasPendingRequests()) {
                e.fire(EVENT_COMPLETED);
            }
        }

        /**
         * Generic error handler for IndexedDB-related objects.
         * @param {Error} err
         */
        function onerror(err) {
            console.error(err.target.error.message);
        }

        /**
         * Creates or updates database structure.
         * @param {Event} ev
         */
        function onUpgradeNeeded(ev) {
            var resultDb = ev.target.result;

            // a transaction for changing db version starts automatically
            ev.target.transaction.onerror = onerror;

            // remove the existing store and create it again
            if (resultDb.objectStoreNames.contains(STORE_NAME)) {
                resultDb.deleteObjectStore(STORE_NAME);
            }

            resultDb.createObjectStore(
                STORE_NAME,
                {keyPath: 'key'}
            );
        }

        /**
         * Assigns database object.
         *
         * This handler is executed right after the upgrade.
         * This method fires the core.storage.open event upon completion.
         * @param {Event} ev
         */
        function onOpenSuccess(ev) {
            db = ev.target.result;
            e.fire(EVENT_OPEN);
        }

        /**
         * Open the database.
         */
        function open() {
            // create a request for opening the database
            var request = indexedDB.open(DB_NAME, VERSION);

            // one or more of the handlers will be called
            // automatically when the current function exits
            request.onupgradeneeded = onUpgradeNeeded;
            request.onsuccess = onOpenSuccess;
            request.onerror = onerror;
        }

        /**
         * Gets value for given key from the storage.
         *
         * The method fires the core.storage.read event upon completion.
         * @param {string} key Key.
         * @return {object?} Json object.
         */
        function get(key) {
            var trans = db.transaction([STORE_NAME], 'readwrite'),
                store = trans.objectStore(STORE_NAME),

                // Find the key in the store
                keyRange = IDBKeyRange.only(key),
                id = addPendingRequest(EVENT_READ, key),
                cursorRequest = store.openCursor(keyRange);

            cursorRequest.onsuccess = function onCursorOpenSuccess(ev) {
                var error = null,
                    cursor = ev.target.result;

                if (!cursor) {
                    error = new Error('No records returned');
                    error.name = 'StorageNotFoundError';

                    e.fire(EVENT_READ, {
                        id: id,
                        key: key,
                        error: error
                    });
                    removePendingRequest(id);
                } else {
                    e.fire(EVENT_READ, {
                        id: id,
                        key: cursor.value.key,
                        value: cursor.value.value
                    });
                }
                removePendingRequest(id);
            };

            cursorRequest.onerror = function onCursorOpenError(err) {
                removePendingRequest(id);
                console.error(err.target.error.message);
            };

            return id;
        }

        /**
         * Sets value for given key to the storage.
         *
         * The method fires the core.storage.write event upon completion.
         * @param {string} key Key.
         * @param {object} val Value object.
         * @return {bool}
         */
        function set(key, val) {
            var trans = db.transaction([STORE_NAME], 'readwrite'),
                store = trans.objectStore(STORE_NAME),
                request = store.put({
                    key: key,
                    value: val
                }),
                id = addPendingRequest(EVENT_WRITE, key, val);

            request.onsuccess = function onPutSuccess() {
                e.fire(
                    EVENT_WRITE,
                    {id: id, key: key, value: val}
                );
                removePendingRequest(id);
            };

            request.onerror = function onPutError(err) {
                console.error(err.target.error.message);
                removePendingRequest(id);
            };

            return id;
        }

        /**
         * Removes value with given key from the storage.
         *
         * The method fires the core.storage.remove event upon completion.
         * @param {string} key Key.
         */
        function remove(key) {
            var trans = db.transaction([STORE_NAME], 'readwrite'),
                store = trans.objectStore(STORE_NAME),
                id = addPendingRequest(EVENT_REMOVE, key),
                request = store.delete(key);

            request.onsuccess = function onDeleteSuccess() {
                e.fire(EVENT_REMOVE, {id: id, key: key});
                removePendingRequest(id);
            };

            request.onerror = function onDeleteError(err) {
                console.error(err.target.error.message);
                removePendingRequest(id);
            };
            return id;
        }

        function init() {
            open();
        }

        return {
            init: init,
            getPendingRequest: getPendingRequest,
            hasPendingRequests: hasPendingRequests,
            isReady: isReady,
            get: get,
            add: set,
            set: set,
            remove: remove
        };
    }
});
