/*global define, console*/

/**
 * Sort module, containing utility functions to help with sorting arrays
 * of files and strings.
 * @module core/sort
 */
define({
    name: 'core/sort',
    def: function coreSort() {
        'use strict';

        /**
         * Compaes a single chunk for natural sort.
         * @param {string} a
         * @param {string} b
         * @return {bool} Comparison.
         */
        function compareChunks(a, b) {
            var aIsNum,
                bIsNum,
                a0,
                b0;

            aIsNum = a.match(/\d+/); // check if number
            bIsNum = b.match(/\d+/); // check if number
            if (!aIsNum || !bIsNum) { // do a string comparison
                return a.localeCompare(b);
            }

            // do a number comparison
            // check if string has leading zeros
            a0 = a.match(/^0*/)[0].length;
            b0 = b.match(/^0*/)[0].length;

            // same number of leading zeroes
            if (a0 === b0) {
                return parseInt(a, 10) >
                    parseInt(b, 10) ?
                            1 : -1;
            }
            // string comparison
            return a.localeCompare(b);
        }

       /**
        * Natural comparison of two strings.
        * @param {string} a String.
        * @param {string} b String.
        * @return {number} Comparison.
        */
        function naturalCompare(a, b) {
            var aSplitted, // string a splitted by numbers
                bSplitted, // string b splitted by numbers
                max, // max length of aSplitted and bSplitted
                i; // loop counter

            //chunk by numbers and remove empty elements
            aSplitted = a.split(/(\d+)/).filter(function removeEmpty(e) {
                return e;
            });

            bSplitted = b.split(/(\d+)/).filter(function removeEmpty(e) {
                return e;
            });

            max = Math.max(aSplitted.length, bSplitted.length);

            if (max === 0) {
                return 0;
            }
            for (i = 0; i < max; i += 1) {
                if (!aSplitted[i]) { // if string ends, put it higher
                    return -1;
                }

                if (!bSplitted[i]) { // if string ends, put it higher
                    return 1;
                }

                if (aSplitted[i] !== bSplitted[i]) { // if dont match
                    return compareChunks(aSplitted[i], bSplitted[i]);
                }
            }
            return 0;
        }

        /**
         * Compares by file name
         * @param {string} a File name.
         * @param {string} b File name.
         * @param {boolean} isStorages Set true when compare storage objects.
         * @return {File[]} sorted array.
         */
        function fileNameCompare(isStorages, a, b) {
            if (isStorages === true) {
                return naturalCompare(a.label, b.label);
            }
            return naturalCompare(a.name, b.name);
        }

        /**
         * Compares by file size
         * @param {number} a Size.
         * @param {number} b Size.
         * @return {int} Comparison.
         */
        function fileSizeCompare(a, b) {
            var fileSizeA = a.fileSize || 0,
                fileSizeB = b.fileSize || 0;

            if (fileSizeA === fileSizeB) {
                return 0;
            }

            return (fileSizeA > fileSizeB) ? 1 : -1;
        }

        /**
         * Compares by file type
         * @param {string} a Type.
         * @param {string} b Type.
         * @return {int} Comparison.
         */
        function fileTypeCompare(a, b) {
            if ((a.isFile === b.isFile) || (a.isDirectory === b.isDirectory)) {
                return fileNameCompare(a, b);
            }

            return (a.isFile && b.isDirectory) ? 1 : -1;
        }

        /**
         * Compares by creation date.
         * @param {string} a Date.
         * @param {string} b Date.
         * @return {int} Comparison.
         */
        function fileDateCreatedCompare(a, b) {
            return (a.created - b.created > 0) ? -1 : 1;
        }

        /**
         * Sorts files.
         *
         * @param {File[]} files Collection of File objects.
         * @param {string} sortMode Sort mode.
         * @param {bool} isStorages If files are storages.
         */
        function sort(files, sortMode, isStorages) {
            switch (sortMode) {
            case 'NAME':
                files.sort(fileNameCompare.bind(null, isStorages));
                break;
            case 'NAME_DESC':
                files.sort(fileNameCompare.bind(null, isStorages));
                files.reverse();
                break;
            case 'SIZE':
                files.sort(fileSizeCompare);
                break;
            case 'TYPE':
                files.sort(fileTypeCompare);
                break;
            case 'DATE':
                files.sort(fileDateCreatedCompare);
                break;
            default:
                console.warn('Incorrect sort mode', sortMode);
            }

            return files;
        }

        return {
            fileDateCreatedCompare: fileDateCreatedCompare,
            fileNameCompare: fileNameCompare,
            fileSizeCompare: fileSizeCompare,
            fileTypeCompare: fileTypeCompare,

            naturalCompare: naturalCompare,

            sort: sort
        };
    }
});
