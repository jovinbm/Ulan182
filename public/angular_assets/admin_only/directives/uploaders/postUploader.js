angular.module('app')
    .directive('postUploader', ['$rootScope', 'globals', '$http', 'Upload', '$interval', function ($rootScope, globals, $http, Upload, $interval) {
        return {

            templateUrl: 'post_uploader.html',
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

                $scope.uploadDirect = function (files) {
                    if (files && files.length) {
                        var file = files[0];
                        var fields = {};
                        if ($scope.selectedFileType.type === 'image') {
                            $scope.showUploading();
                            $http.post('/api/getImagePolicy', {
                                fileNameWithExtension: file.name
                            }).success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                uploadPostImageDirect(fields, file, resp);
                            })
                                .error(function (errResponse) {
                                    $rootScope.main.responseStatusHandler(errResponse);
                                    $scope.hideProgressBars();
                                });
                        } else if ($scope.selectedFileType.type === 'pdf') {
                            $scope.showUploading();
                            $http.post('/api/getPdfPolicy', {
                                fileNameWithExtension: file.name
                            }).success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                uploadPdfDirect(fields, file, resp);
                            })
                                .error(function (errResponse) {
                                    $rootScope.main.responseStatusHandler(errResponse);
                                    $scope.hideProgressBars();
                                });
                        } else if ($scope.selectedFileType.type === 'zip') {
                            $scope.showUploading();
                            $http.post('/api/getZipPolicy', {
                                fileNameWithExtension: file.name
                            }).success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                uploadZipDirect(fields, file, resp);
                            })
                                .error(function (errResponse) {
                                    $rootScope.main.responseStatusHandler(errResponse);
                                    $scope.hideProgressBars();
                                });
                        }
                    }
                };

                function uploadPostImageDirect(fields, file, details) {
                    Upload.upload({
                        url: details.s3BucketUrl,
                        method: 'POST',
                        fields: {
                            key: details.key,
                            AWSAccessKeyId: 'AKIAJ3ODSBXFCLG7A6UA',
                            acl: 'public-read',
                            policy: details.policy,
                            signature: details.signature,
                            "Content-Type": file.type != '' ? file.type : 'application/octet-stream',
                            filename: file.name
                        },
                        file: file
                    }).progress(function (evt) {
                        $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                    })
                        .success(function (data, status, headers, config) {
                            $rootScope.main.responseStatusHandler(data);
                            $rootScope.main.showToast('success', 'File successfully uploaded');
                            $scope.postModel.postUploads.push({
                                type: 'image',
                                data: {
                                    originalname: file.name,
                                    amazonS3Url: details.completePath
                                }
                            });
                            $scope.hideProgressBars();
                        })
                        .error(function (errResponse) {
                            $rootScope.main.showToast('warning', 'There was a problem uploading file. Please ensure that the file format is valid, and the file does not exceed the maximum allowed size');
                            console.log(errResponse);
                            $scope.hideProgressBars();
                        });
                }
                function uploadPdfDirect(fields, file, details) {
                    Upload.upload({
                        url: details.s3BucketUrl,
                        method: 'POST',
                        fields: {
                            key: details.key,
                            AWSAccessKeyId: 'AKIAJ3ODSBXFCLG7A6UA',
                            acl: 'public-read',
                            policy: details.policy,
                            signature: details.signature,
                            "Content-Type": file.type != '' ? file.type : 'application/octet-stream',
                            filename: file.name
                        },
                        file: file
                    }).progress(function (evt) {
                        $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                    })
                        .success(function (data, status, headers, config) {
                            $rootScope.main.responseStatusHandler(data);
                            $rootScope.main.showToast('success', 'File successfully uploaded');
                            $scope.postModel.postUploads.push({
                                type: 'pdf',
                                data: {
                                    originalname: file.name,
                                    amazonS3Url: details.completePath
                                }
                            });
                            $scope.hideProgressBars();
                        })
                        .error(function (errResponse) {
                            $rootScope.main.showToast('warning', 'There was a problem uploading file. Please ensure that the file format is valid, and the file does not exceed the maximum allowed size');
                            console.log(errResponse);
                            $scope.hideProgressBars();
                        });
                }
                function uploadZipDirect(fields, file, details) {
                    Upload.upload({
                        url: details.s3BucketUrl,
                        method: 'POST',
                        fields: {
                            key: details.key,
                            AWSAccessKeyId: 'AKIAJ3ODSBXFCLG7A6UA',
                            acl: 'public-read',
                            policy: details.policy,
                            signature: details.signature,
                            "Content-Type": file.type != '' ? file.type : 'application/octet-stream',
                            filename: file.name
                        },
                        file: file
                    }).progress(function (evt) {
                        $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                    })
                        .success(function (data, status, headers, config) {
                            $rootScope.main.responseStatusHandler(data);
                            $rootScope.main.showToast('success', 'File successfully uploaded');
                            $scope.postModel.postUploads.push({
                                type: 'zip',
                                data: {
                                    originalname: file.name,
                                    amazonS3Url: details.completePath
                                }
                            });
                            $scope.hideProgressBars();
                        })
                        .error(function (errResponse) {
                            $rootScope.main.showToast('warning', 'There was a problem uploading file. Please ensure that the file format is valid, and the file does not exceed the maximum allowed size');
                            console.log(errResponse);
                            $scope.hideProgressBars();
                        });
                }
                $scope.upload = function (files) {
                    if (files && files.length) {
                        var file = files[0];
                        var fields = {};
                        $scope.showUploading();
                        if ($scope.selectedFileType.type === 'image') {
                            uploadPostImage(fields, file);
                        } else if ($scope.selectedFileType.type === 'pdf') {
                            uploadPdf(fields, file);
                        } else if ($scope.selectedFileType.type === 'zip') {
                            uploadZip(fields, file);
                        }
                    }
                };

                function uploadPostImage(fields, file) {
                    uploadPostImageToServer(fields, file)
                        .progress(function (evt) {
                            $scope.uploading.percent = parseInt(80.0 * evt.loaded / evt.total);
                        })
                        .success(function (data, status, headers, config) {
                            $rootScope.main.responseStatusHandler(data);
                            $scope.postModel.postUploads.push({
                                type: 'image',
                                data: data.fileData
                            });
                            $scope.hideProgressBars();
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.hideProgressBars();
                        });
                }
                function uploadPostImageToServer(fields, file) {
                    return Upload.upload({
                        url: globals.getLocationHost() + '/api/uploadPostImage',
                        fields: fields,
                        file: file
                    });
                }
            }
        }
    }]);