$(document).ready(function(){$("body").on("click",".category",function(){$(this).find("button").click()}),$("body").on("click","#simple-modal .close",function(o){o.preventDefault(),$("#simple-modal, #simple-modal-overlay").hide()});var o="<a href='#' class='close'>x</a><div id='container'><form id='registration-login-form'><fieldset></fieldset></form></div>";$('<div class="simple-modal" id="simple-modal">'+o+'</div><div id="simple-modal-overlay" style="opacity: 0.3;background-color: rgb(0, 0, 0);"></div>').appendTo($("body")),$("#simple-modal, #simple-modal-overlay").hide(),$("body").on("click",".start-btn",function(){$("#simple-modal, #simple-modal-overlay").show()}),$("header").hide(),$("body").on("click",".menu_btn",function(o){o.preventDefault(),$("body").removeClass().addClass("body-recolor"),$(this).is(".add-question-menu-btn")?$("body").addClass("add-questions"):$(this).is(".leaderboard-menu-btn")&&$("body").addClass("leaderboard"),pageSelection()}),$("body").on("click",".close-alert",function(){$(".alert").remove()})});