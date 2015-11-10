(function(){
    var app = angular.module("mobile-scm");

    /////////////////////////////////////
    // Controllers
    /////////////////////////////////////

    /////////////////////////////////////
    // http://tiles.lyrk.org/ls/{z}/{x}/{y}?apikey=87be57815cf747a58ec5d84d8e64ccfa
    /////////////////////////////////////

    /////////////////////////////////////
    // HERE Maps credentials
    // App_Id: INhWcYWOEBUd1djZetDO
    // App_Code: vUsfPezonTcM0FKG58vYRw
    /////////////////////////////////////

    app.controller("SuppliersController", ['scmParameters', 'scmNotifier', 'supplierService', '$scope', '$http', '$timeout', '$document', '$window', '$log', '$animate', function(params, notifier, supplierService, $scope, $http, $timeout, $document, $window, $log, $animate){
        var ctrl = this;

        ctrl.idSuppliersView = 0;
        ctrl.idShippingsView = 1;
        ctrl.idOrdersView = 2;
        ctrl.idMessagesView = 3;
        ctrl.idSearchContactsView = 4;
        ctrl.currentView = ctrl.idSuppliersView;
        ctrl.contextStack = [];

        ctrl.orders = supplierService.getOrders();
        ctrl.shippings = supplierService.getShippings();

        ctrl.modalCurrent = null;
        ctrl.modalBasics = 1;

        ctrl.showLargeMap = false;
        ctrl.mapLarge = null;
        ctrl.mapLargeLayer = null;

        ctrl.showOrders = true;
        ctrl.showShippings = true;

        ctrl.toggleLargeMap = function() {
            ctrl.showLargeMap = !ctrl.showLargeMap;
            $log.debug('Map toggled');
        };

        ctrl.openModal = function(modal, $event) {
            ctrl.modalCurrent = modal;
            if ($event) {
                $log.debug('Preventing default');
                $event.stopImmediatePropagation();
            } else {
                $log.debug("Didn't receive $event object");
            }
        };
        ctrl.pullFromContacts = function($event) {
            $event.stopImmediatePropagation();
            ctrl.contextStack.push({
                supplier: ctrl.currentSupplier,
                view: ctrl.currentView
            });
            ctrl.modalCurrent = null;
            ctrl.currentView = ctrl.idSearchContactsView;
        };
        ctrl.pullFromURI = function($event) {
            $event.stopImmediatePropagation();
            ctrl.modalCurrent = null;
        };

        ctrl.supTree = [];
        ctrl.virtualSupplier = {
            parent: null,
            name: "Supply Chain Network",
            suppliers: []
        };
        ctrl.currentSupplier = ctrl.virtualSupplier;
        ctrl.currentMetric = {};

        ctrl.searchPhrase = "";
        ctrl.curSup = null;
        ctrl.curLevel = -1;
        ctrl.suppliers = [];
        ctrl.topSuppliers = [];
        ctrl.suppliersArray = [];
        ctrl.currentSuppliers = [];

        ctrl.defaultGraph = params.graph;
        ctrl.defaultGraphParam = "default-graph-uri";
        //ctrl.defaultEndpoint = "http://p2.eccenca.com:11180/sparql";
        ctrl.defaultEndpoint = params.endpoint;
        ctrl.topLevelQuery = "PREFIX xmo: <http://www.xybermotive.com/ontology/> \
            PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#l> \
\
            SELECT DISTINCT ?supplier ?lat ?long ?city ?name ?street ?zip ?label \
            WHERE { \
              ?supplier a xmo:Supplier . \n\
              OPTIONAL { ?supplier geo:lat ?lat . } \
              OPTIONAL { ?supplier geo:long ?long . } \
              OPTIONAL { ?supplier xmo:city ?city . } \
              OPTIONAL { ?supplier xmo:name ?name . } \
              OPTIONAL { ?supplier xmo:street ?street . } \
              OPTIONAL { ?supplier xmo:zipcode ?zip . } \
              OPTIONAL { ?supplier rdfs:label ?label . } \
              FILTER NOT EXISTS { \
                ?conn xmo:sender ?supplier . \
              } \
            }";
            //default-graph-uri=http%3A%2F%2Fmobile-scm%2Fdump%2F&
        ctrl.q = ctrl.defaultEndpoint + "?default-graph-uri=" + encodeURIComponent(ctrl.defaultGraph) + "&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel%0D%0AWHERE+%7B%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Alat+%3Flat+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Along+%3Flong+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Acity+%3Fcity+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Aname+%3Fname+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+%7D%0D%0A++FILTER+NOT+EXISTS+%7B%0D%0A++++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A++%7D%0D%0A%7D&should-sponge=&format=text%2Fhtml&timeout=0";
        ctrl.q2 = ctrl.defaultEndpoint + "?default-graph-uri=" + encodeURIComponent(ctrl.defaultGraph) + "&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel%0D%0AWHERE+%7B%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Alat+%3Flat+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Along+%3Flong+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Acity+%3Fcity+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Aname+%3Fname+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+%7D%0D%0A++FILTER+NOT+EXISTS+%7B%0D%0A++++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A++%7D%0D%0A%7D&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on";
        //ctrl.q = "http://p2.eccenca.com:11180/sparql?callback=JSON_CALLBACK&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel%0D%0AWHERE+%7B%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Alat+%3Flat+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Along+%3Flong+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Acity+%3Fcity+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Aname+%3Fname+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+%7D%0D%0A++FILTER+NOT+EXISTS+%7B%0D%0A++++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A++%7D%0D%0A%7D&should-sponge=&format=text%2Fhtml&timeout=0";
        //ctrl.q2 = 'http://p2.eccenca.com:11180/sparql?callback=JSON_CALLBACK&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel%0D%0AWHERE+%7B%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Alat+%3Flat+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Along+%3Flong+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Acity+%3Fcity+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Aname+%3Fname+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+%7D%0D%0A++FILTER+NOT+EXISTS+%7B%0D%0A++++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A++%7D%0D%0A%7D&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on';

        ctrl.qShowSupplier = function(supplier) {
            //return "http://p2.eccenca.com:11180/sparql?callback=JSON_CALLBACK&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E+%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E+%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E+%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel+%0D%0AWHERE+{+%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.+%0D%0A++OPTIONAL+{+%3Fsupplier+geo%3Alat+%3Flat+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+geo%3Along+%3Flong+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Acity+%3Fcity+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Aname+%3Fname+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+}+%0D%0A++%3Fconn+xmo%3Areceiver+%3C" +
            //        encodeURIComponent(supplier.uri) +
            //        "%3E+.+%0D%0A++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A}&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on";
            return ctrl.defaultEndpoint + "?default-graph-uri=" + encodeURIComponent(ctrl.defaultGraph) + "&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E+%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E+%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E+%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel+%0D%0AWHERE+{+%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.+%0D%0A++OPTIONAL+{+%3Fsupplier+geo%3Alat+%3Flat+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+geo%3Along+%3Flong+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Acity+%3Fcity+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Aname+%3Fname+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+}+%0D%0A++%3Fconn+xmo%3Areceiver+%3C" +
                encodeURIComponent(supplier.uri) +
                "%3E+.+%0D%0A++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A}&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on";
        };

        ctrl.doWork = function(sup) {
            // use jsonp with BROX's endpoint
            $http.get(ctrl.qShowSupplier(sup)).success(function(data){
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
                    ctrl.suppliersArray.push(sup);
                    if (sup.suppliers !== null && sup.suppliers.length > 0)
                        ctrl.populateTree(sup.suppliers);
                }, 0);
            }).error(function(data){
                alert("Error: " + data);
                sup.suppliers = null;
            });
        };

        ctrl.populateTree = function (sups) {
            for (var i in sups) {
                ctrl.doWork(sups[i]);
            }
        };

        ctrl.getSuppliersTree = function() {
            ctrl.supTree = [];
            ctrl.virtualSupplier = supplierService.createVirtualSupplier();
            ctrl.currentSupplier = ctrl.virtualSupplier;
            // use jsonp with BROX's endpoint
            $http.get(ctrl.q2).success(function(data){
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
                        supplier.parent = ctrl.virtualSupplier;
                        sups.push(supplier);
                    }
                }
                $timeout(function (){
                    ctrl.supTree = sups;
                    ctrl.virtualSupplier.suppliers = sups;
//                    ctrl.populateTree(ctrl.supTree);
                    ctrl.populateTree(ctrl.virtualSupplier.suppliers);
                }, 0);
            }).error(function(data){
                alert("Error: " + data);
                return null;
            });
        };

        ctrl.removeNumber = function(numberString, numberIndex) {
            var message = 'Remove number ' + numberString + ' from supplier ' + ctrl.currentSupplier.name + '?';
            if (typeof navigator.notification !== 'undefined') {
                navigator.notification.confirm(message, function(buttonIndex) {
                    // if other than OK (first button) do nothing
                    if (buttonIndex > 1) return;
                    // remove the number
                    $scope.$applyAsync(function() {
                        ctrl.currentSupplier.removeNumber(numberIndex);
                    });
                });
            } else {
                if (confirm) {
                    ctrl.currentSupplier.removeNumber(numberIndex);
                }
            }
        };

        ctrl.selectSupplier = function(sup, closeSnap) {
            // $('.sup-suppliers-items').css({ "display": "none" });
            ctrl.contextStack.push({
                supplier: ctrl.currentSupplier,
                view: ctrl.currentView
            });
            ctrl.currentSupplier = sup;
            ctrl.showOrders = true;
            ctrl.showShippings = true;
            if (closeSnap) $scope.snapper.close();
        };

        ctrl.back = function() {
            if (ctrl.contextStack.length > 0) {
                var ctx = ctrl.contextStack.pop();
                ctrl.currentSupplier = ctx.supplier;
                ctrl.currentView = ctx.view;
            }
        };

        ctrl.levelUp = function() {
            if (ctrl.currentSupplier.parent !== null) {
                ctrl.currentSupplier = ctrl.currentSupplier.parent;
            }
        };

        ctrl.isCurrent = function(supplier){
            return supplier === ctrl.currentSupplier;
        };

        ctrl.toggleTreeView = function(){
            $scope.snapper.open('right');
        };

        ctrl.trackShipping = function(s){
            if (s.tracked) {
                s.tracked = false;
                s.deregisterWatcher();
            }
            else {
                s.tracked = true;
                s.deregisterWatcher = $scope.$watch(function() { return s.status; }, function(newVal, oldVal) {
                    if (newVal === oldVal) return;
                    var status = "";
                    if (newVal === 1) status = "overdue";
                    if (newVal === 2) status = "completed";
                    var msg = 'Order of ' + s.product + '(s) from ' + s.connectionSourceId + ' to ' +
                        s.connectionTargetId + ' is ' + status;
                    notifier.notifyGlobal(msg, 'Order Update');
                });
            }
        };

        ctrl.notify = function (metric) {
            if (ctrl.evaluateMetric(metric)) return;
            var message = 'Metric ' + metric.name + ' is violated';
            notifier.notifyMetric(message, 'Metric violated', ctrl.currentSupplier);
        };

        ctrl.setCurrentMetric = function(m) {
            ctrl.currentMetric = m;
            ctrl.currentThresholdMin = m.thresholdMin;
            ctrl.currentThresholdMax = m.thresholdMax;
        };

        ctrl.saveCurrentMetric = function() {
            if (ctrl.currentThresholdMax){
                ctrl.currentMetric.thresholdMax = ctrl.currentThresholdMax;
            }
            if (ctrl.currentThresholdMin){
                ctrl.currentMetric.thresholdMin = ctrl.currentThresholdMin;
            }
            ctrl.notify(ctrl.currentMetric);
        };

        ctrl.showMessages = function() {
            ctrl.currentView = ctrl.idMessagesView;
        };

        ctrl.findSupplierByCodename = function(tree, codename) {
            var res = null;
            $.each(tree, function(key, elem) {
                if (elem.codename === codename) {
                    res = elem;
                    return false;
                }
            });
            if (res !== null) return res;
            else {
                $.each(tree, function(key, sup) {
                    res = ctrl.findSupplierByCodename(sup.suppliers, codename);
                    if (res !== null) return false;
                });
                return res;
            }
        };

        ctrl.isShippingIncoming = function(s) {
            if (ctrl.currentSupplier.codename === s.connectionTargetId) return true;
            return false;
        };

        ctrl.isOrderIncoming = function(o) {
            if (ctrl.currentSupplier.codename === o.connectionTargetId) return true;
            return false;
        };

        ctrl.getOther = function(s) {
            if (ctrl.currentSupplier.codename === s.connectionTargetId) return s.connectionSourceId;
            return s.connectionTargetId;
        };

        ctrl.isObjectEmpty = function(m) {
            for (var prop in m) {
                return false;
            }
            return true;
        };

        ctrl.msgs = ['Initial Message 1', 'Initial Message 2'];

        ctrl.injectMessage = function(msg) {
            // inject message here
            $log.info('Received message');
            $log.info(msg.data);

            var newCurDateBroken = null;

            for (var i=0; i<msg.data.orders.length; i++) {
                var curOrder = supplierService.addOrder(msg.data.orders[i]);
                newCurDateBroken = curOrder.dateBroken;
                for (var j=0; j<ctrl.suppliersArray.length; j++) {
                    ctrl.suppliersArray[j].addOrder(curOrder);
                }
            }
            for (i=0; i<msg.data.shippings.length; i++) {
                var curShipping = supplierService.addShipping(msg.data.shippings[i]);
                newCurDateBroken = curShipping.dateBroken;
                for (j=0; j<ctrl.suppliersArray.length; j++) {
                    ctrl.suppliersArray[j].addShipping(curShipping);
                }
            }

            if (newCurDateBroken) {
                supplierService.setCurDateString(newCurDateBroken.date);
            }

            for (var prop in msg.data.dueParts) {
                var supplier = ctrl.findSupplierByCodename(ctrl.supTree, prop);
                if (supplier !== null) {
                    var value = msg.data.dueParts[prop];
                    $log.info('Due parts for ' + supplier.name + ': ' + value);
                    var metric = supplier.metrics["Parts Due"];
                    if (metric) {
                        var oldStatus = metric.status;
                        metric.value = value;
                        var newStatus = metric.calcAndSetStatus();
                        if (oldStatus === 0 && newStatus !== 0) {
                            supplier.hasIssues = true;
                            var title = supplier.name + ' has an issue!';
                            var message = 'Metric ' + metric.name + ' is out of bounds';
                            notifier.notifyMetric(message, title, supplier);
                        } else if (oldStatus !== 0 && newStatus === 0) {
                            supplier.updateHasIssues();
                            var title = supplier.name + ' issue resolved!';
                            var message = 'Metric ' + metric.name + ' is now within bounds';
                            notifier.notifyMetric(message, title, supplier);
                        }
                    }
                } else {
                    $log.info('Couldn\'t find supplier with codename ' + prop);
                }
            }

            if (ctrl.msgs.length === 10) ctrl.msgs.shift();
            ctrl.msgs.push(msg.data.currentDate);
        };

        ctrl.switchToView = function(view) {
            if (ctrl.currentView !== view) {
                ctrl.currentView = view;
            }
            $scope.snapper.close();
        };

        ctrl.dashboardHost = params.dashboard;

        $document.on('deviceready', function() {
            $document.on("backbutton", function() {
                $scope.$applyAsync(function () {
                    ctrl.back();
                });
            });
            if (typeof cordova !== 'undefined') {
                $log.info('Initializing contacts');
                supplierService.getContacts(function(){});
                $log.info('Enabling background mode ...');
                if (typeof cordova.plugins.backgroundMode === 'undefined') {
                    $log.info('Didn\'t find backgroundMode plugin');
                } else {
                    //cordova.plugins.backgroundMode.enable();
                    //cordova.plugins.backgroundMode.configure({
                    //    silent: true
                    //});
                }
                if (typeof cordova.plugins.notification !== 'undefined'){
                    $log.info('Adding notification listener');
                    cordova.plugins.notification.local.on('click', function (notification) {
                        $log.debug('User tapped a notification');
                        $log.debug(notification);
                        var parsedData = JSON.parse(notification.data);
                        try {
                            var newSupplier = ctrl.findSupplierByCodename(ctrl.supTree, parsedData.supplierCodename);
                            if (newSupplier !== null) $scope.$apply(function() { ctrl.currentSupplier = newSupplier; });
                        } catch (error) {
                            $log.error(error);
                            $log.error('Couldn\'t set new supplier, expected data object with currentSupplier property, got:');
                            $log.error(parsedData);
                        }
                    });
                    //$log.info('Adding notification trigger listener');
                    //cordova.plugins.notification.local.on('trigger', function (notification) {
                    //    $log.debug('Received trigger event: ');
                    //    $log.debug(notification);
                    //});
                }
                $log.info('Background mode enabled');
            }
            $('body').prepend('<iframe src="' + ctrl.dashboardHost + '/deliveryStream" frameborder="0" style="display:none"></iframe>');
        });

        $window.addEventListener('message', function(e) {
            $timeout(function() { ctrl.injectMessage(e); }, 0);
        }, false);

        $window.addEventListener("offline", function(e) {
            $log.info("Went offline:");
            $log.info(e);
        }, false);
        $window.addEventListener("online", function(e) {
            $log.info("Went online:");
            $log.info(e);
        }, false);
        $window.addEventListener("load", function(e) {
            if (navigator.onLine) {
                $log.info("Application started in online mode");
                // do whatever is necessary
            } else {
                $log.info("Application started in offline mode");
                // adapt to the fact that there is no internet connection
            }
        }, false);

        $document.ready(function(){
            // if it's running in the browser load delivery stream iframe here
            if (typeof cordova === 'undefined') {
                $('body').prepend('<iframe src="' + ctrl.dashboardHost + '/deliveryStream" frameborder="0" style="display:none"></iframe>');
            }
        });
    }]);

    /////////////////////////////////////
    // Directives
    /////////////////////////////////////

    app.directive("supplierItem", function(){
        return {
            restrict: "E",
            templateUrl: "supplier.html"
//            controller: function(){
//                this.supplier = {
//                    name: "Mihajlo Pupin Institute",
//                    address: "Volgina 15, Belgrade, Serbia"
//                };
//            },
//            controllerAs: "suppliers"
        };
    });

    app.directive("suppliersTree", function(){
        return {
            restrict: "E",
            templateUrl: "suppliers-tree.html",
            link: function(scope, element) {
                // expand and collapse tree nodes
                // $(element).on('click', '.sup-tree-item', function(){
                //     $(this).siblings('ul').slideToggle();
                // });
            }
        };
    });

    app.directive("mainMenu", function(){
        return {
            restrict: "E",
            templateUrl: "main-menu.html"
        }
    });

    app.directive("messages", function() {
        return {
            restrict: "E",
            templateUrl: "messages.html"
        }
    });

    app.directive("ordersView", function() {
        return {
            restrict: "E",
            templateUrl: "orders-view.html"
        }
    });

    app.directive("shippingsView", function() {
        return {
            restrict: "E",
            templateUrl: "shippings-view.html"
        }
    });

    app.directive("currentSupplier", function(){
        return {
            restrict: "E",
            templateUrl: "current-supplier.html",
            link: function(scope, element) {
                $(element).on('click','.sup-suppliers',function(){
                    $(element).find('.sup-suppliers-items').slideToggle();
                });
                $(element).on('click','.sup-suppliers-items',function(){
                    alert('Pressed');
                    $(this).css({ "display": "none" });
                });
                // $(element).on('click', '.sup-shipping-star', function(){
                //     $(this).find('.glyphicon-star').toggleClass('selected');
                // });
            }
        };
    });

    app.directive("treeDrawer", function($timeout) {
        return function(scope, element) {
            $timeout(function(){
                var settings = {
                    element: element[0],
                    // disable: 'left',
                    tapToClose: true
                };
                scope.snapper = new Snap(settings);
                // scope.snapper.open('right');
            });
        }
    });

    app.directive("supMapSmall", function($timeout) {
        return function(scope, element) {
            $timeout(function() {
                var coordinates = [scope.sups.currentSupplier.latitude,
                    scope.sups.currentSupplier.longitude];
                scope.supMapSmall = L.map('supMapSmall', {
                    zoomControl: false
                }).setView(coordinates, 15);
                L.tileLayer('http://tiles.lyrk.org/ls/{z}/{x}/{y}?apikey=87be57815cf747a58ec5d84d8e64ccfa', {
                    detectRetina: true,
                    maxZoom: 19,
                    reuseTiles: true
                }).addTo(scope.supMapSmall);
                scope.supMapSmallLayer = L.featureGroup();
                scope.supMapSmallLayer.addTo(scope.supMapSmall);
                L.marker(coordinates).addTo(scope.supMapSmall);
                scope.$watch('sups.currentSupplier', function(){
                    var coordinates = [scope.sups.currentSupplier.latitude,
                        scope.sups.currentSupplier.longitude];
                    scope.supMapSmall.setView(coordinates, 15);
                    scope.supMapSmallLayer.clearLayers();
                    L.marker(coordinates).addTo(scope.supMapSmallLayer);
                });
            });
            $(element).closest('.sup-block').find('.sup-block-header').click(function(event) {
                $('#supMapLarge').closest('.sup-map-large-container').toggle();
                scope.supMapLargeLayer.clearLayers();
                var coordinates = [scope.sups.currentSupplier.latitude,
                    scope.sups.currentSupplier.longitude];
                scope.supMapLarge.setView(coordinates, 14);
                var icon = L.MakiMarkers.icon({icon: 'star', color: '#F05D00', size: 'l'});
                L.marker(coordinates, { icon: icon }).addTo(scope.supMapLargeLayer);
                var iconSuppliers = L.MakiMarkers.icon({icon: 'gift', color: '#00AED4', size:'m'});
                $.each(scope.sups.currentSupplier.suppliers, function(index, sup) {
                    var coord = [sup.latitude, sup.longitude];
                    L.marker(coord, {icon: iconSuppliers}).addTo(scope.supMapLargeLayer);
                });
                if (scope.supMapLargeLayer.getLayers().length > 1)
                    scope.supMapLarge.fitBounds(scope.supMapLargeLayer.getBounds());
            });
        }
    });

    app.directive('mapContainer', ['$log', '$animate', function($log, $animate) {
        $log.debug('Link function mapContainer');
        return function(scope, element) {
            // create map
            scope.sups.mapLarge = L.map('mapLarge', {
                zoomControl: false
            }).setView([53.2, 12.3], 15);
            L.tileLayer('http://tiles.lyrk.org/ls/{z}/{x}/{y}?apikey=87be57815cf747a58ec5d84d8e64ccfa', {
                detectRetina: true,
                maxZoom: 19,
                reuseTiles: false
            }).addTo(scope.sups.mapLarge);
            scope.sups.mapLargeLayer = L.featureGroup();
            scope.sups.mapLargeLayer.addTo(scope.sups.mapLarge);
            // center and populate based on the current supplier
            scope.sups.mapLargeLayer.clearLayers();
            var coordinates = [scope.sups.currentSupplier.latitude,
                scope.sups.currentSupplier.longitude];
            scope.sups.mapLarge.setView(coordinates, 14);
            var icon = L.MakiMarkers.icon({icon: 'star', color: '#F05D00', size: 'l'});
            L.marker(coordinates, { icon: icon }).addTo(scope.sups.mapLargeLayer);
            var iconSuppliers = L.MakiMarkers.icon({icon: 'gift', color: '#00AED4', size:'m'});
            $.each(scope.sups.currentSupplier.suppliers, function(index, sup) {
                var coord = [sup.latitude, sup.longitude];
                L.marker(coord, {icon: iconSuppliers}).addTo(scope.sups.mapLargeLayer);
            });
            if (scope.sups.mapLargeLayer.getLayers().length > 1)
                scope.sups.mapLarge.fitBounds(scope.sups.mapLargeLayer.getBounds());
            $log.debug('Map populated and centered');

            $animate.on('enter', element, function(e, phase) {
                $log.debug('Entered animate');
                if (phase === 'start') {
                    $log.debug('Animation start');
                    var map = $('#mapLarge');
                    $log.debug(map.width() + ' x ' + map.height());
                }
                if (phase === 'close') {
                    $log.debug('Animation end');
                    var map = $('#mapLarge');
                    $log.debug(map.width() + ' x ' + map.height());
                }
            });
            element.on('$destroy', function() {
                $log.debug('Destroy called');
                scope.sups.mapLargeLayer.clearLayers();
                scope.sups.mapLarge.remove();
            });
        }
    }]);

    app.directive('supMapLarge', function($timeout) {
        return function(scope, element) {
            $timeout(function() {
                scope.supMapLarge = L.map('supMapLarge', {
                    zoomControl: false
                }).setView([53.2, 12.3], 15);
                L.tileLayer('http://tiles.lyrk.org/ls/{z}/{x}/{y}?apikey=87be57815cf747a58ec5d84d8e64ccfa', {
                    detectRetina: true,
                    maxZoom: 19,
                    reuseTiles: false
                }).addTo(scope.supMapLarge);
                scope.supMapLargeLayer = L.featureGroup();
                scope.supMapLargeLayer.addTo(scope.supMapLarge);
                $(element).closest('.sup-map-large-container').css({
                    display: 'none'
                });
                // TODO: fix this thing with the map
                $(element).closest('.sup-map-large-container').find('.sup-map-large-nav').on('click', function(event) {
                    $(element).closest('.sup-map-large-container').toggle(400, function() {
                        $timeout(function() { scope.supMapLarge.invalidateSize(); });
                    });

                });
            });
        }
    });

    app.directive('searchContacts', function() {
        return {
            restrict: "E",
            templateUrl: "search-contacts.html",
            controller: "SearchContactsController"
        }
    });

    app.animation(".sup-block-content", function() {
        return {
            enter: function(element, done) {
                console.log('Entering');
                var elem = $(element).closest('.sup-block');
                var offset = $(elem).offset().top;
                var height = $(elem).height();
                var winElem = $('#snapContent');
                var winOffset = winElem.offset().top + 3;
                var winHeight = $(window).height();
                var yBump = offset + height - winHeight;
                if (yBump < 0) yBump = 0;
                if (yBump > offset-winOffset) yBump = offset - winOffset;
                var scrollPos = winElem.scrollTop() + yBump;
                console.log('Scrolling to: ' + scrollPos);
                $(element).hide();
                //$(element).css("display", "none");
                $(element).slideDown(400, done);
                winElem.animate({
                    scrollTop: scrollPos
                }, 400);
            },
            leave: function(element, done) {
                console.log('Leaving');
                $(element).slideUp(400, done);
            }
        }
    });

    app.animation(".os-content", function() {
        return {
            enter: function(element, done) {
                console.log('Entering');
                var elem = $(element).closest('.os-block');
                var offset = $(elem).offset().top;
                var height = $(elem).height();
                var winElem = $('#snapContent');
                var winOffset = winElem.offset().top + 3;
                var winHeight = $(window).height();
                var yBump = offset + height - winHeight;
                if (yBump < 0) yBump = 0;
                if (yBump > offset-winOffset) yBump = offset - winOffset;
                var scrollPos = winElem.scrollTop() + yBump;
                console.log('Scrolling to: ' + scrollPos);
                $(element).hide();
                //$(element).css("display", "none");
                $(element).slideDown(400, done);
                winElem.animate({
                    scrollTop: scrollPos
                }, 400);
            },
            leave: function(element, done) {
                console.log('Leaving');
                $(element).slideUp(400, done);
            }
        }
    });
})();

$(document).ready(function (){
    console.log("DOM is ready");
    // var snapper = new Snap({
    //   element: document.getElementById('snapContent')
    // });
    // snapper.open('right');
    $(".sup-list").on("click", ".sup-title", function(){
        $(this).closest(".supplier").find(".sup-details").slideToggle("fast");
    });
});

function btnClicked() {
    //alert("Button clicked!");
    cordova.plugins.notification.local.schedule({
      id: 1,
      title: "Production Jour fixe",
      text: "Duration 1h",
      //icon: "http://icons.com/?cal_id=1",
      data: { meetingId:"123#fg8" }
    });
}
function tst(){
    alert("Test called");
}
