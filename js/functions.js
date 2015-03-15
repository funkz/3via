/*jslint node: true */
/*global $ */

var serviceRootUrl = "http://trivia-game.apphb.com/api/trivia/";


//ON DOCUMENT READY
$(document).ready(function () {
    pageSelection();
});

function pageSelection(){
    $("body").on("click", "#logout-nav-btn", logout);
    
    if (sessionStorage.userData != undefined ) {  
        $("#logout-nav-btn").show();
        chooseGame();
        $('header').show();
    }

    if (sessionStorage.userData === undefined) {
        onLoginFormBtnClick();
    } else if($("body").hasClass("choose-game")) { //If choose game screen
        chooseGame();
    } else if($("body").hasClass("leaderboard")) { //If leaderboard screen
        $('body #container .row.game').remove();
        performGetRequest(serviceRootUrl + "users-all", onRankingRequestSuccess, onError);
    } else if($("body").hasClass("add-questions")) { //If add questions screen
        $('body #container .row.game').remove();
        $('body #container').prepend("<div class='row game'><div class='col-md-6 random category'><img class='icon-resize' src='img/icon-add-questions.png'><img class='icon-resize responsive' src='img/icon-add-questions.png'><p class='top-20 icon-text'>Select a category to add a question to. 1 question with 4 answers required.</p><button id='question-add-btn' class='btn btn-link red'>ADD QUESTION</button></div><div class='col-md-6 random category'><img class='icon-resize' src='img/icon-add-categories.png'><img class='icon-resize responsive' src='img/icon-add-categories.png'><p class='top-20 icon-text'>Add a new category.<br> 10 questions with 4 answer each required.</p><button id='category-add-btn' class='btn btn-link red'>ADD CATEGORY</button></div></div>");
        $("#question-add-btn").on("click", onAddQuestionClick);
        $("#category-add-btn").on("click", onAddCategoryClick);
    }
}
//Collecting data   
function collectData() {
    var usernameValue = $("#tb-username").val();
    var passwordValue = $("#tb-pass").val();
    var hash = CryptoJS.SHA1(usernameValue + passwordValue);
    var hashToString = hash.toString();
    var user = {
        username: usernameValue,
        nickname: $("#tb-nickname").val(),
        pass: passwordValue,
        repeatedPass: $("#tb-repeat-pass").val(),
        authcode: hashToString
    };
    return user;
}

//Go to Login Form, button click
function onLoginFormBtnClick() {
    var legendHtml =        '<legend>Login</legend>';
    var usernameHtml =      '<div class="inner-form"><label for="tb-username"></label>' +
                            '<input id="tb-username" type="text" autofocus="autofocus" placeholder="username"/> ';
    var passHtml =          '<label for="tb-pass"></label>' +
                            '<input id="tb-pass" type="password" placeholder="password"/>';
    var loginButtonHtml =   '<button type="button" id="login-button" class="btn form full-width btn-md">Login</button>';
    var regFormBtnHtml =    '<button type="button" id="reg-form-button" class="btn btn-link green full-width btn-xs">Register</button></div>';
    
    $("#registration-login-form fieldset").html(legendHtml + usernameHtml + passHtml + loginButtonHtml + regFormBtnHtml);
    
    $("#reg-form-button").on("click", onRegFormBtnClick);
    
    $("#login-button").on("click", onLoginBtnClick);
}

//Go to Registration Form, button click
function onRegFormBtnClick() {
    $("#reg-form-button").hide();
    $("#login-button").hide();
    
    var legendHtml =        'Register';
    var nicknameHtml =      '<label for="tb-nickname"></label>' +
                            '<input id="tb-nickname" type="text" placeholder="nickname" />';
    var repeatPassHtml =    '<label for="tb-repeat-pass"></label>' +
                            '<input id="tb-repeat-pass" type="password" placeholder="repeat password"/>';
    var registerButton =    '<div class="inner-form"><button type="button" id="register-button" class="btn form full-width btn-md">Register</button>';
    var backToLoginBtn =    '<button type="button" id="login-form-button" class="btn btn-link green full-width btn-xs">Login</button></div>';
    
    $("#registration-login-form fieldset legend").html(legendHtml);
    $("#tb-username").after(nicknameHtml);
    $("#tb-pass").after(repeatPassHtml);
    $("#registration-login-form fieldset").append(registerButton);
    $("#registration-login-form fieldset").append(backToLoginBtn);
      
    $("#login-form-button").on("click", onLoginFormBtnClick);
    
    $("#register-button").on("click", onRegisterBtnClick);
}

//Main Login Button Click
function onLoginBtnClick() {
   
    var userData = collectData();
    
     if (userData.username === "") {
        windowUI("Please enter name");
        event.preventDefault();
        return;
    }
    if (userData.pass === "") {
        windowUI("Please enter password");
        event.preventDefault();
        return;
    }
    userInfo = {
        username:userData.username,
        authCode:userData.authcode
    };
    performPostRequest(serviceRootUrl + "login-user", userInfo, onUserLoginSuccess, onError);
    
    
}


//Login Success
function onUserLoginSuccess(data) {
    
    $("#logout-nav-btn").show();
    userInfo = sessionStorage.setItem('userData',JSON.stringify(userInfo));
    
    preLoaderEnd();
    
    // not needed
    // windowUI("Успешно Влизане");
    
    if (data === null) {
        $("#registration-login-form").remove();
        // new
        $('#simple-modal, #simple-modal-overlay').remove();
        $('header').show();

        chooseGame();
    }   
}

//Main Register Button Click
function onRegisterBtnClick() {
    var userData = collectData();
    
    if (userData.username === "") {
        windowUI("Напишете име");
        event.preventDefault();
        return;
    }
    
    if (userData.nickname === "") {
        windowUI("Напишете прякор");
        event.preventDefault();
        return;
    }
    
    if (userData.pass === "" && userData.repeatedPass === "") {
        windowUI("Напишете парола");
        event.preventDefault();
        return;
    }
    
    if (userData.pass !== userData.repeatedPass) {
        windowUI("Паролите не са еднакви.");
        event.preventDefault();
        return;
    }
    
    var user = {
        username:userData.username,
        nickname:userData.nickname,
        authCode:userData.authcode
    };
    
    performPostRequest(serviceRootUrl + "register-user", user, onUserRegisterSuccess, onError);
    
}

//Register Success
function onUserRegisterSuccess(data) {
    preLoaderEnd();
    if (data == null) {
        onLoginFormBtnClick();
    }
    windowUI("user registered");
}

//Choose Game
function chooseGame() {
    $('body').addClass('body-recolor');
    $("#start-game").remove();
    // new
    var startGameHtml = '<div class="row game"><div class="col-md-6 random category"><img class="icon-resize" src="img/icon-slot-machine.png"><img class="icon-resize responsive" src="img/icon-slot-machine-resp.png"><div class="handle"></div><div class="ball"></div><p class="top-20 icon-text">Play with random questions from different categories.</p><button id="random-game" class="btn btn-link red">START</div><div class="col-md-6 pick category"><img class="icon-check" src="img/icon-check.png"><img class="icon-resize" src="img/icon-categories.png"><img class="icon-resize responsive" src="img/icon-categories-responsive.png"><p class="top-20 icon-text">Pick your own category <br> to play from.</p><button id="custom-game" class="btn btn-link red">START</div></div></div>'
    $("#container").html(startGameHtml);
    $("#random-game").on("click", startRandomGame);
    $("#custom-game").on("click", startCustomGame);
}

//Start Random Game Request
function startRandomGame() {
    $("#random-game").remove();
    $("#custom-game").remove();
    
    var userData = JSON.parse(sessionStorage.userData);
    
    performPostRequest(serviceRootUrl + "start-game/", userData, onStartGameSuccess, onError);
}

//Start Custom Game Request
function startCustomGame() {
    $("#random-game").remove();
    $("#custom-game").remove();
    
    performGetRequest(serviceRootUrl + "categories", onSuccessGetCategories ,onError);   
}

//Get Categories Success
function onSuccessGetCategories (data) {
        var categoriesHtml=  '<ul id="categories-list col-md-12" class="default_list">' +
                             '</ul>'  ;
                             // new
        $("#container").html("\
            <div class='row margin top-40'>\
                <form class='col-md-12' role='search'>\
                    <div class='form-group'>\
                        <input type='text' data-list='.default_list' autocomplete='off' id='search' name='search' class='form-control search' placeholder='Search'>\
                    </div>\
                </form>\
                <p>В асфафса категория?</p></div>" +
                categoriesHtml);
        for (i=0;i<data.length;i++) {
            $("#categories-list").append('<li>' + '<a href data-id="' + data[i].id + '">' + data[i].name  + '</a>' + '</li>');
        }
        $("#categories-list li a").on("click", chosenCategory);
        $('#search').hideseek({
          highlight: true
        });
        $('#container').removeClass('valign');
        $('.valign-wrapper').removeClass('valign-wrapper');
}

//Choosen Category Success
function chosenCategory() {
        $('#container').addClass('valign');
        $('.valign-wrapper').addClass('valign-wrapper');
        var userData = JSON.parse(sessionStorage.userData);
        performPostRequest(serviceRootUrl + "start-game/" + $(this).attr("data-id"), userData, onStartGameSuccess, onError);
        return false;
 }

//Start Game Success
function onStartGameSuccess(data) {
    preLoaderEnd();
    // new
    $("header").addClass('disable');
    var timerHtml = '<div id="countdown">' +
                       '<div class="progress progress-striped active"><div class="bar"></div></div>' +
                       '<div id="timer"><span id="minutes"></span><span>:</span><span id="seconds"></span></div>' +
	                '</div>';
    $("#container").append(timerHtml);
    secondsCount();
    sessionStorage.gameID = data.id;
    var questions = data.questions;
    for (i=0;i<data.questions.length;i++) {
        var questionDivHtml = '<div class="question-container"><div class="question-text" data-id="' + data.questions[i].id + '">' + data.questions[i].text +'</div>';
        var answerDivHtml =    '<div class="answers-input" data-toggle="buttons-radio">' +
                                    '<button type="button" class="btn btn-primary" data-id="' + data.questions[i].answers[0].id  +'">' + data.questions[i].answers[0].text + '</button>' +
                                    '<button type="button" class="btn btn-primary" data-id="' + data.questions[i].answers[1].id  +'">' + data.questions[i].answers[1].text + '</button>' +
                                    '<button type="button" class="btn btn-primary" data-id="' + data.questions[i].answers[2].id  +'">' + data.questions[i].answers[2].text + '</button>' +
                                    '<button type="button" class="btn btn-primary" data-id="' + data.questions[i].answers[3].id  +'">' + data.questions[i].answers[3].text + '</button>' +
                                '</div></div>';
        $("#container").append(questionDivHtml + answerDivHtml);
        $(".question-container").hide();
    }
    $("#container .question-container:first").show();
    $(".question-container .btn").on("click",function() {
        $(this).parent().parent().hide();
        $(this).parent().parent().next().show();
    });
    $(".question-container:last .btn").on("click",postAnswers);
        
    
   // var postAnswersBtnHtml = '<button type="button" id="post-answers-btn" class="btn btn-info">Изпрати отговори</button>';
    //$("#container").append(postAnswersBtnHtml);
    //$("#post-answers-btn").on("click", postAnswers);
}

//Post Answers 
function postAnswers() {
    $("header").removeClass('disable');
    var data = collectDataAnswers();
    performPostRequest2(serviceRootUrl + "post-answers/" + sessionStorage.gameID, data, postAnswersSuccess, onError);
}

//Post Anwers Success
function postAnswersSuccess(data) {
    if(data == null){
        chooseGame();
    };
    windowUI("Отговори изпратени")
    $("header").show();        
}

//Collect Data Answers
function collectDataAnswers() {
    var userData = JSON.parse(sessionStorage.userData);
    var questionIds = $('.question-text').map(function(){return $(this).attr("data-id");});
    var answersIds = $('.active').map(function(){return $(this).attr("data-id");});
    
    var answerData = {"user":userData,
     "questions" : [{ "questionId" : parseInt(questionIds[0]), "answerId" : answersIds[0] },
                    { "questionId" : parseInt(questionIds[1]), "answerId" : answersIds[1] },
                    { "questionId" : parseInt(questionIds[2]), "answerId" : answersIds[2] },
                    { "questionId" : parseInt(questionIds[3]), "answerId" : answersIds[3] },
                    { "questionId" : parseInt(questionIds[4]), "answerId" : answersIds[4] }, 
                    { "questionId" : parseInt(questionIds[5]), "answerId" : answersIds[5] },
                    { "questionId" : parseInt(questionIds[6]), "answerId" : answersIds[6] },
                    { "questionId" : parseInt(questionIds[7]), "answerId" : answersIds[7] },
                    { "questionId" : parseInt(questionIds[8]), "answerId" : answersIds[8] },
                    { "questionId" : parseInt(questionIds[9]), "answerId" : answersIds[9] }]};
    return answerData;
}
  
    
//add question
function onAddQuestionClick() {
    performGetRequest(serviceRootUrl + "categories", function(data) {
    var categoriesHtml=     '<h2 class="heading-text">Please choose category</h2><ul id="categories-list" class="col-md-12">' +
                            '</ul>';
    $("#container").html(categoriesHtml);
    for (i=0;i<data.length;i++) {
        $("#categories-list").append('<li data-id="' + data[i].id + '">' + '<a href="">' + data[i].name  + '</a>' + '</li>');
    }
    $("#categories-list li a").on("click",printQuestionForm);
    } 
                      ,onError); 
}

function printQuestionForm() {
    $("#container ul").remove();
        event.preventDefault();
    var addQuestionHtml =   '<form>'+
                            '<fieldset>' +
                            '<legend>' +
                            'Добавяне на въпрос' +
                            '</legend>'  +
                            '<label for="question-input">Въпрос</label>' +
                            '<input class="question-input" />' +
                            '<label for="correct-answer-input">Правилен отговор</label>' +
                            '<input class="correct-answer-input" />' +
                            '<label for="wrong-answer-input">Грешен отговор</label>' +
                            '<input class="wrong-answer1-input" />' +
                            '<label for="wrong-answer2-input">Грешен отговор</label>' +
                            '<input class="wrong-answer2-input" />' +
                            '<label for="wrong-answer3-input">Грешен отговор</label>' +
                            '<input class="wrong-answer3-input" />' +
                            '<button type="button" id="add-question-btn">Добави</button>' +
                            '</fieldset>' +
                            '</form>'; 
    $("#container").append(addQuestionHtml);
    
    var category = $(this).parent().attr("data-id");
    
    $("#add-question-btn").on("click",function() {
        console.log('test');
        var questionData = collectQuestionData();
        performPostRequest2(serviceRootUrl + "add-question/" + category, questionData, function(){windowUI("въпрос добавен");reloadPage();}, onError);
    });
        
}

function collectQuestionData() {
    var questionValue = $(".question-input").val();
    var correctAnswerValue = $(".correct-answer-input").val();
    var wrongAnswer1Value = $(".wrong-answer1-input").val();
    var wrongAnswer2Value = $(".wrong-answer2-input").val();
    var wrongAnswer3Value = $(".wrong-answer3-input").val();
    var userData = JSON.parse(sessionStorage.userData);
    var question =  {"user":userData,
                     "question":{ "text":questionValue, 
                                "correctAnswers": [
                                                  { "text" : correctAnswerValue }],
                                                    "wrongAnswers" : [
                                                  { "text" : wrongAnswer1Value },
                                                  { "text" : wrongAnswer2Value },
                                                  { "text" : wrongAnswer3Value }]
                                                }
                        };   
    return question;
}




function collectCatData() {
    
    var userData = JSON.parse(sessionStorage.userData);
    
    var categoryName = $("#categoryNameInput").val();
    var questionValue = $('.question-input').map(function() { return this.value; }).get();
    var correctAnswerValue = $('.correct-answer-input').map(function() { return this.value; }).get();
    var wrongAnswer1Value = $('.wrong-answer1-input').map(function() { return this.value; }).get();
    var wrongAnswer2Value = $('.wrong-answer2-input').map(function() { return this.value; }).get();
    var wrongAnswer3Value = $('.wrong-answer3-input').map(function() { return this.value; }).get();
    
     var catData = { "category" : {                     "name" : categoryName,
					"questions" : [
					{ "text" : questionValue[0],
                        "correctAnswers" : [{"text" : correctAnswerValue[0]}],
                        "wrongAnswers" : [
                            { "text" : wrongAnswer1Value[0] },
                            { "text" : wrongAnswer2Value[0] },
                            {  "text" : wrongAnswer3Value[0] }]},					{ "text" : questionValue[1],
                                "correctAnswers" : [{"text" : correctAnswerValue[1]}],
					           "wrongAnswers" : [
                            { "text" : wrongAnswer1Value[1] },
                            { "text" : wrongAnswer2Value[1] },
                            { "text" : wrongAnswer3Value[1] }]},				   { "text" : questionValue[2],
                                "correctAnswers" : [{"text" : correctAnswerValue[2]}],
					           "wrongAnswers" : [
                            { "text" : wrongAnswer1Value[2] },
                            { "text" : wrongAnswer2Value[2] },
                            { "text" : wrongAnswer3Value[2] }]},				   { "text" : questionValue[3],
                                "correctAnswers" : [{"text" : correctAnswerValue[3]}],
					           "wrongAnswers" : [
                            { "text" : wrongAnswer1Value[3] },
                            { "text" : wrongAnswer2Value[3] },
                            { "text" : wrongAnswer3Value[3] }]},                            { "text" : questionValue[4],
                                  "correctAnswers" : [{"text" : correctAnswerValue[4]}],
                                "wrongAnswers" : [
                            { "text" : wrongAnswer1Value[4] },
                            { "text" : wrongAnswer2Value[4] },
                            { "text" : wrongAnswer3Value[4] }]},
                    { "text" : questionValue[5],
                                  "correctAnswers" : [{"text" : correctAnswerValue[5]}],
                                "wrongAnswers" : [
                            { "text" : wrongAnswer1Value[5] },
                            { "text" : wrongAnswer2Value[5] },
                            { "text" : wrongAnswer3Value[5] }]},
                    { "text" : questionValue[6],
                                  "correctAnswers" : [{"text" : correctAnswerValue[6]}],
                                "wrongAnswers" : [
                            { "text" : wrongAnswer1Value[6] },
                            { "text" : wrongAnswer2Value[6] },
                            { "text" : wrongAnswer3Value[6] }]},
                    { "text" : questionValue[7],
                                  "correctAnswers" : [{"text" : correctAnswerValue[7]}],
                                "wrongAnswers" : [
                            { "text" : wrongAnswer1Value[7] },
                            { "text" : wrongAnswer2Value[7] },
                            { "text" : wrongAnswer3Value[7] }]},
                    { "text" : questionValue[8],
                                  "correctAnswers" : [{"text" : correctAnswerValue[8]}],
                                "wrongAnswers" : [
                            { "text" : wrongAnswer1Value[8] },
                            { "text" : wrongAnswer2Value[8] },
                            { "text" : wrongAnswer3Value[8] }]},
                    { "text" : questionValue[9],
                                  "correctAnswers" : [{"text" : correctAnswerValue[9]}],
                                "wrongAnswers" : [
                            { "text" : wrongAnswer1Value[9] },
                            { "text" : wrongAnswer2Value[9] },
                            { "text" : wrongAnswer3Value[9] }]}
                ]},
					 "user" : userData};
    
    return catData;
}
function onAddCategoryClick() {
    var categoryNameHtml = '<div id="add-cat-container"><label for="cat-name">' +
                            'Име на категория' +
                            '</label>' +
                            '<input type="text" id="categoryNameInput"/>';
    $("#container").append(categoryNameHtml);
    $("#container form").remove();
    for (i=0;i<10;i++) {
        printQuestionForm();
    $("#add-question-btn").remove();
    $("#container form legend").remove();
    }
    

    var catSendBtnHtml = '<button type="button" id="send-category-btn" class="btn btn-primary">' +
                            'Прати категория' +
                        '</button></div>';
    $("#container").append(catSendBtnHtml);
    
   
        $("#send-category-btn").on("click", function() {var catData = collectCatData();performPostRequest(serviceRootUrl + "add-category", catData, alert("категория добавена"), onError);console.log(catData);});
}


//ranking 
function onRankingRequestSuccess(data) {
    preLoaderEnd();
    $("#container").prepend("<form class='col-md-12' role='search'><div class='form-group'><input type='text' data-list='.ranking-list' autocomplete='off' id='search' name='search' class='form-control search' placeholder='Search'></div></form><h3 class='text-info'>Общо регистрирани играчи: " + data.length + "</h3>" + "<table id='#myTable' class='ranking-list tablesorter table table-striped'><thead><tr><th id='name-sort'><i class='icon-user'></i></th><th id='games-sort'><i class='icon-picture'></i></th><th id='score-sort'><i class='icon-star-empty'></i></th></tr></thead><tbody id='ranking-body'></tbody></table>");
    $("#name-sort").append("Име");
    $("#games-sort").append("Игри");
    $("#score-sort").append("Точки");
    for (i=0;i<data.length;i++) {
        $("#ranking-body").append("<tr class='current'></tr>");
        $("#ranking-body .current").append('<td>' + '<a href>' + data[i].nickname + '</a>' + '</td>' + '<td>' + data[i].games +'</td>' + '<td>' + Math.round(data[i].score) +'</td>');
        $("#ranking-body tr").removeAttr("class");
    }
    // new - fix
    $("#myTable").tablesorter(); 
    
    $("#container").append("<button class='expand-all-users btn btn-info'>Виж всички потребители</button>");
    
    $("#ranking-body a").on("click",userProfile);
}


//USER PROFILE
function userProfile () {
    
    $("table, h3").remove();
    performGetRequest( serviceRootUrl + "user-score?nickname=" + $(this).html(), onProfileRequestSuccess, onError);
    function onProfileRequestSuccess(data) {
        var profileNameHtml =   '<ul>'+
                                    '<li>' +
                                        '<h3 class="text-error">Профил на ' + data.nickname + '</h3>'
                                    '</li>';
        var profileGamesHtml =      '<li><h4 class="text-success">' +
                                        'Общо изиграни Игри: ' +
                                        data.totalGamesPlayed +
                                    '</li></h4>';   
         var profileScoreHtml =     '<li><h4 class="text-success">' +
                                        'Общо точки: ' +
                                         data.totalScore +
                                    '</li></h4>' +
                                '</ul>';
        var backButtonHtml = "<button class='btn btn-info back-btn'>Назад към Класация</button>"
        var profileByCategoryHtml;
        $("#container").html(profileNameHtml + profileGamesHtml + profileScoreHtml);
        for (i=0;i<data.categoryScores.length;i++) {
            profileByCategoryHtml = '<ul>' +
                                        '<li>' +
                                            'В категория ' +
                                            '<span class="text-error">' + data.categoryScores[i].category + '</span>' +
                                        ' :</li>' +
                                        '<li>' +
                                            'Изиграни Игри: ' +
                                            data.categoryScores[i].gamesPlayed +
                                        '</li>' +
                                        '<li>' +
                                            'Точки: ' +
                                            data.categoryScores[i].score +
                                        '</li>' +
                                    '</ul>';
            $("#container").append(profileByCategoryHtml);
        }
        $("#container").append(backButtonHtml);
        $(".back-btn").on("click", reloadPage);
    }
    return false;
}

//Page reload
function reloadPage() {
        location.reload();
}

//LOGOUT
function logout() {
    sessionStorage.clear();
    location.reload();
}


//countdown timer
function secondsCount() {
    var percent = 300,
        minutes = 5,
        seconds = 0,
        refreshIntervalId  = setInterval(function () {
        seconds--;  
        if (seconds == -1) {
            minutes--;
            seconds = 60;
        }
        $("#seconds").html(seconds);
        $("#minutes").html(minutes);
        if (minutes == 0 && seconds == 0) {
            alert("game over");
            clearInterval(refreshIntervalId);
        }
    }, 1000);
    $("#minutes").html(minutes);
    $("#seconds").html(seconds);
    
    setInterval( function(){percent--;$(".bar").css("width",percent/3 + "%");},1000)
}

//UI alert window
function windowUI (param) {
    var windowUI =  "<div class='alert alert-info' role='alert'>" +
                        "<p>" + param + "</p>"  +
                    "</div>";
    $("#container").before(windowUI);
    $(".alert").delay(2000).fadeOut();
}

//ON ERROR 
function onError(errData) {
    var responseText = errData.responseText;
    var statusText = errData.statusText;
    if (responseText != undefined) {
        var errorTextJSON = JSON.parse(responseText);
        var errorText = errorTextJSON.Message;
    } else {
        var errorText = " ";
    }
    var errorUI =   "<div class='alert alert-danger' role='alert'>" +
                        // "<h4>Възникна грешка</h4>" +
                        "<p>"+ statusText + "<br/>" + errorText + "</p>" +
                        "<p>" + "<a href id='reload-page'>Reload?</a>" + '<br>or<br>' + '<a href="#" class="close-alert">Close</a>' + "</p>"
                    "</div>";
                        
    $('#reload-page').on("click", reloadPage);
    $("#container").html(errorUI);
}

// AJAX preloader
function preLoaderEnd() {
    $("#preloader").remove();
}

//GET REQUEST
function performGetRequest(
    serviceUrl,
    onSuccess,
    onError) {
    $.ajax({
        url: serviceUrl,
        type: "GET",
        timeout: 100000,
        dataType: "json",
        success: onSuccess,
        error: onError,
        ajaxStart: $("#container").prepend("<img id='preloader' src='img/ajax-loader.gif' height='32'  width='32' />")
    });
}

//POST REQUEST - v1
function performPostRequest(serviceUrl, data, onSuccess, onError) {

    //var postData = JSON.stringify(data);

    $.ajax({
        url: serviceUrl,
        type: "POST",
        timeout: 100000,
        dataType: "json",
        data: data,
        success: onSuccess,
        error: onError,
        ajaxStart: $("#container").html("<img id='preloader' src='img/ajax-loader.gif' height='32'  width='32' />")
    });
}

//POST REQUEST - v2
function performPostRequest2(serviceUrl, data, onSuccess, onError) { // Upgraded function used in "Add question" service
    $.ajax({
        url: serviceUrl,
        contentType: "application/json; charset=utf-8", //This is added
        type: "POST",
        timeout: 100000,
        dataType: "json",
        data: JSON.stringify(data), //And this is different
        success: onSuccess,
        error: onError,
        ajaxStart: $("#container").html("<img id='preloader' src='img/ajax-loader.gif' height='32'  width='32' />")
    });
}