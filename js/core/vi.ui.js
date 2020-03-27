/* global vi, query, Hash, $id, $ce, $cf */

/**
 * vi JavaScript Framework
 *
 *  - UI Module
 *
 * @author	yonglong_zhu
 * @version	v1.0.0
 *
 */

(function (window, vi) {
	"use strict"; // in strict mode, no this

	// Global
	var document = window.document,
	// Native.DOM
	DOM = vi.DOM,
	Element = DOM.Element,
	Elements = DOM.Elements,
	// Native.Class
	Native = vi.Native,
	Class = vi.Class,
	Ajax = Class.Ajax,
	// RegExp
	expComma = /\s*,\s*/,
	expMobile = /^1?[\d]{10}$/,
	expAttrName = /(\w+)\[?/,
	expNoInts = /[^\d\-]+/g,
	expNoNums = /[^\d\.\-]+/g,
	expNoPoints = /[^\d]+/g,
	expNoAlphas = /[^\w]+/g,
	expNoAlnums = /[^\w\d\-]+/g,
	// Object
	objRegisters = {};

	// UI
	function UI(a, b, c) {
		this || vi.error("Via new UI()");
		var i = new Class(a, b, [Class.Events, Class.Options].include(c)), n = vi.name(i);
		i.addMethods(this);
		objRegisters[n] = true;
		return i;
	}

	UI.ready = function () {
		for (var k in objRegisters) {
			objRegisters[k] && query(".vi-ui-" + k.lower()).each(function (e) {
				var i = e.getData(k);
				if (i) {
					i.ready();
				} else {
					i = new UI[k](e);
					i.bind();
					e.setData(k, i);
				}
			});
		}
	};

	UI.prototype = {
		ready: vi.owner()
	};

	new Native("vi.UI", UI);

	// zIndex Counter
	var ZIndex = new Class.Counter(1000);

	// Template
	function Template(a) {
		this._vars = {};
		this.Events();
		this.Options(a);
		return this;
	}

	Template.options = {
		namespace: "vi-template"
	};

	Template.prototype = {
		_vars: {},
		options: Template.options,
		assign: function (a, b) {
			if (b !== undefined) {
				this._vars[a] = vi.clone(b);
			} else {
				for (var k in a) {
					this._vars[k] = vi.clone(a[k]);
				}
			}
		},
		fetch: function (a) {
			var n = new Namespace(this._vars);
			return a.replace(/\{\{[a-zA-Z_]{1,1}[\w-]*\}\}/g, function (i) { // parse var
				return n.get(i) || "";
			});
		},
		display: function (a, b) {
			query(a).html(this.fetch(b));
		}
	};

	new UI("vi.UI.Template", Template);

	// Buttons
	function Buttons(a) {
		this.Events();
		this.Options(a);
		return this;
	}

	Buttons.options = {
		namespace: "vi-buttons",
		target: null,
		align: "left",
		buttons: {}
	};

	Buttons.prototype = {
		_target: null,
		options: Buttons.options,
		bind: function () {
			return this.setTarget(this.options.target);
		},
		getTarget: function () {
			return this._target;
		},
		setTarget: function (t) {
			this._target = t && query(t)[0];
			return this;
		},
		addButton: function (a, b, c, d) {
			var i = this;
			if (!a) {
				return i;
			}
			var o = i.options, bs = o.buttons, f = i._target,
			s = bs[a] || (bs[a] = {
				type: d,
				init: !f,
				events: {}
			});
			if (c) { // 添加事件
				b += "." + o.namespace;
				var v = s.events;
				if (v[b]) {
					v[b].include(c);
				} else {
					v[b] = [c];
				}
			}
			if (f && !s.target) { // 实时创建
				var x = $ce("button");
				x.className = "vi-button" + (d ? " vi-button-" + d : "");
				x.innerHTML = a;
				c && x.addEvent(b, c);
				f.appendChild(x);
				s.target = x;
			}
			return i;
		},
		removeButton: function (a) {
			var i = this, o = i.options, s = o.buttons, e = s && a && s[a] && s[a].target;
			if (e) {
				e.dispose();
				delete s[a];
			}
			return i;
		},
		removeButtonByType: function () {
			// @todo
		},
		appendButtons: function () {
			var i = this, o = i.options, b = o.buttons, t = i._target;
			if (!b || !t) {
				return i;
			}
			var f = $cf();
			for (var k in b) {
				var e = b[k];
				if (!e.target) {
					var x = $ce("button"), d = e.type;
					x.className = "vi-button" + (d ? " vi-button-" + d : "");
					x.innerHTML = k;
					x.addEvents(e.events);
					f.appendChild(x);
					e.target = x;
				}
			}
			t.appendChild(f);
			return i;
		},
		disposeButtons: function (a) {
			var i = this, o = i.options, s = o.buttons;
			for (var k in s) {
				var v = s[k], t = v && v.target;
				if (t) {
					delete v.target;
					if (a || !v.init) { // 保留初始化的按钮
						t.dispose();
					}
				}
			}
			return i;
		},
		addButtons: function (a) {
			for (var k in a) {
				var s = a[k].events;
				for (var t in s) {
					this.addButton(k, t, s[t], a[k].type);
				}
			}
		}
	};

	new UI("vi.UI.Buttons", Buttons);

	// Tabs
	function Tabs(a) {
		this.Events();
		this.Options(a);
		this._tabs = [];
		this._coords = new Elements();
		this._series = new Elements();
		return this;
	}

	Tabs.options = {
		namespace: "vi-tabs",
		type: "click",
		target: null,
		button: "left",
		draggable: false,
		animate: true,
		speed: 1000,
		onBind: null,
		onUnbind: null,
		tabs: {}
//		tabs: {
//			"Tab Title": {
//				type: "click",
//				active: false,
//				draggable: false,
//				content: "Content"
//			}
//		}
	};

	Tabs.prototype = {
		_running: false,
		options: Tabs.options,
		bind: function () {
			var i = this, o = i.options, n = o.namespace,
			t = i._target = query(o.target)[0];
			t.find("." + n + "-tab").each(i.addTab, i); // 初始已有Tab
			i.addTabs(o.tabs); // 增加新的Tab
			i.callEvent("bind");
			return i;
		},
		unbind: function () {
			var i = this, o = i.options, n = o.namespace,
			t = i._target;
			// @todo
			i.callEvent("unbind");
			return null;
		},
		selectTab: function (a) {
			var i = this, o = i.options, s = o.tabs, g = s && s[a];
			if (!g) {
				return i;
			}
			var d = g.dialog, x = d.getBox(), y = i._tab;
			if ((y && x === y) || i.callEvent("selectbefore", a) === false) {
				return i;
			}
			i._series.removeClass("vi-active");
			i._tab = x.addClass("vi-active");
			i.callEvent("select");
			return i;
		},
		addTab: function (a, b) {
			var i = this, o = i.options, n = o.namespace, t = a, m = false;
			if (String.type(a)) {
				m = Object.type(b);
				a = m ? vi.extend(b, {title: a}) : {title: a, target: b};
			} else if (Object.type(a)) {
				t = t.title;
			} else if (Element.type(a)) {
				t = a.getAttr("vi-title") || a.find("." + n + "-title").text();
			} else {
				return i;
			}

			// 初始化tab
			var s = o.tabs, g = s[t] = s[t] || {};
			if (g.dialog) {
				return i;
			}

			var d = new Dialog(a), od = d.options,
			ts = i._tabs, cs = i._coords, ss = i._series,
			x = o.draggable, y = od.draggable,
			bb = od.button || o.button, tt = od.type || o.type, cc = od.close || o.close,
			z = x && y !== false && vi.extend({}, x, y, {coords: cs, series: ss});

			g.dialog = d;

			od.alert = false;
			od.container = i._target;
			od.namespace = n;
			od.draggable = z;

			d.bind();
			d.append();

			ts.set(d);
			ss.set(d.getBox());
			cs.set(d.getTitle());

			od.active && i.selectTab(t);

			cc && d.addEvent("hide", i.removeTab.bind(i, t));

			d.getTitle().addEvent(tt + "." + n, function (e) {
				e.isButton(bb) && i.selectTab(t);
				return false;
			});

			i.callEvent("add", a);
			return i;
		},
		removeTab: function (a) {
			var i = this, o = i.options, s = o.tabs, g = s && s[a];
			if (!g) {
				return i;
			}
			var d = g.dialog, ts = i._tabs.remove(d);
			i._series.unset(d.getBox());
			i._coords.unset(d.getTitle());
			// 删除当前选择的TAB时选中第1个TAB
			ts[0] && i.selectTab(ts[0].getOption("title"));
			delete s[a];
			i.callEvent("remove", a);
			return i;
		},
		addTabs: vi.setter("addTab")
	};

	new UI("vi.UI.Tabs", Tabs);

	// Toolbar
	function Toolbar(a) {
		this.Events();
		this.Options(a);
		return this;
	}

	Toolbar.options = {
		namespace: "vi-toolbar",
		wrapper: null,
		target: null,
		align: "left",
		buttons: {},
		tabs: {}
	};

	Toolbar.prototype = {
		options: Toolbar.options
	};

	new UI("vi.UI.Toolbar", Toolbar, [Buttons, Tabs]);

	// Dialog
	function Dialog(a) {
		this.Events();
		this.Options(a);
		this._initDialog();
		return this;
	}

	Dialog.bind = function (a, b, c, d) {
		var o = a && typeof a === "object" ? a : {content: a, title: b, onShow: c, onHide: d};
		return new Dialog(o).bind();
	};

	var objPositions = {
		center: function (a) {
			return {
				top: window.getClientHeight().center(a.getHeight()),
				left: window.getClientWidth().center(a.getWidth())
			};
		},
		"left-center": function (a) {
			return {
				top: window.getClientHeight().center(a.getHeight()),
				left: 0
			};
		},
		"right-center": function (a) {
			return {
				top: window.getClientHeight().center(a.getHeight()),
				right: 0
			};
		},
		"top-center": function (a) {
			return {
				top: 0,
				left: window.getClientWidth().center(a.getWidth())
			};
		},
		"bottom-center": function (a) {
			return {
				bottom: 0,
				left: window.getClientWidth().center(a.getWidth())
			};
		},
		"left-top": function () {
			return {
				top: 0,
				left: 0
			};
		},
		"right-top": function () {
			return {
				top: 0,
				right: 0
			};
		},
		"left-bottom": function () {
			return {
				bottom: 0,
				left: 0
			};
		},
		"right-bottom": function () {
			return {
				bottom: 0,
				right: 0
			};
		}
	};

	Dialog.options = {
		namespace: "vi-dialog",
		target: null,
		container: null,
		box: null,
		handler: null,
		position: "center",
		title: "Dialog",
		content: null,
		width: "auto",
		scale: 4,
		height: "auto",
		minHeight: null,
		submit: null,
		reset: null,
		right: null,
		cancel: null,
		show: false,
		mask: true,
		draggable: true,
		header: true,
		footer: true,
		close: true,
		zoom: true,
		alert: true,
		offset: null,
		align: "left",
		onReady: null,
		onDrag: null,
		onDrop: null,
		onCancel: null,
		onRight: null,
		onSubmit: null,
		onReset: null,
		onShow: null,
		onHide: null,
		onBind: null,
		onUnbind: null,
		tabs: {},
		buttons: {}
	};

	Dialog.prototype = {
		_running: false,
		options: Dialog.options,
		_initDialog: function () {
			var i = this, o = i.options, bs = o.buttons;
			o.alert && ['submit', 'reset', 'right', 'cancel'].each(function (v) {
				o[v] && (bs[v] || (bs[v] = {
					type: v,
					init: true,
					events: {
						click: i[v].wrap(i, false)
					}
				}));
			});
		},
		bind: function () {
			var i = this, o = i.options, n = o.namespace,
			cs = query(o.container),
			ts = query(o.target), t = ts[0],
			tib = i._isBox = t && t.hasClass(n),
			tih = i._isHandler = t && t.hasClass(n + "-handler"),
			hs = tih ? ts : query(o.handler),
			b = tib ? t : query(o.box)[0];
			i._target = t;
			i._container = cs[0] ? cs : t && t.getParent() || document.body;
			i._box = b;
			i._handler = hs[0] && hs.onClick(n, i.show.wrap(i, false));
			o.show && i.show();
			i.callEvent("bind");
			return i;
		},
		unbind: function () {
			var i = this, o = i.options, n = o.namespace,
			t = i._target, d = i._handler;
			t && t.removeClass(n);
			d && d.removeClass(n + "-handler").onClick(n, null);
			i._running = false;
			i.hide();
			i.callEvent("unbind");
			return null;
		},
		ready: function () { // 响应式的临时解决方案
			var i = this;
			if (i._isHandler) {
				return i;
			}
			var o = i.options, n = o.namespace, p = i._container, h = o.handler,
			t = i._target, d = query(h, p)[0] || t;
			d && d.addClass(n + "-handler").onClick(n, i.show.bind(i));
			i.callEvent("ready");
			return i;
		},
		show: function (e) {
			var i = this;
			if (i._running || i.callEvent("showbefore", e) === false) {
				return i;
			}
			var o = i.options;
			if (o.mask) {
				i._mask = Mask.show(o.mask);
			}
			i.append();
			i.callEvent("show", e);
			return i;
		},
		hide: function (e) {
			var i = this;
			if (!i._running || i.callEvent("hidebefore", e) === false) {
				return i;
			}
			i._running = false;
			var o = i.options, m = o.mask && i._mask;
			m && m.hide();
			i.dispose();
			i.callEvent("hide", e);
			return i;
		},
		submit: function (e) {
			var i = this;
			if (!i._running || i.callEvent("submit", e) === false) {
				return i;
			}
			var t = i._target, f = t.find("form")[0];
			f && f.submit();
			i.hide(e);
			return i;
		},
		reset: function (e) {
			var i = this;
			if (!i._running || i.callEvent("reset", e) === false) {
				return i;
			}
			var t = i._target, f = t.find("form")[0];
			f && f.reset();
			return i;
		},
		right: function (e) {
			var i = this;
			if (i._running && i.callEvent("right", e) !== false) {
				i.hide(e);
			}
			return i;
		},
		cancel: function (e) {
			var i = this;
			if (i._running && i.callEvent("cancel", e) !== false) {
				i.hide(e);
			}
			return i;
		},
		getTarget: function () {
			return this._target;
		},
		getBox: function () {
			return this._box;
		},
		getHandler: function () {
			return this._handler;
		},
		getBody: function () {
			return this._body;
		},
		getHeader: function () {
			return this._header;
		},
		getTitle: function () {
			return this._title;
		},
		getFooter: function () {
			return this._footer;
		},
		getFooterBar: function () {
			var i = this, o = i.options, fb = null;
			if (o.footer) {
				fb = i._footerbar || (i._footerbar = new Toolbar({buttons: o.buttons}));
				fb.setTarget(i._footer);
			}
			return fb;
		},
		getDraggable: function () {
			return this._draggable;
		},
		setPosition: function (a) {
			var i = this;
			if (!i._running) {
				return i;
			}
			var o = i.options, b = i._box, s = o.offset || {},
			f = a && objPositions[a] || objPositions[o.position || "center"],
			p = f ? f(b) : objPositions.center(b);
			for (var k in s) { // 偏移值
				if (p[k]) {
					p[k] += s[k];
				}
			}
			b.css(p);
			return i;
		},
		setSize: function () {
			var i = this;
			if (!i._running) {
				return i;
			}
			var o = i.options, b = i._box, s = b.style,
			x = o.width, h = o.minHeight || 0, y = o.height;
			s.width = x === "auto" ? (window.getClientWidth() / o.scale) + "px" : x + "px";
			s.height = y === "auto" ? h > 0 ? Math.max(h, b.getHeight()) + "px" : "auto" : Math.max(h, y) + "px";
			return i;
		},
		create: function () {
			var i = this, o = i.options, n = o.namespace,
			a = i._box = $ce("div"),
			h = "<div class='" + n + "-inner'>";
			if (o.header) {
				h += "<div class='" + n + "-header'>";
				if (o.title) {
					h += "<div class='" + n + "-title'><span class='" + n + "-ttext'>" + o.title + "</span></div>";
				}
				if (o.close) {
					h += "<a href='javascript:;' class='" + n + "-close'><span class='halflings halflings-remove'></span></a>";
				}
				h += "<div class='vi-divider " + n + "-divider'></div></div>";
			}
			h += "<div class='" + n + "-body'>" + (o.content || "") + "</div>";
			if (o.footer) {
				h += "<div class='" + n + "-footer'></div>";
			}
			h += "</div>";
			a.className = n;
			a.innerHTML = h;
			return a;
		},
		append: function () {
			var i = this, o = i.options, n = o.namespace, u = o.draggable, l = o.alert,
			v = i._events, t = i._target, p = i._container,
			b = i._isBox, e = i._isHandler, a = b ? i._box : i.create(), // 如果target不是box则创建一个box
			h = i._header || (i._header = o.header && a.find("." + n + "-header")[0]),
			c = i._title || (i._title = h && a.find("." + n + "-title")[0]),
			d = i._close || (i._close = h && o.close && a.find("." + n + "-close")[0]),
			g = i._body || (i._body = a.find("." + n + "-body")[0]),
			f = i._footer || (i._footer = o.footer && a.find("." + n + "-footer")[0]),
			k = i._draggable || (i._draggable = u && Draggable.bind(vi.extend({}, u, {target: a, handler: c})));
			k && k.addEvent("drag", v.drag).addEvent("drop", v.drop);
			i._running = true;
			f && i.getFooterBar().appendButtons();
			d && d.onClick(n, i.hide.wrap(i, false));
			// 如果target不是box
			if (!b) {
				// box放入父标签
				p.append(a);
				if (t) {
					i._tStyle = t.style.cssText;
					e || !g || g.append(t);
					t.show();
				}
			}
			// 如果是弹出窗口则调整显示位置
			if (l) {
				var s = a.style;
				i._bStyle = s.cssText;
				s.position = "fixed";
				s.zIndex = ZIndex.incr();
				i.setSize();
				a.show();
				i.setPosition();
				window.onResize(n, i.setPosition.bind(i));
			}
			return i;
		},
		dispose: function () {
			var i = this, o = i.options, n = o.namespace, l = o.alert,
			p = i._container, a = i._box, t = i._target, d = i._close, f = i._footer, b = i._isBox, e = i._isHandler;
			i._running = false;
			f && i.getFooterBar().disposeButtons();
			d && d.onClick(n);
			if (l) {
				a.style.cssText = i._bStyle;
				window.onResize(n);
			}
			if (!b) {
				a.dispose();
				i._box = i._header = i._title = i._close = i._body = i._footer = i._footerbar = i._draggable = null;
				if (t) {
					t.style.cssText = i._tStyle;
					!l || e || p.append(t);
				}
			}
		}
	};

	new UI("vi.UI.Dialog", Dialog);

	// Mask
	function Mask(a) {
		this.Events();
		this.Options(a);
		return this;
	}

	Mask.show = function (a, b, c, d) {
		a = typeof a === "object" ? a : {onShow: a, onHide: b, bgColor: c, opacity: d};
		var n = new Mask(a);
		return n.bind().show();
	};

	Mask.options = {
		namespace: "vi-mask",
		wrapper: null,
		target: null,
		onShow: null,
		onHide: null,
		bgColor: null,
		opacity: null
	};

	Mask.prototype = {
		_running: false,
		options: Mask.options,
		bind: function () {
			var i = this, o = i.options, n = o.namespace,
			w = query(o.wrapper).el(0) || document.body,
			t = query(o.target)[0];
			t && t.addClass(n);
			i._wrapper = w;
			i._target = t;
			i.callEvent("bind");
			return i;
		},
		unbind: function () {
		},
		show: function () {
			var i = this;
			if (i._running || i.callEvent("showbefore") === false) {
				return i;
			}
			i._running = true;
			i.append();
			i.callEvent("show");
			return i;
		},
		hide: function () {
			var i = this;
			if (!i._running) {
				return i;
			}
			i._running = false;
			i.dispose();
			i.callEvent("hide");
			return i;
		},
		setSize: function () {
			var i = this;
			if (!i._running) {
				return i;
			}
			var w = i._wrapper, t = i._target, s = t.style;
			s.width = (window.getClientWidth() + window.getScrollLeft()) + "px";
			s.height = Math.max(w.getHeight(), window.getClientHeight()) + "px";
			return i;
		},
		create: function () {
			var i = this, o = i.options, n = o.namespace,
			p = o.opacity, b = o.bgColor, t = $ce("div");
			t.className = n;
			t.style.cssText = 'position: absolute; z-index: ' + ZIndex.get(-1) + ';';
			p && t.setStyle("opacity", p);
			b && t.setStyle("backgroundColor", b);
			return t;
		},
		append: function () {
			var i = this, o = i.options, n = o.namespace,
			t = i._target || (i._target = i.create());
			i._wrapper.appendChild(t);
			t.show();
			i.setSize();
			window.onResize(n, i.setSize.bind(i));
			return i;
		},
		dispose: function () {
			var i = this, o = i.options, n = o.namespace,
			w = i._wrapper, t = i._target;
			t && w.removeChild(t);
			w && window.onResize(n);
			return null;
		}
	};

	new UI("vi.UI.Mask", Mask);

	// Confirm
	function Confirm(a) {
		this.Events();
		this.Options(a);
		this._initDialog();
		return this;
	}

	Confirm.show = function (a, b, c, d) {
		a = typeof a === "object" ? a : {content: a, title: b, onShow: c, onHide: d};
		return new Confirm(a).bind().show();
	};

	Confirm.options = {
		namespace: "vi-confirm",
		target: null,
		handler: "this",
		position: "center",
		title: "提示",
		content: "",
		width: "auto",
		height: "auto",
		minHeight: null,
		scale: 5,
		right: "确定",
		cancel: "取消",
		mask: true,
		draggable: true,
		header: true,
		footer: true,
		close: true,
		alert: true,
		onCancel: null,
		onRight: null,
		onShow: null,
		onHide: null
	};

	Confirm.prototype = {
		_running: false,
		options: Confirm.options
	};

	new UI("vi.UI.Confirm", Confirm, Dialog);

	// Alert
	function Alert(a) {
		this.Events();
		this.Options(a);
		this._initDialog();
		return this;
	}

	Alert.show = function (a, b, c, d) {
		var o = Object.type(a) ? a : {content: a, title: b, onShow: c, onHide: d};
		return new Alert(o).bind().show();
	};

	Alert.options = {
		namespace: "vi-alert",
		target: null,
		handler: "this",
		position: "center",
		title: "提示",
		content: "",
		width: "auto",
		height: "auto",
		minHeight: null,
		scale: 5,
		right: "确定",
		mask: true,
		draggable: true,
		header: true,
		footer: true,
		close: true,
		alert: true,
		onRight: null,
		onShow: null,
		onHide: null
	};

	Alert.prototype = {
		_running: false,
		options: Alert.options
	};

	new UI("vi.UI.Alert", Alert, Dialog);

	// Request
	function Request(a) {
		this.Events();
		this.Options(a);
		return this;
	}

	Request.options = {
		namespace: "vi-request",
		target: null,
		url: null,
		data: null,
		type: "post",
		dataType: "json",
		onSuccess: null,
		onError: null,
		onSend: null,
		onConfirm: null,
		onCancel: null,
		onBind: null,
		onUnbind: null
	};

	Request.prototype = {
		_running: false,
		options: Request.options,
		bind: function () {
			var i = this, o = i.options, n = o.namespace,
			t = query(o.target)[0];
			t && t.addClass(n);
			t.onClick(n, i.send.bind(i));
			i._target = t;
			i.callEvent("bind");
			return i;
		},
		unbind: function () {
			var i = this, o = i.options,
			t = o.target;
			t.removeClass("vi-request");
			t.onClick(o.namespace);
			i.callEvent("unbind");
		},
		send: function (e) {
			var i = this, o = i.options;
			if (i._running) {
				return i;
			}
			if (i.callEvent("send", e) === false) { // 元素上的其它事件均不执行
				e && e.stop();
				return i;
			}
			if (!i.hasEvent("confirm")) {
				return i._send();
			}
			Confirm.show({
				content: i.callEvent("confirm", e),
				handler: i._target,
				onRight: i._send.bind(i),
				onCancel: i._events.cancel
			});
			return i;
		},
		_send: function () {
			var i = this;
			if (i._running) {
				return i;
			}
			i._running = true;
			var o = i.options;
			Ajax.send({
				url: o.url,
				data: o.data,
				type: o.type,
				dataType: o.dataType,
				onSuccess: function (a, b) {
					i._running = false;
					i.callEvent("success", a, b);
				},
				onError: function (a, b) {
					i._running = false;
					i.callEvent("error", a, b);
				}
			});
			return i;
		}
	};

	new UI({
		name: "vi.UI.Request",
		main: Request,
		write: true
	});

	// Draggable
	function Draggable(a) {
		this.Events();
		this.Options(a);
		return this;
	}

	Draggable.bind = function (a, b, c, d) {
		var o = typeof a === "object" ? a : {target: a, handler: b, onDrag: c, onDrop: d};
		return new Draggable(o).bind();
	};

	Draggable.options = {
		namespace: "vi-draggable",
		wrapper: null, // 移动范围元素，可以是window即当前可见区域范围
		target: null, // 拖动元素，必须是一个元素
		handler: null, // 触发拖动的元素
		container: null, // 移动元素存放容器，可以是元素集合
		series: null, // 一系列拖放元素
		coords: null, // 一系列坐标元素
		droppable: false, // 拖放元素在容器范围内时是否预告它即将放下的位置
		locked: false, // 是否将拖动元素锁定在容器中
		reset: false, // 放下时是否重置到原始位置
		clone: false, // 开始手动时是否在克隆元素到原始位置
		animate: true, // 使用动画效果吗
		button: "left", // 触发拖动的鼠标键
		delay: 13, // 间隔多久更新移动元素位置
		onSwap: null, // 元素交换位置时
		onDrag: null, // 开始拖放附加事件
		onDrop: null // 结束拖放附加事件
	};

	Draggable.prototype = {
		_running: false,
		options: Draggable.options,
		bind: function () {
			var i = this, o = i.options, n = o.namespace,
			w = query(o.wrapper).el(0),
			c = o.container, cs = Elements.type(c) ? c : query(c), // 保留引用
			s = o.series, ss = Elements.type(s) ? s : query(s), // 保留引用
			d = o.coords, ds = Elements.type(d) ? d : query(d), // 保留引用
			t = query(o.target, cs).el(0),
			h = query(o.handler, t).el(0) || t;
			i._target = t;
			i._wrapper = w;
			i._handler = h;
			i._series = ss;
			i._coords = ds;
			i._container = cs;
			t && t.addClass(n);
			cs[0] && cs.addClass(n + "-container");
			h && h.addClass(n + "-handler").onMousedown(n, i._drag.bind(i));
			i.callEvent("bind");
			return i;
		},
		unbind: function () {
			var i = this, o = i.options, n = o.namespace,
			c = i._container, s = i._series, t = i._target, h = i._handler;
			t && t.removeClass(n);
			h && h.removeClass(n + "-handler");
			s[0] && s.removeClass(n + "-series");
			c[0] && c.removeClass(n + "-container");
			h && h.onMousedown(n);
			i.callEvent("unbind");
			return null;
		},
		_drag: function (e) {
			var i = this, o = i.options;
			if (i._running || !e.isButton(o.button) || i.callEvent("dragbefore", e) === false) { // 哪个键触发有效
				return false;
			}
			i._running = true;
			var n = o.namespace, a = o.droppable, h = i.hasEvent("run"), // 有运行中事件
			w = i._wrapper, c = i._container, t = i._target, p = t,
			oc = !!c[1] || o.clone, or = o.reset, od = o.delay,
			x = e.clientX, X = x, y = e.clientY, Y = y, // 起始 鼠标位置
			ss = i._series, ds = i._coords, cs = ds[0] ? ds : ss,
			sk, ck = c[0] && c.hasChild(t).indexOf(true),
			hs = a && ss[0], hc = ck >= 0, b = document.body,
			v, s, z, g, r, q, m, u, cr,
			k = function () {
				if (!i._running) { // 节流中断
					return;
				}
				if (hs) { // 允许目标元素放下时克隆其到body中
					cr = cs[0] && cs.getRectangle();
				} else if (oc) { // 克隆目标元素到body
					b = hc ? c[ck] : w || b;
				} else {
					or && (i._style = t.style.cssText);
					b = null;
				}
				if (b) {
					p = t.clone(true);
					p.addClass(n + "-clone");
					i._clone = p;
					b.appendChild(p);
				}
				if (hc && !hs) { // 限制容器范围
					u = true;
					g = c.getRectangle(p);
					r = g[ck];
				} else if (w) { // wrapper
					u = !w.setTimeout;
					r = w.getRectangle(p);
				} else { // 没有限制
					u = false;
					r = null;
				}
				b = r || cr ? t.getPosition(u) : t.getOffset();
				p.addClass(n + "-running");
				s = p.style;
				s.position = u ? "absolute" : "fixed";
				s.left = b.left + "px";
				s.top = b.top + "px";
				s.zIndex = ZIndex.incr();
				// 容器间的切换时块整个移入
				b.width = hc ? p.getWidth() : p.getClientWidth();
				b.height = hc ? p.getHeight() : p.getClientHeight();
				v = b.left;
				z = b.top;
				i._offset = {left: v, top: z};
				i._timer = window.setInterval(f, od);
				f();
			},
			d = function (e) { // 原始事件只记录坐标
				document.clearSelection();
				X = e.clientX;
				Y = e.clientY;
				m = null;
				if (k) { // 节流
					i._delay = window.setTimeout(k, od);
					k = null;
				}
			},
			f = function (e) {
				b.left = v + X - x;
				b.top = z + Y - y;
				if (m && m === b) { // 未移动
					return;
				}
				r && r.limit(b);
				q && q();
				s.left = b.left + "px";
				s.top = b.top + "px";
				m = b;
				h && i.callEvent("run", e);
			};
			if (hs) { // 一系列元素之间相互拖放
				q = function () {
					if (sk === undefined) { // 初始化位置
						var j = Math.max(0, ss.indexOf(t)), n = ss[j], p = n.parentNode;
						p.insertBefore(t, n);
						i._body = p;
						sk = j;
						return;
					}
					for (var h = false, j = 0, l = cr.length; j < l; j++) {
						if (j !== sk && cr[j].inRight(b) && cr[j].inBottom(b)) { // 拖放元素在容器右下角时创建一个即将放下的临时元素到其后
							h = cr[j];
							break;
						}
					}
					if (!h) { // 没找到位置
						return;
					}
					i._offset = {top: h.top, left: h.left};
					// 交换元素位置
					var n = ss[j], p = n.parentNode, u = i._body;
					i._item = n;
					i._body = p;
					p.insertBefore(t, sk > j ? n : n.nextSibling); // 往前拖 ? : 往后拖
					cs.swap(sk, j);
					cs === ss || ss.swap(sk, j);
					n = Math.min(j, sk);
					l = u && u !== p ? l : Math.max(j, sk) + 1;
					for (; n < l; n++) { // 切换容器时当前元素后的所有元素位置都要更新
						cr[n] = cs[n].getRectangle();
					}
					i.callEvent("swap", sk, j);
					sk = j;
				};
			} else if (hc) { // 一系列容器之间相互拖放
				q = function () {
					for (var j = 0, l = g.length; j < l; j++) {
						if (j !== ck && g[j].inSide(b)) { // 拖放元素在容器范围内时创建一个即将放下的临时元素到容器末尾中
							c[j].appendChild(t);
							i._offset = t.getPosition(u);
							i._body = c[j];
							ck = j;
							break;
						}
					}
				};
			}
			document.onMouseup(n, i._drop.bind(i)); // 鼠标松下时中断
			document.onMousemove(n, d);
			i.callEvent("drag", e);
			return true;
		},
		_drop: function (e, b) {
			var i = this;
			if (!i._running) {
				return false;
			}
			var o = i.options, n = o.namespace,
			or = o.reset, t = i._target, c = i._clone, y = i._style,
			j = function () {
				i._running = false;
				c || t.removeClass(n + "-running");
			};
			document.onMouseup(n);
			document.onMousemove(n);
			if (!i._delay) { // 未移动过
				j();
				return false;
			}
			window.clearInterval(i._timer);
			window.clearTimeout(i._delay);
			var a = i._animate, f = function () {
				if (or && y) { // 重置样式
					t.style.cssText = y;
					i._style = null;
				}
				c && c.dispose();
				j();
			};
			if (b || !o.animate || (!i._body && !or)) { // 没有重置动画
				a && a.stop();
				f();
			} else { // 有重置动画
				var l = c || t, m = i._item, s = m ? m.getOffset() : l.style;
				i._animate = l.animate({left: s.left, top: s.top}, i._offset, or, f).start();
			}
			i._timer = i._delay = i._animate = i._clone = i._body = i._offset = i._item = null;
			i.callEvent("drop", e, b);
			return true;
		}
	};

	new UI("vi.UI.Draggable", Draggable);

	// Paginator
	function Paginator(a) {
		this.Events();
		this.Options(a);
		return this;
	}

	Paginator.options = {
		namespace: "vi-paginator",
//		target: null,
		total: null, // 总条数
		page: null, // 当前页
		url: null, // 分页链接
		blank: false,
		ajax: false, // ajax分页 @todo
		group: false, // 显示组分页
		range: 2, // 显示前后几页
		size: 10 // 每页多少条
	};

	Paginator.prototype = {
		options: Paginator.options,
		bind: function () {
			var i = this, o = i.options, n = o.namespace,
			t = query(o.target)[0];
			t.addClass(n);
			i._target = t;
			i.append();
			i.callEvent("bind");
			return i;
		},
		unbind: function () {
			var i = this,
			t = i._target;
			t && t.removeClass("vi-paginator").setHtml("").hide();
			i.callEvent("unbind");
		},
		append: function () {
			var i = this, o = i.options, w = i._target, h = "", t = o.total, s = o.size;
			if (t <= 0 || t < s) { // 总数小于等于0或小于每页数量
				w.hide();
				return;
			}
			var l = Math.ceil(t / s);
			if (l <= 1) { // 1页及以下不需要分页
				w.setHtml(h).hide();
				return;
			}
			var ng = "", pg = "", // 下/上一组
			n = o.namespace,
			b = o.blank ? " target='_blank'" : "",
			q = o.url || location.href || "",
			m = q && q.match(/page=(\d+)/),
			p = o.page || (m && m[1]) || 0; // 第几页
			p = p.toInt().limit(1, l);
			var r = o.range.toInt().limit(1, l),
			g = Math.max(2, r) * 2 + 1, // 每组多少页
			sp = p > r ? p - r : Math.max(1, p - 1), // 起始页数
			ep = (p + r).limit(g, l); // 结束页数
			q = q.replace(/[\?|&]?page(?:size|)=\d*&?/ig, "");
			q += (q.has("?") ? "&" : "?") + (this.defaults.size === s ? "" : "pagesize=" + s + "&");
			h += "<div class='" + n + "-header'>共<span class='" + n + "-count'>" + l + "</span>页，<span class='" + n + "-total'>" + t + "</span>条记录</div>"; // 分页信息
			h += "<ul class='" + n + "-body'>";
			if (p !== 1) { // 不是第一页
				h += "<li class='first'><a href='" + q + "page=1'" + b + ">首 页</a></li>";
				if (p > 1) {
					h += "<li class='prev'><a href='" + q + "page=" + (p - 1) + "'" + b + ">上一页</a></li>";
				}
			}
			if (o.group && l > g) { // 至少有1组
				var gt = Math.ceil(p / g), // 当前页处于第几组
				fp = ((gt - 1) * g) + 1, // 当前组起始页
				lp = gt * g; // 当前组结束页
				if (lp < l) { // 中间组
					sp = fp;
					ep = lp;
					ng = "<li class='nextgroup' title='下一组, 第" + (lp + 1) + "页'><a href='" + q + "page=" + (lp + 1) + "'" + b + ">...</a></li>";
				} else { // 其它组
					sp = fp;
					ep = l;
				}
				if (gt > 1) { // 不是第1组
					pg = "<li class='prevgroup' title='上一组, 第" + (fp - 1) + "页'><a href='" + q + "page=" + (fp - 1) + "'" + b + ">...</a></li>";
				}
			}
			h += pg; // 连接上一组
			for (ep++; sp < ep; sp++) { // 生成中间页
				if (sp === p) {
					h += "<li class='vi-active' title='当前页, 第" + sp + "页'><a href='javascript:;'>" + sp + "</a></li>";
				} else {
					h += "<li title='第" + sp + "页'><a href='" + q + "page=" + sp + "'" + b + ">" + sp + "</a></li>";
				}
			}
			h += ng; // 连接下一组
			if (p !== l) { // 不是最后页
				if (p < l) {
					h += "<li class='next' title='下一页, 第" + (p + 1) + "页'><a href='" + q + "page=" + (p + 1) + "'" + b + ">下一页</a></li>";
				}
				h += "<li class='last' title='尾页, 第" + sp + "页'><a href='" + q + "page=" + l + "'" + b + ">尾 页</a></li>";
			}
			h += "</ul>";
			w.append(h).show();
		}
	};

	new UI("vi.UI.Paginator", Paginator);

	// Countdown
	function Countdown(a) {
		this.Events();
		this.Options(a);
		return this;
	}

	Countdown.options = {
		namespace: "vi-countdown",
//			target: null,
		wrapper: null,
		onStart: null,
		onStop: null,
		nowTime: null,
		startTime: null,
		endTime: null
	};

	Countdown.prototype = {
		_running: false,
		options: Countdown.options,
		bind: function () {
			var i = this, o = i.options, n = o.namespace,
			t = query(o.target)[0];
			t.addClass(n);
			i._target = t;
			i.start();
			i.callEvent("bind");
			return i;
		},
		unbind: function () {
			var i = this;
			i.stop();
			i.callEvent("unbind");
		},
		start: function () {
			var i = this, t = i._target;
			if (!t || i._running || i.callEvent("start") === false) {
				return i;
			}
			i._running = true;
			var o = i.options, n = o.namespace,
			no = parseInt(o.nowTime, 10) * 1000,
			so = parseInt(o.startTime, 10) * 1000,
			eo = parseInt(o.endTime, 10) * 1000;
			if (eo < 0 || so < 0) {
				return i;
			}
			var d = t.find("." + n + "-day"),
			h = t.find("." + n + "-hour"),
			m = t.find("." + n + "-minute"),
			s = t.find("." + n + "-seconds"),
			f = function () {
				no && (no += 1000);
				var nt = no ? no : +new Date,
				st = so && eo ? so : nt,
				et = eo ? eo : so || nt,
				dt = (et - st) / 1000, // 相差秒数
				dn = parseInt(dt / 60 / 60 / 24, 10), // 计算剩余的天数
				hn = parseInt(dt / 60 / 60 % 24, 10), // 计算剩余的小时数
				mn = parseInt(dt / 60 % 60, 10), // 计算剩余的分钟数
				sn = parseInt(dt % 60, 10);  // 计算剩余的秒数
				// 赋值给指定的文本
				d.length ? d.setHtml(dn) : hn += dn * 24;
				h.length ? h.setHtml(hn) : mn += hn * 60;
				m.length ? m.setHtml(mn) : sn += mn * 60;
				// 倒计时停止
				if (dn > 0 || hn > 0 || mn > 0 || sn > 0) {
					s.setHtml(sn);
				} else {
					d.setHtml("0");
					h.setHtml("00");
					m.setHtml("00");
					s.setHtml("00");
					i.stop();
				}
			};
			f();
			i._timer = window.setInterval(f, 1000);
			return i;
		},
		stop: function () {
			var i = this;
			if (!i._running || i.callEvent("stop") === false) {
				return i;
			}
			i._running = false;
			window.clearInterval(i._timer);
			i._timer = null;
			return i;
		}
	};

	new UI("vi.UI.Countdown", Countdown);

	// Form
	function Form(a) {
		this.Events();
		this.Options(a);
		this._group = {};
		return this;
	}

	Form.validate = {
		required: {// 必填项
			note: "请输入{label}",
			test: function (a) {
				return !!a || a === "0";
			},
			notes: "请选择{label}",
			tests: function (a) {
				return a.every(function (e) {
					return e.checked;
				});
			}
		},
		included: {// 非必填
			note: "请输入{label}",
			notes: "请选择{label}",
			test: function () {
				return true;
			},
			tests: function (a) {
				return a.some(function (e) {
					return e.checked;
				});
			}
		},
		num: {// 数字
			note: "{label}必须为数字",
			test: String.isNumber,
			filter: function (a) {
				return a.replace("..", ".").replace(expNoNums, "");
			}
		},
		'int': {// 整数
			note: "{label}必须为整数",
			test: String.isInt,
			filter: function (a) {
				return a.replace(expNoInts, "");
			}
		},
		"float": {// 小数
			note: "{label}必须为小数",
			test: String.isFloat,
			filter: function (a) {
				return a.replace("..", ".").replace(expNoNums, "");
			}
		},
		range: {// 数字范围
			note: function (a) {
				if (!a) {
					return "";
				}
				var p = a.split("~").toNumber(), m = String.isNumber(p[0]), n = String.isNumber(p[1]);
				if (m && n) {
					return "{label}必须为" + p[0] + "至" + p[1] + "之间的纯数字";
				}
				if (m) {
					return "{label}必须为大于等于" + p[0] + "的纯数字";
				}
				if (n) {
					return "{label}必须为小于等于" + p[1] + "的纯数字";
				}
				return "";
			},
			test: function (a, b) {
				if (!b) {
					return true;
				}
				if (!String.isNumber(a)) {
					return false;
				}
				var p = b.split("~").toNumber(), m = String.isNumber(p[0]), n = String.isNumber(p[1]);
				if (m && n) {
					return a >= p[0] && a <= p[1];
				}
				if (m) {
					return a >= p[0];
				}
				if (n) {
					return a <= p[1];
				}
				return true;
			},
			filter: function (a) {
				return a.replace("..", ".").replace(expNoNums, "");
			}
		},
		alpha: {//字母
			note: "{label}必须为字母",
			test: String.isAlpha,
			filter: function (a) {
				return a.replace(expNoAlphas, "");
			}
		},
		alnum: {
			note: "{label}必须为数字、字母、-、_、组合",
			test: String.isAlnum,
			filter: function (a) {
				return a.replace(expNoAlnums, "");
			}
		},
		mobile: {
			note: "{label}必须为手机号",
			test: function (a) {
				return expMobile.test(a);
			},
			filter: function (a) {
				return a.replace(expNoPoints, "");
			}
		},
		regexp: {// 正则
			note: "{label}不合法",
			test: function (a, b) {
				return b && new RegExp(b).test(a);
			}
		}
	};

	Form.options = {
		namespace: "vi-form",
		target: null,
		handler: null,
		ajax: true,
		url: null,
		data: null,
		type: "post",
		dataType: "json",
		filter: true,
		validate: true,
		submit: true,
		onSubmit: null,
		onSuccess: null,
		onError: null
	};

	Form.prototype = {
		_running: false,
		options: Form.options,
		bind: function () {
			var i = this, o = i.options, n = o.namespace,
			t = query(o.target)[0], h = query(o.handler),
			r = t.find("[type=reset]"), g = {},
			f = i._submit.bind(i);
			i._target = t;
			i._handler = h;
			for (var j = 0, s = t.elements, l = s.length; j < l; j++) { // 绑定输入监控事件
				var a = s[j];
				if (a.type !== "hidden" && Element.isValidInput(a)) {
					if (Element.isGroupInput(a)) {
						var k = a.name.match(/(\w+)\[?/)[1];
						g[k] = g[k] || [new Elements(), new Elements()];
						g[k][0].set(a.getNext());
						g[k][1].set(a);
					} else {
						var k = a.isNodeName("select") ? "change" : "keyup." + n + ",blur";
						a.addEvents(k + "." + n, i._validate.wrap(i, true, a, true));
					}
				}
			}
			for (var k in g) { // 绑定选择监控事件
				g[k][0].onClick(n, i.validate.delay(i, true, 13, g[k][1], true));
			}
			t.addClass(n);
			h[0] ? h.addClass(n + "-handler").onClick(n, f) : t.onSubmit(n, f);
			r[0] && r.onClick(n, i._reset.bind(i));
			i.callEvent("bind");
			return i;
		},
		unbind: function () {
			var i = this, o = i.options, n = o.namespace,
			t = i._target;
			t && t.removeClass(n);
			i._target = null;
			i.callEvent("unbind");
			return null;
		},
		submit: function () {
			this._submit();
			return this;
		},
		_submit: function (e) {
			var i = this;
			if (i._running || i.callEvent("submitbefore", e) === false) { // 提交中, 提交被中止
				return false;
			}
			var o = i.options;
			if (o.validate && !i.validate(null, false)) { // 验证失败
				return false;
			}
			i._running = true;
			if (!o.submit) {
				return false;
			}
			var t = i._target;
			i.callEvent("submit", e);
			if (!o.ajax) {
				t.submit();
			} else {
				Ajax.send({
					url: o.url,
					data: [o.data, t],
					type: o.type,
					dataType: o.dataType,
					onSuccess: function (a, b) {
						i._running = false;
						i.callEvent("success", a, b);
					},
					onError: function (a, b) {
						i._running = false;
						i.callEvent("error", a, b);
					}
				});
			}
			return false;
		},
		reset: function () {
			this._reset();
			return this;
		},
		_reset: function (e) {
			var i = this;
			if (i._running || i.callEvent("resetbefore", e) === false) {
				return false;
			}
			for (var j = 0, t = i._target, s = t.elements, l = s.length; j < l; j++) {
				var a = s[j];
				if (Element.isValidInput(a) && a.type !== "hidden") {
					a.removeData("validate");
					a.removeClass("vi-warning", "vi-success");
					t.find(".vi-validate").hide();
				}
			}
			var r = e && e.target;
			r && r.type !== "reset" && t.reset();
			i.callEvent("reset", e);
			return true;
		},
		success: function (a, b) {
			var i = this, o = i.options, n = o.namespace, s = Elements.type(a),
			g = s ? a[0].getParent() : a, p = g.getParent(), x = p.getNext(),
			l = g.isNodeName("select"), c = '<span class="halflings halflings-ok"></span>';
			a.replaceClass("vi-warning", "vi-success");
			x && x.hasClass("vi-validate") ? x.replaceClass("vi-warning", "vi-success").setHtml(c).show() : p.insertBottom('<div class="vi-validate vi-success">' + c + '</div>');
			l || g.setData("validate", true); // 已验证
			return i;
		},
		warning: function (a, b, c, d, e) {
			var i = this, o = i.options, n = o.namespace, s = Elements.type(a), v = Form.validate[b],
			g = s ? a[0].getParent() : a, p = g.getParent(), x = p.getNext(), y = p.getPrev(),
			l = g.isNodeName("select"), k = !s ? l ? "change" : "keyup" : "click", t = l || s ? "notes" : "note";
			c = c || vi.maker(v[t], "")(d).replace("{label}", y.getText().replace(/:|：/g, ""));
			k += "." + n;
			c = '<span class="halflings halflings-remove"></span> ' + c;
			a.replaceClass("vi-success", "vi-warning");
			x && x.hasClass("vi-validate") ? x.replaceClass("vi-success", "vi-warning").setHtml(c).show() : p.insertBottom('<div class="vi-validate vi-warning">' + c + '</div>');
			s || l || !o.filter || !v.filter || a.getAttr("vi-filter") === "false" || a.setValue(v.filter(a.getValue())); // 过滤value
			l || g.setData("validate", false); // 未验证
			if (!s) { // 单个
				g.hasEvent(k) || g.addEvent(k, i._validate.wrap(i, true, a, true));
			} else { // 组合
				for (var f = null, j = 0, l = a.length; j < l; j++) {
					var g = a[j].getNext();
					g.hasEvent(k) || g.addEvent(k, f = f || i.validate.delay(i, true, 13, a, true));
				}
			}
			return i;
		},
		validate: function (a, b) {
			var i = this, t = i._target;
			if (!t || i.callEvent("validatebefore", a, b) === false) {
				return false;
			}
			for (var r = true, g = i._group, j = 0, s = a && Elements.type(a) ? a : t.elements, l = s.length; j < l; j++) {
				var e = s[j];
				if (!i._validate(e, false)) {
					r && e.focus();
					r = false;
				}
			}
			for (var k in g) {
				for (var c = true, j = 0, v = g[k][1], s = g[k][0], l = s.length; j < l; j++) {
					var p = s[j].split(":"), k = p[0].split("|"), f = Form.validate[k[0]];
					if (f && !f.tests(v, k[1], b)) {
						i.warning(v, k[0], p[1], k[1], b);
						r && v[0].focus();
						c = r = false;
						break;
					}
				}
				c && i.success(v, b);
			}
			i._group = {};
			i.callEvent("validate", a, b);
			return r;
		},
		_validate: function (a, b) {
			var e, i = this;
			if (a.type !== "hidden" && Element.isValidInput(a) && (e = a.getAttr("vi-expr")) && (b || a.getData("validate"))) {
				if (Element.isGroupInput(a)) {
					if (!b) {
						var g = i._group, k = a.name.match(expAttrName);
						k = k[1];
						g[k] = g[k] || [[], new Elements()];
						g[k][0].include(e.split(","));
						g[k][1].set(a);
					}
				} else {
					for (var v = a.getValue(), j = 0, s = e.split(expComma), l = s.length; j < l; j++) {
						var p = s[j].split(":"), k = p[0].split("|"), f = Form.validate[k[0]];
						if (f && !f.test(v, k[1], b)) {
							i.warning(a, k[0], p[1], k[1], b);
							return false;
						}
					}
					i.success(a, b);
				}
			}
			return true;
		}
	};

	new UI("vi.UI.Form", Form);

	// Menu
	function Menu(a) {
		this._running = {};
		this.Events();
		this.Options(a);
		return this;
	}

	Menu.options = {
		namespace: "vi-menu",
		wrapper: null,
		keep: true, // 是否保持显示状态
		show: false,
		enter: true,
		leave: false,
		onShow: null,
		onHide: null
	};

	Menu.prototype = {
		_running: {},
		options: Menu.options,
		bind: function () {
			var i = this, o = i.options, n = o.namespace,
			p = query(o.wrapper).el(0),
			t = query(o.target, p)[0],
			m = t.find("." + n),
			h = t.find("." + n + "-handler"),
			b = t.find("." + n + "-body");
			i._container = p;
			i._target = t;
			i._handler = h;
			i._body = b;
			i._menus = m;
			t.addClass(n);
			o.show && i.show(0);
			o.enter && h.each(function (v, k) {
				v.onMouseenter(n, i.show.bind(i, k));
			});
			h.each(function (v, k) {
				v.onClick(n, i.toggle.bind(i, k));
			});
			b.onClick(n, function (e) { // 不冒泡到document
				e.stopPropagation();
			});
			o.leave && document.onMouseleave(n, function (e) {
				i.hide(0, e);
			});
			document.onClick(n, function (e) { // 点左键才关闭
				e.isButton("left") ? i.hide(0, e) : e.stopPropagation();
			});
			i.callEvent("bind");
			return i;
		},
		unbind: function () {
			var i = this, o = i.options, n = o.namespace,
			p = i._container, t = i._target, h = i._handler, b = i._body;
			i.hide();
			t.removeClass(n);
			h.removeEvent(n);
			b.removeEvent(n);
			document.removeEvent(n);
			i._container = i._target = i._handler = i._body = i._menus = null;
			i.callEvent("unbind");
			return null;
		},
		getHandler: function () {
			return this._handler[this._index];
		},
		getBody: function () {
			return this._body[this._index];
		},
		toggle: function (a, e) {
			var i = this;
			return i._running[a] ? i.hide(a, e) : i.show(a, e);
		},
		show: function (a, e) {
			var i = this;
			if (i._running[a] || i.callEvent("showbefore", a, e) === false) {
				return false;
			}
			e && e.stopPropagation();
			i._running[a] = true;
			var o = i.options, n = o.namespace,
			h = i._handler.eq(a).addClass("vi-active"),
			b = i._body.eq(a).show();
			if (a && i._menus[0]) { // 处理多层嵌套
				var s = b.getParents("." + n);
				i._menus.each(function (v, k) {
					s.has(v) || i.hide(k + 1, e);
				});
			}
			i._index = a;
			i.callEvent("show", a, e);
			return i;
		},
		hide: function (a, e) {
			var i = this;
			if (!i._running[a]) {
				return false;
			}
			e && e.stopPropagation();
			i._running[a] = false;
			i._index = null;
			var o = i.options, n = o.namespace,
			k = a && o.keep ? a : null;
			i._handler.eq(k).removeClass("vi-active");
			i._body.eq(k).hide();
			i.callEvent("hide", a, e);
			return i;
		}
	};

	new UI("vi.UI.Menu", Menu);

	document.ready(UI.ready);

})(window, window.vi);