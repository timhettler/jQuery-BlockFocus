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
			   clearTimeout;
	} )();

	BlockFocus = function (settings) {
	
		this.settings = settings,
		this.el = $('body'),
		this.blocks = this.el.find(this.settings.selector),
		this.currentBlockIndex = undefined,
		this.currentBlock = undefined,
		this.scrollTop = 0,
		this.scrollDirection = 1,
		this.relativePosition = 0,
		this.watchLoop;
		
		return this;
	
	};
	
	BlockFocus.prototype = {
	
		init: function () {
		
			var $this = this;
			
			if($this.el.data('_blockFocus')) return $this.el.data('_blockFocus');
			
			$this.el.on('_blockChange',function(e,curBlockIndex){
				$this.settings.callback.apply($this, [$this.settings, $this.blocks, $this.currentBlockIndex]);
			});
			
			$this.onScroll();
			$this.watch();
			
			$this.el.data('_blockFocus', this);
		},
		
		watch: function () {
		
			var $this = this;
			
			if($this.scrollTop !== $(window).scrollTop()) {
				$this.onScroll();
			}
			
			this.watchLoop = requestAnimFrame(function(){$this.watch()});
		},
		
		unWatch: function() {
		
			cancelRequestAnimFrame(this.watchLoop);  
			
		},
		
		onScroll: function () {
			
			var $this = this,
				scrollTop = $(window).scrollTop();
				
			$this.scrollDirection =  ( scrollTop > $this.scrollTop ) ? 1 : 0 ;
			$this.scrollTop = scrollTop;
			$this.setCurBlock($this.getCurBlockIndex(scrollTop));
			$this.setRelativePostion($this.getPosInCurBlock(scrollTop));

			$this.el.trigger('_blockfocus.scroll', [$this.currentBlockIndex, $this.relativePosition, $this.scrollDirection]);
		},
		
		setCurBlock: function (index) {

			var $this = this;
		
			if(index !== $this.currentBlockIndex) {
				$this.currentBlockIndex = index,
				$this.currentBlock = ($this.currentBlockIndex !== undefined) ? $this.blocks.eq(this.currentBlockIndex) : undefined;
				console.log('block changed to '+index+'!');
				$this.blocks.removeClass('bf-is-in-focus');
				if(index !== undefined) {
					$this.currentBlock.addClass('bf-is-in-focus');
					$this.el.trigger('_blockChange', index);
				}
			}
			
			return $this.currentBlockIndex;
		},
		
		setRelativePostion: function (pos) {
		
			var $this = this;
				
			return $this.relativePosition = pos;
		},
		
		getCurBlockIndex: function (scrollTop) {
		
			var $this = this,
					curBlockIndex = undefined,
					scrollTop = scrollTop || $(window).scrollTop();
			
			for (var i=0; i<$this.blocks.length; i++) {
				if ($($this.blocks[i]).offset().top <= scrollTop + $this.settings.offset) {
					curBlockIndex = i;
				}
			}
			
			return curBlockIndex;
		},
		
		getPosInCurBlock: function (scrollTop) {
		
			var $this = this,
				$curBlock = $this.currentBlock,
				scrollTop = scrollTop || $(window).scrollTop();
				
			
			return ($curBlock === undefined) ? null : (scrollTop + $this.settings.offset - $curBlock.offset().top) / $curBlock.outerHeight();
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