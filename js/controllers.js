var controllers = angular.module('controllers', []);

controllers.controller("mainCtrl", MainCtrl);

function MainCtrl($timeout) {
    var locks = 10;

    var vm = this;
    var timeToNextMeltDownInSeconds = 5;
    var lastMeltDown = new Date();
    var meltDownPromise = undefined;
    var unlockPassword="NCA4IDE1IDE2IDIzIDQy";

    vm.temperature = 36;
    vm.message = 'Please closely monitor the gauge below!';

    vm.access = false;
    
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
        vm.access = (atob(unlockPassword)===vm.password);
        if (vm.access) {
            $timeout(changeTemperature, 1000);
        }
    }

    function bottomContent() {
        return 'Remaining meltdowns to prevent : ' + locks;
    }

    function keyDown(event) {
        console.log('Pressed key: ' + event.keyCode);
        if (event.keyCode === 32) {
            if (meltDownPromise !== undefined) {
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
        } else if (event.keyCode === 13 && !vm.access) {
            validateAccess();
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
        locks = 10;
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

}
