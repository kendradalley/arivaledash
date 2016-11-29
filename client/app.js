angular.module('MoodTracker', ['ngRoute', 'satellizer', 'mgcrea.ngStrap', 'angularCharts', 'ngSanitize'])
    .config(function($authProvider, $routeProvider) {

        $authProvider.oauth2({
            name: 'google',
            clientId: '990013997360-7s2gf45r4t8hp5tqhdegm02qji0pi7lf.apps.googleusercontent.com',
            url: '/auth/google',
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
            redirectUri: window.location.origin
        });

        $routeProvider.when('/', {
                templateUrl: '../views/home.html',
                controller: 'HomeController'
            })
            .when('/mood', {
                templateUrl: '../views/mood.html',
                controller: 'MoodController'
            })
            .when('/profile', {
                templateUrl: '../views/profile.html',
                controller: 'ProfileController'
            })
            .when('/message', {
                templateUrl: '../views/message.html',
                controller: 'MessageController'
            })
            .when('/grounding', {
                templateUrl: '../views/grounding.html',
            })
            .otherwise({
                redirect: '/'
            });
    });
