/**
 * Created by vukm on 10/22/15.
 */

angular.module('mobile-scm')

    .controller('SearchContactsController', ['$scope', '$log', function($scope, $log) {
        var sups = $scope.sups;
        $scope.phrase = '';
        $scope.contacts = [];
        function populateContactsArray(contactsObject) {
            $scope.$applyAsync(function() {
                $scope.contacts = contactsObject;
            });
        }

        if (typeof cordova !== 'undefined' && typeof navigator.contacts !== 'undefined') {
            $log.debug('Acquiring contacts');
            navigator.contacts.find([/*navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name, */navigator.contacts.fieldType.phoneNumbers],
                populateContactsArray, function() { $log.error('There was an error while acquiring contacts')});
        } else {
            $scope.contacts = [
                {
                    displayName: 'Pera',
                    phoneNumbers: [
                        {
                            type: 'home',
                            value: '063 332-381'
                        }
                    ]
                },
                {
                    displayName: 'Zika',
                    phoneNumbers: [
                        {
                            type: 'home',
                            value: '061 6345-789'
                        },
                        {
                            type: 'work',
                            value: '063/332-381'
                        }
                    ]
                }
            ];
        }

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
    }]);