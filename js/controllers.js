var controllers = angular.module('controllers', ['ngAnimate']);

controllers.controller("mainCtrl", MainCtrl);

function MainCtrl($timeout, ngAudio) {
    var timeToReactBeforeMeltDownInSeconds = 2;
    var timeToNextMeltDownInSeconds = 5;
    var startingNumberOfLocks = 10;
    var locks = startingNumberOfLocks;

    var pressureReliefSound = ngAudio.load('pressureRelief');
    var rattleSound = ngAudio.load('rattle');
    var explosionSound = ngAudio.load('explosion');
    var machineSound = ngAudio.load('machineKort');
    machineSound.loop = true;

    var vm = this;
    var lastMeltDown = new Date();
    var meltDownPromise = undefined;
    var unlockPassword="NDgxNTE2MjM0Mg==";

    vm.temperature = 36;
    vm.message = 'Please closely monitor the reactor pressure';

    vm.access = false;
    vm.shakeAccessDenied = false;

    vm.gauge = {
        upperLimit : 100,
        lowerLimit : 0,
        valueUnit : "",
        precision : 2,
        needleColor: '#C50200',
        ranges : [
            {
                min: 0,
                max: 25,
                color: '#DEDEDE'
            },
            {
                min: 25,
                max: 50,
                color: '#8DCA2F'
            },
            {
                min: 50,
                max: 75,
                color: '#FDC702'
            },
            {
                min: 75,
                max: 85,
                color: '#FF7700'
            },
            {
                min: 85,
                max: 100,
                color: '#C50200'
            }
        ]
    };

    function validateAccess() {
        unlockIfValid();
        if (!vm.access) {
            showAccessDenied();
        }
    }

    function showAccessDenied() {
        vm.shakeAccessDenied = true;
        vm.password = "";
        $timeout(function() {vm.shakeAccessDenied = false}, 500);
    }

    function unlockIfValid() {
        if (vm.access) {
            return;
        };
        if (atob(unlockPassword) === stripNonNumeric(vm.password)) {
            vm.access = true;
        };

        if (vm.access) {
            machineSound.play();
            $timeout(changeTemperature, 500);
        }
    }

    function formatPasswordInput() {
        console.log("password=" + vm.password);
        console.log("strip non numeric=" + stripNonNumeric(vm.password));
        console.log("strip non alpha numeric=" + stripNonAlphaNumeric(vm.password));
        var currentPassword = stripNonAlphaNumeric(vm.password);
        if ((stripNonNumeric(vm.password).length > 0)&& (atob(unlockPassword).indexOf(stripNonAlphaNumeric(vm.password)) === 0)) {
            var formattedPassword = '';
            for (var i=0; i<currentPassword.length; i++) {
                formattedPassword = formattedPassword + currentPassword[i];
                if (i+1 == currentPassword.length) break;
                if ((i == 0) || (i == 1)) {
                    formattedPassword = formattedPassword + ' ';
                }
                if ((i > 1) && (i%2==1)) {
                    formattedPassword = formattedPassword + ' ';
                }
            }
            vm.password = formattedPassword;
        }
    }

    function stripNonNumeric(value) {
        return value.replace(/\D/g,'');
    }

    function stripNonAlphaNumeric(value) {
        return value.replace(/\W/g,'');
    }

    function bottomContent() {
        return 'Remaining meltdowns to prevent : ' + locks;
    }

    function gaugeWidth() {
        return Math.round(window.innerHeight * 0.55);
    }

    function gaugePaddingBottom() {
        return Math.round(gaugeWidth() * 0.12);
    }

    function keyUp(event) {
        console.log('keyUp: ' + event.keyCode);
        if (!vm.access) {
            formatPasswordInput();
            unlockIfValid();
            return;
        }
    }

    function keyDown(event) {
        console.log('Pressed key: ' + event.keyCode);
        if (event.keyCode === 13) {
            validateAccess();
            return;
        }

        if (!vm.access) {
            return;
        }

        if (event.keyCode === 32) {
            if (meltDownPromise !== undefined) {
                pressureReliefSound.play();
                rattleSound.stop();
                $timeout.cancel(meltDownPromise);
                lastMeltDown = new Date();
                locks--;
                meltDownPromise = undefined;

                if (locks > 0) {
                    changeTemperature();
                } else {
                    vm.finished = true;
                }
            } else {
                if (locks < 20) {
                    locks++;
                }
            }
        }
    }

    function timeSinceLastMeltDownInSeconds() {
        var now = new Date();
        return (now.getTime() - lastMeltDown.getTime()) / 1000;
    }

    function changeTemperature() {
        if (timeSinceLastMeltDownInSeconds() < timeToNextMeltDownInSeconds) {
            vm.temperature = randomBetween(0, 85);
        } else {
            vm.temperature = randomBetween(0, 100);
        }
        if (!inDanger()) {
            $timeout(changeTemperature, randomBetween(0.5, 2) * 1000 );
        } else {
            meltDownPromise = $timeout(meltDown, timeToReactBeforeMeltDownInSeconds * 1000);
            rattleSound.play();
        }
    }

    function meltDown() {
        machineSound.pause();
        rattleSound.stop();
        explosionSound.play();
        locks = Math.max(startingNumberOfLocks, locks);
        lastMeltDown = new Date();
        vm.meltDown = true;
        $timeout(function () {
            vm.meltDown = false;
            machineSound.play();
        }, 1000);
        changeTemperature();
        meltDownPromise = undefined;
    }

    function randomBetween(min, max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    function inDanger() {
        return vm.temperature >= 85;
    }

    vm.inDanger = inDanger;
    vm.keydown = keyDown;
    vm.keypress = keyUp;
    vm.bottomContent = bottomContent;
    vm.gaugeWidth = gaugeWidth;
    vm.gaugePaddingBottom = gaugePaddingBottom;

}
