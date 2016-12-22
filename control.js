/**
Core script to handle the entire theme and core functions
**/

var aperture;
var shutter;
var iso;


var currMode = 0;
var videoOn = 0;
var power = 1;
var firstrun = true;


var availMode = ["Program Auto", "Shutter", "Aperture", "Intelligent Auto"];
var availModeDisplay = ["P", "TV", "AV", "Intelligent"];
var modeTable = "";
var availAperture;
var availShutter;
var availISO;
var exMode;




window.onload = function(){
	window.onclick = function(e){
		var evt = window.event || e;
		$("#coordinateLeft").html(evt.clientX + "," + evt.clientY);
	}
}



var QuickSidebar = function () {

    // Handles quick sidebar toggler
    var handleQuickSidebarToggler = function () {
        // quick sidebar toggler
        $('.dropdown-quick-sidebar-toggler a, .page-quick-sidebar-toggler, .quick-sidebar-toggler').click(function (e) {
            $('body').toggleClass('page-quick-sidebar-open'); 
        });
    };


    var handleSettingChange = function () {
        var wrapper = $('.page-quick-sidebar-wrapper');
        var wrapperChat = wrapper.find('.page-quick-sidebar-chat');
 
    // intialize the frame of sidebar
        var initChatSlimScroll = function () {
            var chatUsers = wrapper.find('.page-quick-sidebar-chat-users');
            var chatUsersHeight;

            chatUsersHeight = wrapper.height() - wrapper.find('.nav-tabs').outerHeight(true);

            // chat user list 
            App.destroySlimScroll(chatUsers);
            chatUsers.attr("data-height", chatUsersHeight);
            App.initSlimScroll(chatUsers);

            var chatMessages = wrapperChat.find('.page-quick-sidebar-chat-user-messages');
            var chatMessagesHeight = chatUsersHeight - wrapperChat.find('.page-quick-sidebar-chat-user-form').outerHeight(true);
            chatMessagesHeight = chatMessagesHeight - wrapperChat.find('.page-quick-sidebar-nav').outerHeight(true);

            // user chat messages 
            App.destroySlimScroll(chatMessages);
            chatMessages.attr("data-height", chatMessagesHeight);
            App.initSlimScroll(chatMessages);
        };

        initChatSlimScroll();
        App.addResizeHandler(initChatSlimScroll); // reinitialize on window resize

        wrapper.find('.page-quick-sidebar-chat-users .media-list > .selMode').click(function () {
            $("#nav_title").text("Mode");      
            var ci = availMode.indexOf(exMode);
            generateSettingHTML(availModeDisplay, ci, "setMode", 0);
            wrapperChat.addClass("page-quick-sidebar-content-item-shown");


        });

        wrapper.find('.page-quick-sidebar-chat-users .media-list > .selAperture').click(function () {
            
            $("#nav_title").text("Aperture");   
            var ci = availAperture.indexOf(aperture);
            var lb = ci - 5;
            var hb = ci + 5;
            if (ci - 5 < 0) {
                lb = 0;
            }
            if (ci + 5 > availAperture.length - 1) {
                hb = availAperture.length - 1;
            }
           // generateSettingHTML(availAperture.slice(lb, hb), ci, "setAperture", lb);
           generateSettingHTML(availAperture, ci, "setAperture", 0);

            wrapperChat.addClass("page-quick-sidebar-content-item-shown");

            
        });

        wrapper.find('.page-quick-sidebar-chat-users .media-list > .selShutter').click(function () {
            $("#nav_title").text("Shutter");
            var ci = availShutter.indexOf(shutter);
             console.log(ci);
             /*
            var lb = ci - 5;
            var hb = ci + 5;
            if (ci - 5 < 0) {
                lb = 0;
            }
            if (ci + 5 > availShutter.length - 1) {
                hb = availShutter.length - 1;
            }*/
            // console.log(lb + " "+ hb + " " + ci + " " +  availShutter.slice(lb, hb));
           // generateSettingHTML(availShutter.slice(lb, hb), ci, "setShutter", lb);
           generateSettingHTML(availShutter, ci, "setShutter", 0);

            wrapperChat.addClass("page-quick-sidebar-content-item-shown");
            
        });

        wrapper.find('.page-quick-sidebar-chat-users .media-list > .selISO').click(function () {
            $("#nav_title").text("ISO");
            var ci = availISO.indexOf(iso);
            /*  
            var lb = ci - 5;
            var hb = ci + 5;
            if (ci - 5 < 0) {
                lb = 0
            }
            if (ci + 5 > availISO.length - 1) {
                hb = availISO.length - 1;
            }
            */
            //generateSettingHTML(availISO.slice(lb, hb), ci, "setISO", lb);
            generateSettingHTML(availISO, ci, "setISO", 0);
            wrapperChat.addClass("page-quick-sidebar-content-item-shown");
        });

        wrapper.find('.page-quick-sidebar-chat-users .list-settings > .setting').click(function (e) {

            console.log($(this).attr('value') + $(this).attr('function'));

            e.preventDefault();
            var clickedButton = e.target;
            var setting = $(this).attr('function');
            var value = $(this).attr('value');
            console.log("The vlaue of mode");
            console.log(value);
            console.log(setting);

            if (setting == "setMode") {
                var valIndex = availModeDisplay.indexOf(value);
                value = availMode[valIndex];
            }
            console.log('second value');
            console.log(value);
            var request = new XMLHttpRequest();
            request.open("GET", "/" + setting +"/" + value, true);
            request.send();
            if (setting =="setMode"){
                
                $("#second_row th.first_cell").html('updating..');
                setTimeout(updateDataValues, 2000)
            }else{
                setTimeout(updateDataValues, 1000)
                //updateDataValues();
            }
            
            wrapperChat.removeClass("page-quick-sidebar-content-item-shown");
        });


        wrapper.find('.page-quick-sidebar-chat-users .page-quick-sidebar-back-to-list').click(function () {
            $("#nav_title").text("Settings");    
            wrapperChat.removeClass("page-quick-sidebar-content-item-shown");
        });

        

        var generateSettingHTML = function(options, current, setting, lb) {
            var htmlResult = "";
             htmlResult += '<li class="media setting" value=' + options[current] + ' function= ' + setting + '><div class="media-body"><h4 class="media-heading">' + options[current] + '</h4><div class="media-heading-sub"> Current </div></div></li>'; 
            for (i = 0; i < options.length; i++) {
                if (current != i + lb) {
                    htmlResult += '<li class="media setting" value=' + options[i] + ' function= ' + setting + '><div class="media-body"><h4 class="media-heading">' + options[i] + '</h4></div></li>';
                } 

            }
           
             $("#setting_html").html(htmlResult);  
             handleSettingChange();

                                
        };


    };

    // set camera to video/picture mode when the button get clicked 
    var setupVideoButtonCallback = function() {
        var switchModeButton = document.querySelector('.switchModeButton');
        var recordButtonjq = $(".recordButton");
        switchModeButton.addEventListener("click", function(e) {
            e.preventDefault();
            var request = new XMLHttpRequest();
            console.log("Clicked button to switch mode");
            if (currMode == 1) {
                request.open("GET", "/setPictureMode", true);
                currMode = 0;
                request.send();

                $("#switch_button_text").text("Switch to Video Mode");
                recordButtonjq.removeClass("fa fa-video-camera");
                recordButtonjq.addClass("fa fa-camera");
                setTimeout(updateDataValues,1000);
            } else {
               $("#modebox").hide();
                $("#aperturebox").hide();
                $("#shutterbox").hide();
                $("#isobox").hide();
                request.open("GET", "/setVideoMode", true);
                currMode = 1;
                request.send();
                $("#switch_button_text").text("Switch to Picture Mode");
                recordButtonjq.removeClass("fa fa-camera");
                recordButtonjq.addClass("fa fa-video-camera");
            }

        });


        // take a picture or video when "play" button gets clicked
        var recordButton = document.querySelector('.recordButton');
        recordButton.addEventListener("click", function(e) {
            e.preventDefault();
            var request = new XMLHttpRequest();
            if (currMode == 1) {

                if (videoOn == 0) {
                    console.log("Clicked button to take Video");
                    request.open("GET", "/takeVideo", true);
                    request.send();
                    $(".recordButton").removeClass("fa fa-video-camera");
                    $(".recordButton").addClass("fa fa-stop");
                    videoOn = 1;
                } else {
                    console.log("Clicked button to stop Video");
                    request.open("GET", "/stopVideo", true);
                    request.send();
                    $(".recordButton").removeClass("fa fa-stop");
                    $(".recordButton").addClass("fa fa-video-camera");
                    videoOn = 0;
                }
            } else {
                console.log("Clicked button to take picture");
                request.open("GET", "/takePicture", true);
                request.send();
            }

        });
    };

    var setVideoMode = function(){
        var request = new XMLHttpRequest();
        request.open("GET", "/setVideoMode", true);
        request.send();
        console.log("set video mode !!");

    };

    // each time the values of camera changed, we update its value
    var updateDataValues = function() {
     
        console.log("update is called");

        $SCRIPT_ROOT = "";
        $.getJSON($SCRIPT_ROOT+"/_data", function(data) {
            
            exMode = data.mode;
         
    


            if (power == 0) {
                $("#power_setting").text("Turn On");
            } else {
                $("#power_setting").text("Turn Off");
            }


            availAperture = data.avail_aperture;
            availISO = data.avail_iso;
            availShutter = data.avail_shutter;

            aperture = data.aperture;
            shutter = data.shutter;
            iso = data.iso;

            
           
            modeTable = availModeDisplay[availMode.indexOf(exMode)];
            
            $("#second_row th.first_cell").html(modeTable);
            $("#second_row th.second_cell").html(aperture);
            $("#second_row th.third_cell").html(shutter);
            $("#second_row th.fourth_cell").html(iso);

            
            $("#modebox").show();
            if (currMode == 0){
            if (availAperture.length == 0){
                $("#aperturebox").hide();

            }else{
                $("#aperturebox").show();

            }
            if (availISO.length == 0){
                $("#isobox").hide();

            }else{
                $("#isobox").show();

            }
            if (availShutter.length == 0){
                $("#shutterbox").hide();

            }else{
                $("#shutterbox").show();

            }
        }

        });
        

        

    };

    return {

        init: function () {
            //layout handlers
            handleSettingChange();
            setupVideoButtonCallback();
            handleQuickSidebarToggler();
            updateDataValues();
            //setVideoMode();
            

        }
    };

}();

if (App.isAngularJsApp() === false) { 
    jQuery(document).ready(function() {    
       QuickSidebar.init(); // init metronic core componets
    });
}