/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global vi, VI, Class */

(function (vi, VI) {

	function Timer(a, b) {
		this.Events();
		this._delay = a > 0 ? a.toFloat() : 1;
		this._repeatCount = b > 0 ? b.toInt() : -1;
		this._currentCount = b > 1 ? 0 : 1;
		this._run = this.run.bind(this);
		return this;
	}

	Class.Timer = Timer;

	Timer.prototype = {
		// Events Class
		_parent: null,
		_timer: null,
		_delay: null,
		_repeatCount: null,
		_currentCount: null,
		_running: false,
		run: function () {
			this._repeatCount < 0 || this._currentCount++ < this._repeatCount ? this.callEvent("run") : this.stop();
			return this;
		},
		start: function () {
			if (this._running) {
				return this.run();
			}
			this._running = true;
			this._timer = window.setInterval(this._run, this._delay);
			this.callEvent("start");
			return this;
		},
		stop: function () {
			if (!this._timer) {
				return this;
			}
			window.clearInterval(this._timer);
			this._timer = null;
			this.callEvent("stop");
			return this;
		},
		reset: function () {
			if (!this._running) {
				return this;
			}
			this._running = false;
			this._currentCount = this.repeatCount > 1 ? 0 : 1;
			this.stop();
			this.start();
			this.callEvent("reset");
		}
	};

	new Class({
		name: "vi.Class.Timer",
		main: Timer,
		implement: Class.Events
	});

})();