$(document).ready(function() {
  $('#parse').click(function() {
    /*try {
      var result = pl0.parse($('#input').val());
      $('#output').html(JSON.stringify(result,undefined,2));
    } catch (e) {
      $('#output').html('<div class="error"><pre>\n' + JSON.stringify(e, null,4) + '\n</pre></div>');
    }*/
		var value = $('#input').val();
        $.get("/parse",
          { data: value },
          function (data) {
			if(data.status == 1) {
				$("#output").html(JSON.stringify(data.result, undefined, 2)); 
			} else {
				$("#output").html('<div class="error"><pre>Error at line ' + data.result.location.start.line + ' column ' + data.result.location.start.column + '. Message: ' + data.result.message + '\n</pre></div>'); 
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
      
      input.innerHTML = contents;
    }
    r.readAsText(f);
  });

});

  

