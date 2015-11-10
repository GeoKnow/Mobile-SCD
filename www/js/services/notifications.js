/**
 * Created by vukm on 10/8/15.
 */

angular.module('scm-notifications-web', [])
    .factory('scmNotifier', function() {
        return {
            notifyMetric: function (message, title) {
                alert(title + '\n' + message);
            },
            notifyGlobal: function (message) {
                alert(message);
            }
        }
    });

angular.module('scm-notifications-phone', [])
    .factory('scmNotifier', ['$log', function($log) {
        function isPluginPresent() {
            if (typeof cordova === 'undefined') return false;
            else if (typeof cordova.plugins.notification === "undefined") return false;
            return true;
        }
        return {
            notifyMetric: function (message, title, supplier) {
                if (!isPluginPresent()) {
                    $log.error('Notification plugin is not present');
                    return;
                }
                cordova.plugins.notification.local.schedule({
                    id: 1,
                    title: title,
                    text: message,
                    //message: message,
                    //icon: "http://icons.com/?cal_id=1",
                    data: { supplierCodename: supplier.codename }
                });
            },
            notifyGlobal: function(message, title) {
                if (!isPluginPresent()) {
                    $log.error('Notification plugin is not present');
                    return;
                }
                cordova.plugins.notification.local.schedule({
                    id: 2,
                    title: title,
                    text: message,
                    //message: message,
                    data: {}
                });
            }
        }
    }]);
