$(document).ready(function () {
    //nav links
    if (Global.g_bootStrapWidth(Global.g_windowWidth) == 'lg' || Global.g_bootStrapWidth(Global.g_windowWidth) == 'md') {
        $(window).bind("scroll", function () {
            if (this.pageYOffset >= 10) {
                $('nav.main-navigation.desktop').addClass('scrolled');
            }

            if (this.pageYOffset < 10) {
                $('nav.main-navigation.desktop').removeClass('scrolled');
            }
        });
    }
    /*
     * mobile search opener
     * */
    if (Global.g_bootStrapWidth(Global.g_windowWidth) == 'sm' || Global.g_bootStrapWidth(Global.g_windowWidth) == 'xs') {
        var dsbfjk = 0;
        $('.main-navigation.mobile a.search-icon').click(function () {
            $('.main-navigation.mobile div.search').toggleClass('open', dsbfjk % 2 === 0);
            dsbfjk++;
        });
    }

    /*
     * slding mobile nav
     * */
    if (Global.g_bootStrapWidth(Global.g_windowWidth) == 'sm' || Global.g_bootStrapWidth(Global.g_windowWidth) == 'xs') {
        $menuLeft = $('nav#mobileSlidingNav');
        var mobileTopNavHeight = $("nav.main-navigation.mobile").height();
        $menuLeft.css("top", mobileTopNavHeight);

        $mobileNavOpener = $("nav.main-navigation.mobile .mobileNavOpener");
        var clicks = 0;

        $mobileNavOpener.click(function () {
            $menuLeft.toggleClass('open', clicks % 2 === 0);
            clicks++;
        });
    }
});