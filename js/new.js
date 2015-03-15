$(document).ready(function () {
  
  // Click takes whole section
  $('body').on('click', '.category', function () {
    $(this).find('button').click();
  });

  //Modal window for login changes
  $('body').on('click', '#simple-modal .close', function (e) {
      e.preventDefault();
    $('#simple-modal, #simple-modal-overlay').hide();
    });
    var template="<a href='#' class='close'>x</a><div id='container'><form id='registration-login-form'><fieldset></fieldset></form></div>";
    $('<div class="simple-modal" id="simple-modal">'+template+'</div><div id="simple-modal-overlay" style="opacity: 0.3;background-color: rgb(0, 0, 0);"></div>').appendTo($('body'));

    $('#simple-modal, #simple-modal-overlay').hide();
    $('body').on('click','.start-btn',function () {
      $('#simple-modal, #simple-modal-overlay').show();
    });
    $('header').hide();

  $('body').on('click', '.menu_btn', function (e) {
      e.preventDefault();
      $('body').removeClass().addClass('body-recolor');
      
      if($(this).is('.add-question-menu-btn')){
        $('body').addClass('add-questions');
      } else if ($(this).is('.leaderboard-menu-btn')) {
        $('body').addClass('leaderboard');
      }
      pageSelection();
  });
  $('body').on('click', '.close-alert', function(){
      $('.alert').remove();
  });
  $('.glyphicon-menu-hamburger').on('click', function(){
      $('header').toggleClass('resp-active');
  });

});


