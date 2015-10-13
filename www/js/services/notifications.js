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
    .factory('scmNotifier', function() {
        return {
            notifyMetric: function (message, title, supplier) {
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
                cordova.plugins.notification.local.schedule({
                    id: 2,
                    title: title,
                    text: message,
                    //message: message,
                    data: {}
                });
            }
        }
    });
