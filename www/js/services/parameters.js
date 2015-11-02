/**
 * Created by vukm on 10/1/15.
 */

angular.module('scm-parameters-hotspot', [])
    .factory('scmParameters', function() {
        return {
            endpoint: "http://192.168.43.246:8890/sparql",
            graph: "http://www.xybermotive.com/geoknow/",
            middle: "?default-graph-uri=" + encodeURIComponent("http://www.xybermotive.com/geoknow/") + "&",
            dashboard: "http://192.168.43.246:9000"
        }
    });

angular.module('scm-parameters-hotspot2', [])
    .factory('scmParameters', function() {
        return {
            endpoint: "http://192.168.43.222:8890/sparql",
            graph: "http://www.xybermotive.com/geoknow/",
            middle: "?default-graph-uri=" + encodeURIComponent("http://www.xybermotive.com/geoknow/") + "&",
            dashboard: "http://192.168.43.222:9000"
        }
    });

angular.module('scm-parameters-local', [])
    .factory('scmParameters', function() {
        return {
            endpoint: "http://localhost:8890/sparql",
            graph: "http://www.xybermotive.com/geoknow/",
            middle: "?default-graph-uri=" + encodeURIComponent("http://www.xybermotive.com/geoknow/") + "&",
            dashboard: "http://localhost:9000"
        }
    });

angular.module("scm-parameters-jpo", [])
    .factory("scmParameters", function() {
        return {
            endpoint: "http://jpo.imp.bg.ac.rs/sparql",
            graph: "http://mobile-scm/dump/",
            middle: "?default-graph-uri=" + encodeURIComponent("http://mobile-scm/dump/") + "&",
            dashboard: "http://192.168.43.246:9000"
        }
    });

angular.module("scm-parameters-eccenca", [])
    .factory("scmParameters", function() {
        return {
            endpoint: "http://p2.eccenca.com:11180/sparql",
            graph: "http://mobile-scm/dump/",
            middle: "?callback=JSON_CALLBACK&",
            dashboard: "http://192.168.43.246:9000"
        }
    });

angular.module("scm-parameters-geoknow", [])
    .factory("scmParameters", function() {
        return {
            endpoint: "http://geoknow.imp.bg.ac.rs/sparql",
            graph: "http://www.xybermotive.com/geoknow/",
            middle: "?default-graph-uri=" + encodeURIComponent("http://www.xybermotive.com/geoknow/") + "&",
            dashboard: "http://geoknow.imp.bg.ac.rs:9000"
        }
    });