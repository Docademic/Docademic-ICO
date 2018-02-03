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
    var currentDate = moment().tz("America/Mexico_City");
    var sellStarts = moment.tz('2018-01-03 00:00', 'America/Mexico_City');
    var sellEnds = moment.tz('2018-03-01 00:00', 'America/Mexico_City');
    var countdownDate = '';
    // var args = '%D Days, %H Hours, %M Minutes, %S Seconds';
    if (currentDate.isBefore(sellStarts)) {
        $('#home-content .title h2').html('ICO Launch in: 2018/02/03');
        countdownDate = sellStarts;
        // args = '2018/02/03';
        // args += '<span>Minutes<br/>%M</span>' + '<span>Seconds<br/>%S</span>';
        sellCountdown(args);
    } else if (currentDate.isAfter(sellStarts)) {
        // timerContainer.addClass('selling');
        // args = '2018/03/03';
        $('.sell').addClass('selling');
        $('#home-content .title h2').html('ICO ends in: 2018/03/03');
        countdownDate = sellEnds;
        sellCountdown(args);
    }

    function sellCountdown(args){
        timerContainer.countdown(countdownDate.toDate(), function(event) {
	      $(this).html(event.strftime(args));
        }).on('finish.countdown', function(event) {
	        timerContainer.addClass('selling');
	        $('#home-content .title h2').html('ICO ends in: 2018/03/03');
	        countdownDate = sellEnds;
	        // args = '<span>Days<br/>%D</span>' + '<span>Hours<br/>%H</span>';
	        sellCountdown(args);
        });
    }

    // modal
    $('.tgl-show').click(function () {
        $($(this).data('show')).toggleClass('show');
    });

});