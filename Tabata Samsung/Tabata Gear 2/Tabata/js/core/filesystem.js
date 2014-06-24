/*jslint devel: true*/
/*global define, tizen */

/**
 * Filesystem helper
 */

define({
    name: 'core/filesystem',
    def: function coreFilesystem() {
        'use strict';


        /**
         * @type {string}
         */
        var URI_PREFIX = 'file://';

        /**
         * No operation.
         * @return {undefined}
         */
        function noop() { return; }

        /**
         * Returns file name for given path
         * @param {string} path Path.
         * @return {string} Basename.
         */
        function basename(path) {
            return path.split('/').pop();
        }

        /**
         * Returns parent directory's path
         * @param {string} path File path.
         * @return {string} Dir name.
         */
        function dirName(path) {
            return path.split('/').slice(0, -1).join('/');
        }

        /**
         * Converts URI to system path
         * @param {string} uri Uri.
         * @return {string} Returns system path for specified uri.
         */
        function getSystemPath(uri) {
            return uri.replace(URI_PREFIX, '');
        }

        /**
         * @param {string} fileName File name.
         * @return {string} extension for specified file name.
         */
        function getFileExtension(fileName) {
            var splittedFileName = fileName.split('.'),
                ext = '';

            if (splittedFileName.length > 1) {
                ext = '.' + splittedFileName.pop();
            }
            return ext;
        }

        /**
         * @param {string} fileName Filename.
         * @return {string} fileName  Filename without extension.
         */
        function getFilenameWithoutExtension(fileName) {
            var splittedFileName = fileName.split('.');
            if (splittedFileName.length > 1) {
                fileName = splittedFileName.slice(0, -1).join('.');
            }

            return fileName;
        }

        /**
         * Returns true if filename starts with a dot
         * @param {string} fileName File name.
         */
        function isHiddenFile(fileName) {
            return (fileName[0] === '.') ? true : false;
        }


        /**
         * Creates new empty file in specified location
         *
         * @param {File} directoryHandle Directory handle.
         * @param {string} fileName File name.
         */
        function createFile(directoryHandle, fileName) {
            try {
                return directoryHandle.createFile(fileName);
            } catch (e) {
                console.error('Filesystem_createFile error:' + e.message);
                return false;
            }
        }

        /**
         * Writes content to file stream
         *
         * @param {File} handle file handler.
         * @param {string} content file content.
         * @param {function} suc on success callback.
         * @param {function} onError on error callback.
         * @param {string} contentEncoding content encoding.
         */
        function writeFile(handle, content, suc, err, encoding) {
            err = err || noop;

            handle.openStream('w', function writeFile(fileStream) {
                if (encoding === 'base64') {
                    fileStream.writeBase64(content);
                } else {
                    fileStream.write(content);
                }

                fileStream.close();

                // launch onSuccess callback
                if (typeof suc === 'function') {
                    suc();
                }
            }, err, 'UTF-8');
        }

        /**
         * Opens specified location
         *
         * @param {string} path directory path.
         * @param {function} onSuccess on success callback.
         * @param {function} onError on error callback.
         * @param {string} openMode mode.
         */
        function openDir(path, onSuccess, onError, openMode) {
            openMode = openMode || 'rw';
            onSuccess = onSuccess || noop;

            try {
                tizen.filesystem.resolve(path, onSuccess, onError, openMode);
            } catch (e) {
                onError(e);
            }
        }

        /**
         * Parses specified filepath and returns data parts.
         *
         * @param {string} filePath File path.
         * @return {array} Data parts.
         */
        function getPathData(filePath) {
            var path = {
                originalPath: filePath,
                fileName: '',
                dirName: ''
            },
                splittedPath = filePath.split('/');

            path.fileName = splittedPath.pop();
            path.dirName = splittedPath.join('/') || '/';

            return path;
        }

        /**
         * Saves specified content to file
         *
         * @param {string} path file path.
         * @param {string} content file content.
         * @param {function} onSaveSuccess save success callback.
         * @param {string} fileEncoding file encoding.
         */
        function saveFileContent(path, content, suc, encoding) {
            var pathData = getPathData(path),
                fileHandle;

            function onOpenDirSuccess(dir) {
                // create new file
                fileHandle = createFile(dir, pathData.fileName);
                if (fileHandle !== false) {
                    // save data into this file
                    writeFile(
                        fileHandle,
                        content,
                        suc,
                        false,
                        encoding
                    );
                }
            }

            // open directory
            openDir(pathData.dirName, onOpenDirSuccess);
        }

        /**
         * Deletes specified file
         *
         * @param {File} dir Directory.
         * @param {string} path file path.
         * @param {function} onSuccess delete success callback.
         * @param {function} onErr delete error callback.
         */
        function deleteFile(dir, path, onSuccess, onErr) {
            try {
                dir.deleteFile(path, onSuccess, onErr);
            } catch (e) {
                console.error('Filesystem_deleteFile error: ' + e.message);
                return false;
            }
        }

        /**
         * Deletes specified directory
         *
         * @param {File} dir Directory.
         * @param {string} path dir path.
         * @param {function} onSuccess delete success callback.
         * @param {function} onError delete error callback.
         * @return {boolean} Success.
         */
        function deleteDir(dir, path, onSuccess, onError) {
            try {
                dir.deleteDirectory(path, false, onSuccess, onError);
            } catch (e) {
                console.error('Filesystem_deleteDir error:' + e.message);
                return false;
            }

            return true;
        }

        function onDeleteError(e) {
            console.error('Filesystem_deleteNode:_onDeleteError', e);
        }

        /**
         * Deletes node with specified path
         *
         * @param {string} nodePath node path.
         * @param {function} onSuccess success callback.
         */
        function deleteNode(nodePath, onSuccess) {
            var pathData = getPathData(nodePath);

            function onOpenDirSuccess(dir) {
                var onListFiles = function onListFiles(files) {
                    var del = null;
                    if (files.length > 0) {
                        // File exists.
                        if (files[0].isDirectory) {
                            del = deleteDir;
                        } else {
                            del = deleteFile;
                        }

                        del(
                            dir,
                            files[0].fullPath,
                            onSuccess,
                            onDeleteError
                        );
                    } else {
                        onSuccess();
                    }
                };

                // check file exists;
                dir.listFiles(onListFiles, function error(e) {
                    console.error(e);
                }, {
                    name: pathData.fileName
                });
            }

            openDir(pathData.dirName, onOpenDirSuccess, function error(e) {
                console.error('Filesystem_openDir error:' + e.message);
            });
        }

        /**
         * @param {string} type storage type.
         * @param {function} onSuccess on success callback.
         * @param {string} excluded Excluded storage.
         */
        function getStorages(type, onSuccess, excluded) {
            tizen.filesystem.listStorages(function getStorages(storages) {
                var tmp = [];

                if (type !== undefined) {
                    tmp = storages.filter(function (value) {
                        // filter by label and type
                        return value.label !== excluded &&
                            (value.type === 0 || value.type === type);
                    });
                } else {
                    tmp = storages;
                }

                if (typeof onSuccess === 'function') {
                    onSuccess(tmp);
                }
            });
        }

        function getFilesList(dir, onSuccess) {
            try {
                dir.listFiles(
                    function getFiles(files) {
                        var tmp = [],
                            len = files.length,
                            i;

                        for (i = 0; i < len; i += 1) {
                            tmp.push(files[i].name);
                        }

                        if (typeof onSuccess === 'function') {
                            onSuccess(tmp);
                        }
                    },
                    function error(e) {
                        console.error(
                            'Filesystem_getFilesList dir.listFiles() error:',
                            e
                        );
                    }
                );
            } catch (e) {
                console.error('Filesystem_getFilesList error:', e.message);
            }
        }

        /**
         * Get list of files.
         *
         * @param {string} path Directory path.
         * @param {function} onSuccess On success callback.
         * @param {function} onError On error callback.
         * @param {string} fileMask File mask.
         */
        function dir(path, onSuccess, onError, fileMask) {
            fileMask = fileMask || '';
            onSuccess = onSuccess || noop;

            function onOpenDir(dir) {
                var exc;
                if (typeof dir !== 'object') {
                    exc = {message: 'dir is not an object'};
                    throw exc;
                }
                if (dir.isDirectory !== true) {
                    exc = {message: 'dir is not instance of File'};
                    throw exc;
                }
                fileMask = (fileMask && typeof fileMask === 'string') ?
                        {name: fileMask} : fileMask;

                dir.listFiles(function success(files) {
                    onSuccess(files, dir);
                }, onError, null);
            }

            function onOpenDirError(e) {
                console.error('onOpenDirError: ' + e.message);
                onError(e);
            }

            try {
                openDir(path, onOpenDir, onOpenDirError, 'rw');
            } catch (e) {
                console.error('Filesystem_dir error:' + e.message);
            }
        }

        return {
            basename: basename,
            dirName: dirName,
            getSystemPath: getSystemPath,
            getFileExtension: getFileExtension,
            getFileNameWithoutExtension: getFilenameWithoutExtension,
            isHiddenFile: isHiddenFile,

            dir: dir,
            openDir: openDir,
            writeFile: writeFile,
            createFile: createFile,
            deleteDir: deleteDir,
            deleteFile: deleteFile,
            deleteNode: deleteNode,
            getFilesList: getFilesList,
            getPathData: getPathData,
            getStorages: getStorages,
            saveFileContent: saveFileContent
        };
    }
});
