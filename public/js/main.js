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

  $("#examples").change(function(ev) {
    var f = ev.target.files[0]; 
    var r = new FileReader();
    r.onload = function(e) { 
      var contents = e.target.result;
      
      myCodeMirror.setValue(contents);
    }
    r.readAsText(f);
  });

});

  

