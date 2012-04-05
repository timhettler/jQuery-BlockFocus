(function ($) {

	// requestAnim shim layer by Paul Irish (http://paulirish.com/2011/requestanimationframe-for-smart-animating/)
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function( callback ){
					window.setTimeout(callback, 1000 / 60);
				};
	})();

	BlockFocus = function (settings) {
	
		this.settings = settings,
		this.el = $('body'),
		this.blocks = this.el.find(this.settings.selector),
		this.currentBlockIndex = this.getCurBlockIndex($(window).scrollTop()),
		this.currentBlock = (this.currentBlockIndex) ? this.blocks.eq(this.currentBlockIndex) : undefined;
		
		return this;
	
	};
	
	BlockFocus.prototype = {
	
		init: function () {
		
			var $this = this;
			
			if($this.el.data('_blockFocus')) return $this.el.data('_blockFocus');
		
			$this.didScroll = false;
			
			$this.el.on('_blockChange',function(e,curBlockIndex){
				$this.currentBlockIndex = curBlockIndex,
				$this.currentBlock = ($this.currentBlockIndex) ? $this.blocks.eq(this.currentBlockIndex) : undefined;
				console.log('block changed to '+curBlockIndex+'!');
				$this.settings.callback.apply($this);
			});
			
			$(window).on('scroll.blockFocus',function(){
				$this.didScroll = true; 
			});
			
			$this.watch();
			
			$this.el.data('_blockFocus', this);
		},
		
		watch: function () {
		
			var $this = this;
			
			if($this.didScroll) {
				$this.onScroll();
				$this.didScroll = false;
			}
			
			requestAnimFrame(function(){$this.watch()});
		},
		
		onScroll: function () {
			
			var $this = this,
				curBlockIndex = $this.getCurBlockIndex($(window).scrollTop());
				
			if(curBlockIndex !== $this.currentBlockIndex) {
				$this.el.trigger('_blockChange', curBlockIndex);
			}
		},
		
		getCurBlockIndex: function (scrollTop) {
		
			var $this = this,
				currBlockIndex = undefined;
			
			for (var i=0; i<$this.blocks.length; i++) {
				//console.log($this,$this.blocks[i],$($this.blocks[i]).offset().top,scrollTop);
				if ($($this.blocks[i]).offset().top <= scrollTop - $this.settings.offset) {
					currBlockIndex = i;
				}
			}
			
			return currBlockIndex;
		}
	
	};
	
	$.blockFocus = function(selector, callback){
		
		var settings = {};
		
		if (typeof selector === 'object') {
		
			settings = selector;
			
		} else if (typeof selector === 'string')  {
		
			settings.selector = selector;
			
			if (typeof callback === 'function') {
			
				settings.callback = callback;
			}
			
		} else {
		
			return false;
			
		}
		
		$settings = $.extend({}, $.blockFocus.defaultSettings, settings || {});
		
		var blockFocus = new BlockFocus($settings);
			
		blockFocus.init();
		
		return blockFocus;
		
	}
	
	$.blockFocus.defaultSettings = {
		offset: 0,
		callback: function () {}
	};

})(jQuery);