var controllers = angular.module('controllers', []);

controllers.controller("mainCtrl", MainCtrl);

function MainCtrl() {
    this.test = 'I am a test';
    this.bottomContent = 'Press spacebar!!!';
}
