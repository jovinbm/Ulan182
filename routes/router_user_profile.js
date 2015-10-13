var fileName = 'router_user_profile.js';

var Promise = require('bluebird');
var rq = require('../rq.js');

var receivedLogger = function (module) {
    return rq.receivedLogger(module, fileName);
};

var successLogger = function (module, text) {
    return rq.successLogger(module, fileName, text);
};

var errorLogger = function (module, text, err) {
    return rq.errorLogger(module, fileName, text, err);
};

function defaultMainObject(req, res) {

    return {
        title: 'The African Exponent - News and Articles Related to Africa',
        meta_description: '',
        theUser: req.user,
        state: '',
        partial: false,
        accountStatusBanner: rq.functions().account.returnAccountStatusBanner(req.user),
        postCategoryName: '',
        foundPostsIndexes: []
    };
}

module.exports = {

    render_user_private_profile_Html: function (req, res) {
        var app = rq.app();
        var module = 'render_user_private_profile_Html';
        receivedLogger(module);

        var main = defaultMainObject(req, res);
        main.title = 'User - The African Exponent'; //changed below after getting the user's data
        main.state = 'user-private-profile';

        main.requestedUsername = req.params.username;
        main.userToDisplay = {};
        main.allPostCategoriesArray = [];
        main.allPostCategories = {};
        main.tabs = [
            'account-overview',
            'edit-details',
            'profile-picture',
            'edit-password',
            'notifications'
        ];

        main.tab = req.query.tab;
        if (!main.tab || main.tabs.indexOf(main.tab) === -1) {
            main.tab = 'account-overview'; //set to default tab if not found
        }


        Promise.resolve()
            .then(function () {
                if (main.requestedUsername) {
                    main.requestedUsername = main.requestedUsername.toString();
                } else {
                    throw {
                        msg: 'We were unable to find the profile of the requested user.',
                        code: 404
                    };
                }
            })
            .then(function () {
                return rq.user_handler().findUserWithUserName(req, res, main.requestedUsername);
            })
            .then(function (obj) {
                if (!obj.theUser) {
                    throw {
                        code: 404,
                        msg: 'We could not find the profile of the user you were looking for.'
                    };
                } else {
                    main.userToDisplay = obj.theUser;
                    main.title = app.locals.getFullName(main.userToDisplay) + ' - The African Exponent';
                    return true;
                }
            })
            .then(function () {
                //check if this user does not own the requested profile, if so, just show the public profile of the requested user
                if (main.theUser.uniqueCuid !== main.userToDisplay.uniqueCuid) {
                    throw {
                        code: 'public'
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                //reaching here means that this user owns the profile, render it to them
                return true;
            })
            .then(function () {
                return rq.post_category_handler().getPostCategories(null, null);
            })
            .then(function (obj) {
                main.allPostCategoriesArray = obj.postCategoriesArray;
                main.allPostCategories = {};

                //put post categories
                main.allPostCategoriesArray.forEach(function (category) {
                    main.allPostCategories[category.postCategoryUniqueCuid] = category.postCategoryName;
                });

                return true;
            })
            .then(function () {
                res.render('all/user_private_profile.ejs', main);
            })
            .catch(function (e) {
                if (e.code === 'public') {
                    res.redirect(app.locals.getUserPublicProfileUrl(null, main.requestedUsername));
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });
    },

    render_user_public_profile_Html: function (req, res) {
        var app = rq.app();
        var module = 'render_user_public_profile_Html';
        receivedLogger(module);

        var main = defaultMainObject(req, res);
        main.title = 'User - The African Exponent'; //changed below after getting the user's data
        main.state = 'user-public-profile';

        main.requestedUsername = req.params.username;
        main.requestedPage = parseInt(req.query.page) || 1;
        main.userToDisplay = {};
        main.allPostCategoriesArray = [];
        main.allPostCategories = {};
        main.foundPostsIndexes = [];
        main.popularStories = [];
        main.trendingStories = [];
        main.posts = [];
        main.postsObj = {
            profilePath: "", // to the path of the user below after we have the user to display
            page: 1,
            quantity: 15,
            totalPages: 0,
            totalResults: 0
        };


        Promise.resolve()
            .then(function () {
                if (main.requestedUsername) {
                    main.requestedUsername = main.requestedUsername.toString();
                } else {
                    throw {
                        msg: 'We were unable to find the profile of the requested user.',
                        code: 404
                    };
                }
            })
            .then(function () {
                return rq.user_handler().findUserWithUserName(req, res, main.requestedUsername);
            })
            .then(function (obj) {
                if (!obj.theUser) {
                    throw {
                        code: 404,
                        msg: 'We could not find the profile of the user you were looking for.'
                    };
                } else {
                    main.userToDisplay = obj.theUser;
                    main.title = app.locals.getFullName(main.userToDisplay) + ' - The African Exponent';
                    return true;
                }
            })
            .then(function () {
                return rq.post_category_handler().getPostCategories();
            })
            .then(function (obj) {
                main.allPostCategoriesArray = obj.postCategoriesArray;
                main.allPostCategories = {};

                //put post categories
                main.allPostCategoriesArray.forEach(function (category) {
                    main.allPostCategories[category.postCategoryUniqueCuid] = category.postCategoryName;
                });
                return rq.post_handler().getUsersPosts(main.userToDisplay.uniqueCuid, {
                    quantity: main.postsObj.quantity,
                    requestedPage: main.requestedPage
                });
            })
            .then(function (obj) {
                main.postsObj.page = obj.page;
                main.postsObj.totalPages = obj.totalPages;
                main.postsObj.totalResults = obj.totalResults;
                main.postsObj.profilePath = app.locals.getUserPublicProfileUrl(main.userToDisplay);
                main.posts = obj.posts;

                var options = {
                    quantity: 15,
                    maxIterations: 30,
                    quantityInPerIteration: 1,
                    intervalInDaysForEachIteration: 1,
                    intervalInDays: 7,
                    excludedPostIndexes: main.foundPostsIndexes
                };

                //get general popular stories
                return rq.post_handler().getPopularStories(options);

            })
            .then(function (obj) {
                main.popularStories = obj.popularStories;

                main.foundPostsIndexes = main.foundPostsIndexes.concat(main.popularStories.map(function (post) {
                    return post.postIndex;
                }));

                //the first five of trending stories are the main trending stories, the remaining will be used to
                //show more from african exponent
                var options = {
                    quantity: 15,
                    maxIterations: 30,
                    quantityInPerIteration: 1,
                    intervalInDaysForEachIteration: 1,
                    intervalInDays: 7,
                    excludedPostIndexes: main.foundPostsIndexes
                };
                return rq.post_handler().getTrendingStories(options);
            })
            .then(function (obj) {
                main.trendingStories = obj.trendingStories;

                main.foundPostsIndexes = main.foundPostsIndexes.concat(main.trendingStories.map(function (post) {
                    return post.postIndex;
                }));

                return main;
            })
            .then(function () {
                res.render('all/user_public_profile.ejs', main);
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });
    }
};