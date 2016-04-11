var controllers = angular.module('controllers', []);

controllers.controller("mainCtrl", MainCtrl);

function MainCtrl($timeout) {
    var locks = 10;

    var vm = this;

    vm.temperature = 36;
    vm.message = 'Please closely monitor the gauge below!';
    vm.bottomContent = 'Remaining meltdowns to prevent : ' + locks;

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

    function changeTemperature() {
        vm.temperature = randomBetween(0, 100);
        $timeout(changeTemperature, randomBetween(0.5, 2) * 1000 );
    }

    function randomBetween(min, max) {
       return Math.floor(Math.random()*(max-min+1)+min);
    }

    function inDanger() {
        return vm.temperature >= 85;
    }

    vm.inDanger = inDanger;

    $timeout(changeTemperature, 1000);

}
