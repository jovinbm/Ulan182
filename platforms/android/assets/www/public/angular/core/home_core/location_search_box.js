angular.module('app')
    .directive('locationSearchBox', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attr) {

                $scope.lat = angular.element($element.find('.details input.lat')).val();
                $scope.lng = angular.element($element.find('.details input.lng')).val();
                $scope.formatted_address = angular.element($element.find('.details input.formatted_address')).val();
                /*
                 * auto complete for the input.geoFields
                 * */
                angular.element($element.find('input.geoField')).geocomplete({
                    details: angular.element($element.find('.details'))
                })
                    .bind("geocode:result", function () {
                        $scope.lat = angular.element($element.find('.details input.lat')).val();
                        $scope.lng = angular.element($element.find('.details input.lng')).val();
                        $scope.formatted_address = angular.element($element.find('.details input.formatted_address')).val();

                        $scope.$apply($attr['locationUpdate']);
                    });
            }
        };
    }]);