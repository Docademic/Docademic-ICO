$(document).ready(function () {

	$('a.nav-link[href*="#"]:not([href="#"]), a#toHealthcare').click(function() {
	    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
	      var target = $(this.hash);
	      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
	      if (target.length) {
	        $('html, body').animate({
	          scrollTop: (target.offset().top - 54)
	        }, 1000);
	        return false;
	      }
	    }
	});


    // fixed navbar and roadmap
    var navbar = $('.navbar');
    var homeHeight = $('#home').height() - 60;
    var effect = $('.show-effect');
    $(window).on('scroll', function (event) {
        var scrollValue = $(window).scrollTop();
        if (scrollValue >= homeHeight) {
            $('.navbar').addClass('affix');
            $('#countdown .sell').addClass('affix');
            $('#countdown .whitepaper').addClass('affix');
        }
        if (scrollValue < homeHeight) {
            $('.navbar').removeClass('affix');
            $('#countdown .sell').removeClass('affix');
            $('#countdown .whitepaper').removeClass('affix');
        }
        effect.each(function () {
            if ($(this).offset().top <= $(window).scrollTop() + $(window).height() * 0.75) {
                $(this).addClass('go');
            }
        });
    });

    // countdown timer
    var timerContainer = $('.timer-container');
    var offers = $('#home #offers');
    var currentDate = moment().tz("America/Mexico_City");
    var sellStarts = moment.tz('2018-03-06 12:00', 'America/Mexico_City');
    var sellEnds = moment.tz('2018-03-01 00:00', 'America/Mexico_City');
    var countdownDate = '';
    var args = '';
    if (currentDate.isBefore(sellEnds)) {
        $('.sell').addClass('selling');
        $('#home-content .title h2').html('Pre-Sale ends on: 2018/02/28');
        countdownDate = sellEnds;
        sellCountdown(args);
    }
    if (currentDate.isAfter(sellEnds)) {
        $('.sell').removeClass('selling');
        offers.empty();
        countdownDate = sellStarts;
        args = 'Sell starts at %D days and %H:%M:%S';
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
            args = 'Sell starts at %D days and %H:%M:%S';
            sellCountdown(args);
        });
    }

    function offerCountdown(date){
        offers.countdown(date, function(event) {
          
        }).on('finish.countdown', function(event) {
            currentDate = moment().tz("America/Mexico_City");
            dateCheck();
        });
    }
    //dateCheck();

    // modal
    $('.tgl-show').click(function () {
        $($(this).data('show')).toggleClass('show');
    });

});