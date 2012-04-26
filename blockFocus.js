/*
 *  Project: jQuery-BlockFocus
 *  Description: A jQuery plug-in that takes a selector and fires an event whenever a matched element is scrolled into.
 *  Author: Tim Hettler
 */

(function ($) {

	// requestAnim shim layer by Paul Irish (http://paulirish.com/2011/requestanimationframe-for-smart-animating/)
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function( callback ){
					return window.setTimeout(callback, 1000 / 60);
				};
	})();
	
	
	// cancelRequestAnim shim layer by Jerome Etienne (http://notes.jetienne.com/2011/05/18/cancelRequestAnimFrame-for-paul-irish-requestAnimFrame.html)
	window.cancelRequestAnimFrame = ( function() {
		return window.cancelAnimationFrame              ||
			   window.webkitCancelRequestAnimationFrame ||
			   window.mozCancelRequestAnimationFrame    ||
			   window.oCancelRequestAnimationFrame      ||
			   window.msCancelRequestAnimationFrame     ||
			   clearTimeout
	} )();

	BlockFocus = function (settings) {
	
		this.settings = settings,
		this.el = $('body'),
		this.blocks = this.el.find(this.settings.selector),
		this.currentBlockIndex = this.getCurBlockIndex($(window).scrollTop()),
		this.currentBlock = (this.currentBlockIndex) ? this.blocks.eq(this.currentBlockIndex) : undefined,
		this.watchLoop;
		
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
			
			this.watchLoop = requestAnimFrame(function(){$this.watch()});
		},
		
		unwatch: function() {
		
			cancelRequestAnimFrame(this.watchLoop);  
			
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
				if ($($this.blocks[i]).offset().top <= scrollTop + $this.settings.offset) {
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