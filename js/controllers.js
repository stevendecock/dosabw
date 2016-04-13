var controllers = angular.module('controllers', []);

controllers.controller("mainCtrl", MainCtrl);

function MainCtrl($timeout, ngAudio) {
    var startingNumberOfLocks = 10;
    var locks = startingNumberOfLocks;

    var pressureReliefSound = ngAudio.load('pressureRelief');
    var vm = this;
    var timeToNextMeltDownInSeconds = 5;
    var lastMeltDown = new Date();
    var meltDownPromise = undefined;
    var unlockPassword="NCA4IDE1IDE2IDIzIDQy";

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
        if (vm.access) {
            return;
        }
            vm.access = (atob(unlockPassword) === vm.password);
            if (vm.access) {
                $timeout(changeTemperature, 500);
            } else {
                vm.shakeAccessDenied = true;
                vm.password = "";
                $timeout(function() {vm.shakeAccessDenied = false}, 500);
            }

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

    function keyDown(event) {
        if (event.keyCode === 13) {
            validateAccess();
            return;
        }
        if (!vm.access) {
            return;
        }
        console.log('Pressed key: ' + event.keyCode);
        if (event.keyCode === 32) {
            if (meltDownPromise !== undefined) {
                pressureReliefSound.play();
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
            meltDownPromise = $timeout(meltDown, 2000);
        }
    }

    function meltDown() {
        locks = Math.max(startingNumberOfLocks, locks);
        lastMeltDown = new Date();
        vm.meltDown = true;
        $timeout(function () {vm.meltDown = false}, 3000);
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
    vm.bottomContent = bottomContent;
    vm.gaugeWidth = gaugeWidth;
    vm.gaugePaddingBottom = gaugePaddingBottom;

}
