(function(){
    var app = angular.module("mobile-scm", []);

    /////////////////////////////////////
    // Controllers
    /////////////////////////////////////
    app.controller("SuppliersController", ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
        var ctrl = this;

        ctrl.supTree = [];
        ctrl.virtualSupplier = {
            parent: null,
            name: "Supply Chain Network",
            suppliers: []
        };
        ctrl.currentSupplier = ctrl.virtualSupplier;


        ctrl.curSup = null;
        ctrl.curLevel = -1;
        ctrl.suppliers = [];
        ctrl.topSuppliers = [];
        ctrl.currentSuppliers = [];
        ctrl.defaultGraph = "http://mobile-scm/dump/";
        ctrl.defaultGraphParam = "default-graph-uri";
        ctrl.defaultEndpoint = "http://jpo.imp.bg.ac.rs/sparql";
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
        ctrl.q = "http://jpo.imp.bg.ac.rs/sparql?default-graph-uri=http%3A%2F%2Fmobile-scm%2Fdump%2F&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel%0D%0AWHERE+%7B%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Alat+%3Flat+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Along+%3Flong+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Acity+%3Fcity+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Aname+%3Fname+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+%7D%0D%0A++FILTER+NOT+EXISTS+%7B%0D%0A++++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A++%7D%0D%0A%7D&should-sponge=&format=text%2Fhtml&timeout=0";
        ctrl.q2 = "http://jpo.imp.bg.ac.rs/sparql?default-graph-uri=http%3A%2F%2Fmobile-scm%2Fdump%2F&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel%0D%0AWHERE+%7B%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Alat+%3Flat+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+geo%3Along+%3Flong+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Acity+%3Fcity+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Aname+%3Fname+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+%7D%0D%0A++OPTIONAL+%7B+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+%7D%0D%0A++FILTER+NOT+EXISTS+%7B%0D%0A++++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A++%7D%0D%0A%7D&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on";

        ctrl.qShowSupplier = function(supplier) {
            return "http://jpo.imp.bg.ac.rs/sparql?default-graph-uri=http%3A%2F%2Fmobile-scm%2Fdump%2F&query=PREFIX+xmo%3A+%3Chttp%3A%2F%2Fwww.xybermotive.com%2Fontology%2F%3E+%0D%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E+%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23l%3E+%0D%0A%0D%0ASELECT+DISTINCT+%3Fsupplier+%3Flat+%3Flong+%3Fcity+%3Fname+%3Fstreet+%3Fzip+%3Flabel+%0D%0AWHERE+{+%0D%0A++%3Fsupplier+a+xmo%3ASupplier+.+%0D%0A++OPTIONAL+{+%3Fsupplier+geo%3Alat+%3Flat+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+geo%3Along+%3Flong+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Acity+%3Fcity+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Aname+%3Fname+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Astreet+%3Fstreet+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+xmo%3Azipcode+%3Fzip+.+}+%0D%0A++OPTIONAL+{+%3Fsupplier+rdfs%3Alabel+%3Flabel+.+}+%0D%0A++%3Fconn+xmo%3Areceiver+%3C" +
                    encodeURIComponent(supplier.uri) +
                    "%3E+.+%0D%0A++%3Fconn+xmo%3Asender+%3Fsupplier+.%0D%0A}&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on";
        }

        ctrl.getSuppliers = function(){
            var req = {
                responseType: "json",
                params: "{ \
                    query: " + encodeURIComponent(ctrl.topLevelQuery) + ",\
                    default-graph-uri: " + encodeURIComponent(ctrl.defaultGraph) + ",\
                    callback: JSON_CALLBACK\
                }"
            };
            $http.get(ctrl.q2).success(function(data){
                var results = data.results.bindings;
                ctrl.curSup = null;
                ctrl.curLevel = -1;
                ctrl.suppliers = [];
                ctrl.topSuppliers = [];
                ctrl.currentSuppliers = [];
                for (var s in results) {
                    var supplier = {};
                    supplier.latitude = results[s].lat.value;
                    supplier.longitude = results[s].long.value;
                    supplier.city = results[s].city.value;
                    supplier.name = results[s].name.value;
                    supplier.street = results[s].street.value;
                    supplier.zipcode = results[s].zip.value;
                    supplier.uri = results[s].supplier.value;
                    supplier.suppliers = [];
                    ctrl.topSuppliers.push(supplier);
                }
                ctrl.curLevel = 0;
                ctrl.suppliers.push(ctrl.topSuppliers);
                ctrl.currentSuppliers = ctrl.topSuppliers;
                return ctrl.topSuppliers;
            }).error(function(data){
                alert("Error: " + data);
                return null;
            });
        };

        ctrl.doWork = function(sup) {
            $http.get(ctrl.qShowSupplier(sup)).success(function(data){
                    var results = data.results.bindings;
                    var supList = [];
                    for (var s in results) {
                        var supplier = {};
                        supplier.latitude = results[s].lat.value;
                        supplier.longitude = results[s].long.value;
                        supplier.city = results[s].city.value;
                        supplier.name = results[s].name.value;
                        supplier.street = results[s].street.value;
                        supplier.zipcode = results[s].zip.value;
                        supplier.uri = results[s].supplier.value;
                        supplier.suppliers = [];
                        supplier.parent = sup;
                        supList.push(supplier);
                        /*sup.suppliers.push(supplier);*/
                    }
                    $timeout(function(){
//                        alert("Adding to " + sup.name + " " + supList.length + " suppliers");
                        sup.suppliers = supList;
                        if (sup.suppliers !== null && sup.suppliers.length > 0)
                            ctrl.populateTree(sup.suppliers);
                    }, 0);
                    /*if (sup.suppliers !== null && sup.suppliers.length > 0)
                        ctrl.populateTree(sup.suppliers);*/
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
            ctrl.virtualSupplier = {
                parent: null,
                name: "Supply Chain Network",
                suppliers: []
            };
            ctrl.currentSupplier = ctrl.virtualSupplier;
            $http.get(ctrl.q2).success(function(data){
                var results = data.results.bindings;
//                alert("Success: " + JSON.stringify(results));
                var sups = [];
                for (var s in results) {
                    var supplier = {};
                    supplier.latitude = results[s].lat.value;
                    supplier.longitude = results[s].long.value;
                    supplier.city = results[s].city.value;
                    supplier.name = results[s].name.value;
                    supplier.street = results[s].street.value;
                    supplier.zipcode = results[s].zip.value;
                    supplier.uri = results[s].supplier.value;
                    supplier.suppliers = [];
                    supplier.parent = ctrl.virtualSupplier;
                    sups.push(supplier);
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

            /*return ctrl.supTree;*/
        };

        ctrl.showSupplier = function (supplier) {
            $http.get(ctrl.qShowSupplier(supplier)).success(function(data){
                var results = data.results.bindings;
                ctrl.currentSuppliers = [];
                for (var s in results) {
                    var supplier = {};
                    supplier.latitude = results[s].lat.value;
                    supplier.longitude = results[s].long.value;
                    supplier.city = results[s].city.value;
                    supplier.name = results[s].name.value;
                    supplier.street = results[s].street.value;
                    supplier.zipcode = results[s].zip.value;
                    supplier.uri = results[s].supplier.value;
                    supplier.suppliers = [];
                    ctrl.currentSuppliers.push(supplier);
                }
                ctrl.suppliers.push(ctrl.currentSuppliers);
                ctrl.curLevel++;
                ctrl.curSup = supplier;
                return ctrl.currentSuppliers;
            }).error(function(data){
                alert("Error: " + data);
                return null;
            });
        };

        ctrl.selectSupplier = function(sup) {
            $('.sup-suppliers-items').css({ "display": "none" });
            ctrl.currentSupplier = sup;
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
        }
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
                $(element).on('click', '.sup-tree-item', function(){
                    $(this).siblings('ul').slideToggle();
                });
            }
        };
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
            }
        };
    });

    app.directive("treeDrawer", function($timeout) {
        return function(scope, element) {
            $timeout(function(){
                var settings = {
                    element: element[0],
                    disable: 'left',
                    tapToClose: true
                };
                scope.snapper = new Snap(settings);
                // scope.snapper.open('right');
            });
        }
    })
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
    };
    function tst(){
        alert("Test called");
    };
