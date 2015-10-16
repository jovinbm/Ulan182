app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($q) {
        return {
            'request': function (config) {
                config.url = 'https://pluschat.net' + config.url;
                return config || $q.when(config);

            }

        }
    });
});