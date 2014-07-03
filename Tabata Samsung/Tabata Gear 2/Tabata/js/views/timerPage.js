/*global define, tau, tizen, setTimeout, clearTimeout, document, Math*/

/**
 * Timer page module
 */

define({
    name: 'views/timerPage',
    requires: [
        'core/event',
        'core/storage/idb',
        'core/application',
        'models/timer',
        'helpers/timer',
        'core/power',
        'core/audio',
        'helpers/page'
    ],
    def: function viewsTimerPage(req) {
        /*jshint maxstatements:46*/
        'use strict';

        var e = req.core.event,
            app = req.core.application,
            storage = req.core.storage.idb,
            Timer = req.models.timer.Timer,
            Time = req.helpers.timer.Time,
            power = req.core.power,
            audio = req.core.audio,
            pageHelper = req.helpers.page,
            ceil = Math.ceil,
            maskPage = document.getElementById('mask-page'),
            elTotalTime = document.getElementById('timer-up-total-time'),
            cursorPos = 0,
            flips = document.getElementsByClassName('label'),
            timer = null,
            timerUpPage = null,
            digits = [0, 0, 0, 1, 0, 0],
            startTimeMilli = 60 * 1000,
            keyPressed = true,
            autoHideTimerId = null,
            alarmInvoked = false,
            alarmStatus = false,
            powerKeyDown = false,
            AUTO_HIDE_TIME = 45 * 1000,
            STORAGE_TIMER_TIME_KEY_BASE = 'TimerTimeBase',
            sTimerKeyBase = null,
            STORAGE_TIMER_TIME_KEY_PAUSED = 'TimerTimePaused',
            ALARM_SOUND_PATH = 'sounds/sounds_alarm.mp3',
            pageId = null,
            countdown = false;

        function show() {
            pageId = pageId || '#timer-page';
            tau.changePage(pageId);
        }

        function showAlarm() {
            tau.changePage('#timer-up-page');
            if (maskPage) {
                setTimeout(function () {
                    maskPage.outerHTML = '';
                });
            }
            setTimeout(tizen.power.turnScreenOn, 100);
        }

        /**
         * Adds alarm and creates the appControl with ControlData.
         */
        function addAlarm(time) {
            // round the time up 1 second to make sure
            // either alarm or application show the notification
            var alarm = new tizen.AlarmRelative(time + 1),
                appControl = new tizen.ApplicationControl(
                    'http://tizen.org/appcontrol/operation/alarm/' +
                        sTimerKeyBase
                );
            tizen.alarm.add(
                alarm,
                tizen.application.getCurrentApplication().appInfo.id,
                appControl
            );
        }

        /**
         * Removes all alarms of current application.
         */
        function removeAlarm() {
            tizen.alarm.removeAll();
        }

        /**
         * Show buttons.
         *
         * @param {string} status Status can be ready, paused, running.
         */
        function showButtons(status) {
            var btns = document.getElementsByClassName('timer-btn'),
                i = 0,
                footer = null;
            status = status || timer.status;
            for (i = btns.length - 1; i >= 0; i -= 1) {
                btns[i].classList.add('hidden');
            }
            btns = document.getElementsByClassName('timer-' + status);
            for (i = btns.length - 1; i >= 0; i -= 1) {
                btns[i].classList.remove('hidden');
            }
            footer = document.getElementById('timer-footer');
            footer.classList.remove('ui-grid-col-1', 'ui-grid-col-2');
            footer.classList.add(
                'ui-grid-col-' + btns.length
            );
        }

        /**
         * Make all flips inactive
         */
        function deactivateFlips() {
            var q;
            for (q = 0; q < flips.length; q += 1) {
                flips[q].parentNode.classList.remove('active');
            }
        }

        function lockFlips() {
            deactivateFlips();
            var q;
            for (q = 0; q < flips.length; q += 1) {
                flips[q].parentNode.classList.add('locked');
            }
        }

        /**
         * Reset active classes for the flips. The given flip will become
         * active.
         *
         * @param {jQuery} flip Flip element.
         */
        function setActiveFlip(flipParent) {
            deactivateFlips();
            flipParent.classList.add('active');
        }

        function checkFlipsValue() {
            var start = document.getElementById('timer-start-btn');
            if (Math.max.apply(null, digits) === 0) {
                start.blur();
                start.disabled = true;
            } else {
                start.disabled = false;
            }
        }

        /**
         * Refresh content of a flip.
         *
         * If flipIndex is undefined, then refresh the active flip
         * (resetting active classes included).
         * @param {int} flipIndex
         * @return {bool}
         */
        function refreshFlip(flipIndex) {
            var refreshActiveClasses = false, flip = null, content = '';

            if (flipIndex === undefined) {
                // calculate the index of the currently active flip
                flipIndex = Math.floor(cursorPos / 2);
                refreshActiveClasses = true;
            }
            flip = flips[flipIndex];

            // content string of the flip (two digits)
            content = digits[flipIndex * 2].toString() +
                digits[flipIndex * 2 + 1];

            if (refreshActiveClasses) {
                setActiveFlip(flip.parentNode);
            }

            flip.innerHTML = content;

            checkFlipsValue();

            return true;
        }

        function unlockFlips() {
            var q;
            for (q = 0; q < flips.length; q += 1) {
                flips[q].parentNode.classList.remove('locked');
            }
            cursorPos = 0;
            refreshFlip(); // activate the first flip
        }

        /**
         * Refresh all flips
         */
        function refreshFlips() {
            refreshFlip(0);
            refreshFlip(1);
            refreshFlip(2);
        }

        /**
         * Resets flips to first selected start time
         */
        function resetFlips() {
            unlockFlips();
            refreshFlips();
        }

        /**
         * Refresh timer digits.
         * @param {number?} timeMilliseconds Time to be displayed.
         */
        function refreshTimer(timeMilliseconds) {
            var time = [];

            if (timeMilliseconds === undefined) {
                timeMilliseconds = startTimeMilli - timer.getTimeElapsed();
            }
            // round up to 1 second
            timeMilliseconds = ceil(timeMilliseconds / 1000) * 1000;
            if (timeMilliseconds < 1000) {
                timeMilliseconds = 1000;
            }
            // get Time
            time = new Time(timeMilliseconds);

            // take six digits from the time object
            digits = time.slice(0, 6);

            // refresh all three flips
            refreshFlips();
        }

        /**
         * Returns time from flips.
         * @return {number}
         */
        function getTimeFlips() {
            return 1000 *
                //seconds
                (10 * digits[4] + digits[5] +
                // minutes
                60 * (10 * digits[2] + digits[3]) +
                // hours
                60 * 60 * (10 * digits[0] + digits[1]));
        }
        /**
         * Starts counting down.
         */
        function startCountdown(save) {
            if (save) {
                storage.add(STORAGE_TIMER_TIME_KEY_BASE, getTimeFlips());
            }

            if (keyPressed === true) {
                keyPressed = false;
                startTimeMilli = 0;
            }
            startTimeMilli = startTimeMilli || getTimeFlips();
            timer.run();
            power.awake();
            showButtons();
            document.getElementById('timer-keyboard').style.display = 'none';

            lockFlips();
            countdown = true;
        }

        /**
         * Start the timer.
         *
         * @param {Event} ev Event.
         */
        function start(ev) {
            ev.preventDefault();

            startCountdown(ev.target.id === 'timer-start-btn');
        }

        /**
         * Clear time in storage
         */
        function clearStorage() {
            storage.add(STORAGE_TIMER_TIME_KEY_PAUSED, null);
            storage.add(STORAGE_TIMER_TIME_KEY_BASE, null);
        }

        /**
         * Reset the timer to zero.
         *
         * @param {Event} ev Event.
         */
        function reset(ev) {
            if (ev) {
                ev.preventDefault();
                // remove alarm if reset from UI
                removeAlarm();
            }
            show();
            alarmStatus = false;
            timer.reset();
            power.normal();
            startTimeMilli = 0;
            cursorPos = 0;
            document.getElementById('timer-keyboard').style.display = 'table';
            e.fire('views.timerPage.tick');
            showButtons();
            refreshTimer(sTimerKeyBase);
            resetFlips();
            clearStorage();
            audio.pause();
            countdown = false;
        }

        /**
         * Stop actually pauses the timer
         */
        function stop(ev) {
            ev.preventDefault();
            timer.pause();
            power.normal();
            storage.add(STORAGE_TIMER_TIME_KEY_PAUSED, getTimeFlips());
            e.fire('views.timerPage.tick');
            showButtons();
            removeAlarm();
            countdown = false;
        }

        /**
         * Clears Timeout if exists.
         */
        function resetTimeout() {
            if (autoHideTimerId) {
                clearTimeout(autoHideTimerId);
            }
        }

        /**
         * Function called when TimeUp page is hidden.
         */
        function onTimeUpPageHide() {
            audio.pause();
            if (alarmInvoked) {
                sTimerKeyBase = startTimeMilli;
            }
            resetTimeout();
            reset();
        }

        function onTimeUpStop() {
            if (alarmInvoked) {
                app.exit();
            } else {
                show();
            }
            countdown = false;
        }

        /**
         * Adds a digit to the timer's display.
         * @param {number} value
         */
        function addDigit(value) {
            // left (even)
            if (cursorPos % 2 === 0) {
                // zero the first digit, it will be shifted out anyway
                digits[cursorPos] = 0;
                // set the left digit on the right side
                digits[cursorPos + 1] = value;
            // right (odd)
            } else {
                // The flip will be filled,
                // validity check for minutes and seconds
                if (cursorPos > 1) {
                    if (10 * digits[cursorPos] + value > 59) {
                        digits[cursorPos] = 5;
                        value = 9;
                    }
                }

                // right digit of the flip
                // - shift the right digit to the left
                digits[cursorPos - 1] = digits[cursorPos];
                // - set the right digit
                digits[cursorPos] = value;

            }

            refreshFlip();
            cursorPos += 1;

            if (value === 0 && cursorPos === 5) {
                cursorPos = 4;
            }

            // if cursor is out of range, go back to seconds
            if (cursorPos > 5) {
                cursorPos = 4;
            } else {
                refreshFlip();
            }
        }

        /**
         * Deletes a digit from the timer's display.
         */
        function deleteDigit() {
            // reset the current flip
            // the flip must be the same, but the current position
            // must point to the left digit (even position)
            if (cursorPos % 2 === 1) {
                cursorPos -= 1;
            }
            digits[cursorPos] = 0; // left
            digits[cursorPos + 1] = 0; // right
            refreshFlip();
        }

        /**
         * Key press handler
         * @this {HTMLElement}
         */
        function onKeyPress(event) {
            var value = event.target.getAttribute('data-value');
            if (!isNaN(value)) {
                value = parseInt(value, 10);
            }

            keyPressed = true;
            if (typeof value === 'number') {
                addDigit(value);
            } else if (value === 'del') {
                deleteDigit();
            }
        }

        /**
         * @this {jQuery}
         */
        function onFlipTap() {
            /*jshint validthis:true*/
            if (this.classList.contains('locked')) {
                return;
            }
            var index = this.getAttribute('data-index');
            setActiveFlip(this);
            cursorPos = 2 * index;
        }

        /**
         * Handles navigation tabata button tap
         * @param {event} ev
         */
        function onNaviStopWatchTap(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            pageId = '#tabata-page';
            tau.changePage(pageId);
        }

        /**
         * Handles navigation timer button tap
         * @param {event} ev
         */
        function onNaviTimerTap(ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }

        /**
         * Set flips value form locale storage or alarm
         */
        function setFlips() {
            storage.get(STORAGE_TIMER_TIME_KEY_PAUSED);
        }

        function bindEvents() {
            var buttons, q;

            document.getElementById('timer-navi-tabata').addEventListener(
                'click',
                onNaviStopWatchTap
            );
            document.getElementById('timer-navi-timer').addEventListener(
                'click',
                onNaviTimerTap
            );

            buttons = document.getElementById('timer-keyboard')
                .querySelectorAll('button');
            for (q = 0; q < buttons.length; q += 1) {
                buttons[q].addEventListener('click', onKeyPress);
            }

            // start, restart
            document.getElementById('timer-start-btn')
                .addEventListener('click', start);

            // stop (when running)
            document.getElementById('timer-stop-btn')
                .addEventListener('click', stop);

            // restart (when stopped)
            document.getElementById('timer-restart-btn')
                .addEventListener('click', start);

            // two reset buttons
            document.getElementById('timer-reset1-btn')
                .addEventListener('click', reset);
            document.getElementById('timer-reset2-btn')
                .addEventListener('click', reset);

            document.getElementById('timer-up-stop-btn')
                .addEventListener('click', onTimeUpStop);

            timerUpPage.addEventListener('pagehide', onTimeUpPageHide);

            // flips tap
            for (q = 0; q < flips.length; q += 1) {
                flips[q].parentNode.addEventListener('click', onFlipTap);
            }
        }

        function init() {
            timerUpPage = document.getElementById('timer-up-page');
            // init model
            timer = new Timer(100, 'views.timerPage.tick');
            // init UI by binding events
            bindEvents();

            storage.add(STORAGE_TIMER_TIME_KEY_PAUSED, null);
            storage.get(STORAGE_TIMER_TIME_KEY_BASE);

            audio.setFile(ALARM_SOUND_PATH);
        }

        function autoHide() {
            if (!alarmInvoked) {
                show();
            } else {
                app.exit();
            }
        }

        /**
         * The timer has ended, go to Time Up page.
         * @param {number} timeMilli
         * @return {boolean} true if alarm shown, false on break
         */
        function timeUp(timeMilli) {
            var time = new Time(timeMilli);
            if (document.visibilityState === 'visible') {
                removeAlarm();
            } else if (tizen.alarm.getAll().length > 0) {
                // let the AlarmAPI show the application and notification
                return false;
            }
            // show alarm in TimeUp page
            elTotalTime.innerHTML = time.toString();
            showAlarm();
            audio.play({loop: true});
            // reset flips
            resetFlips();
            // TimeUp page timeout
            resetTimeout();
            autoHideTimerId = setTimeout(autoHide, AUTO_HIDE_TIME);
            // done
            return true;
        }

        /**
         * The timer has ended, go to Time Up page and bind events after
         * starting the app from the alarm
         */
        function timeAlarmFire(event) {
            var event_time = parseInt(event.detail.time, 10),
                time = parseInt(sTimerKeyBase, 10);

            if (time !== event_time) {
                time = event_time;
                storage.add(STORAGE_TIMER_TIME_KEY_BASE, time);
            }

            alarmInvoked = true;
            // time up with last timer time
            timeUp(time);
            alarmStatus = true;
        }

        function isAlarmInvoked() {
            return alarmInvoked;
        }

        /**
         * Refresh timer digits.
         *
         * @return {array} Array of digits.
         */
        function tick() {
            var timeDiff = startTimeMilli - timer.getTimeElapsed(),
                time = parseInt(sTimerKeyBase, 10);
            if (timeDiff < 0) {
                timeDiff = 0;
                if (timeUp(time)) {
                    timer.reset();
                    alarmStatus = true;
                }
            } else {
                refreshTimer(timeDiff);
            }
        }

        /**
         * Function called when application visibility state changes
         * (document.visibilityState changed to 'visible' or 'hidden').
         */
        function visibilityChange(ev) {
            var state = document.visibilityState;

            if (ev && ev.detail.hidden) {
                // force 'hidden' state
                state = 'hidden';
            }

            if (state !== 'visible') {
                if (timer.status === 'running') {
                    addAlarm((startTimeMilli - timer.getTimeElapsed()) / 1000);
                    countdown = true;
                } else if (timer.status === 'paused') {
                    storage.add(STORAGE_TIMER_TIME_KEY_PAUSED, startTimeMilli -
                        timer.getTimeElapsed());
                } else if (timer.status === 'ready') {
                    storage.add(STORAGE_TIMER_TIME_KEY_PAUSED, startTimeMilli);
                }
                if (alarmStatus && powerKeyDown) {
                    powerKeyDown = false;
                    reset();
                    show();
                }
                if (pageHelper.isPageActive(timerUpPage) && powerKeyDown) {
                    reset();
                    app.exit();
                }
                if (!pageHelper.isPageActive(timerUpPage) && alarmInvoked) {
                    reset();
                    app.exit();
                }
            } else {
                removeAlarm();
            }
        }

        function onStorageWrite(ev) {
            var key = ev.detail.key,
                val = ev.detail.value;

            if (key === STORAGE_TIMER_TIME_KEY_BASE) {
                sTimerKeyBase = val;
            }

        }

        function onStorageGet(ev) {
            var key = ev.detail.key,
                val = ev.detail.value;

            if (key === STORAGE_TIMER_TIME_KEY_BASE) {
                sTimerKeyBase = val;
                // preset flips
                if (val === null) {
                    resetFlips();
                } else {
                    setFlips();
                }
            }

            if (key === STORAGE_TIMER_TIME_KEY_PAUSED) {

                if (tizen.alarm.getAll().length > 0) {
                    refreshTimer(tizen.alarm.getAll()[0].getRemainingSeconds() *
                        1000);
                    startCountdown();
                    removeAlarm();
                } else if (val !== null) {
                    refreshTimer(val);
                    if (sTimerKeyBase !== null) {
                        showButtons('paused');
                        document.getElementById('timer-keyboard')
                            .style.display = 'none';
                        lockFlips();
                    }
                } else {
                    refreshTimer(startTimeMilli);
                }
            }
        }

        /**
         * Hadnel PowerOff button press
         */
        function onPowerOff() {
            powerKeyDown = true;
            if ((startTimeMilli - timer.getTimeElapsed()) < 1000 &&
                countdown) {
                addAlarm((startTimeMilli - timer.getTimeElapsed()) / 1000);
            } else {
                if (alarmStatus) {
                    alarmStatus = false;
                    show();
                } else if (!pageHelper.isPageActive(timerUpPage) &&
                        alarmInvoked) {
                    app.exit();
                }
            }
            countdown = false;
        }

        /**
         * Set id of active page after change page
         */
        function onChangeActivePage() {
            pageId = '#timer-page';
        }

        e.listeners({
            'views.timerPage.show': show,
            'views.timerPage.tick': tick,
            'views.timerPage.timeAlarm': timeAlarmFire,
            'visibility.change': visibilityChange,
            'device.powerOff': onPowerOff,
            'core.storage.open': init,
            'core.storage.read': onStorageGet,
            'core.storage.write': onStorageWrite,
            'views.timerPage.changeActivePage': onChangeActivePage
        });

        return {
            //init: init,
            isAlarmInvoked: isAlarmInvoked
        };

    }
});
