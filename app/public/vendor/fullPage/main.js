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