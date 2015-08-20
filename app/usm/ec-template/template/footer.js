$(function () {
    //link bottom animation
    $(".ec-footer .top-link").click(function () {
        var anchor = $(this).attr("href");
        $("html, body").animate({
            scrollTop: $(anchor).offset().top
        }, "slow");

        return false;
    });
});