/*global define, tizen, console*/

/**
 * Power module
 */

define({
    name: 'core/power',
    requires: [
        'core/event'
    ],
    def: function corePower(e) {
        'use strict';
        var power = null,

            RESOURCE = 'SCREEN',
            STATE_NORMAL = 'SCREEN_NORMAL',
            STATE_OFF = 'SCREEN_OFF',

            screenState = STATE_NORMAL;

        function noop() {
            return;
        }

        /**
         * Set screen power to normal.
         */
        function awake() {
            power.request(RESOURCE, STATE_NORMAL);
        }

        /**
         * Set screen power to default.
         */
        function normal() {
            power.release(RESOURCE);
        }

        /**
         * Returns true if device screen is on, false otherwise.
         * @return {boolean}
         */
        function isScreenOn() {
            return tizen.power.isScreenOn();
        }

        /**
         * Returns screen state.
         * @return {string}
         */
        function getScreenState() {
            if (!isScreenOn()) {
                return STATE_OFF;
            } else {
                return screenState;
            }
        }

        /**
         * Screen state callback.
         * @param {string} previousState
         * @param {string} changedState
         */
        function onScreenStateChanged(previousState, changedState) {
            screenState = changedState;
            e.fire('power.screen.from.' + previousState.toLowerCase());
            e.fire('power.screen.to.' + changedState.toLowerCase());
            e.fire('power.screen.changed', {
                previousState: previousState,
                changedState: changedState
            });
        }

        /**
         * Registers view event listeners.
         */
        function bindEvents() {
            power.setScreenStateChangeListener(onScreenStateChanged);
        }

        function init() {
            if (typeof tizen === 'object' && typeof tizen.power === 'object') {
                power = tizen.power;
                bindEvents();
            } else {
                console.warn(
                    'tizen.power not available'
                );
                power = {
                    request: noop,
                    release: noop
                };
            }
        }

        return {
            normal: normal,
            awake: awake,
            isScreenOn: isScreenOn,
            getScreenState: getScreenState,
            init: init
        };
    }
});
