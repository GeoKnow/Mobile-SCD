/**
 * Created by vukm on 11/20/15.
 */
angular.module('mobile-scm').controller('ContactsFromUriController', ['$scope', '$log', 'supplierService', function($scope, $log, supplierService) {
    var sups = $scope.sups;
    var frame = {
        "@context": {
            "vcard": "http://www.w3.org/2006/vcard/ns#",
            "ns": "http://geoknow.imp.bg.ac.rs/people/"
        },
        //"vcard:hasTelephone": {},
        "@id": "ns:Vuk"
    };
    $scope.isLoading = true;
    $scope.contacts = [];
    $scope.message = null;

    $scope.addNumber = function(number) {
        // add number
        var ind = false;
        if (typeof navigator.notification !== 'undefined') {
            navigator.notification.confirm('Add number to supplier ' + $scope.sups.currentSupplier.name, function(buttonIndex) {
                // OK button has index 1 (it is the first, indexing starts from 1)
                if (buttonIndex > 1) return;
                // if the user pressed OK add number
                $scope.$applyAsync(function() {
                    sups.currentSupplier.addNumber(number.value, number.type);
                });
            });
        } else {
            if (confirm('Add number to supplier ' + $scope.sups.currentSupplier.name)) {
                sups.currentSupplier.addNumber(number.value, number.type);
            }
        }
    };

    $.getJSON("http://geoknow.imp.bg.ac.rs/chevu/geoknow/mobile-scm/contact.json", {}, function(data, status) {
        // create contacts array out of data object
        jsonld.frame(data, frame, function(err, framed) {
            if (err) {
                $scope.$applyAsync(function() {
                    $scope.isLoading = false;
                    $scope.message = "Error occurred: " + err;
                });
            } else if (framed) {
                var framedContacts = framed["@graph"];
                var newContacts = [];
                for (var i=0; i<framedContacts.length; i++) {
                    var framedContact = framedContacts[i];
                    var newContact = {
                        displayName: framedContact["vcard:fn"],
                        phoneNumbers: []
                    };
                    newContacts.push(newContact);
                    var phones = framedContact["vcard:hasTelephone"];
                    if (!phones.length) newContact.phoneNumbers.push({
                        type: "Other",
                        value: phones.substring(4)
                    }); else for (var j=0; j<phones.length; j++) {
                        newContact.phoneNumbers.push({
                            type: "Other",
                            value: phones[j].substring(4)
                        });
                    }
                }
                $scope.$applyAsync(function() {
                    $scope.isLoading = false;
                    $scope.message = null;
                    if (newContacts.length === 0) $scope.message = "No contacts found";
                    $scope.contacts = newContacts;
                });
            }
        });
        $scope.contacts = data;
    }).fail(function(status, err) {
        $scope.$applyAsync(function() {
            $scope.isLoading = false;
            $scope.contacts = [];
            $scope.message = "Error occurred: " + err;
        });
    });
}]);