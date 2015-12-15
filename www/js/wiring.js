/**
 * Created by vukm on 10/13/15.
 */


// scm-parameters-{local,hotspot,hotspot2,jpo,eccenca,geoknow}
// scm-notifications-{web,phone}
// scm-comm-{sim,brox}

var parametersModule = 'scm-parameters-local';
var notificationsModule = 'scm-notifications-phone';
var messagingModule = 'scm-comm-sim';

angular.module("scm-comm-brox", [parametersModule]);
angular.module("scm-comm-sim", []);
angular.module("mobile-scm", [parametersModule, notificationsModule, messagingModule, 'ngAnimate'])

.config(['$compileProvider', function($compileProvider){
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|http|tel|sms|ftp|mailto|chrome-extension):/);
    }]);