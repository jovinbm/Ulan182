$(document).ready(function () {
    //select all links with no target and apply target _self to them
    $('a:not([target])').each(function () {
        $(this).attr('target', '_self');
    });
});