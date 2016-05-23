$(document).ready(function() {
  var myCodeMirror = CodeMirror.fromTextArea(input);
  myCodeMirror.setSize(1000, 500);
  myCodeMirror.setValue("");
   
  $('#parse').click(function() {
		var value = myCodeMirror.getValue();
        $.get("/parse",
          { data: value },
          function (data) {
			if(data.status == 0) {
				$("#output").html('<b>Generated Tree (JSON format):</b><br><textarea rows="30" cols="150" style="resize: none;">' + JSON.stringify(data.result, undefined, 2) + '</textarea><br><br><br><br>'); 
			} else if(data.status == 1) {
				$("#output").html('<div class="error">Error at line ' + data.result.location.start.line + ' column ' + data.result.location.start.column + '. Message: ' + data.result.message + '\n</div>'); 
			} else if(data.status == 2) {
				$("#output").html('<div class="error">Error at line ' + data.result.startLine + ' column ' + data.result.startColumn + '. Message: ' + data.result.message + '\n</div>'); 
			} 		   
          },
          'json'
        );
  });
  
    $('#loginImage').click(function() {
		 $('#myModal').show()
  });

  $("#examples").change(function(ev) {
    var f = ev.target.files[0]; 
    var r = new FileReader();
    r.onload = function(e) { 
      var contents = e.target.result;
      
      myCodeMirror.setValue(contents);
    }
    r.readAsText(f);
  });

    $('#saveProgramButton').click(function() {
		var valueToSent = {};
		valueToSent.program = myCodeMirror.getValue();
		valueToSent.owner = 'adrian';
		valueToSent.name = $("#saveas").val();
        $.get("/addProgram",
          { data: valueToSent },
          function (data) {
				$("#storedPrograms").html('<a href="getProgram/' + data[0].name + '"><button type="button" class="btn btn-info">' + data[0].name + '</button></a>'); 				
          },
          'json'
        );
  });

});

$(function() {
    
    var $formLogin = $('#login-form');
    var $formRegister = $('#register-form');
    var $divForms = $('#div-forms');
    var $modalAnimateTime = 300;
    var $msgAnimateTime = 150;
    var $msgShowTime = 2000;

    $("form").submit(function () {
        switch(this.id) {
            case "login-form":
                var $lg_username=$('#login_username').val();
				var $lg_password=$('#login_password').val();
				
				var checkResult;
				var valueToSent = {};
				valueToSent.name = $('#login_username').val();
				valueToSent.password = $('#login_password').val();
				$.ajaxSetup({async: false});
				$.get("/validateCredentials",
				{ async: false,
				  data: valueToSent },
					function (data) {
					checkResult = data.text; 				
				},
				'json'
				);
                
                if (checkResult == 'yes') {
					msgChange($('#div-login-msg'), $('#icon-login-msg'), $('#text-login-msg'), "success", "glyphicon-ok", "Login OK");
                } else {
                    msgChange($('#div-login-msg'), $('#icon-login-msg'), $('#text-login-msg'), "error", "glyphicon-remove", "Login error");
                }
                return false;
                break;
            case "register-form":
                var $rg_username=$('#register_username').val();
                var $rg_email=$('#register_email').val();
                var $rg_password=$('#register_password').val();
				
				var checkResult;
				var valueToSent = {};
				valueToSent.name = $('#register_username').val();
				$.ajaxSetup({async: false});
				$.when($.get("/accountExists",
				{ async: false,
				  data: valueToSent },
					function (data) {
					checkResult = data.text; 				
				},
				'json'
				)).then(function(){
					if (checkResult == 'yes') {
					msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "error", "glyphicon-remove", "Account already exists");
                } else {
					valueToSent.name = $('#register_username').val();
					valueToSent.password = $('#register_password').val();
					$.ajaxSetup({async: false});
					$.when($.get("/createAccount",
					{ async: false,
					  data: valueToSent },
						function (data) {			
					},
					'json'
					)).then(function(){
						// thing b
					});
					
					msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "success", "glyphicon-ok", "Register OK");	
                }
                return false;
				});
				
                break;
            default:
                return false;
        }
        return false;
    });
    
    $('#login_register_btn').click( function () { modalAnimate($formLogin, $formRegister) });
    $('#register_login_btn').click( function () { modalAnimate($formRegister, $formLogin); });
    
    function modalAnimate ($oldForm, $newForm) {
        var $oldH = $oldForm.height();
        var $newH = $newForm.height();
        $divForms.css("height",$oldH);
        $oldForm.fadeToggle($modalAnimateTime, function(){
            $divForms.animate({height: $newH}, $modalAnimateTime, function(){
                $newForm.fadeToggle($modalAnimateTime);
            });
        });
    }
    
    function msgFade ($msgId, $msgText) {
        $msgId.fadeOut($msgAnimateTime, function() {
            $(this).text($msgText).fadeIn($msgAnimateTime);
        });
    }
    
    function msgChange($divTag, $iconTag, $textTag, $divClass, $iconClass, $msgText) {
        var $msgOld = $divTag.text();
        msgFade($textTag, $msgText);
        $divTag.addClass($divClass);
        $iconTag.removeClass("glyphicon-chevron-right");
        $iconTag.addClass($iconClass + " " + $divClass);
        setTimeout(function() {
            msgFade($textTag, $msgOld);
            $divTag.removeClass($divClass);
            $iconTag.addClass("glyphicon-chevron-right");
            $iconTag.removeClass($iconClass + " " + $divClass);
  		}, $msgShowTime);
    }
});

  

