

$(document).ready(function () {
	$('body').on('click', '.category', function () {
  		$(this).find('button').click();
  	});

	$.fn.SimpleModal({
	    draggable: false,
	    template:" <div id='container'><form id='registration-login-form'><fieldset></fieldset></form></div>"
	}).showModal();

  	$('#simple-modal, #simple-modal-overlay').hide();
  	$('.start-btn').click(function () {
  		$('#simple-modal, #simple-modal-overlay').show();
  	});
  	$('header').hide();
  	
});