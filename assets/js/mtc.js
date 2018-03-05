$(document).ready(function () {

    $('.toggle').click(function(e){
        e.preventDefault();
        $(this).toggleClass('open');
        $($(this).data('target')).toggleClass('show');
    });

	$('menu a[href*="#"]:not([href="#"])').click(function() {
	    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
	      var target = $(this.hash);
	      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
	      if (target.length) {
            $('menu').removeClass('show');
	        $('html, body').animate({
	          scrollTop: (target.offset().top - 54)
	        }, 1000);
	        return false;
	      }
	    }
	});

    var homeHeight = $('#home').height();
    var effect = $('.show-effect');
    $(window).on('scroll', function (event) {
        var scrollValue = $(window).scrollTop();
        if (scrollValue <= homeHeight) {
            $('.parallax .col-4, .parallax .col-8').css({
                'top': scrollValue/5 +'px'
            });
        }
        if (scrollValue >= homeHeight/4) {
            $('header').addClass('affix');
            $('header img').attr('src', 'assets/img/mtc-blue.png');
        } else{
            $('header').removeClass('affix');
            $('header img').attr('src', 'assets/img/mtc.png');
        }
        effect.each(function () {
            if ($(this).offset().top <= $(window).scrollTop() + $(window).height() * 0.75) {
                if ($(this).hasClass('invert')) {
                    $('#docademic-info').addClass('go');
                } else{
                    $(this).addClass('go');
                }
            }
        });
    });

    // countdown timer
    var timerContainer = $('.timer');
    var currentDate = moment().tz("America/Mexico_City");
    var sellStarts = moment.tz('2018-03-06 12:00', 'America/Mexico_City');
    var sellEnds = moment.tz('2018-03-10 12:00', 'America/Mexico_City');
    var countdownDate = '';
    var args = '%D days and %H:%M:%S';
    if (currentDate.isBefore(sellEnds)) {
        $('.sell').addClass('selling');
        countdownDate = sellEnds;
        sellCountdown(args);
    }
    if (currentDate.isAfter(sellEnds)) {
        $('.sell').removeClass('selling');
        offers.empty();
        countdownDate = sellStarts;
        args = 'Sell stats at %D days and %H:%M:%S';
        sellCountdown(args);
    }
    function sellCountdown(args){
        timerContainer.countdown(countdownDate.toDate(), function(event) {
          $(this).html(event.strftime(args));
        }).on('finish.countdown', function(event) {
            $('#home-content .title h2').empty('');
            $('.sell').removeClass('selling');
            offers.empty();
            countdownDate = sellStarts;
            args = 'Sell stats at %D days and %H:%M:%S';
            sellCountdown(args);
        });
    }

    // function offerCountdown(date){
    //     offers.countdown(date, function(event) {
          
    //     }).on('finish.countdown', function(event) {
    //         currentDate = moment().tz("America/Mexico_City");
    //         dateCheck();
    //     });
    // }
    // dateCheck();
});