module.exports = function (app) {

    var fileName = 'app.locals.js';
    var Promise = require('bluebird');
    var uString = require("underscore.string");
    var rq = require('./rq.js');

    var errorLogger = function (module, text, err) {
        return rq.errorLogger(module, fileName, text, err);
    };

    app.locals.env = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';  //defaults to production environment

    app.locals.trimString = function (string, leftEnd, rightEnd) {
        var temp = string;

        if (leftEnd) {
            temp = uString.strRight(temp, leftEnd);
        }

        if (rightEnd) {
            temp = uString.strLeft(temp, rightEnd);
        }

        return temp;

    };

    app.locals.getFirstWord = function (string) {
        if (string) {
            if (typeof string == 'string') {
                return uString.words(string)[0];
            }
        }

        rq.showErrorStack(new Error(errorLogger('app.locals.getFirstWord', 'Called with invalid string, string = ' + string)));
        return '';
    };

    app.locals.getFullName = function (user) {
        return app.locals.capitalizeFirstLetter(user.firstName) + ' ' + app.locals.capitalizeFirstLetter(user.lastName);
    };

    app.locals.getUserPrivateProfileUrl = function (user, username) {
        if (user) {
            return '/pr/profile/' + user.username;
        } else {
            if (username) {
                return '/pr/profile/' + username;
            } else {
                return undefined;
            }
        }
    };

    app.locals.getUserPublicProfileUrl = function (user, username) {
        if (user) {
            return '/profile/' + user.username;
        } else {
            if (username) {
                return '/profile/' + username;
            } else {
                return undefined;
            }
        }
    };

    app.locals.getImageUrlFromKey = function (key) {
        //the key must have no initial slash
        var domain = 'http://www.pluschat.net/';
        return domain + key;
    };

    app.locals.getResizedImageUrlFromKey = function (key, height) {
        //the key must have no initial slash
        var domain = 'http://www.pluschat.net/';
        var keyWithoutExt = key.substr(0, key.lastIndexOf('.'));
        var ext = key.substr(key.lastIndexOf('.') + 1);

        switch (height) {
            case 80:
                return domain + keyWithoutExt + '80' + '.' + ext;
                break;
            case 200:
                return domain + keyWithoutExt + '200' + '.' + ext;
                break;
            case 400:
                return domain + keyWithoutExt + '400' + '.' + ext;
                break;
            default:
                return domain + key;
        }
    };

    app.locals.getResizedProfilePictureKey = function (key, height) {
        //the key must have no initial slash
        var domain = 'http://www.pluschat.net/';

        if (!key || key.length == 0) {
            //return the default profile picture url
            return domain + 'public/imgsmin/default_avatar/default_avatar_red_462_462.png'
        } else {
            var keyWithoutExt = key.substr(0, key.lastIndexOf('.'));
            var ext = key.substr(key.lastIndexOf('.') + 1);

            switch (height) {
                case 80:
                    return domain + keyWithoutExt + '80' + '.' + ext;
                    break;
                case 200:
                    return domain + keyWithoutExt + '200' + '.' + ext;
                    break;
                case 400:
                    return domain + keyWithoutExt + '400' + '.' + ext;
                    break;
                default:
                    return domain + key;
            }
        }
    };

    app.locals.getRandomNumber = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    app.locals.getHyphenatedUrl = function (post, postCategory) {

        function convertToSlug(Text) {
            return Text
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');
        }

        var text;
        if (post) {
            text = convertToSlug(post.postShortHeading);
            return text + '-' + post.postIndex;
        } else if (postCategory) {
            text = convertToSlug(postCategory.postCategoryName);
            return text + '-' + postCategory.postCategoryUniqueCuid;
        }
    };

    app.locals.getTopicUrl = function (topicName) {
        topicName = topicName.toLowerCase();
        return '/topic/' + topicName;
    };

    app.locals.getPostCategoryNameFromUniqueCuid = function (postCategoryUniqueCuid, postCategoriesArray) {
        var name = false;
        if (postCategoryUniqueCuid && postCategoriesArray && postCategoriesArray.length > 0) {
            postCategoriesArray.forEach(function (category) {
                if (category.postCategoryUniqueCuid == postCategoryUniqueCuid) {
                    name = category.postCategoryName;
                }
            });
            return name;
        } else {
            return null;
        }
    };

    app.locals.getPostCategoryUniqueCuidFromName = function (name, postCategoriesArray) {
        var categoryUniqueCuid = false;
        if (name && postCategoriesArray && postCategoriesArray.length > 0 && typeof name === 'string') {
            postCategoriesArray.forEach(function (category) {
                if (category.postCategoryName.toLowerCase().indexOf(name.toLowerCase()) > -1) {
                    categoryUniqueCuid = category.postCategoryUniqueCuid;
                }
            });
            return categoryUniqueCuid;
        } else {
            return null;
        }
    };


    app.locals.getCategoryPathFromCategoryName = function (categoryName, postCategoriesArray) {

        var foundUniqueCuid = false;
        var catName = categoryName.toLowerCase();

        //check that the url exists first
        postCategoriesArray.every(function (category) {
            var dbCategoryName = category.postCategoryName.toLowerCase();
            if (dbCategoryName.indexOf(catName) > -1) {
                foundUniqueCuid = category.postCategoryUniqueCuid;
                return false;
            } else {
                return true;
            }
        });

        if (foundUniqueCuid) {
            return '/category/' + uString.words(catName)[0];  //get the first word for categories like culture & life
        } else {
            //return home for not found category
            return null;
        }

    };

    app.locals.getCategoryPathFromCategoryUniqueCuid = function (postCategoryUniqueCuid, postCategoriesArray) {

        //get the category name
        var categoryName = false;
        if (postCategoryUniqueCuid && postCategoriesArray && postCategoriesArray.length > 0) {
            postCategoriesArray.forEach(function (category) {
                if (category.postCategoryUniqueCuid == postCategoryUniqueCuid) {
                    categoryName = category.postCategoryName;
                }
            });

            //now get the path
            var foundUniqueCuid = false;

            if (categoryName && postCategoriesArray) {

                var catName = categoryName.toLowerCase();

                //check that the url exists first
                postCategoriesArray.every(function (category) {
                    var dbCategoryName = category.postCategoryName.toLowerCase();
                    if (dbCategoryName.indexOf(catName) > -1) {
                        foundUniqueCuid = category.postCategoryUniqueCuid;
                        return false;
                    } else {
                        return true;
                    }
                });

                if (foundUniqueCuid) {
                    return '/category/' + uString.words(catName)[0];  //get the first word for categories like culture & life
                } else {
                    //return home for not found category
                    return '/';
                }
            } else {
                return null;
            }

        } else {
            return null;
        }
    };


    app.locals.getPostIndexFromHyphenatedUrl = function (url) {
        if (url) {
            //this will return NaN if no number is found at the end which is false
            return parseInt(url.substr(url.lastIndexOf('-') + 1));
        } else {
            return false;
        }
    };


    /*takes a category name and checks if it's the one active*/
    app.locals.checkActiveNavigationCategory = function (name, postCategoryName) {
        if (name) {
            if (postCategoryName.toLowerCase().indexOf(name.toLowerCase()) > -1) {
                return 'active';
            } else {
                return '';
            }
        } else {
            return '';
        }
    };

    app.locals.getMiniTopicFromTags = function (preparedPostTags) {
        if (preparedPostTags) {
            if (preparedPostTags.length > 0) {
                return app.locals.capitalizeFirstLetter(preparedPostTags[0].text.toLowerCase());
            } else {
                /*no tags*/
                return 'News';
            }
        } else {
            return 'News';
        }
    };

    app.locals.capitalizeFirstLetter = function (text) {
        if (text && typeof text === 'string') {
            return text.charAt(0).toUpperCase() + text.slice(1);
        } else {
            return text;
        }
    };

    app.locals.getMetaUrl = function (localUrlWithSlash) {
        if (process.env.NODE_ENV === 'production') {
            return 'http://www.pluschat.net/' + localUrlWithSlash;
        } else {
            return 'http://localhost:7000' + localUrlWithSlash;
        }
    };

    app.locals.getAssetUrl = function (localUrlWithSlash) {
        if (process.env.NODE_ENV === 'production') {
            return 'http://www.pluschat.net/' + localUrlWithSlash;
        } else {
            return localUrlWithSlash;
        }
    };

    app.locals.sortArrayOfObjects = function (field, reverse, primer) {
        //for info stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects

        var key = primer ?
            function (x) {
                return primer(x[field])
            } :
            function (x) {
                return x[field]
            };

        reverse = !reverse ? 1 : -1;

        return function (a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
    };

    app.locals.sortPostsIntoCategories = function (postsArray, callback) {
        //returns an object with keys being the postCategoryUniqueCuids and values being arrays of posts in that category
        var obj = {};

        postsArray.forEach(function (post, index) {
            if (obj.hasOwnProperty(post.postCategoryUniqueCuid)) {
                if (obj[post.postCategoryUniqueCuid]) {
                    obj[post.postCategoryUniqueCuid].push(post);
                } else {
                    obj[post.postCategoryUniqueCuid] = [];
                    obj[post.postCategoryUniqueCuid].push(post);
                }
            } else {
                obj[post.postCategoryUniqueCuid] = [];
                obj[post.postCategoryUniqueCuid].push(post);
            }
        });

        callback(obj);
    };

    app.locals.shuffleArrayElements = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    };

    app.locals.shuffleObjectProperties = function (obj) {  // this function has to go below the shuffleArrayElements function
        var arr = app.locals.shuffleArrayElements(Object.keys(obj));
        var temp = {};
        arr.forEach(function (prop) {
            temp[prop] = obj[prop];
        });
        return temp;
    };

};