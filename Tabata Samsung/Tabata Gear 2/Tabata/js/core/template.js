/*jslint regexp: true, evil: true, unparam: true*/
/*jshint unused: true*/
/*global define, console, document*/

/**
 * Template manager module
 */

define({
    name: 'core/template',
    requires: [
        'core/config',
        'core/event',
        'core/http'
    ],
    def: function template(config, e, http) {
        'use strict';

        /**
         * Compiled template cache
         */
        var cache = {},
            loopVariablesRegex = /\{\{this(\..+?)?\}\}/g,
            whitespaceRegex = /[\r\t\n]/g,
            loopTemplateRegex = /\{\{#([\w]*)\}\}(.*)\{\{\/(\1)\}\}/ig,
            conditionTemplateRegex = null,
            variablesRegex = /\{\{(.+?)\}\}/g;

        /**
         * Regular expression matching template conditions
         *
         * \{\{ -opening braces
         * \? -mandatory question mark at the start
         * (typeof\s|[^a-zA-Z0-9]*) -special stuff eg. !, typeof
         * (.+?) -any sequence of chars in the condition
         * \}\} - closing braces
         * (.*) -body
         * \{\{ - opening braces
         * \/ -backslash
         * (\1)(\2) -the same sequence as found before
         * \}\} -closing braces
         *
         * /ig -global, case-insensitive
         *
         */
        conditionTemplateRegex =
            /\{\{\?(typeof\s|[^a-zA-Z0-9]*)(.+?)\}\}(.*)\{\{\/(\1)(\2)\}\}/ig;

        /**
         * Generate code for template loops.
         *
         * @param {string} match The matched substring.
         * @param {string} $1 First submatch (array variable).
         * @param {string} $2 Second submatch (body).
         * @return {string}
         */
        function templateLoop(match, $1, $2) {
            return '\';var i=0,l=data.' + $1 +
                '.length,d=data.' + $1 + ';for(;i<l;i++){s+=\'' +
                $2
                .replace(loopVariablesRegex, '\'+d[i]$1+\'') +
                '\'}s+=\'';
        }

        /**
         * Generate code for template conditions.
         *
         * @param {string} match The matched substring.
         * @param {string} $1 First submatch (typeof, negation).
         * @param {string} $2 Second submatch (condition).
         * @param {string} $3 Third submatch (body).
         * @return {string}
         */
        function templateCondition(match, $1, $2, $3) {
            return '\';if(' + $1 + 'data.' + $2 + '){s+=\'' + $3 + '\'}s+=\'';
        }

        /**
         * compile and templateLoop is the $template method taken from Qatrix
         * modified to better suit the app structure
         *
         * Copyright (c) 2013, Angel Lai
         * The Qatrix project is under MIT license.
         * For details, see the Qatrix website: http://qatrix.com
         *
         * @param {string} template Template.
         * @return {function} Compiled template.
         */
        function compile(template) {
            var content = cache[template];

            if (!content) {
                // initialize empty string
                content = 'var s=\'\';s+=\'' +
                    // replace all weird whitespace with spaces
                    template.replace(whitespaceRegex, ' ')
                    .split('\'').join('\\\'') // escape quotes
                    .replace(
                        /**
                         * Handle loops.
                         *
                         * In the loop, 'i' is the key and 'this' is the value
                         *
                         * Example:
                         *     {{#arr}}<li>key:{{i}} value:{{this}}</li>{{/arr}}
                         */
                        loopTemplateRegex,
                        templateLoop
                    )
                    .replace(
                        /**
                         * Handle conditions.
                         *
                         * Example:
                         *     {{?logged}}Logged{{/logged}}
                         * becomes:
                         *     if(data.logged){s+='Logged'}
                         *
                         * Some of other possible conditions:
                         *     {{!variable}}
                         *     {{typeof variable !== "undefined"}}
                         *     {{variable === "value"}}
                         */
                        conditionTemplateRegex,
                        templateCondition
                    )
                       /**
                        * Handle other references by adding 'data.'.
                        *
                        * Example:
                        *     {{user.name}}
                        * becomes:
                        *     s+=data.user.name
                        *
                        * \{\{ -opening braces
                        * (.+?) -any sequence of characters
                        * \}\} -closing braces
                        *
                        * /g -global
                        *
                        */
                    .replace(variablesRegex, '\'+data.$1+\'') +
                    '\';return s;'; // return the string

                content = cache[template] = new Function('data', content);
            }

            return content;
        }

        /**
         *
         * @param {string} tplName Template name.
         * @param {function} tplData Template data.
         */
        function add(tplName, tplData) {
            cache[tplName] = tplData;
        }

        /**
         * Load a template using ajax.
         *
         * @param {string} tplName Template name.
         * @param {object} options Options.
         * @param {function?} onSuccess Success callback.
         * @return {function|undefined}
         */
        function loadOne(tplName, options, onSuccess) {
            var tplPath = [
                    config.get('templateDir'),
                    [tplName, config.get('templateExtension')].join('')
                ].join('/'),
                tplCompiled = null,
                async,
                onReqSuccess = function onReqSuccess(data) {
                    tplCompiled = compile(data);
                    add(tplName, tplCompiled);
                    if (async === false) {
                        if (typeof onSuccess === 'function') {
                            onSuccess();
                        }
                    }
                };

            options = options || {};
            async = typeof options.async === 'boolean' ? options.async : false;

            http.request({
                url: tplPath,
                async: async,
                success: onReqSuccess,
                error: function error(textStatus) {
                    console.error(tplPath + ' loading error: ' + textStatus);
                }
            });

            if (async === false) {
                return tplCompiled;
            }
            return undefined;
        }

        /**
         * Loads templates.
         *
         * @param {array} tplNames Template names.
         * @param {object} options Options.
         */
        function load(tplNames, options) {
            var cachedTemplates = 0,
                i = 0,
                onSuccess = function onSuccess() {
                    cachedTemplates += 1;
                    // if all templates are cached fire event
                    if (cachedTemplates >= tplNames.length) {
                        e.fire('template.loaded');
                    }
                };

            options = options || {};
            options.async = typeof options.async === 'boolean' ?
                    options.async : true;

            if (Array.isArray(tplNames)) {
                for (i = 0; i < tplNames.length; i += 1) {
                    loadOne(tplNames[i], options, onSuccess);
                }
            }
        }

        /**
         * Returns template completed by specified params
         * @param {function} tplCompiled Compiled template.
         * @param {array|object} tplParams Template parameters.
         * @return {string} Completed template.
         */
        function getCompleted(tplCompiled, tplParams) {
            /*jshint validthis:true*/
            return tplCompiled.call(this, tplParams);
        }

        /**
         * Returns template html (from cache)
         * @param {string} tplName Template name.
         * @param {string} tplParams Template parameters.
         * @return {string} Completed template.
         */
        function get(tplName, tplParams) {
            var tplCompiled = cache[tplName] || loadOne(tplName);
            return getCompleted(tplCompiled, tplParams);
        }

        /**
         * Returns first HTML element from completed template.
         * @param {string} tplName Template name.
         * @param {string} tplParams Template parameters.
         * @return {HTMLElement} First element from the completed template.
         */
        function getElement(tplName, tplParams) {
            var html = get(tplName, tplParams),
                tempElement = document.createElement('div');

            tempElement.innerHTML = html;
            return tempElement.firstChild;
        }

        /**
         * Returns completed template as DocumentFragment.
         * @param {string} tplName Template name.
         * @param {string} tplParams Template parameters.
         * @return {DocumentFragment} First element from the completed template.
         */
        function getAsFragment(tplName, tplParams) {
            var html = get(tplName, tplParams),
                tempElement = document.createElement('div'),
                fragment = document.createDocumentFragment(),
                child = null;

            tempElement.innerHTML = html;

            while ((child = tempElement.firstChild)) {
                fragment.appendChild(child);
            }
            return fragment;
        }

        /**
         * Returns the compiled template.
         * @return {function} Compiled template.
         */
        function getCompiled(tplName) {
            return cache[tplName] || loadOne(tplName);
        }

        return {
            load: load,
            getCompiled: getCompiled,
            getElement: getElement,
            getAsFragment: getAsFragment,
            get: get
        };
    }
});
