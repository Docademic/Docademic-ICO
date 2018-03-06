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
        if (scrollValue >= homeHeight/4) {
            $('header').addClass('affix');
	        $('#bounty-button').parent().hide();
            $('header img').attr('src', 'assets/img/mtc-blue.png');
        } else{
            $('header').removeClass('affix');
	        $('#bounty-button').parent().show();
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
	
	$('.sell').click(() => {
		window.location='/buy.html';
	});

    // countdown timer
    var timerContainer = $('.timer');
    var currentDate = moment().tz("America/Mexico_City");
    var sellStarts = moment.tz('2018-03-06 12:00', 'America/Mexico_City');
    var sellEnds = moment.tz('2018-03-10 12:00', 'America/Mexico_City');
    var countdownDate = '';
    var args = '%D days and %H:%M:%S';
	if (currentDate.isBefore(sellStarts)) {
		countdownDate = sellStarts;
		args = "Sale starts in %H:%M:%S hrs";
		sellCountdown(args);
	}
    if (currentDate.isAfter(sellStarts)) {
        $('.sell').addClass('selling');
	    args = "Next price 0.00004 in %D days and %H:%M:%S hrs";
        countdownDate = sellEnds;
        sellCountdown(args);
    }
    function sellCountdown(args){
        timerContainer.countdown(countdownDate.toDate(), function(event) {
          $(this).html(event.strftime(args));
        }).on('finish.countdown', function(event) {
	        $('.sell').addClass('selling');
	        args = "Next price 0.00004 in %D days and %H:%M:%S hrs";
	        countdownDate = sellEnds;
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
	$('.tgl-show').click(function () {
		$($(this).data('show')).toggleClass('show');
	});
});