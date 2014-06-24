/*global define, console*/

/**
 * App module
 */

define({
    name: 'app',
    requires: [
        'core/event',
        'core/application',
        'views/initPage'
    ],
    def: function appInit(req) {
        'use strict';

        console.log('app::def');

        var e = req.core.event,
            app = req.core.application,
            OPERATION_ALARM = 'http://tizen.org/appcontrol/operation/alarm';

        function init() {
            var appOperation = app.getCurrentApplication()
                .getRequestedAppControl()
                .appControl
                .operation;

            if (appOperation.indexOf(OPERATION_ALARM) !== -1) {
                e.fire('views.timerPage.timeAlarm', {
                    time: appOperation.substr(OPERATION_ALARM.length + 1)
                });
            }
            console.log('app::init');
        }

        e.listeners({
            'core.storage.open': init
        });

        return {
            //init: init
        };
    }
});

