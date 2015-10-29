/**
 * Created by vukm on 10/13/15.
 */


// scm-parameters-{local,hotspot,jpo,eccenca,geoknow}
// scm-notifications-{web,phone}
angular.module("mobile-scm", ['scm-parameters-hotspot', 'scm-notifications-phone', 'ngAnimate'])

.config(['$compileProvider', function($compileProvider){
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|http|tel|sms|ftp|mailto|chrome-extension):/);
    }]);