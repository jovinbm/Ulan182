angular.module('app')
    .filter("getSlugUrl", [function () {
        return function (post) {
            function convertToSlug(Text) {
                return Text
                    .toLowerCase()
                    .replace(/[^\w ]+/g, '')
                    .replace(/ +/g, '-');
            }

            var text = convertToSlug(post.postShortHeading);
            return text + '-' + post.postIndex;
        };
    }]);