angular.module('app')
    .factory('globals', ['$location', '$http',
        function ($location, $http) {
            var userData = {};

            return {

                userData: function (data) {
                    if (data) {
                        userData = data;
                        return userData;
                    } else {
                        return userData;
                    }
                },

                userDataFromServer: function () {
                    return $http.get('/api/getUserData');
                },

                getLocationHost: function () {
                    if (document.location.hostname.search("africanexponent") !== -1) {
                        return "//www.africanexponent.com";
                    } else if (document.location.hostname.search("amazonaws") !== -1) {
                        return "//ec2-54-85-41-117.compute-1.amazonaws.com:3000";
                    } else {
                        if ($location.port()) {
                            return 'http://localhost' + ":" + $location.port();
                        } else {
                            return 'http://localhost';
                        }
                    }
                }
            };
        }
    ]);