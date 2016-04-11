var controllers = angular.module('controllers', []);

controllers.controller("mainCtrl", MainCtrl);

function MainCtrl() {
    var locks = 10;

    this.test = 'I am a test';
    this.bottomContent = 'Remaining locks : ' + locks;

}
