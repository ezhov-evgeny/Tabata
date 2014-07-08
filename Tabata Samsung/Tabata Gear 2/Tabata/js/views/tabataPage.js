/*global tau, document, define, window*/
/*jslint plusplus: true */

/**
 * Tabata page module
 */

define({
    name: 'views/tabataPage',
    requires: [
        'core/event',
        'models/intervalTimer',
        'core/template',
        'helpers/timer'
    ],
    def: function viewsTabataPage(req) {
        'use strict';

        var e = req.core.event,
            tpl = req.core.template,
            IntervalTimer = req.models.intervalTimer.IntervalTimer,
            Time = req.helpers.timer.Time,
            stopLapListEl = null,
            stopContentListLapEl =
                document.getElementById('tabata-content-lap-list'),
            stopContentListLapElScrollTop = 0,
            page = null,
            pageId = 'tabata-page',
            timer = null,
            initialised = false;

        /**
         * Show the tabata page.
         */
        function show() {
            page = page || document.getElementById(pageId);
            tau.changePage(page);
        }

        /**
         * Show buttons.
         *
         * @param {string} status Status can be ready, paused, running.
         */
        function showButtons(status) {
            var btns = document.getElementsByClassName('tabata-btn'),
                i,
                footer;
            status = status || timer.status;
            for (i = btns.length - 1; i >= 0; i -= 1) {
                btns[i].classList.add('hidden');
            }
            btns = document.getElementsByClassName('tabata-' + status);
            for (i = btns.length - 1; i >= 0; i -= 1) {
                btns[i].classList.remove('hidden');
            }
            footer = document.getElementById('tabata-footer');
            footer.classList.remove('ui-grid-col-1', 'ui-grid-col-2');
            footer.classList.add(
                    'ui-grid-col-' + btns.length
            );
        }

        /**
         * Refresh timer digits.
         *
         * @return {Array} Array of digits.
         */
        function refreshTimer() {
            /**
             * Array of digits
             * @type {Array}
             */
            var time = new Time(timer.getTimeRemained()),
                i,
                element;

            for (i = time.length - 1; i >= 0; i -= 1) {
                element = document.getElementById('d' + i);
                element.classList.remove.apply(
                    element.classList,
                    [
                        'd0',
                        'd1',
                        'd2',
                        'd3',
                        'd4',
                        'd5',
                        'd6',
                        'd7',
                        'd8',
                        'd9'
                    ]
                );
                element.classList.add('d' + time[i]);
            }
            return time;
        }

        /**
         * Refresh rounds digits.
         *
         * @return {Array} Array of digits.
         */
        function refreshRounds() {
            var round,
                i,
                element;

            if (timer.currentRound <= 9) {
                round = '0';
            }
            round += '' + timer.currentRound;
            if (timer.rounds <= 9) {
                round += '0';
            }
            round += '' + timer.rounds;

            for (i = round.length - 1; i >= 0; i -= 1) {
                element = document.getElementById('dr' + i);
                element.classList.remove.apply(
                    element.classList,
                    [
                        'd0',
                        'd1',
                        'd2',
                        'd3',
                        'd4',
                        'd5',
                        'd6',
                        'd7',
                        'd8',
                        'd9'
                    ]
                );
                element.classList.add('d' + round[i]);
            }
            return round;
        }

        /**
         * Refresh UI layout for current mode
         */
        function changeMode() {
            refreshTimer();
            refreshRounds();
            var wrapper = document.getElementById('tabata-page');
            wrapper.classList.remove.apply(
                wrapper.classList,
                [
                    'prepare',
                    'work',
                    'rest'
                ]
            );
            wrapper.classList.add(timer.mode);
        }

        /**
         * Start the timer.
         */
        function start(e) {
            e.preventDefault();
            timer.run();
            showButtons();
        }

        /**
         * Reset to zero.
         *
         * Works when the timer is stopped (paused)
         */
        function reset() {
            timer.reset();
            window.scrollTo(0);
            document.getElementById('tabata-lap-list').innerHTML = '';
            refreshTimer();
            showButtons();
        }


        /**
         * Save the current time on the list
         */
        function lap() {
            /*jshint validthis: true*/
            var currentLap = timer.lap(),
                html,
                tmpTable,
                newItem;

            stopLapListEl =
                stopLapListEl || document.getElementById('tabata-lap-list');

            html = tpl.get('lapRow', {
                no: currentLap.no > 9 ? currentLap.no : '0' + currentLap.no,
                totalTime: new Time(timer.getTimeElapsed()),
                lapTime: new Time(currentLap.time)
            });
            tmpTable = document.createElement('table');
            tmpTable.innerHTML = html;
            newItem = tmpTable.firstChild;

            if (stopLapListEl.firstChild) {
                stopLapListEl.insertBefore(newItem, stopLapListEl.firstChild);
            } else {
                stopLapListEl.appendChild(newItem);
            }

            stopContentListLapEl.scrollTop = 0;
            stopContentListLapElScrollTop = 0;
        }

        /**
         * Stop actually pauses the timer
         */
        function stop(e) {
            e.preventDefault();
            timer.stop();
            refreshTimer();
            refreshRounds();
            showButtons();
        }

        /**
         * Stop actually pauses the timer
         */
        function pause(e) {
            e.preventDefault();
            timer.pause();
            refreshTimer();
            refreshRounds();
            showButtons();
        }

        /**
         * Handles navigation tabata button tap
         * @param {event} ev
         */
        function onNaviStopWatchTap(ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }

        /**
         * Handles navigation timer button tap
         * @param {event} ev
         */
        function onNaviTimerTap(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            // save laps list's position
            stopContentListLapElScrollTop = stopContentListLapEl.scrollTop;
            // change page to Timer
            e.fire('views.timerPage.changeActivePage');
            tau.changePage('#timer-page');
        }

        function bindEvents() {
            document.getElementById('tabata-navi-timer').addEventListener(
                'click',
                onNaviTimerTap
            );

            document.getElementById('tabata-navi-tabata')
                .addEventListener(
                'click',
                onNaviStopWatchTap
            );

            // start (when zeroed, ready to run)
            document.getElementById('tabata-start-btn').addEventListener(
                'click',
                start
            );

            // stop (when running)
            document.getElementById('tabata-stop-btn').addEventListener(
                'click',
                stop
            );

            // pause (when running)
            document.getElementById('tabata-pause-btn').addEventListener(
                'click',
                pause
            );

            // resume, reset (when paused)
            document.getElementById('tabata-resume-btn').addEventListener(
                'click',
                start
            );

            document.getElementById('tabata-reset-btn').addEventListener(
                'click',
                reset
            );

        }

        /**
         * Initialise the tabata - timer and events.
         *
         * @return {boolean} True if any action was performed.
         */
        function initTabata() {
            if (initialised) {
                return false;
            }
            // init model
            timer = new IntervalTimer(3000, 20000, 10000, 8, 'views.tabataPage.tick', 'views.tabataPage.changeMode');

            // init UI by binding events
            bindEvents();

            initialised = true;
            return true;
        }

        function pageShow() {
            initTabata();
        }

        /**
         * Bind the pageshow event.
         */
        function bindPageShow() {
            page = page || document.getElementById(pageId);

            page.addEventListener('pageshow', pageShow);

            if (page.classList.contains('ui-page')) {
                // the page is already active and the handler didn't run
                pageShow();
            }

        }

        e.listeners({
            'views.stopWatchPage.show': show,
            'views.tabataPage.tick': refreshTimer,
            'views.tabataPage.changeMode': changeMode
        });

        return {
            init: bindPageShow
        };

    }
});
