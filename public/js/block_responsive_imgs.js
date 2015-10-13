$(function () {
    var allContentImageStyles = [];

    resizePostImages();

    $(window).resize(function () {
        resizePostImages();
    });

    function resizePostImages() {
        $('.content img').each(function (index) {

            //save all image styles first
            var temp = {};
            temp.height = $(this).css('height');
            temp.width = $(this).css('width');
            temp.float = $(this).css('float');
            temp.clear = $(this).css('clear');
            temp.display = $(this).css('display');
            allContentImageStyles.push(temp);

            //if image's display property is block, then just make it fit

            if ($(window).width() < 768) {
                $(this).css({
                    'display': 'block',
                    'float': 'none',
                    'clear': 'none',
                    'width': '100%',
                    'max-width': '100%',
                    'height': 'auto'
                });
            } else {
                //restore the images original css
                $(this).css(allContentImageStyles[index]);

                //desktop screens
                //if image is not floated (no text wrapping)
                if ($(this).css('float') == 'none') {
                    $(this).css({
                        'width': '100%',
                        'max-width': '100%',
                        'height': 'auto'
                    });
                } else {
                    //just add a margin

                    if ($(this).css('float') == 'left') {
                        $(this).css({
                            'margin-right': '15px'
                        });
                    }

                    if ($(this).css('float') == 'right') {
                        $(this).css({
                            'margin-left': '15px'
                        });
                    }

                }
            }
        });
    }
});