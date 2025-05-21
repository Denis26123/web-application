$(document).ready(function() {
    
    //click to scroll to sections
    $('.js--scroll-to-schedule').click(function () {
       $('html, body').animate({scrollTop: $('.js--schedule').offset().top}, 1000); 
    });

    $('.js--scroll-to-calories').click(function () {
       $('html, body').animate({scrollTop: $('.js--calories').offset().top}, 1000); 
    });
    $('.js--scroll-to-result').click(function () {
       setTimeout( function() {
         $('html, body').animate({scrollTop: $('.js--schedule-result').offset().top}, 1000);
       }, 500)    
   });

   $('.js--scroll-to-cal-cal').click(function () {
      setTimeout( function() {
        $('html, body').animate({scrollTop: $('.js--cal-cal').offset().top}, 1000);
      }, 300)    
  });
   
});
