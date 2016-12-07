/*
* jHash v2.1
* http://jhash.codeplex.com
*
* Copyright (c) 2013 Chris Pietschmann
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of
* this software and associated documentation files (the "Software"), to deal in the
* Software without restriction, including without limitation the rights to use, copy,
* modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
* and to permit persons to whom the Software is furnished to do so, subject to the
* following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies
* or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
* INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
* PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
* CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
* OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function (window) {

    var ie_documentMode = window.document.documentMode;
    var hashChangeSupported = ('onhashchange' in window) && (ie_documentMode === undefined || ie_documentMode > 7);
    var jHash = window.jHash = {
        jhash: "2.1",

        /// adds an event handler for the "hashchange" event
        change: function (handler) {
            if (hashChangeSupported) {
                attachEvent(window, "hashchange", handler);
            } else {
                eventHandlers.push(handler);
            }
        },

        /// removes an event handler from the "hashchange" event
        unbind: function (handler) {
            var i = 0, len = 0;
            if (hashChangeSupported) {
                detachEvent(window, "hashchange", handler);
            } else {
                arrayRemove(eventHandlers, eventHandlers.indexOf(handler));
            }
            return this;
        },

        /// gets or sets a hash querystring value
        val: function (name, value) {
            var ho = jHash.query();
            if (arguments.length === 2) {
                ho[name.toLowerCase()] = (value === null ? '' : value);
                return this.set(this.root(), ho);
            } else if (arguments.length === 1 && typeof (name) === 'string') {
                return ho[name.toLowerCase()];
            } else if (typeof(name) === 'object') {
                return this.set(this.root(), name);
            }
            return ho;
        },

        /// gets or sets the root hash
        root: function (value) {
            if (value === undefined) {
                return parseHashRoot(window.location.hash);
            }
            return this.set(value, this.val());
        },

        /// sets both the root hash and the hash querystring
        set: function (root, query) {
            var fullHashValue = null;
            if (root === null && query === null) {
                fullHashValue = null;
            } else if (query !== undefined) {
                var rootValue = root;
                var queryValue = typeof (query) === "string" ? query : objectToHash(query);
                if (queryValue.length > 0) {
                    rootValue += '?';
                }
                fullHashValue = rootValue + queryValue;
            } else {
                fullHashValue = root;
            }
            window.location.hash = fullHashValue;
            return this;
        },

        /// removes a value from the hash querystring
        remove: function (name) {
            var ho = jHash.query();
            ho[name.toLowerCase()] = undefined;
            return this.set(this.root(), ho);
        },

        /// returns an object representation of the hash querystring
        query: function () {
            return hashToObject(window.location.hash);
        },

        /// clears the hash
        clear: function () {
            window.location.hash = '';
            return this;
        },
        // clears the hash querystring
        clearQuery: function() {
            this.set(this.root());
            return this;
        },
        // clears the hash root
        clearRoot: function() {
            this.set('', this.query());
            return this;
        },



        _routes: {},
        _routeHandlerRegistered: false,
        _defaultRoute: null,

        /// adds a new route handler
        route: function (route, handler) {
            this._routes[route] = handler;

            if (!this._routeHandlerRegistered) {
                this._routeHandlerRegistered = true;
                jHash.change(routeHandler);
            }
        },

        /// Forces the current route to be processed.
        /// useful for calling on initial page load, after
        /// all page initialization has been performed
        processRoute: function () {
            routeHandler();
        },

        /// Gets or sets the default route for the page, when
        /// no "root" hash is specified
        defaultRoute: function (root, query) {
            if (arguments.length == 0) {
                return this._defaultRoute;
            }
            this._defaultRoute = {
                root: root,
                query: query
            };
        }
    };


    if (!hashChangeSupported) {
        window.setInterval(function () {
            var currentHash = window.location.hash;
            if (previousHashValue !== currentHash) {
                for (var i in eventHandlers) {
                    eventHandlers[i].call(window);
                }
            }
            previousHashValue = currentHash;
        }, 200);
    }

    var eventHandlers = [],
        previousHashValue = window.location.hash,
        attachEvent = function (element, evtName, handler) {
            if (element.addEventListener) {
                element.addEventListener(evtName, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + evtName, handler);
            } else {
                element["on" + evtName] += handler;
            }
        },
        detachEvent = function (element, evtName, handler) {
            if (element.removeEventListener) {
                element.removeEventListener(evtName, handler, false);
            } else if (element.detachEvent) {
                element.detachEvent("on" + evtName, handler);
            } else {
                element["on" + evtName] -= handler;
            }
        },
        arrayRemove = function (array, from, to) {
            /* function source: http://ejohn.org/blog/javascript-array-remove/ */
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
        },
        hashToObject = function (hash) {
            /* create a "dictionary" object for the passed in hash value */
            var obj = {},
                pair = null,
                strHash = hash.substring(0, hash.length);
            if (hash !== null && hash !== undefined) {
                if (strHash.indexOf("#") === 0) {
                    strHash = strHash.substring(1, strHash.length);
                }

                var queryIndex = strHash.indexOf("?");

                if (queryIndex > -1) {
                    strHash = strHash.substring(queryIndex + 1, strHash.length);

                    var parts = strHash.split("&");
                    for (var i in parts) {
                        pair = parts[i].split("=");
                        obj[pair[0].toString().toLowerCase()] = pair[1];
                    }
                }
            }
            return obj;
        },
        objectToHash = function (object) {
            var s = "";
            for (var i in object) {
                if (object[i] !== undefined) {
                    if (s.length > 0) {
                        s += "&";
                    }
                    s += i.toString() + "=" + object[i].toString();
                }
            }
            return s;
        },
        parseHashRoot = function (hash) {
            var strHash = hash.substring(0, hash.length);
            if (strHash.indexOf("#") > -1) {
                strHash = strHash.substring(1, strHash.length);
            }
            if (strHash.indexOf("?") > -1) {
                strHash = strHash.substring(0, strHash.indexOf("?"));
            }
            return strHash;
        },

        ROUTE_REPLACE = "([^\/]+)",
        ROUTE_MATCH = /{([\w\d]+)}/g,
        getRouteMatches = function (route, root) {
            var pathRegex = new RegExp(route.replace(ROUTE_MATCH, ROUTE_REPLACE) + "$")
            return root.match(pathRegex);
        },
        routeHandler = function () {
            var root = jHash.root();

            var defaultRoute = jHash.defaultRoute();
            if ((root || '').length === 0 && defaultRoute) {
                jHash.set(defaultRoute.root, defaultRoute.query);
                return;
            }

            for (var r in jHash._routes) {
                if (typeof (r) === "string") {
                    var matches = getRouteMatches(r, root);
                    if (matches !== null) {
                        var handler = jHash._routes[r];

                        var context = {};
                        var routeParts = r.match(ROUTE_MATCH);
                        if (routeParts !== null) {
                            for (var rp = 0; rp < routeParts.length; rp++) {
                                var routePartName = routeParts[rp].substring(1).substring(0, routeParts[rp].length - 2);
                                context[routePartName] = matches[rp + 1];
                            }
                        }

                        handler.call(context);

                        return;
                    }

                }
            }
        };
})(window);
