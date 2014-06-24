/*global define, tizen, console*/

/**
 * System info module
 */

define({
    name: 'core/systeminfo',
    requires: [
        'core/event'
    ],
    def: function helpersSystemInfo(e) {
        'use strict';
        var systeminfo = null,
            lowBattery = 0.04;

        /**
         * Add listener for battery change to low
         */
        function listenBatteryLowState() {
            systeminfo.addPropertyValueChangeListener(
                'BATTERY',
                function change(battery) {
                    if (!battery.isCharging) {
                        e.fire('core.battery.low');
                    }
                },
                {
                    lowThreshold : lowBattery
                }
            );
        }

        /**
         * Check low battery state
         */
        function checkBatteryLowState() {
            systeminfo.getPropertyValue('BATTERY', function (battery) {
                if (battery.level < lowBattery && !battery.isCharging) {
                    e.fire('core.battery.low', {
                        level: battery.level
                    });
                } else {
                    e.fire('core.battery.normal');
                }
                e.fire('core.battery.checked');
            }, null);
        }

        function init() {
            if (typeof tizen === 'object' &&
                typeof tizen.systeminfo === 'object') {
                systeminfo = tizen.systeminfo;
            } else {
                console.warn(
                    'tizen.systeminfo not available'
                );
            }
        }

        return {
            checkBatteryLowState: checkBatteryLowState,
            listenBatteryLowState : listenBatteryLowState,
            init: init
        };
    }
});
