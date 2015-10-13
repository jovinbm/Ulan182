angular.module('app')
    .filter("validatePostHeading", ['$rootScope', function ($rootScope) {
        return function (postHeading, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.main.showToast(type, text);
                }
            }

            if (postHeading) {
                if (postHeading.length == 0) {
                    errors++;
                    broadcastShowToast('warning', 'The heading is required');
                }
                if (errors == 0) {
                    if (postHeading.length < 10) {
                        broadcastShowToast('warning', 'The minimum required length of the heading is 10 characters');
                        errors++;
                    }
                }
            } else {
                errors++;
                broadcastShowToast('warning', 'The heading is required');
            }
            return errors == 0;
        }
    }])
    .filter("postHeadingMessages", [function () {
        return function (postHeading) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            if (postHeading) {
                var postHeadingText = $("<div>" + postHeading + "</div>").text();

                if (postHeadingText.length == 0) {
                    addMessage('This is a required field');
                }
                if (postHeadingText.length > 0 && postHeadingText.length < 10) {
                    addMessage('Minimum length required is 10 characters');
                }
            } else {
                addMessage('This is a required field');
            }
            return messages;

        }
    }])
    .filter("validatePostShortHeading", ['$rootScope', function ($rootScope) {
        return function (postShortHeading, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.main.showToast(type, text);
                }
            }

            if (postShortHeading) {
                if (postShortHeading.length == 0) {
                    errors++;
                    broadcastShowToast('warning', 'The short heading is required');
                }
                if (errors == 0) {
                    if (postShortHeading.length < 10) {
                        broadcastShowToast('warning', 'The minimum required length of the short heading is 10 characters');
                        errors++;
                    }
                }
                if (errors == 0) {
                    if (postShortHeading.length > 60) {
                        broadcastShowToast('warning', 'The maximum allowed length of the short heading is 60 characters');
                        errors++;
                    }
                }
            } else {
                errors++;
                broadcastShowToast('warning', 'The short heading is required');
            }
            return errors == 0;
        }
    }])
    .filter("postShortHeadingMessages", [function () {
        return function (postShortHeading) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            if (postShortHeading) {
                var postShortHeadingText = $("<div>" + postShortHeading + "</div>").text();

                if (postShortHeadingText.length == 0) {
                    addMessage('The is a required field');
                }
                if (postShortHeadingText.length > 0 && postShortHeadingText.length < 10) {
                    addMessage('Minimum length required is 10 characters');
                }
                if (postShortHeadingText.length > 60) {
                    addMessage('This heading cannot exceed 60 characters');
                }
            } else {
                addMessage('This is a required field');
            }
            return messages;

        }
    }])
    .filter("validatePostContent", ['$rootScope', function ($rootScope) {
        return function (postContent, broadcast) {
            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.main.showToast(type, text);
                }
            }

            if (postContent) {
                var postContentText = $("<div>" + postContent + "</div>").text();
                if (postContentText.length == 0) {
                    broadcastShowToast('warning', 'Please add some text to the post first');
                }
                return postContentText.length > 0;
            } else {
                broadcastShowToast('warning', 'Please add some text to the post first');
                return false;
            }
        }
    }])
    .filter("postContentMessages", [function () {
        return function (postContent) {
            if (postContent) {
                var postContentText = $("<div>" + postContent + "</div>").text();
                if (postContentText.length == 0) {
                    return "This is a required field"
                } else {
                    return "";
                }
            } else {
                return "This is a required field"
            }
        }
    }])
    .filter("validatePostSummary", ['$rootScope', function ($rootScope) {
        return function (postSummary, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.main.showToast(type, text);
                }
            }

            if (postSummary) {
                var postSummaryText = $("<div>" + postSummary + "</div>").text();

                if (postSummaryText.length == 0) {
                    errors++;
                    broadcastShowToast('warning', 'The post summary cannot be empty');
                }
                if (errors == 0) {
                    if (postSummaryText.length > 250) {
                        errors++;
                        broadcastShowToast('warning', 'The post summary cannot exceed 250 characters');
                    }
                }
            } else {
                errors++;
                broadcastShowToast('warning', 'The post summary cannot be empty');
            }
            return errors == 0;
        }
    }])
    .filter("postSummaryMessages", [function () {
        return function (postSummary) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            if (postSummary) {
                var postSummaryText = $("<div>" + postSummary + "</div>").text();

                if (postSummaryText.length == 0) {
                    addMessage('The post summary cannot be empty');
                }
                if (postSummaryText.length > 250) {
                    addMessage('The post summary cannot exceed 250 characters');
                }
            } else {
                addMessage('The post summary cannot be empty');
            }
            return messages;

        }
    }])
    .filter("validatePostTags", ['$rootScope', function ($rootScope) {
        return function (postTags, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.main.showToast(type, text);
                }
            }

            var numberOfTags = 0;

            if (postTags) {
                postTags.forEach(function (tag) {
                    numberOfTags++;
                    if (tag && tag.text) {
                        if (errors == 0) {
                            if (tag.text.length < 3) {
                                errors++;
                                broadcastShowToast('warning', 'Minimum required length for each tag is 3 characters');
                            }
                        }

                        if (errors == 0) {
                            if (tag.text.length > 30) {
                                errors++;
                                broadcastShowToast('warning', 'Maximum allowed length for each tag is 30 characters');
                            }
                        }
                    }
                });

                if (errors == 0) {
                    if (numberOfTags < 1) {
                        errors++;
                        broadcastShowToast('warning', 'Every post should have at least one tag');
                    }
                    if (numberOfTags > 5) {
                        errors++;
                        broadcastShowToast('warning', 'Only a maximum of 5 tags are allowed per post');
                    }
                }
            } else {
                errors++;
                broadcastShowToast('warning', 'Every post should have at least one tag');
            }

            return errors == 0;
        }
    }])
    .filter("postTagsMessages", [function () {
        return function (postTags) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            var numberOfTags = 0;

            if (postTags) {
                postTags.forEach(function (tag) {
                    numberOfTags++;
                    if (tag && tag.text) {
                        if (tag.text.length < 3) {
                            addMessage('Minimum required length for each tag is 3 characters');
                        }

                        if (tag.text.length > 30) {
                            addMessage('Maximum allowed length for each tag is 30 characters');
                        }
                    }
                });

                if (numberOfTags > 5) {
                    addMessage('Only a maximum of 5 tags are allowed per post');
                }
            }

            return messages;
        }
    }]);