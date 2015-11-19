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
    commBrox.factory("msgProvider", ['$document', '$window', '$timeout', 'scmParameters', function($document, $window, $timeout, scmParameters) {

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

        return {
            addCallback: addCallback,
            removeCallback: removeCallback,
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

        return {
            addCallback: addCallback,
            removeCallback: removeCallback,
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