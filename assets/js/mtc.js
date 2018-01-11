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
        }
        if (scrollValue < homeHeight) {
            $('.navbar').removeClass('affix');
        }
        effect.each(function () {
            if ($(this).offset().top <= $(window).scrollTop() + $(window).height() * 0.75) {
                $(this).addClass('go');
            }
        });
    });

    // countdown timer
    var timerContainer = $('.timer-container');
    var currentDate = moment().tz("America/Mexico_City").format('Y-MM-DD H:mm');
    var sellStarts = moment.tz('2018-01-29 00:00', 'America/Mexico_City');
    var sellEnds = moment.tz('2018-02-10 00:00', 'America/Mexico_City');
    var countdownDate = '';
    var args = '<span>Days<br/>%D</span>' + '<span>Hours<br/>%H</span>';
    console.log(currentDate, sellStarts._i);
    if (currentDate < sellStarts._i) {
        $('#countdown .title').html('ICO Launch in:');
        countdownDate = sellStarts;
        args += '<span>Minutes<br/>%M</span>' + '<span>Seconds<br/>%S</span>';
        sellCountdown(args);
    } else if (currentDate > sellStarts._i && currentDate < sellEnds._i) {
        timerContainer.addClass('selling');
        $('#countdown .title').html('ICO ends in:');
        countdownDate = sellEnds;
        sellCountdown(args);
    }

    function sellCountdown(args){
        timerContainer.countdown(countdownDate.toDate(), function(event) {
          $(this).html(event.strftime(args));
        });
    }

    // modal
    $('.tgl-show').click(function () {
        $($(this).data('show')).toggleClass('show');
    });

});