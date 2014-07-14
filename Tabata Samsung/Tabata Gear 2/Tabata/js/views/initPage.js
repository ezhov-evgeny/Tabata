/*global define, window, document, history*/

/**
 * Init page module
 */

define({
    name: 'views/initPage',
    requires: [
        'core/event',
        'core/template',
        'core/application',
        'views/tabataPage',
        'views/timerPage',
        'core/systeminfo'
    ],
    def: function viewsInitPage(req) {
        'use strict';

        var e = req.core.event,
            app = req.core.application,
            timerPage = req.views.timerPage,
            sysInfo = req.core.systeminfo;

        function onHardwareKeysTap(ev) {
            var keyName = ev.keyName,
                page = document.getElementsByClassName('ui-page-active')[0],
                pageid = page ? page.id : '';
            if (keyName === 'back') {
                if (timerPage.isAlarmInvoked()) {
                    e.fire('visibility.change', {
                        hidden: true
                    });
                    app.exit();
                }
                if (pageid === 'tabata-page' || pageid === 'settings-page') {
                    e.fire('visibility.change', {
                        hidden: true
                    });
                    app.exit();
                } else {
                    history.back();
                }
            }
        }

        function onVisibilityChange(ev) {
            e.fire('visibility.change', ev);
        }

        /**
         * Handler onLowBattery state
         */
        function onLowBattery() {
            app.exit();
        }

        /**
         * Catch device PowerOff button press
         * @param {object} ev
         */
        function onKeyDown(ev) {
            if (ev.keyIdentifier.indexOf('Power') !== -1) {
                e.fire('device.powerOff');
            }
        }

        function bindEvents() {
            document.addEventListener('keydown', onKeyDown);
            window.addEventListener('tizenhwkey', onHardwareKeysTap);
            document.addEventListener('visibilitychange', onVisibilityChange);
            sysInfo.listenBatteryLowState();
        }

        function init() {
            // bind events to page elements
            bindEvents();
            sysInfo.checkBatteryLowState();
        }

        e.listeners({
            'core.battery.low': onLowBattery
        });

        return {
            init: init
        };
    }

});
