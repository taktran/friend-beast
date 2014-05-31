// $(function() {

//  // Get the form.
//  var form = $('ajax-slide2');

//  // Get the messages div.
//  var formMessages = $('#form-messages');

//  // Set up an event listener for the contact form.
//  $(form).submit(function(e) {
//    // Stop the browser from submitting the form.
//    e.preventDefault();

//    // Serialize the form data.
//    var formData = $(form).serialize();

//    // Submit the form using AJAX.
//    $.ajax({
//      type: 'POST',
//      url: $(form).attr('action'),
//      data: formData
//    })
//    .done(function(response) {
//      // Make sure that the formMessages div has the 'success' class.
//      $(formMessages).removeClass('error');
//      $(formMessages).addClass('success');

//      // Set the message text.
//      $(formMessages).text(response);

//      // Clear the form.
//      $('#name').val('');
//      $('#email').val('');
//      $('#message').val('');
//    })
//    .fail(function(data) {
//      // Make sure that the formMessages div has the 'error' class.
//      $(formMessages).removeClass('success');
//      $(formMessages).addClass('error');

//      // Set the message text.
//      if (data.responseText !== '') {
//        $(formMessages).text(data.responseText);
//      } else {
//        $(formMessages).text('Oops! An error occured and your message could not be sent.');
//      }
//    });

//  });

// });


// Binds the proper click events to the target object
// supports jQuery collections
 var touch = 'createTouch' in document,
  eStart = touch ? 'touchstart' : 'mousedown',
  eMove = touch ? 'touchmove' : 'mousemove',
  eEnd = touch ? 'touchend' : 'mouseup';

$.fn.tap = function(callback){
    this.each(function(){
        var $this = $(this);
        if(touch){
            var x, y;

            $this.on('touchstart',function(e){
                x = e.originalEvent.touches[0].pageX;
                y = e.originalEvent.touches[0].pageY;

                $this.on('touchmove', function(e){
                    if(Math.abs(e.originalEvent.touches[0].pageX - x) > 6 || Math.abs(e.originalEvent.touches[0].pageY - y) > 6){
                        $this.off('touchmove').off('touchend');
                    }
                }).on('touchend', function(e){
                  e.preventDefault();
                    $this.off('touchmove').off('touchend');
                    if(callback) callback.call(this, e);
                });
            });
        }
        else{
            $this.click(callback);
        }
    });
    return this;
};

// Submits a form to the specified URL via POST,
// and executes callbacks accordingly.
$.fn.submitForm = function(url, success, error){
  var that = this;

  that.on('submit', function(e){
    e.preventDefault();
    $.ajax({
      url: url,
      type: 'POST',
      data : that.serialize(),
          success: function(){
        success.call(that);
      },
          error: function(err){
        error.call(that, err && err.responseText);
      }
    });
  });
}

$(function(){
  $('ajax-slide2').submitForm('/submit', function(){
    window.location = '/';
    console.log('submited!');
  }, function(){
    showError(err || 'Sorry, could not submit.');
  });
});