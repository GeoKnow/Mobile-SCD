/**
 * Created by vukm on 11/19/15.
 */

(function(){

    var callbacks = [];
    function addCallback(fun) {
        callbacks.push(fun);
    }
    function removeCallback(fun) {
        var index = callbacks.indexOf(fun);
        callbacks.splice(index, 1);
    }

    var commBrox = angular.module("scm-comm-brox");
    commBrox.factory("msgProvider", ['$http', '$log', '$document', '$window', '$timeout', 'scmParameters', 'supplierService', function($http, $log, $document, $window, $timeout, scmParameters, supplierService) {

        $document.on('deviceready', function() {
            $('body').prepend('<iframe src="' + scmParameters.dashboard + '/deliveryStream" frameborder="0" style="display:none"></iframe>');
        });
        $document.ready(function(){
            // if it's running in the browser load delivery stream iframe here
            if (typeof cordova === 'undefined') {
                $('body').prepend('<iframe src="' + scmParameters.dashboard + '/deliveryStream" frameborder="0" style="display:none"></iframe>');
            }
        });
        $window.addEventListener('message', function(e) {
            $timeout(function() {
                for (var i=0; i<callbacks.length; i++) {
                    callbacks[i](e);
                }
            }, 0);
        }, false);

        /*-----------------------------------------------
         * Supply Chain Network Querying
         -----------------------------------------------*/

        var defaultGraph = scmParameters.graph;
        var defaultEndpoint = scmParameters.endpoint;
        var q2 = defaultEndpoint + "?default-graph-uri=" + encodeURIComponent(defaultGraph) + "&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel%0D%0AWHERE+%7B%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Alat+%3Flat+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Along+%3Flong+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Acity+%3Fcity+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Aname+%3Fname+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+%7D%0D%0A++FILTER+NOT+EXISTS+%7B%0D%0A++++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A++%7D%0D%0A%7D&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on";
        //q2 = 'http://p2.eccenca.com:11180/sparql?callback=JSON_CALLBACK&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel%0D%0AWHERE+%7B%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Alat+%3Flat+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Along+%3Flong+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Acity+%3Fcity+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Aname+%3Fname+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+%7D%0D%0A++FILTER+NOT+EXISTS+%7B%0D%0A++++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A++%7D%0D%0A%7D&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on';

        function qShowSupplier(supplier) {
            //return "http://p2.eccenca.com:11180/sparql?callback=JSON_CALLBACK&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E+%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E+%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E+%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel+%0D%0AWHERE+{+%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.+%0D%0A++OPTIONAL+{+%3Fsupplier+geo%3Alat+%3Flat+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+geo%3Along+%3Flong+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Acity+%3Fcity+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Aname+%3Fname+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+}+%0D%0A++%3Fconn+xmo%3Areceiver+%3C" +
            //        encodeURIComponent(supplier.uri) +
            //        "%3E+.+%0D%0A++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A}&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on";
            return defaultEndpoint + "?default-graph-uri=" + encodeURIComponent(defaultGraph) + "&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E+%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E+%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E+%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel+%0D%0AWHERE+{+%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.+%0D%0A++OPTIONAL+{+%3Fsupplier+geo%3Alat+%3Flat+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+geo%3Along+%3Flong+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Acity+%3Fcity+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Aname+%3Fname+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+}+%0D%0A++%3Fconn+xmo%3Areceiver+%3C" +
                encodeURIComponent(supplier.uri) +
                "%3E+.+%0D%0A++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A}&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on";
        }

        function replacerForSupplierTree(key, val) {
            if (key == "parent") return undefined;
            return val;
        }

        function doWork(sup, supArray) {
            // use jsonp with BROX's endpoint
            $http.get(qShowSupplier(sup)).success(function(data){
                var results = data.results.bindings;
                var supList = [];
                for (var s in results) {
                    var r = results[s];
                    var supplier = supplierService.createSupplier(
                        r.supplier.value, r.name.value, r.lat.value, r.long.value,
                        r.city.value, r.street.value, r.zip.value
                    );
                    supplier.parent = sup;
                    $log.info('Found supplier: ' + supplier.name);
                    supList.push(supplier);
                }
                $timeout(function(){
                    sup.suppliers = supList;
                    if (supArray) supArray.push(sup);
                    if (sup.suppliers !== null && sup.suppliers.length > 0)
                        populateTree(sup.suppliers, supArray);
                    else {
                        //localStorage.setItem("virtualSupplier", JSON.stringify(virtSup, replacerForSupplierTree));
                    }
                }, 0);
            }).error(function(data){
                alert("Error: " + data);
                sup.suppliers = null;
            });
        }

        function populateTree(sups, supArray) {
            for (var i in sups) {
                doWork(sups[i], supArray);
            }
        }

        function populateNetworkInfo(virtSup, supArray) {
            // use jsonp with BROX's endpoint
            $http.get(q2).success(function(data){
                var results = data.results.bindings;
//                alert("Success: " + JSON.stringify(results));
                var sups = [];
                for (var s in results) {
                    var r = results[s];
                    if (r.lat && r.long
                        && r.city && r.name
                        && r.street && r.zip
                        && r.supplier) {
                        var supplier = supplierService.createSupplier(
                            r.supplier.value, r.name.value, r.lat.value, r.long.value,
                            r.city.value, r.street.value, r.zip.value
                        );
                        supplier.parent = virtSup;
                        sups.push(supplier);
                    }
                }
                $timeout(function (){
                    virtSup.suppliers = sups;
                    populateTree(virtSup.suppliers, supArray);
                }, 0);
            }).error(function(data){
                alert("Error: " + data);
                return null;
            });
        }

        return {
            addCallback: addCallback,
            removeCallback: removeCallback,
            populateNetworkInfo: populateNetworkInfo,
            step: function() {},
            reset: function() {}
        }
    }]);

    var commSim = angular.module("scm-comm-sim");
    commSim.factory("msgProvider", ['$timeout', function($timeout) {
        var msgs = null;
        $.getJSON('json/msgs-data.json', {}, function(data, status) {
            msgs = data;
        });
        var curIndex = 0;

        function populateNetworkInfo(virtSup, supArray) {
            // TODO: do a mock population
        }

        return {
            addCallback: addCallback,
            removeCallback: removeCallback,
            populateNetworkInfo: populateNetworkInfo,
            step: function() {
                if (!msgs || curIndex >= msgs.length) return;
                $timeout(function() {
                    for (var i=0; i<callbacks.length; i++){
                        callbacks[i]({
                            data: msgs[curIndex]
                        });
                    }
                    curIndex++;
                }, 0);
            },
            reset: function() {
                curIndex = 0;
                this.step();
            }
        }
    }]);

})();