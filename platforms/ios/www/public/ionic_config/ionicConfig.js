app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($q) {
        return {
            'request': function (config) {
                config.url = '' + config.url;
                return config || $q.when(config);

            }

        }
    });
});