/*global define, setInterval, clearInterval*/

/**
 * Interval Timer module
 */

define({
    name: 'models/intervalTimer',
    requires: ['core/event'],
    def: function modelsIntervalTimer(e) {
        'use strict';

        /**
         * Interval Timer class.
         *
         * @constructor
         * @param {number} prepare Initial prepare interval durations in milliseconds.
         * @param {number} work Working(exercise) interval durations in milliseconds.
         * @param {number} rest Rest(break) interval duration in milliseconds.
         * @param {number} rounds Count of the rounds for interval timer.
         * @param {string|function|Array} timerCallbacks Events/functions to be fired.
         * @param {string|function|Array} modeCallbacks Events/functions to be fired.
         */
        function IntervalTimer(prepare, work, rest, rounds, timerCallbacks, modeCallbacks) {
            if (typeof timerCallbacks === 'function' ||
                typeof timerCallbacks === 'string') {
                timerCallbacks = [timerCallbacks];
            } else if (timerCallbacks === undefined) {
                timerCallbacks = [];
            }
            if (typeof modeCallbacks === 'function' ||
                typeof modeCallbacks === 'string') {
                modeCallbacks = [modeCallbacks];
            } else if (modeCallbacks === undefined) {
                modeCallbacks = [];
            }
            this.reset();
            this.timerCallbacks = timerCallbacks;
            this.modeCallbacks = modeCallbacks;
            this.signals = [];
            this.rounds = rounds;
            this.rest = rest;
            this.work = work;
            this.prepare = prepare;
            this.delay = 10;
            this.id = setInterval(this.tick.bind(this), this.delay);
        }

        IntervalTimer.prototype = {

            /**
             * Adds signal callbacks into pool
             *
             * @param {int} offset Offset in milliseconds before events occurs.
             * @param {Function} callback Function which will be invoked.
             */
            addSignal: function addSignal(offset, callback) {
                this.signals.push({offset: offset, callback: callback});
            },

            /**
             * Pause the interval timer.
             *
             * After calling the 'run' method, it will continue counting.
             *
             * @return {IntervalTimer} This object for chaining.
             */
            pause: function pause() {
                if (this.status !== 'running') {
                    throw new Error('Can pause only a running timer');
                }
                this.status = 'paused';
                this.timePaused = Date.now();
                return this;
            },

            /**
             * Reset the interval timer to 0 and 'ready' state.
             *
             * @return {IntervalTimer} This object for chaining.
             */
            reset: function reset() {
                this.status = 'ready';
                this.mode = 'prepare';
                this.startTime = null;
                this.currentRound = 1;
            },

            /**
             * Run the interval timer.
             *
             * @throws {Error} Throws an error if already stopped.
             * @return {IntervalTimer} This object for chaining.
             */
            run: function run() {
                switch (this.status) {
                    case 'ready':
                        if (this.startTime === null) {
                            this.startTime = Date.now();
                        }
                        break;
                    case 'paused':
                        // Adjust the startTime by the time passed since the pause
                        // so that the time elapsed remains unchanged.
                        this.startTime += Date.now() - this.timePaused;
                        break;
                    case 'running':
                        // already running
                        return this;
                    case 'stopped':
                        throw new Error('Can\'t run a stopped timer again');
                }
                this.status = 'running';
                return this;
            },

            /**
             * Stop the interval timer.
             *
             * SetInterval is cleared, so unlike pause, once you stop timer,
             * you can't run it again.
             *
             * @return {IntervalTimer} This object for chaining.
             */
            stop: function stop() {
                clearInterval(this.id);
                this.status = 'stopped';
                this.timePaused = null;
                return this;
            },

            /**
             * @return {int} Time elapsed on the timer.
             */
            getTimeElapsed: function getTimeElapsed() {
                if (this.status === 'running') {
                    return Date.now() - this.startTime;
                }
                if (this.status === 'paused') {
                    return this.timePaused - this.startTime;
                }
                return 0;
            },

            /**
             * @return {int} Time remained for current interval.
             */
            getTimeRemained: function getTimeRemained() {
                return this.getCurrentIntervalDuration() - this.getTimeElapsed();
            },

            /**
             * @private
             * @returns {int} Duration of the current interval in milliseconds.
             */
            getCurrentIntervalDuration: function getCurrentIntervalDuration() {
                switch (this.mode) {
                    case 'prepare':
                        return this.prepare;
                    case 'work':
                        return this.work;
                    case 'rest':
                        return this.rest;
                    default:
                        throw new Error('Not supported mode.');
                }
            },

            /**
             * Changes interval timer mode, if it needed stops timer
             *
             * @private
             * @param {string} newMode new value of the timer mode
             */
            changeMode: function changeMode(newMode) {
                console.info('Changing mode from \'' + this.mode + '\' to \'' + newMode + '\'.');
                this.startTime = Date.now();
                this.mode = newMode;
                switch (newMode) {
                    case 'prepare':
                        break;
                    case 'work':
                        this.currentRound++;
                        break;
                    case 'rest':
                        if (this.currentRound >= this.rounds) {
                            this.stop();
                        }
                        break;
                    default:
                        throw new Error('Not supported mode.');
                }

                for (var i = 0; i < this.modeCallbacks.length; i++) {
                    if (typeof this.modeCallbacks[i] === 'string') {
                        e.fire(this.modeCallbacks[i], this);
                    } else if (typeof this.modeCallbacks[i] === 'function') {
                        this.modeCallbacks[i].call(this);
                    }
                }
            },

            /**
             * Tick handling.
             *
             * Fires all events/callbacks and updates the 'count'
             *
             * @private
             * @return {IntervalTimer} This object for chaining.
             */
            tick: function tick() {
                if (this.status !== 'running') {
                    return this;
                }
                for (var j = 0; j < this.signals.length; j++) {
                    if (this.getTimeRemained() - this.signals[j].offset <= 0) {
                        this.signals[j].callback.call(this);
                    }
                }
                if (this.getTimeRemained() <= 0) {
                    switch (this.mode) {
                        case 'prepare':
                            this.changeMode('work');
                            break;
                        case 'work':
                            this.changeMode('rest');
                            break;
                        case 'rest':
                            this.changeMode('work');
                            break;
                        default:
                            throw new Error('Not supported mode.');
                    }
                }
                for (var i = 0; i < this.timerCallbacks.length; i++) {
                    if (typeof this.timerCallbacks[i] === 'string') {
                        e.fire(this.timerCallbacks[i], this);
                    } else if (typeof this.timerCallbacks[i] === 'function') {
                        this.timerCallbacks[i].call(this);
                    }
                }
                return this;
            }
        };

        return {
            IntervalTimer: IntervalTimer
        };
    }
});
