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
    var ethPrice = $('.eth-price');
    var sellStarts = moment.tz('2018-03-10 12:00', 'America/Mexico_City');
    var sellEnds = moment.tz('2018-03-14 12:00', 'America/Mexico_City');
    var d20 = moment.tz('2018-03-20 12:00', 'America/Mexico_City');
    var d30 = moment.tz('2018-03-30 12:00', 'America/Mexico_City');
    var d6A = moment.tz('2018-04-06 13:00', 'America/Mexico_City');
    var d13A = moment.tz('2018-04-15 13:00', 'America/Mexico_City');
    var f13 = moment.tz('2018-04-13 19:00', 'America/Mexico_City');
    var countdownDate = '';
    var args = '';
	function dateCheck(){
        var currentDate = moment().tz("America/Mexico_City");
    	if (currentDate.isBefore(sellStarts)) {
            $('.sell').addClass('selling');
    		countdownDate = sellStarts;
            ethPrice.html('0.000035');
    		args = "Next price 0.00004 in %D days and %H:%M:%S hrs";
    		sellCountdown();
    	}
        if (currentDate.isAfter(sellStarts) && currentDate.isBefore(sellEnds)) {
            $('.sell').addClass('selling');
            ethPrice.html('0.00004');
    	    args = "Next price 0.000045 in %D days and %H:%M:%S hrs";
            countdownDate = sellEnds;
            sellCountdown();
        }
        if (currentDate.isAfter(sellEnds) && currentDate.isBefore(d20)) {
            $('.sell').addClass('selling');
            ethPrice.html('0.000045');
            args = "Next price 0.00006 in %D days and %H:%M:%S hrs";
            countdownDate = d20;
            console.log(args);
            sellCountdown();
        }
        if (currentDate.isAfter(d20) && currentDate.isBefore(d30)) {
            $('.sell').addClass('selling');
            ethPrice.html('0.00006');
            args = "Next price 0.0001 in %D days and %H:%M:%S hrs";
            countdownDate = d30;
            sellCountdown();
        }
        if (currentDate.isAfter(d30) && currentDate.isBefore(d6A)) {
            $('.sell').addClass('selling');
            ethPrice.html('0.0001');
            args = "Sell ends in %D days and %H:%M:%S hrs";
            countdownDate = d6A;
            sellCountdown();
        }
        if (currentDate.isAfter(d6A) && currentDate.isBefore(d13A)) {
            $('.sell').addClass('selling');
            ethPrice.html('0.0001');
            args = "Sell ends in %D days and %H:%M:%S hrs";
            countdownDate = d13A;
            sellCountdown();
        }
        if (currentDate.isAfter(d13A)) {
            $('.sell').removeClass('selling');
            $('#timer-p').html('ICO is over, thank you for your support, stay tuned for news.');
        }
		if (currentDate.isBefore(f13)) {
			modalTimer();
		}
    }
    function sellCountdown(){
        timerContainer.countdown(countdownDate.toDate(), function(event) {
            $(this).html(event.strftime(args));
        }).on('finish.countdown', function(event) {
	        dateCheck();
        });
    }
    dateCheck();

	$('.tgl-show').click(function () {
		$($(this).data('show')).toggleClass('show');
	});

    function modalTimer(){
        setTimeout(function(){
            $('#modal').addClass('show');
        }, 2000);
    }
    $('#modal .df-close').click(function(e){
        e.preventDefault();
        $('#modal').removeClass('show');
    });
});