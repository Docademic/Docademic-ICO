$(document).ready(function(){

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
	$(window).on('scroll', function(event) {
	    var scrollValue = $(window).scrollTop();
	    if (scrollValue >= homeHeight) {
	         $('.navbar').addClass('affix');
	    }
	    if (scrollValue < homeHeight) {
	         $('.navbar').removeClass('affix');
	    }
	    effect.each(function(){
	        if( $(this).offset().top <= $(window).scrollTop()+$(window).height()*0.75){
	            $(this).addClass('go');
	        }
	    });
	});

	// countdown timer
	$('#timer-numbers').countdown('2017/12/22').on('update.countdown', function(event) {
	  var $this = $(this).html(event.strftime(''
	    + '<span>%D</span>'
	    + '<span>%H</span>'
	    + '<span>%M</span>'
	    + '<span>%S</span>'));
	});

	// modal
	$('.tgl-show').click(function(){
		$($(this).data('show')).toggleClass('show');
	});

	// input animated
	$('.input-animated input').focus(function(){
		$(this).parent().addClass('active');
	});
});