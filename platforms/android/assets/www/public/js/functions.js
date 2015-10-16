Global = {};
$(document).ready(function () {
    Global.g_windowWidth = $(window).width();

    Global.g_bootStrapWidth = function (width) {
        width = parseInt(width);

        if (width >= 1200) {
            return 'lg';
        } else if (width >= 992 && width < 1200) {
            return 'md';
        } else if (width >= 768 && width < 992) {
            return 'sm';
        } else if (width < 768) {
            return 'xs';
        }
    };
});