/*global define, console, tizen*/
/*jslint regexp: true*/

/**
 * Application module
 */

define({
    name: 'core/application',
    requires: [
        'core/event'
    ],
    def: function coreApplication(e) {
        'use strict';

        var app = null,
            APP_CONTROL_URL = 'http://tizen.org/appcontrol/';

        /**
         * Gets current application.
         */
        function getCurrentApplication() {
            return app.getCurrentApplication();
        }

        /**
         * Gets application control URI.
         * @param {object} params Control data params.
         */
        function getAppControlUri(operation) {
            return APP_CONTROL_URL + operation;
        }

        /**
         * Gets current application id.
         */
        function getId() {
            return getCurrentApplication().appInfo.id;
        }

        /**
         * Launches application control.
         * @param {object} controlData Control data params.
         */
        function launchAppControl(controlData) {
            var control = new tizen.ApplicationControl(
                    getAppControlUri(controlData.operation),
                    null,
                    controlData.mime || null
                ),
                replyCallback = {
                    onsuccess: function onsuccess(data) {
                        e.fire(
                            'core.application.replySuccess',
                            {
                                operation: controlData.operation,
                                data: data
                            }
                        );
                    },
                    onfailure: function onfailure() {
                        e.fire(
                            'core.application.replyFailure',
                            {
                                operation: controlData.operation
                            }
                        );
                    }
                };

            try {
                app.launchAppControl(
                    control,
                    null,
                    function successCallback() {
                        e.fire(
                            'core.application.launchSuccess',
                            {
                                operation: controlData.operation
                            }
                        );
                    },
                    function errorCallback(ev) {
                        e.fire(
                            'core.application.launchError',
                            {
                                operation: controlData.operation,
                                data: ev
                            }
                        );
                    },
                    replyCallback
                );
            } catch (e) {
                console.error(e.message);
            }
        }

        /**
         * Returns requeste application control data.
         * @param {string} operation Action to be performed.
         * @return {object}
         */
        function getRequestedAppControlData(operation) {
            var rAppControl = getCurrentApplication().getRequestedAppControl(),
                appControl = null;

            if (rAppControl) {
                appControl = rAppControl.appControl;

                if (appControl.operation === operation) {
                    return appControl;
                }
            }

            return null;
        }

        /**
         * Creates ApplicationControl object.
         * @param {string} operation Action to be performed.
         */
        function createApplicationControl(operation) {
            return new tizen.ApplicationControl(getAppControlUri(operation));
        }

        /**
         * Application exit.
         */
        function exit() {
            getCurrentApplication().exit();
        }

        /**
         * Application hide.
         */
        function hide() {
            getCurrentApplication().hide();
        }

        /**
         * No operation.
         */
        function noop() {
            return;
        }

        if (typeof tizen === 'object' &&
                typeof tizen.application === 'object') {
            app = tizen.application;
        } else {
            console.warn(
                'tizen.application not available, using a mock instead'
            );
            app = {
                launchAppControl: noop,
                getCurrentApplication: function getApp() {
                    return {
                        getRequestedAppControl: noop,
                        exit: noop,
                        hide: noop
                    };
                }
            };
        }

        return {
            getId: getId,
            getCurrentApplication: getCurrentApplication,
            getAppControlUri: getAppControlUri,
            getRequestedAppControlData: getRequestedAppControlData,
            launchAppControl: launchAppControl,
            createApplicationControl: createApplicationControl,
            hide: hide,
            exit: exit
        };
    }

});
