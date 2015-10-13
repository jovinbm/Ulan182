angular.module('app')
    .directive('profilePictureUploader', ['$rootScope', 'globals', '$http', 'Upload', '$interval', function ($rootScope, globals, $http, Upload, $interval) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.selectedFileType = {
                    type: 'image'
                };

                $scope.isUploading = false;
                $scope.uploading = {
                    show: false,
                    percent: 0,
                    status: 'Uploading...'
                };


                function incrementUploadingPercent() {
                    if ($scope.uploading.percent < 100) {
                        $scope.uploading.percent++;
                    }
                }

                var progressIntervalPromise;

                $scope.$watch(function () {
                    return $scope.uploading.percent;
                }, function (newVal, oldVal) {
                    /*user upload progress goes until 80%*/
                    if (newVal == 80) {
                        $scope.uploading.status = 'Processing...';
                        progressIntervalPromise = $interval(incrementUploadingPercent, 1000);
                    }
                });

                $scope.showUploading = function () {
                    $scope.isUploading = true;
                    $scope.uploading.percent = 0;
                    $scope.uploading.status = 'Uploading';
                    $scope.uploading.show = true;
                };

                $scope.hideProgressBars = function () {
                    $scope.isUploading = false;
                    $scope.uploading.show = false;
                    $scope.uploading.status = 'Uploading';

                    /*stop the timeout*/
                    if (progressIntervalPromise) {
                        $interval.cancel(progressIntervalPromise)
                    }
                };

                $scope.upload = function (files) {
                    if (files && files.length) {
                        var file = files[0];
                        var fields = {};
                        $scope.showUploading();
                        if ($scope.selectedFileType.type === 'image') {
                            uploadProfilePicture(fields, file);
                        }
                    }
                };

                function uploadProfilePicture(fields, file) {
                    uploadImageToServer(fields, file)
                        .progress(function (evt) {
                            $scope.uploading.percent = parseInt(80.0 * evt.loaded / evt.total);
                        })
                        .success(function (data, status, headers, config) {
                            $rootScope.main.responseStatusHandler(data);
                            $scope.hideProgressBars();
                            //refresh page to reflect updates
                            $rootScope.main.reloadPage();
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.hideProgressBars();
                        });
                }
                function uploadImageToServer(fields, file) {
                    return Upload.upload({
                        url: globals.getLocationHost() + '/api/uploadProfilePicture',
                        fields: fields,
                        file: file
                    });
                }
            }
        }
    }]);