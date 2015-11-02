/**
 * Created by vukm on 10/13/15.
 */


// scm-parameters-{local,hotspot,hotspot2,jpo,eccenca,geoknow}
// scm-notifications-{web,phone}
angular.module("mobile-scm", ['scm-parameters-local', 'scm-notifications-phone', 'ngAnimate'])

.config(['$compileProvider', function($compileProvider){
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|http|tel|sms|ftp|mailto|chrome-extension):/);
    }]);