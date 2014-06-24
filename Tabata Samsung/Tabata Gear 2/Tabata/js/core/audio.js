/*global define, console, Audio*/

/**
 * Audio module
 */

define({
    name: 'core/audio',
    def: function coreAudio() {
        'use strict';

        var MAX_VOLUME = 15,

            audio = new Audio();

        /**
         * Set audio volume
         * @param {number} value
         */
        function setVolume(value) {
            audio.volume = value / MAX_VOLUME;
        }

        /**
         * Set audio file path
         * @param {string} path
         */
        function setFile(path) {
            audio.src = path;
            audio.autoplay = false;
            audio.loop = false;
            audio.load();
        }

        /**
         * Pause playing audio
         */
        function pause() {
            audio.pause();
        }

        /**
         * Set audio loop flag
         * @param {boolean} flag
         */
        function loop(flag) {
            audio.loop = flag;
        }

        /**
         * Add audio callback for events.
         * @param {object} params
         */
        function addAudioCallback(params) {
            audio.addEventListener(params.event, params.callback);
        }

        /**
         * Remove audio callback for events.
         * @param {object} params
         */
        function removeAudioCallback(params) {
            audio.removeEventListener(params.event, params.callback);
        }

        /**
         * Starts playing audio
         * @param {object} params
         * @return {boolean}
         */
        function play(params) {
            params = params || {};

            if (params.volume) {
                setVolume(params.volume);
            }

            if (params.loop) {
                loop(params.loop);
            }

            if (params.file) {
                setFile(params.file);
            }
            if (!audio.src) {
                console.error('No file to play!');
                return false;
            }

            audio.play();

            return true;
        }

        return {
            MAX_VOLUME: MAX_VOLUME,
            setFile: setFile,
            play: play,
            pause: pause,
            addAudioCallback: addAudioCallback,
            removeAudioCallback: removeAudioCallback,
            loop: loop
        };
    }
});
