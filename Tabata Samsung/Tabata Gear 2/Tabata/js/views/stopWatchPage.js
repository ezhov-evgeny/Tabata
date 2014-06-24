/*global tau, document, define, window*/
/*jslint plusplus: true */

/**
 * StopWatch page module
 */

define({
    name: 'views/stopWatchPage',
    requires: [
        'core/event',
        'models/timer',
        'core/template',
        'helpers/timer'
    ],
    def: function viewsStopWatchPage(req) {
        'use strict';

        var e = req.core.event,
            tpl = req.core.template,
            Timer = req.models.timer.Timer,
            Time = req.helpers.timer.Time,
            stopLapListEl = null,
            stopContentListLapEl =
                document.getElementById('stopwatch-content-lap-list'),
            stopContentListLapElScrollTop = 0,
            page = null,
            pageId = 'stopwatch-page',
            timer = null,
            initialised = false;

        /**
         * Show the stopwatch page.
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
            var btns = document.getElementsByClassName('stopwatch-btn'),
                i = 0,
                footer = null;
            status = status || timer.status;
            for (i = btns.length - 1; i >= 0; i -= 1) {
                btns[i].classList.add('hidden');
            }
            btns = document.getElementsByClassName('stopwatch-' + status);
            for (i = btns.length - 1; i >= 0; i -= 1) {
                btns[i].classList.remove('hidden');
            }
            footer = document.getElementById('stopwatch-footer');
            footer.classList.remove('ui-grid-col-1', 'ui-grid-col-2');
            footer.classList.add(
                'ui-grid-col-' + btns.length
            );
        }

        /**
         * Refresh timer digits.
         *
         * @return {array} Array of digits.
         */
        function refreshTimer() {
            /**
             * Array of digits
             * @type {array}
             */
            var time = new Time(timer.getTimeElapsed()),
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
         * Start the timer.
         *
         * @param {Event} event Event.
         */
        function start(ev) {
            ev.preventDefault();
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
            document.getElementById('stopwatch-lap-list').innerHTML = '';
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
                tmptable = null,
                newitem = null;

            stopLapListEl =
                stopLapListEl || document.getElementById('stopwatch-lap-list');

            html = tpl.get('lapRow', {
                no: currentLap.no > 9 ? currentLap.no : '0' + currentLap.no,
                totalTime: new Time(timer.getTimeElapsed()),
                lapTime: new Time(currentLap.time)
            });
            tmptable = document.createElement('table');
            tmptable.innerHTML = html;
            newitem = tmptable.firstChild;

            if (stopLapListEl.firstChild) {
                stopLapListEl.insertBefore(newitem, stopLapListEl.firstChild);
            } else {
                stopLapListEl.appendChild(newitem);
            }

            stopContentListLapEl.scrollTop = 0;
            stopContentListLapElScrollTop = 0;
        }

        /**
         * Stop actually pauses the timer
         */
        function stop(e) {
            e.preventDefault();
            timer.pause();
            refreshTimer();
            showButtons();
        }

        /**
         * Handles navigation stopwatch button tap
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
            document.getElementById('stopwatch-navi-timer').addEventListener(
                'click',
                onNaviTimerTap
            );

            document.getElementById('stopwatch-navi-stopwatch')
                .addEventListener(
                    'click',
                    onNaviStopWatchTap
                );

            // start (when zeroed, ready to run)
            document.getElementById('stopwatch-start-btn').addEventListener(
                'click',
                start
            );

            // stop, lap (when running)
            document.getElementById('stopwatch-stop-btn').addEventListener(
                'click',
                stop
            );

            document.getElementById('stopwatch-lap-btn').addEventListener(
                'click',
                lap
            );

            // restart, reset (when stopped, ie. paused)
            document.getElementById('stopwatch-restart-btn').addEventListener(
                'click',
                start
            );

            document.getElementById('stopwatch-reset-btn').addEventListener(
                'click',
                reset
            );

        }

        /**
         * Initialise the stopwatch - timer and events.
         *
         * @return {boolean} True if any action was performed.
         */
        function initStopWatch() {
            if (initialised) {
                return false;
            }
            // init model
            timer = new Timer(10, 'views.stopWatchPage.tick');

            // init UI by binding events
            bindEvents();

            initialised = true;
            return true;
        }

        function pageShow() {
            initStopWatch();
            // scroll laps list to previous position
            stopContentListLapEl.scrollTop = stopContentListLapElScrollTop;
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
            'views.stopWatchPage.tick': refreshTimer
        });

        return {
            init: bindPageShow
        };

    }
});
