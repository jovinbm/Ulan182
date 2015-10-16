$(document).ready(function () {
    if (Global.g_bootStrapWidth(Global.g_windowWidth) == 'lg' || Global.g_bootStrapWidth(Global.g_windowWidth) == 'md') {
        $("body .postContent .column").matchHeight({
            byRow: true,
            property: 'height',
            target: $("body .postContent .column.main")
        });
    }
});