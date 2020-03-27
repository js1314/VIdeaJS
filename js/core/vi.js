/**
 * vi JavaScript Framework
 *
 * @author	yonglong_zhu
 * @version	v1.0.0
 *
 */

/* global vi */

(function (window, undefined) {
	"use strict"; // in strict mode, no this

	// vi Object
	var vi = window.vi = {
		namespace: "vi",
		version: "1.0.0",
		debug: true,
		guid: function (a, b) {
			return (a || "vi-") + (guid++) + "-" + (b || vi.time());
		},
		data: function (a, b, c) {
			var k = b ? "{data}." + b : "{data}", s = new Namespace(a);
			return c !== undefined ? c !== null ? s.add(k, c) : s.remove(k) : s.get(k);
		},
		heap: function (a, b, c) {
			var k = b ? "{data}." + b : "{data}", s = new Namespace(a);
			return c !== undefined ? c !== null ? s.heap(k, c) : s.remove(k) : s.get(k);
		},
		error: function (a) {
			throw new Error(a);
		},
		extend: function () {
			for (var s = arguments, c = s[0] === true, a = !c && s[0] || {}, b, i = 1, l = s.length; i < l; i++) {
				if ((b = s[i]) && typeof b === "object") {
					for (var k in b) {
						a[k] = c ? vi.clone(b[k]) : b[k];
					}
				}
			}
			return a || b;
		},
		include: function () {
			for (var s = arguments, c = s[0] === true, a = !c && s[0] || {}, b, i = 1, l = s.length; i < l; i++) {
				if ((b = s[i]) && typeof b === "object") {
					for (var k in b) {
						var x = a[k], y = b[k];
						if (x === undefined) {
							a[k] = c ? vi.clone(y) : y;
						}
					}
				}
			}
			return a || b;
		},
		clone: function (a) {
			var r = a;
			if (a) {
				if (Object.type(a)) { // Object
					r = {};
					for (var k in a) {
						r[k] = vi.clone(a[k]);
					}
				} else if (Hash.type(a)) { // Hash
					r = a.clone();
				} else if (a.splice) { // no LikeArray
					for (var r = new a['{constructor}'](), i = 0, l = a.length; i < l; i++) {
						r.set(vi.clone(a[i]));
					}
				}
			}
			return r;

		},
		isset: function (a) {
			return a !== undefined && a !== null;
		},
		noset: function (a) {
			return a === undefined || a === null;
		},
		slice: function (a, b) {
			if (vi.noset(a)) {
				return [];
			}
			var t = typeof a;
			if (t === "string" || t === "function" || a.nodeType || a.setTimeout || vi.noset(a.length)) { // string, function, node, no length
				return [a];
			}
			for (var i = b || 0, r = [], l = a.length; i < l; i++) {
				r[i] = a[i];
			}
			return r;
		},
		url: function () {
			return location.href.split("#")[0];
		},
		time: function (a) {
			var d = new Date(), t = d.getTime();
			return a ? (t / 1000) : t;
		},
		eval: function (a, b) {
			return new Function(a, b)();
		},
		these: function () {
			for (var i = 0, l = arguments.length; i < l; i++) {
				try {
					return arguments[i]();
				} catch (e) {
					return false;
				}
			}
			return null;
		},
		name: function (a) {
			var t = a && a["{token}"];
			return t ? t.name : "Undefined";
		},
		type: function (a) {
			if (vi.noset(a)) {
				return "Undefined";
			}
			if (a["{token}"]) {
				var c = a['{constructor}']; // handle object.prototype
				return c && a === c.prototype ? "Object" : a["{token}"].type;
			}
			if (a.nodeType) {
				return objNodeType[a.nodeType] || "Object";
			}
			if (a.callee) {
				return "Arguments";
			}
			if (a.item) {
				return "Elements";
			}
			var t = typeof a;
			if (t !== "object") {
				return t.substr(0, 1).toUpperCase() + t.substr(1);
			}
			return expToType.exec(toString.call(a))[1];
		},
		getter: function (a) { // each arguments call this[a](arg:scalar) and collect return value
			return function () {
				for (var i = 0, r = {}, l = arguments.length; i < l; i++) {
					for (var j = 0, s = vi.slice(arguments[i]), t = s.length; j < t; j++) {
						r[s[j]] = this[a](s[j]);
					}
				}
				return r;
			};
		},
		setter: function (a) { // foreach b:object call this[a](b:key, b:value, args[])
			return function () {
				for (var i = 0, l = arguments.length; i < l; i++) {
					var v = arguments[i];
					if (v) {
						for (var k in v) {
							this[a](k, v[k]);
						}
					}
				}
				return this;
			};
		},
		caller: function (a) { // each arguments call this[a](arg)
			return function () {
				for (var i = 0, s = arguments, l = s.length; i < l; i++) {
					this[a](s[i]);
				}
				return this;
			};
		},
		maker: function (a, b) {
			var t = typeof a;
			return t !== "undefined" ? t === "function" && typeof b !== t ? a : function () {
				return a;
			} : function () {
				return b;
			};
		},
		owner: function (a) {
			return a === undefined ? function () {
				return this;
			} : function () {
				return this[a];
			};
		},
		arger: function (a) {
			return a > -1 ? function () {
				return arguments[a];
			} : function () {
				return arguments;
			};
		}
	},
	// Public Object
	objNodeType = {
		1: "Element", 2: "Attribute", 3: "Text", 4: "CDateSection",
		5: "EntityReference", 6: "Entity", 7: "ProcessingInstruction", 8: "Comment",
		9: "Document", 10: "DocumentType", 11: "DocumentFragment", 12: "Notation"
	},
	// Public Variables
	document = window.document,
	id = vi.guid(),
	guid = 0,
	slice = [].slice,
	toString = vi.toString,
	// Public RegExp
	expNativeCode = /\{\s+\[native code\]\s+\}/, // native code
	expOnEvent = /^on\w+/, // onSuccess, onError
	expNthParam = /\+?(\-?\d*n?)\+?(\-?\d*n?)/, // 2n, 2n+1, -1+n
	expBlank = /\s+| /, // \r\n
	expComma = /\s*,\s*/, // ,
	expHtml = /<[\w:]+/, // html string
	expCssnum = /^(\+|\-|\*|\/)=(\d+\.?\d*)([px|em|pt]?)$/, // +=2px, -=2em, *=2pt, /=2
	expToType = /([A-Z]{1,1}[a-z]+)\]$/, // [object String] => String
	expInt = /^\-?\d+$/, // +2, -2
	expFloat = /^\-?\d+\.{1}\d+$/, // +2.1, -2.1
	expNumber = /^\-?\d+\.?\d*$/, // +1, -1
	expAlnum = /^[\w\d\-]+$/, // alpha123number
	expAlpha = /^\w+$/, // alpha
	expChars = /^[\],:{}\s]*$/,
	expNoCommas = /,?\s*|[^,]+,?/, // ,test or test,
	expNoChars = /([.*+?^=!:${}()|[\]\/\\ ])/g, // .*+?^=!:${}()|[\]/\
	expNoTags = /<(\w+)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>|<\w+\b[^<]*\/?>|<\/\w+>/ig, // <div id="test">test</div>, <br />, </div>
	expNoScripts = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, // <script>code</script>
	expNoBraces = /(?:^|:|,)(?:\s*\[)+/g,
	expNoEscape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	expNoTokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g;

	// Support
	function Support() {
		vi.error("Illegal Constructor.");
	}

	/**
	 * 成员是否定义
	 *
	 * @param {type} a
	 * @returns {undefined}
	 */
	Support.define = function (a) {
		for (var i = 1, l = arguments.length; i < l; i++) {
			var k = arguments[i];
			Support[k] = (a[k] !== undefined);
		}
	};

	/**
	 * 成员是否定义，二者之一
	 *
	 * @param {type} a
	 * @returns {undefined}
	 */
	Support.select = function (a) {
		for (var i = 1, l = arguments.length; i < l; i++) {
			var g = arguments[i].split(":"),
			k = g[0], o = k.replace(/^on/, ""),
			d = g[1], n = d && d.replace(/^on/, ""),
			f = !d || a[d] === undefined ? false : n || false,
			v = Support[k] || (a[k] !== undefined) ? g.length > 1 ? o : true : f;
			if (d) {
				Support[n] = f || v;
			}
			Support[o] = v;
		}
	};

	/**
	 * 是否为原生方法
	 *
	 * @param {type} a
	 * @returns {undefined}
	 */
	Support.native = function (a) {
		for (var i = 1, l = arguments.length; i < l; i++) {
			var k = arguments[i];
			Support[k] = !!(a[k] && a[k].apply && expNativeCode.test(a[k] + ""));
		}
	};

	var root = document.body || document.documentElement, div = document.createElement("div");
	div.test = "1";
	div.style.cssText = "display:none;height:1px;";
	div.innerHTML = "<label for=1></label><input id='" + id + "' type=radio disabled=1 /><a href='/1'></a>";
	root.appendChild(div);
	var node = div.childNodes;

	Support.define(window, "getComputedStyle");
	Support.define(div, "textContent", "innerText");

	Support.native(div,
	"getElementsByClassName", // selector
	"attachEvent", "fireEvent", "addEventListener", // add event
	"contains", "compareDocumentPosition", // node
	"clearAttributes", "mergeAttributes", // attribute
	"insertAdjacentText", "insertAdjacentHTML" // html
	);

	Support.select(div.style, "opacity:filter", "cssFloat:styleFloat"); // style

	Support.select(div,
	"getElementsByClassName:", // selector
	"oninput:onpropertychange", "onfocusin:onfocus", "onfocusout:onblur", // fix foucs
	"onmouseenter:onmouseover", "onmouseleave:onmouseout", "DOMMouseScroll:onmousewheel", // fix mouse
	"onreadystatechange:" // load
	);

	// DOM树解析完成事件类型兼容，IE使用onreadystatechange和doScroll实现
	Support.DOMContentLoaded = Support.readystatechange || "DOMContentLoaded";

	// 元素隐藏时它的 this.offsetHeight 是否为0，如果是的话可以用这个方案快速判断元素显示状态
	Support.offsetHeightAndHidden = div.offsetHeight === 0;

	// getElementsByName("test") 不包含[id=test]的元素
	Support.getElementsByNameNoId = document.getElementsByName(id).length === 0;

	// label元素使用 getAttribute("for") 是否正常，一些浏览器需要使用 getAttribute("htmlFor")，表现不一
	Support.getAttributeForNormal = node[0].getAttribute("for") === "1";

	// 获取元素Boolean类型的属性时是否返回true
	Support.getAttributeNoBoolean = node[1].getAttribute("disabled") === "1";

	// 当input.value未定义时获取的value是否正常
	Support.getInputValueNormal = node[1].value === undefined;

	// 在IE7下, a元素使用 getAttribute("href") 带根路径，表现不一
	Support.getAttributeHrefNormal = node[2].getAttribute("href") === "/1";

	// 是否区分特性与属性，及 Attribute 与 Property
	Support.getAttributeAndProperty = div.getAttribute("test") === "1";

	// 克隆元素时是否会克隆其对应的事件，这里认为是否会复制属性
	Support.cloneNodeAndEvents = false;

	// 绑定事件时，事件处理函数内部this指向的是否为目标元素，暂时只认为IE如此
	Support.eventContextIsTarget = false;

	// 是否会克隆select元素的selected @todo
	Support.cloneState = false;

	// 可以使用delete删除document特性
	Support.deleteUndefinedProperty = vi.these(function () {
		delete div.vi;
		return true;
	});

	// in IE? May be opera?
	if (Support.fireEvent && Support.attachEvent) {
		var f1 = function () {
			Support.cloneNodeAndEvents = true;
		}, f2 = function () {
			Support.eventContextIsTarget = this === div;
		};

		div.attachEvent("onclick", f1);
		div.attachEvent("onclick", f2);

		div.cloneNode(true).fireEvent("onclick");
		div.fireEvent("onclick");

		div.detachEvent("onclick", f2);
		div.detachEvent("onclick", f1);
		f1 = f2 = null;
	}

	root.removeChild(div);
	root = node = div = null;

	/**
	 * 命名空间
	 *
	 * @param {Object} a 根对象
	 * @param {String} b 命名空间
	 * @returns {Namespace}
	 */
	function Namespace(a, b) {
		this._root = a || window;
		this.setSpace(b);
		return this;
	}

	Namespace.get = function (a, b) {
		return new Namespace(a, b).get();
	};

	Namespace.prototype = {
		_root: null,
		_space: null,
		_path: null,
		_list: [],
		getRoot: function () {
			return this._root;
		},
		getName: function () {
			return this._list[this._list.length - 1];
		},
		getSpace: function (a) {
			this.setSpace(a);
			return this._space || this._root;
		},
		setSpace: function (a) { // window, a.b.c
			if (!a || typeof a !== "string" || a === this._path) {
				return this;
			}
			this._path = a;
			this._list = a.split(".");
			var s, l = this._list.length - 1;
			if (l > 0) {
				for (var i = 0, s = this._root; i < l; i++) {
					a = this._list[i];
					s = s[a] = s[a] || {};
				}
			}
			this._space = s;
			return this;
		},
		has: function (a) {
			return this.get(a) !== undefined;
		},
		get: function (a) {
			this.setSpace(a);
			return this.getSpace()[this.getName()];
		},
		set: function (a, b) {
			this.setSpace(a);
			this.getSpace()[this.getName()] = b;
			return b;
		},
		add: function (a, b) {
			if (b === undefined) {
				return b;
			}
			this.setSpace(a);
			var s = this.getSpace(), n = this.getName();
			s[n] === undefined && (s[n] = b);
			return s[n];
		},
		heap: function (a, b) {
			this.setSpace(a);
			var s = this.getSpace(), n = this.getName();
			s[n] = s[n] || [];
			return s[n].include(b);
		},
		remove: function (a, b) {
			this.setSpace(a);
			var s = this.getSpace(), n = this.getName(), i = s[n];
			if (i === undefined) {
				return i;
			}
			if (b === undefined || i === b) {
				delete s[n];
				this._path = null;
				return i;
			}
			if (typeof i.remove === "function") {
				i.remove(b);
				i.length || delete s[n];
				this._path = null;
			}
			return i;
		}
	};

	/**
	 * 扩展Native对象
	 *
	 * @param {Object|String} a 如果是String，a={name: a, main: b}
	 *	@property {Object} root
	 *	@property {String} name
	 *	@property {Function|String} main
	 *	@property {Function|String} from
	 *	@property {Boolean} boot
	 *	@property {Boolean} base
	 *	@property {Boolean} write
	 *	@property {Object} members
	 *	@property {Object} methods
	 *	@property {Object} clones
	 *	@property {Object} aliases
	 * @param {Function|} b a是String才生效，作为a.main
	 * @param {Function|String} c a是String才生效，作为a.from
	 * @returns {Native}
	 */
	function Native(a, b, c) {
		this || vi.error("Via new Native()");
		if (!a) {
			return this;
		}
		if (typeof a === "string") { // via new Native("Type", function() {})
			a = {name: a, main: b, from: c};
		} else if (typeof a === "object") { // via new Native({})
		} else {
			vi.error("Invalid arguments(0)");
		}

		// unregisterd
		var k = a.name;
		objRegisters[k] && vi.error(k + " registed");

		// 获取目标对象
		var r = a.root,
		m = new Namespace(r),
		s1 = m.getSpace(k), s2,
		n1 = m.getName(), n2,
		o = a.boot, // 不扩展prototype
		f = a.from, // 目标
		w = a.write, // 替换目标
		i = o || a.base;
		if (i) { // 如果是基类型
			s2 = window;
			n2 = n1;
			r = s2[n2];
		} else if (typeof f === "function") { // 目标是方法
			w = w === undefined || w;
			s2 = m.getRoot();
			n2 = n1;
			r = f;
		} else if (typeof f === "string") { // 目标是命名空间
			w = w === undefined || w;
			m = new Namespace();
			s2 = m.getSpace(f);
			n2 = m.getName();
			r = s2[n2];
		} else { // 目标未定义
			s2 = m.getRoot();
			n2 = n1;
			r = w ? null : s2[n2];
		}

		// 扩展自己
		var t = a.main || r, // 自己
		p = a.parent || "Native", // 父类名称
		y, x = t.prototype, // 自己原型链
		g = r || t, // 目标方法
		e = n1 !== p; // 不是父类自己

		// 已定义
		objRegisters[k] = {deep: e && !o, base: i};

		// 保存类到命名空间
		s1[n1] = t;

		// 不扩展prototype
		if (o) {
			t["{token}"] = {name: n1, type: p};
			vi.extend(t, Native.members);
			a.members && t.addMembers(a.members);
			return t;
		}

		vi.extend(t, Native.members);
		vi.extend(t, this);

		// 扩展自己prototype
		if (x) {
			t["{constructor}"] = g;
			x['{constructor}'] = t;
			t["{token}"] = {name: n1, type: p};
			x["{token}"] = {name: n1, type: n1};
		}

		// 没定义目标则不扩展目标prototype
		if ((y = g.prototype) && x !== y) {
			vi.extend(g, Native.members);
			vi.extend(g, this);
			vi.extend(y, x);
			y['{constructor}'] = g;
			y["{token}"] = {name: n1, type: n1};
			g["{token}"] = {name: n1, type: p};
			t["{prototype}"] = y;
			t.prototype = y;
		}

		// 目标不是基类型 或 目标未定义 则保存类到全局
		if (w || !i || !r) {
			s2[n2] = t;
		}

		// 垂直扩展
		if (x && e && t.__method) {
			for (var k in x) {
				t.__method(k, x[k]);
			}
		}

		(x = a.members) && t.addMembers(x);
		(x = a.methods) && t.addMethods(x);
		(x = a.clones) && t.cloneMethods(x);
		(x = a.aliases) && t.aliasMethods(x);

		return t;
	}

	var objRegisters = {},
	objProMembers = {"{token}": true, "{constructor}": true, "{prototype}": true},
	objProMethods = {"{token}": true, "{constructor}": true};

	Native.__member = function (a, b, c) {
		var n = new Namespace(window);
		for (var k in objRegisters) {
			objRegisters[k].deep && n.get(k).addMember(a, b, c);
		}
	};

	Native.__method = function (a, b, c) {
		var n = new Namespace(window);
		for (var k in objRegisters) {
			objRegisters[k].deep && n.get(k).addMethod(a, b, c);
		}
	};

	// 增加静态化方法
	Native.staticize = function (a, b, c) {
		var m = c || a.prototype[b];
		if (typeof m !== "function") {
			return a;
		}
		var t = "to" + vi.name(a),
		f = function (e) { // 尝试转化到自身类型，可能实现了泛型
			var i = e && e[t] ? e[t].apply(e, s) : new a(e),
			s = slice.call(arguments, 1);
			return m.apply(i, s);
		};
		a.addMember(b, f);
		return a;
	};

	// 增加泛型化方法
	Native.genricize = function (a) {
		var t = "to" + vi.name(a),
		f = function () {
			var v = new a(this);
			return v.to.apply(v, arguments);
		};
		for (var i = 1, l = arguments.length; i < l; i++) {
			for (var j = 0, s = vi.slice(arguments[i]), n = s.length; j < n; j++) {
				s[j].addMethod(t, f);
			}
		}
		return a;
	};

	// 增加复数化方法
	Native.pluralize = function (a, b, c) {
		var m = a.prototype[b];
		if (typeof m !== "function") {
			return a;
		}
		var x = vi.name(a), y = vi.name(c),
		f = function () {
			for (var t, v, h = false, p = new c, r = [], i = 0, l = this.length; i < l; i++) {
				if ((v = m.apply(this[i], arguments)) !== undefined) {
					h = h || ((t = vi.type(v)) && (t === x || t === y));
					h ? p.include(v) : r.set(v);
				}
			}
			return h ? p : r;
		};
		c.addMethod(b, f);
		return a;
	};

	Native.members = {
		type: function (a) {
			return vi.type(a) === vi.name(this);
		},
		addMember: function (a, b, c, d) { // 增加成员
			if (!b || objProMembers[a]) {
				return this;
			}
			var i = this, p = i["{constructor}"];
			i[a] = b;
			p && (p[a] = b);
			!c && i.__member && i.__member(a, b, d);
			return i;
		},
		addMembers: vi.setter("addMember")
	};

	Native.prototype = {
		type: function (a) {
			var t = a && a["{token}"];
			return t && t.type === vi.name(this);
		},
		addMethod: function (a, b, c, d) { // 增加方法
			var i = this;
			if (typeof b === "function" && !objProMethods[a]) {
				var p = i["{prototype}"], f = !c && i.__method;
				i.prototype[a] = b;
				p && (p[a] = b);
				f && f(a, b, d);
			}
			return i;
		},
		aliasMethod: function (a, b, c, d) { // 增加别名方法
			for (var i = this, f = i.prototype[a], j = 0, s = vi.slice(b), l = s.length; j < l; j++) {
				i.addMethod(s[j], f, c, d);
			}
			return i;
		},
		cloneMethod: function (a) { // 克隆单个Native实例方法
			for (var i = this, j = 1, s = arguments, l = s.length; j < l; j++) {
				i.addMethod(s[j], a[s[j]], true);
			}
			return i;
		},
		cloneMethods: function () { // 克隆一组Native实例方法
			for (var i = this, s = arguments, j = 0, l = s.length; j < l; j++) {
				var v = s[j], g = v && v[0];
				if (g && g[0]) { // [[],[]..]
					for (var k = 1, r = g.length; k < r; k++) {
						i.addMethod(g[k], g[0][g[k]], true);
					}
				} else if (g) { // []
					for (var j = 1, t = v.length; j < t; j++) {
						i.addMethod(v[j], v[0][v[j]], true);
					}
				}
			}
			return i;
		},
		addMethods: vi.setter("addMethod"),
		aliasMethods: vi.setter("aliasMethod")
	};

	new Native("vi.Native", Native);

	new Native("vi.Namespace", Namespace);

	new Native("vi.Support", Support);

	new Native({
		name: "vi.Boolean",
		boot: true
	});

	new Native({
		name: "vi.RegExp",
		boot: true
	});

	new Native({
		name: "vi.Object",
		boot: true
	});

	// Genric
	function Genric(a, b, c) {
		return Native.genricize(new Native(a, b), c || a.implement);
	}

	new Native("vi.Genric", Genric);

	// Function
	var _Function = window.Function;

	function Function(a, b) {
		return typeof b === "string" ? new _Function(b, a) : new _Function(a);
	}

	Function.prototype = {
		bind: function (a) {
			var m = this, s = slice.call(arguments, 1);
			return s.length ? function () {
				return m.apply(a, s.merge(arguments));
			} : function () {
				return m.apply(a, arguments);
			};
		},
		unbind: function (a) {
			var m = this, s = slice.call(arguments, 1);
			return s.length ? function (e) {
				return m.apply(a, slice.call(arguments).merge(s));
			} : function () {
				return m.apply(a, arguments);
			};
		},
		curry: function () {
			var m = this, s = arguments;
			return s.length ? function () {
				return m.apply(this, s.merge(arguments));
			} : function () {
				return m.apply(this, arguments);
			};
		},
		wrap: function (a, b) {
			var m = this, s = slice.call(arguments, 2);
			return s.length ? function () {
				m.apply(a, s.merge(arguments));
				return b;
			} : function () {
				m.apply(a, arguments);
				return b;
			};
		},
		delay: function (a, b, c) {
			var m = this, s = slice.call(arguments, 3);
			return s.length ? function () {
				var n = s.merge(arguments);
				window.setTimeout(function () {
					m.apply(a, n);
				}, c);
				return b;
			} : function () {
				var n = arguments;
				window.setTimeout(function () {
					m.apply(a, n);
				}, c);
				return b;
			};
		},
	};

	new Native({
		name: "vi.Function",
		main: Function,
		base: true
	});

	// Array Object
	var Array = vi.caller("extend");

	Array.prototype = {
		length: 0,
		eq: function (a) {
			return this[a];
		},
		el: function (a) {
			return Element.to(this[a]);
		},
		each: function (a, b) {
			for (var i = 0, l = this.length; i < l; i++) {
				a.call(b, this[i], i, this);
			}
			return this;
		},
		every: function (a, b) {
			for (var i = 0, l = this.length; i < l; i++) {
				if (!a.call(b, this[i], i, this)) {
					return false;
				}
			}
			return true;
		},
		hasEvery: function (a) {
			for (var i = 0, s = vi.slice(a), l = s.length; i < l; i++) {
				if (this.indexOf(s[i]) === -1) {
					return false;
				}
			}
			return true;
		},
		some: function (a, b) {
			for (var i = 0, l = this.length; i < l; i++) {
				if (a.call(b, this[i], i, this)) {
					return true;
				}
			}
			return false;
		},
		hasSome: function (a) {
			for (var i = 0, s = vi.slice(a), l = s.length; i < l; i++) {
				if (this.indexOf(s[i]) !== -1) {
					return true;
				}
			}
			return false;
		},
		clear: function (a, b) {
			for (var i = 0; i < this.length; i++) {
				if (a.call(b, this[i], i, this)) {
					this.splice(i, 1);
					this.clear(a, b);
				}
			}
			return this;
		},
		inject: function (a, b, c) {
			for (var i = 0, l = this.length; i < l; i++) {
				var r = b.call(c, a, this[i], i, this);
				if (r !== undefined) {
					a = r;
				}
			}
			return a;
		},
		filter: function (a, b) {
			return this.inject(new this['{constructor}'](), function (r, v, k, s) {
				return a.call(b, v, k, s) ? r.set(v) : undefined;
			});
		},
		map: function (a, b) {
			return this.inject(new this['{constructor}'](), function (r, v, k, s) {
				return r.set(a.call(b, v, k, s));
			});
		},
		collect: function (a, b) {
			return this.inject(new this['{constructor}'](), function (r, v, k, s) {
				return r.include(a.call(b, v, k, s));
			});
		},
		subjoin: function (a, b, c) {
			return this.collect(b, c).join(a);
		},
		invoke: function (a) {
			var s = slice.call(arguments, 1);
			return this.map(function (v) {
				return v[a].apply(v, s);
			});
		},
		flatten: function () {
			return this.collect(function (v) {
				return Array.type(v) ? vi.slice(v).flatten() : v;
			});
		},
		unique: function (a, b) {
			typeof a === "function" || (a = vi.isset);
			var f = {};
			return this.inject(new this['{constructor}'](), function (r, v, k, s) {
				if (!f[v] && a.call(b, v, k, s)) {
					r.set(v);
					f[v] = true;
				}
			});
		},
		differ: function (a) {
			return this.unique(this.not, a);
		},
		intersect: function (a) {
			return this.unique(this.has, a);
		},
		leftOf: function (a, b) {
			for (var i = b || 0, l = this.length; i < l; i++) {
				if (this[i].indexOf(a) === 0) {
					return i;
				}
			}
			return -1;
		},
		indexOf: function (a, b) {
			for (var i = b || 0, l = this.length; i < l; i++) {
				if (a === this[i]) {
					return i;
				}
			}
			return -1;
		},
		lastIndexOf: function (a, b) {
			if (!b) {
				b = this.length;
			}
			while (b-- > 0) {
				if (a === this[b]) {
					break;
				}
			}
			return b;
		},
		has: function (a) {
			return this.indexOf(a) !== -1;
		},
		last: function () {
			return this[this.length - 1];
		},
		get: function (a, b) {
			if (vi.noset(a)) {
				return this;
			}
			var l = this.length, i = a < 0 ? l + a : a;
			a = Math.min(i, l);
			return vi.noset(this[a]) ? b : this[a];
		},
		set: function (a) {
			this[this.length++] = a;
			return this;
		},
		add: function (a) {
			this.has(a) || this.set(a);
			return this;
		},
		swap: function (a, b) {
			if (a === b) {
				return this;
			}
			var v = this[a];
			this.splice(a, 1);
			this.splice(b, 0, v);
			return this;
		},
		replace: function (a) {
			var p = this.indexOf(a);
			if (p === -1) {
				return this.set(a);
			}
			this[p] = a;
			return this;
		},
		extend: function (a) {
			for (var i = 0, s = vi.slice(a), l = s.length; i < l; i++) {
				this.set(s[i]);
			}
			return this;
		},
		include: function (a) {
			for (var i = 0, s = vi.slice(a), l = s.length; i < l; i++) {
				this.add(s[i]);
			}
			return this;
		},
		merge: function (a) {
			return this.clone().extend(a);
		},
		combine: function (a) {
			return this.clone().include(a);
		},
		remove: function (a) {
			var i = this.indexOf(a);
			if (i !== -1) {
				this.splice(i, 1);
			}
			return this;
		},
		unset: function (a) {
			var i = this.indexOf(a);
			if (i === -1) {
				return undefined;
			}
			this.splice(i, 1);
			return a;
		},
		del: function (a) {
			return this.unset(a) !== undefined;
		},
		empty: function () {
			this.length = 0;
			return this;
		},
		clone: function () {
			return this.inject(new this['{constructor}'](), function (r, v) {
				return r.set(v);
			});
		},
		rand: function () {
			return this.sort(function () {
				return Math.random() > 0.5 ? 1 : -1;
			});
		},
		sum: function () {
			for (var i = 0, s = 0, l = this.length; i < l; i++) {
				if (typeof this[i] === "string") {
					s += parseFloat(this[i]) || 0;
				}
			}
			return s;
		},
		sortNum: function (a) {
			var o = a === "desc" ? 0 : -2, i = o + 1, l = -1 - o;
			return this.sort(function (p, n) {
				return p > n ? i : l;
			});
		},
		sortNumBy: function (a, b, c) {
			var o = c === "desc" ? 0 : -2, i = o + 1, l = -1 - o;
			b = b || a;
			return this.sort(function (p, n) {
				return p[a] > n[b] ? i : l;
			});
		},
		toNumber: function () {
			for (var i = 0, l = this.length; i < l; i++) {
				if (typeof this[i] === "string") {
					this[i] = parseFloat(this[i]) || 0;
				}
			}
			return this;
		},
		toArray: function () {
			return slice.call(this);
		}
	};

	new Native({
		name: "vi.Array",
		main: Array,
		base: true,
		aliases: {
			get: "eq",
			last: "getLast",
			has: ["contains", "hasValue"]
		}
	});

	// String
	function String(a, b) {
		return new QueryString(a, b).to(a, b);
	}

	String.prototype = {
		trim: function (a) {
			var r = a ? (a + "").toRegExp("\\s|") : /\s/;
			for (var i = 0, l = this.length; i < l; i++) {
				if (!r.test(this.charAt(i))) {
					break;
				}
			}
			while (--l > 0) {
				if (!r.test(this.charAt(l))) {
					break;
				}
			}
			return this.slice(i, l + 1);
		},
		ltrim: function (a) {
			var r = a ? (a + "").toRegExp("\\s|") : /\s/;
			for (var i = 0, l = this.length; i < l; i++) {
				if (!r.test(this.charAt(i))) {
					break;
				}
			}
			return this.slice(i);
		},
		rtrim: function (a) {
			var r = a ? (a + "").toRegExp("\\s|") : /\s/, l = this.length;
			while (--l > 0) {
				if (!r.test(this.charAt(l))) {
					break;
				}
			}
			return this.slice(0, l + 1);
		},
		subjoin: function (a, b, c) {
			return this.split(a).subjoin(a, b, c);
		},
		strip: function (a) {
			var r = a ? (a + "").toRegExp("\\s+|", "g") : expBlank;
			return this.replace(r, "");
		},
		stripTags: function () {
			return this.replace(expNoTags, "");
		},
		stripScripts: function () {
			return this.replace(expNoScripts, "");
		},
		evalScripts: function (a) {
			if (!a) {
				return this.replace(expNoScripts, "");
			}
			var s = "",
			f = this.replace(expNoScripts, function (i, p) {
				s += p + "\n";
				return "";
			});
			if (s) {
				typeof a === "function" ? a.call(this, s) : vi.eval(s);
			}
			return f;
		},
		space: function () {
			return this.trim().replace(expBlank, " ");
		},
		rand: function () {
			return this.toArray().random().join("");
		},
		decode: function () {
			return decodeURIComponent(this);
		},
		encode: function () {
			return encodeURIComponent(this);
		},
		escapeRegExp: function () {
			return this.replace(expNoChars, "\\$1");
		},
		camel: function () {
			return this.replace(/-\D/g, function (i) {
				return i.charAt(1).upper();
			});
		},
		lcfirst: function () {
			return this.charAt(0).lower() + this.substr(1);
		},
		ucfirst: function () {
			return this.charAt(0).upper() + this.substr(1);
		},
		ucwords: function (a) {
			return this.subjoin(a || " ", function (v) {
				return v.ucfirst();
			});
		},
		capitalize: function () {
			return this.replace(/\b[a-z]/g, function (i) {
				return i.upper();
			});
		},
		hyphenate: function () {
			return this.replace(/[A-Z]/g, function (i) {
				return "-" + i.charAt(0).lower();
			});
		},
		repeat: function (a) {
			var r = this;
			if (a > 0) {
				while (a--) {
					r += this;
				}
			}
			return r;
		},
		before: function (a) {
			var i = this.indexOf(a);
			return i === -1 ? "" : this.substring(0, i);
		},
		after: function (a) {
			var i = this.indexOf(a);
			return i === -1 ? "" : this.substring(i + 1);
		},
		between: function (a, b) {
			var i = this.indexOf(a) + 1, l = this.lastIndexOf(b || a);
			return this.substring(i, l);
		},
		join: function (a) {
			return this.split(a).join(a);
		},
		toArray: function () {
			return this.split("");
		},
		toRegExp: function (a, b) {
			return new RegExp((a || "") + this.escapeRegExp(), b);
		},
		toInt: function (a) {
			return parseInt(this, (a || 10)) || 0;
		},
		toFloat: function () {
			return parseFloat(this) || 0.00;
		},
		toText: function () {
			return this.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		},
		toHtml: function () {
			return this.stripTags().replace(/&lt\;/g, "<").replace(/&gt\;/g, ">");
		},
		toQueryParams: function (a) {
			return this.ltrim("?").split(a || "&").inject({}, function (h, v, k) {
				v = v.split("=");
				k = v[0];
				v = v[1];
				if (k && v) {
					h.heap(k, v.decode());
				}
			});
		}
	};

	new Native({
		name: "vi.String",
		main: String,
		base: true,
		clones: [Array.prototype, "has", "not", "last"],
		aliases: {
			toLowerCase: "lower",
			toUpperCase: "upper",
			ucfirst: "toUpperFirstCase",
			camel: ["camelize", "toCamelCase"]
		},
		members: {
			isInt: function (a) {
				return Number.type(a) && expInt.test(a);
			},
			isFloat: function (a) {
				return expFloat.test(a);
			},
			isNumber: function (a) {
				return expNumber.test(a);
			},
			isAlnum: function (a) {
				return expAlnum.test(a);
			},
			isAlpha: function (a) {
				return expAlpha.test(a);
			}
		}
	});

	// Number
	function Number(a) {
		switch (vi.type(a)) {
			case "Number":
				return a;
			case "String":
				return a + 0;
			case "Array":
				return a.length;
			case "Hash":
				return a.size();
			case "Object":
				return Hash.size(a);
			default:
				return 0;
		}
	}

	Number.prototype = {
		limit: function (a, b) {
			return Math.min(b, Math.max(a, this));
		},
		center: function (a) {
			return Math.round((this - a) / 2);
		}
	};

	new Native({
		name: "vi.Number",
		main: Number,
		base: true,
		clones: [String.prototype, "toInt", "toFloat"],
		members: {
			isInt: String.isInt,
			isFloat: String.isFloat
		}
	});

	// Hash
	function Hash(a) {
		this._object = vi.clone(a);
		return this;
	}

	Hash.__method = function (a, b) {
		Native.staticize(Hash, a, b);
	};

	Hash.prototype = {
		_object: {},
		each: function (a, b) {
			for (var k in this._object) {
				a.call(b, this._object[k], k, this);
			}
			return this;
		},
		every: function (a, b) {
			for (var k in this._object) {
				if (!a.call(b, this._object[k], k, this)) {
					return false;
				}
			}
			return true;
		},
		some: function (a, b) {
			for (var k in this._object) {
				if (a.call(b, this._object[k], k, this)) {
					return true;
				}
			}
			return false;
		},
		inject: function (a, b, c) {
			for (var k in this._object) {
				var r = b.call(c, a, this._object[k], k, this);
				if (r !== undefined) {
					a = r;
				}
			}
			return a;
		},
		filter: function (a, b) {
			return this.inject(new this['{constructor}'](), function (r, v, k) {
				return a.call(b, v, k, this) ? r.set(k, v) : undefined;
			});
		},
		map: function (a, b) {
			return this.inject(new this['{constructor}'](), function (r, v, k) {
				return r.set(k, a.call(b, v, k, this));
			});
		},
		collect: function (a, b) {
			return this.inject([], function (r, v, k) {
				return r.include(a.call(b, v, k, this));
			});
		},
		has: function (a) {
			return this._object.hasOwnProperty(a);
		},
		contains: function (a) {
			return this.some(function (v) {
				return a === v;
			});
		},
		get: function (a) {
			return this.has(a) ? this._object[a] : undefined;
		},
		set: function (a, b) {
			this._object[a] = b;
			return this;
		},
		add: function (a, b) {
			this.has(a) || this.set(a, b);
			return this;
		},
		extend: function (a, b) {
			vi.extend(a, this._object, b);
			return this;
		},
		include: function (a, b) {
			vi.include(a, this._object, b);
			return this;
		},
		del: function (a) {
			return (delete this._object[a]);
		},
		remove: function (a) {
			delete this._object[a];
			return this;
		},
		unset: function (a) {
			var v = this.get(a);
			this.del(a);
			return v;
		},
		empty: function () {
			this._object = {};
			return this;
		},
		clone: function () {
			return vi.clone(this._object);
		},
		heap: function (a, b) {
			var g = this.get(a);
			if (Array.type(g)) {
				g.add(b);
			} else if (g) {
				this.set(a, [g, b]);
			} else {
				this.set(a, b);
			}
			return this;
		},
		size: Support.__count__ ? function () {
			return this._object.__count__;
		} : function () {
			var l = 0;
			for (var k in this._object) {
				l++;
			}
			return l;
		},
		keys: function () {
			return this.collect(function (a, b) {
				return b;
			});
		},
		values: function () {
			return this.collect(function (a) {
				return a;
			});
		},
		toObject: function () {
			return this._object;
		}
	};

	new Native({
		name: "vi.Hash",
		main: Hash,
		base: true,
		write: true,
		clones: [Array.prototype, "merge", "combine"],
		aliases: {
			has: "hasKey",
			contains: "hasValue",
			keys: "getKeys",
			values: "getValues",
			size: ["getSize", "getLength"]
		}
	});

	// DOM
	function DOM() {
		vi.error("Illegal Constructor.");
	}

	new Native("vi.DOM", DOM);

	// Elements
	var Elements = vi.caller("include");

	Elements.prototype = {
		length: 0,
		set: function (a) {
			Element.id(a) && (this[this.length++] = a);
			return this;
		}
	};

	new Native({
		name: "vi.DOM.Elements",
		main: Elements,
		clones: [Array.prototype, "add", "get", "eq", "el", "has", "del", "each", "some", "every", "unset", "splice", "swap", "indexOf", "extend", "include", "toArray"]
	});

	// Element
	function Element(a) {
		a = a || "div";
		var e = typeof a === "string" ? $ce(a) : a;
		return Element.id(e);
	}

	Element.to = function (a) {
		var n = a && (a.nodeType || a.setTimeout);
		return n ? n === 1 ? a : document.body : null;
	};

	Element.id = function (a) {
		return a && a.nodeType === 1 ? Element.type(a) ? a : vi.extend(a, Element.prototype) : null;
	};

	Element.__method = function (a, b, c) {
		c ? Elements.addMethod(a, b) : Native.pluralize(Element, a, Elements);
	};

	Element.isValidInput = function (a) {
		return a && !!a.name && !a.disabled && !!objInputTags[a.nodeName.lower()] && !objInvalidType[a.type];
	};

	Element.isGroupInput = function (a) {
		return a && (a.nodeName.lower() === "input") && objGroupType[a.type];
	};

	var objInputTags = {input: true, textarea: true, select: true, option: true},
	objGroupType = {checkbox: 2, radio: 1},
	objInvalidType = {submit: true, reset: true, button: true, image: true, file: true},
	objInsertPos = {afterbegin: "insertEnd", beforeend: "insertTop", beforebegin: "insertBegin", afterend: "insertBottom"},
	objAttrTwo = {href: true, src: true, url: true, width: true, height: true},
	objAttrFix = Support.getAttributeForNormal ? {
		htmlFor: "for",
		className: "class"
	} : {
		"for": "htmlFor",
		"class": "className"
	},
	objAttrBool = {readonly: true, checked: true, disabled: true, multiple: true, selected: true},
	objStyleFix = {style: "cssText", opacity: Support.opacity, "float": Support.cssFloat},
	objStylePx = {columnCount: true, fillOpacity: true, flexGrow: true, flexShrink: true, fontWeight: true, lineHeight: true, opacity: true, order: true, orphans: true, widows: true, zIndex: true, zoom: true};

	Element.prototype = {
		/* jQuery start */
		ready: Support.readystatechange ? function (a) { // in IE, iframeElement support readystatechange
			this.isNodeName("iframe") ? this.getWindow().document.addEvent("ready", a) : this.addEvent("load", a);
			return this;
		} : function (a) { // others, iframe.contentWindow support DOMContentLoaded
			this.isNodeName("iframe") ? this.getWindow().addEvent("ready", a) : this.addEvent("load", a);
			return this;
		},
		show: function (a) {
			var p, v, d = this.getData("display");
			if (d === undefined && (p = this.getStyle("display")) !== null) {
				d = this.addData("display", p);
				v = true;
			}
			this.style.display = v || d === "none" ? "block" : d;
			a && a.call(this);
			return this;
		},
		hide: function (a) {
			var s = this.getStyle("display");
			this.addData("display", s);
			this.style.display = "none";
			a && a.call(this, a);
			return this;
		},
		toggle: function (a, b) {
			return this.isHidden() ? this.show(a) : this.hide(b);
		},
		hover: function (a, b) {
			return this.onMouseenter(a).onMouseleave(b);
		},
		animate: function (a, b, c, d) {
			return new Animate({target: this, start: a, stop: b, speed: c, onStop: d});
		},
		slideDown: function (a, b) {
			new Animate({target: this, start: {height: 0}, stop: {height: 0}, speed: a, onStop: b}).start();
			return this;
		},
		slideUp: function (a, b) {
			new Animate({target: this, start: {height: this.getHeight()}, stop: {height: 0}, speed: a, onStop: b}).start();
			return this;
		},
		css: function (a, b, c) {
			return arguments.length === 1 ? typeof a === "string" ? this.getStyle(a) : this.setStyles(a) : this.setStyle(a, b, c);
		},
		attr: function (a, b) {
			return arguments.length === 1 ? typeof a === "string" ? this.getAttr(a) : this.setAttrs(a) : this.setAttr(a, b);
		},
		html: function (a) {
			return arguments.length ? this.setHtml(a) : this.getHtml();
		},
		text: function (a) {
			return arguments.length ? this.setText(a) : this.getText();
		},
		clone: Support.cloneNodeAndEvents ? function (a, b) {
			var e = Element.id(this.cloneNode(a)).removeAttr("id");
			return b ? e : e.clearEvent();
		} : function (a, b) {
			var e = Element.id(this.cloneNode(a)).removeAttr("id");
			if (b) {
				var s = e.getAll();
				this.getAll().each(function (v, k) {
					s[k].cloneEvent(v.removeAttr("id"));
				});
			}
			return e;
		},
		replace: function (a) {
			var i = this, p = i.getParent();
			p && p.replaceChild(a, i.clearEvent());
			return null;
		},
		dispose: function (a) {
			a = a || this;
			var p = this.getParent();
			p && p.removeChild(a);
			return this;
		},
		empty: function () {
			this.getAll().dispose();
			return this;
		},
		destroy: function () {
			this.dispose(this);
			return null;
		},
		appendTo: function (a) {
			query(a).append(this);
			return this;
		},
		before: function (a) {
			var f = this.getFirst();
			f && this.insertBefore(new Fragment(a).parse(), f);
			return this;
		},
		append: function (a) {
			this.appendChild(new Fragment(a).parse());
			return this;
		},
		prepend: function (a) {
			var p = this.getParent();
			p && p.insertBefore(new Fragment(a).parse(), this);
			return this;
		},
		after: function (a) {
			var p = this.getParent();
			p && p.insertBefore(new Fragment(a).parse(), this.getNext());
			return this;
		},
		getPosition: function (a) {
			var l = this.getStyle("marginLeft").toInt(),
			t = this.getStyle("marginTop").toInt(),
			b = this.getBoundingClientRect(),
			p = this.getOffsetParent();
			if (p) {
				var w = this.getWindow(), d = this.getDocument();
				if (p !== d.body) {
					var c = p.getOffset();
					l += c.left + p.getStyle("borderLeftWidth").toInt();
					t += c.top + p.getStyle("borderTopWidth").toInt();
					w = p;
				}
				if (a) { // abs
					l -= w.getScrollLeft();
					t -= w.getScrollTop();
				}
			}
			return {
				left: b.left - l,
				top: b.top - t
			};
		},
		getOffset: function (a) {
			var w = this.getWindow(),
			d = this.getDocument(),
			r = d.getDocumentRoot(),
			l = w.getScrollLeft(),
			t = w.getScrollTop(),
			b = this.getBoundingClientRect();
			return {
				left: b.left + (a ? -l : l) - (r.clientLeft || 0),
				top: b.top + (a ? -t : t) - (r.clientTop || 0)
			};
		},
		/* Like jQuery end */
		getWindow: function () {
			return new Window(this.contentWindow || this.defaultView || this.parentWindow || window);
		},
		getDocument: function () {
			return new Document(this.contentDocument || this.ownerDocument || document);
		},
		getDocumentRoot: function () {
			return this.getDocument().getDocumentRoot();
		},
		getOffsetParent: function () {
			var b = this.getDocument().body, p = this.offsetParent || b;
			while (p && p !== b && p.getStyle("position") === "static") {
				p = p.offsetParent;
			}
			return Element.id(p);
		},
		getRectangle: function (a) {
			var c = this.hasChild(a), // 相对子元素
			s = !c || this.getStyle("position") === "static",
			o = s && this.getOffset(),
			l = c && a.getStyle("marginLeft").toInt(),
			t = c && a.getStyle("marginTop").toInt();
			return new Rectangle(
			(s ? o.left + this.getStyle("borderLeftWidth").toInt() : this.getScrollLeft()) - (c ? this.getStyle("paddingLeft").toInt().limit(l, l) : 0),
			(s ? o.top + this.getStyle("borderTopWidth").toInt() : this.getScrollTop()) - (c ? this.getStyle("paddingTop").toInt().limit(t, t) : 0),
			this.getClientWidth(),
			this.getClientHeight()
			);
		},
		getWidth: function () {
			return Math.max(this.offsetWidth || 0, this.scrollWidth || 0, this.getClientWidth());
		},
		getHeight: function () {
			return Math.max(this.offsetHeight || 0, this.scrollHeight || 0, this.getClientHeight());
		},
		getClientWidth: function () {
			return this.clientWidth || 0;
		},
		getClientHeight: function () {
			return this.clientHeight || 0;
		},
		getScrollTop: function () {
			return this.scrollTop || 0;
		},
		getScrollLeft: function () {
			return this.scrollLeft || 0;
		},
		isVisible: Support.offsetHeightAndHidden ? function () {
			return this.offsetHeight > 0;
		} : function () {
			return this.getStyle("display") !== "none";
		},
		isHidden: Support.offsetHeightAndHidden ? function () {
			return !this.offsetHeight;
		} : function () {
			return this.getStyle("display") === "none";
		},
		isNodeName: function (a) {
			return a && a.lower().has(this.getNodeName());
		},
		getNodeName: function () {
			return this.nodeName.lower();
		},
		getHtml: function () {
			return this.innerHTML || "";
		},
		setHtml: function (a) {
			this.empty().innerHTML = a;
			return this;
		},
		insertHtml: Support.insertAdjacentHTML ? function (a, b) {
			objInsertPos[a] && this.insertAdjacentHTML(a, b);
			return this;
		} : function (a, b) {
			objInsertPos[a] && this[objInsertPos[a]](b);
			return this;
		},
		getText: Support.textContent ? function () {
			return this.textContent || "";
		} : function () {
			return this.innerText || "";
		},
		setText: Support.textContent ? function (a) {
			this.textContent = a || "";
			return this;
		} : function (a) {
			this.innerText = a || "";
			return this;
		},
		insertText: Support.insertAdjacentText ? function (a, b) {
			objInsertPos[a] && this.insertAdjacentText(a, b);
			return this;
		} : function (a, b) {
			objInsertPos[a] && this[objInsertPos[a]](document.newText(b));
			return this;
		},
		getValue: function (a) {
			if (a && !Element.isValidInput(this)) { // input
				return null;
			}
			var n = this.getNodeName();
			if (n === "input") {
				return this.hasAttr("value") && (!a || !objGroupType[this.type] || this.checked) ? this.value : null;
			}
			if (n === "textarea") {
				return this.value || this.getHtml() || null;
			}
			if (n === "option") {
				return this.hasAttr("value") && (!a || this.selected) ? this.value : null;
			}
			if (n !== "select") {
				return a ? null : this.getAttr("value");
			}
			var o = this.options, l = o.length, i = this.selectedIndex;
			if (!l || i < 0) {
				this.selectedIndex = -1;
				return null;
			}
			if (!this.multiple) {
				return o[i] && Element.id(o[i]).getValue(a);
			}
			for (var v = []; i < l; i++) {
				o[i] && v.set(Element.id(o[i]).getValue(a));
			}
			return v;
		},
		setValue: function (a) {
			var r = vi.slice(a), t = r.join(","), n = this.getNodeName();
			if (n === "input") {
				objGroupType[this.type] ? this.setAttr("checked", r.has(this.getValue())) : this.value = t;
				return this;
			}
			if (n === "textarea") {
				this.value = t;
				return this;
			}
			if (n === "option") {
				r.has(this.getValue()) ? this.setAttr("selected", true) : this.value = t;
				return this;
			}
			if (n !== "select") {
				return this.setAttr("value", t);
			}
			var o = this.options, l = o.length, i = this.selectedIndex;
			if (!l || i < 0) {
				this.selectedIndex = -1;
			} else if (!this.multiple) {
				o[i] && Element.id(o[i]).setValue(r);
			} else {
				for (i = 0; i < l; i++) {
					Element.id(o[i]).setValue(r);
				}
			}
			return this;
		},
		getStyle: Support.getComputedStyle ? function (a) {
			a = objStyleFix[a] || a.camel();
			var v = this.style[a] || window.getComputedStyle(this, null)[a];
			return vi.noset(v) ? "" : v;
		} : function (a) {
			a = objStyleFix[a] || a.camel();
			var v = this.currentStyle[a] || this.style[a];
			return vi.noset(v) ? "" : v;
		},
		setStyle: function (a, b, c) {
			a = objStyleFix[a] || a.camel();
			if (b && expCssnum.test(b)) {
				var m = expCssnum.exec(b), o = m[1], r = parseFloat(m[2]) || 0, u = m[3] || "",
				l = parseFloat(this.getStyle(a)) || 0;
				b = Operator.get(l, o, r) + u;
			}
			if (String.isNumber(b)) {
				if (a === "filter") {
					var s = this.currentStyle, v = (parseFloat(b) || 0) * 100;
					(s && (s.zoom === "normal" || !s.hasLayout)) && (this.style.zoom = 1);
					b = "alpha(opacity=" + v + ")";
				} else if (!objStylePx[a]) {
					b += c || "px";
				}
			}
			try {
				this.style[a] = b; // in IE try
			} catch (e) {
			}
			return this;
		},
		hasAttr: function (a) {
			var v = this.attributes[a];
			return !!(v && v.specified);
		},
		getAllAttrs: function () {
			return this.attributes;
		},
		getAttr: Support.getAttributeHrefNormal ? function (a) {
			a = objAttrFix[a] || a;
			var v = this.getAttribute(a);
			return vi.noset(v) ? null : objAttrBool[a] || v;
		} : function (a) {
			a = objAttrFix[a] || a;
			var v = objAttrTwo[a] ? this.getAttribute(a, 2) : this.getAttribute(a);
			return vi.noset(v) ? null : objAttrBool[a] || v;
		},
		setAttr: function (a, b) {
			objAttrBool[a] && b === false ? this.removeAttr(a) : this.setAttribute(objAttrFix[a] || a, b + "");
			return this;
		},
		removeAttr: function (a) {
			this.removeAttribute(objAttrFix[a] || a);
			return this;
		},
		mergeAttrs: Support.mergeAttributes ? function (a) {
			this.mergeAttributes(a);
			return this;
		} : function (a) {
			for (var i = 0, s = a && a.attributes, l = s.length; i < l; i++) {
				var v = s[i];
				v && v.specified && this.setAttr(v.nodeName, v.nodeValue);
			}
			return this;
		},
		clearAttrs: Support.clearAttributes ? function () {
			this.clearAttributes();
			return this;
		} : function () {
			for (var i = 0, s = this.attributes, l = s.length; i < l; i++) {
				var v = s[i];
				v && v.specified && this.removeAttr(v.nodeName);
			}
			return this;
		},
		hasClass: function (a) {
			var c = this.className;
			return c && c.split(" ").has(a);
		},
		addClass: function () {
			for (var i = 0, l = arguments.length; i < l; i++) {
				var a = arguments[i], c = this.className;
				this.className = c ? c.split(expBlank).add(a).join(" ") : a || "";
			}
			return this;
		},
		removeClass: function () {
			var c = this.className;
			if (c) {
				for (var i = 0, l = arguments.length; i < l; i++) {
					var s = c.split(expBlank);
					if (s.del(arguments[i])) {
						this.className = s.join(" ");
					}
					if (!s.length) {
						return this.removeAttr("class");
					}
				}
			}
			return this;
		},
		toggleClass: function (a) {
			return this.hasClass(a) ? this.removeClass(a) : this.addClass(a);
		},
		replaceClass: function (a, b) {
			return a === b ? this : this.addClass(b).removeClass(a);
		},
		hasChild: Support.contains ? function (a) {
			return a ? this.contains(a) === true : false;
		} : function (a) {
			return !!a && this.compareDocumentPosition(a) === 20; // 4 + 16
		},
		hasParent: Support.compareDocumentPosition ? function (a) {
			return !!a && this.compareDocumentPosition(a) === 10; // 2 + 8
		} : function (a) {
			if (a && a.nodeType) {
				var p = this;
				while ((p = p.parentNode)) {
					if (p === a) {
						return true;
					}
				}
			}
			return false;
		},
		purposive: function (a, b, c) {
			var i = this, t = c && i[c] || i, e = t[a || b];
			while (e) {
				if (e !== i && e.nodeType === 1) {
					break;
				}
				e = e[b];
			}
			return Element.id(e);
		},
		recursive: function (a, b, c) {
			var i = this, t = c && i.purposive(c, c) || i, e = t[a || b], s = new Elements();
			while (e) {
				e === i || s.add(e);
				e = e[b];
			}
			return s;
		},
		getFirst: function () {
			return this.purposive("firstChild", "nextSibling");
		},
		getLast: function () {
			return this.purposive("lastChild", "previousSibling");
		},
		getPrev: function () {
			return this.purposive("previousSibling", "previousSibling");
		},
		getPrevs: function (a) {
			return this.recursive("previousSibling", "previousSibling").filter(a);
		},
		getNext: function () {
			return this.purposive("nextSibling", "nextSibling");
		},
		getNexts: function (a) {
			return this.recursive("nextSibling", "nextSibling").filter(a);
		},
		getSibling: function () {
			return this.purposive("firstChild", "nextSibling", "parentNode");
		},
		getSiblings: function (a) {
			return this.recursive("firstChild", "nextSibling", "parentNode").filter(a);
		},
		getParent: function () {
			return this.purposive("parentNode", "parentNode");
		},
		getParents: function (a) {
			return this.recursive("parentNode", "parentNode").filter(a);
		},
		getAll: function (a) {
			return this.$tag("*").filter(a);
		},
		getChildren: function (a) {
			return new Elements(this.children || this.childNodes).filter(a);
		},
		getStyles: vi.getter("getStyle"),
		setStyles: vi.setter("setStyle"),
		getAttrs: vi.getter("getAttr"),
		setAttrs: vi.setter("setAttr")
	};

	new Native({
		name: "vi.DOM.Element",
		from: window.Element || window.HTMLElement,
		main: Element,
		aliases: {
			before: "insertStart",
			append: "insertEnd",
			prepend: "insertTop",
			after: "insertBottom",
			dispose: "remove"
		}
	});

	// Window
	function Window(a) {
		return Window.id(a || window);
	}

	Window.id = function (a) {
		return a && a.setTimeout ? Window.type(a) ? a : vi.extend(a, Window.prototype) : null;
	};

	Window.prototype = {
		getWindow: function () {
			return window;
		},
		getDocument: function () {
			return document;
		},
		$ce: function (a) {
			return Element.id(document.createElement(a || "div"));
		},
		$cf: function () {
			return Fragment.id(document.createDocumentFragment());
		},
		getDocumentRoot: function () {
			return document.getDocumentRoot();
		},
		ready: Support.readystatechange ? function (a) { // in IE, iframeElement support readystatechange
			document.addEvent("ready", a);
			return window;
		} : function (a) { // others, iframe.contentWindow support DOMContentLoaded
			(window.frameElement ? window : document).addEvent("ready", a);
			return window;
		},
		getWidth: function () {
			return window.outerWidth || window.getDocumentRoot().getWidth();
		},
		getHeight: function () {
			var window = window;
			return window.outerHeight || window.getDocumentRoot().getHeight();
		},
		getClientWidth: function () {
			var w = window.getDocumentRoot().getClientWidth();
			return window.innerWidth === undefined ? w : Math.min(window.innerWidth, w);
		},
		getClientHeight: function () {
			var h = window.getDocumentRoot().getClientHeight();
			return window.innerHeight === undefined ? h : Math.min(window.innerHeight, h);
		},
		getScrollTop: function () {
			return window.pageYOffset || window.getDocumentRoot().scrollTop || 0;
		},
		getScrollLeft: function () {
			return window.pageXOffset || window.getDocumentRoot().scrollLeft || 0;
		},
		getRectangle: function (a) {
			var i = window;
			if (!a || a.nodeType !== 1) {
				return new Rectangle(0, 0, i.getClientWidth(), i.getClientHeight());
			}
			// 相对子元素
			var s = a.getStyle('position') === 'static',
			r = a.getOffset();
			return new Rectangle(
			(s ? 0 : a.getStyle('left').toInt()) - r.left,
			(s ? 0 : a.getStyle('top').toInt()) - r.top,
			i.getClientWidth() - a.getStyle('borderLeftWidth').toInt() - a.getStyle('borderRightWidth').toInt(),
			i.getClientHeight() - a.getStyle('borderTopWidth').toInt() - a.getStyle('borderBottomWidth').toInt()
			);
		}
	};

	new Native("vi.DOM.Window", Window);

	// Document
	function Document(a) {
		a || (a = document);
		if (a.readyState !== "uninitialized") {
			Document.id(a);
			a.window || Window.id(a.window = a.defaultView || a.parentWindow || window);
		}
		return a;
	}

	Document.id = function (a) {
		return a && a.nodeType === 9 ? Document.type(a) ? a : vi.extend(a, Document.prototype) : null;
	};

	Document.prototype = {
		getDocument: vi.owner(),
		getWindow: vi.owner("window"),
		getDocumentRoot: function () {
			return this.root || Element.id(this.root = this.compatMode === "BackCompat" ? this.body : this.documentElement || this.body);
		},
		ready: function (a) {
			return this.addEvent("ready", a);
		},
		clearSelection: document.selection ? function () {
			this.selection.empty();
		} : function () {
			this.getSelection().removeAllRanges();
		}
	};

	new Native("vi.DOM.Document", Document);

	// Fragment
	function Fragment(a) {
		var i = this;
		i._target = a;
		return i;
	}

	Fragment.id = function (a) {
		return a && a.nodeType === 11 ? Fragment.type(a) ? a : vi.extend(a, Fragment.prototype) : null;
	};

	Fragment.prototype = {
		_target: null,
		parse: function () {
			var i = this, t = i._target, f = "to" + vi.type(t);
			return i[f] ? i[f](t) : document.createTextNode("");
		},
		toDocumentFragment: function (a) {
			var i = this;
			a = a || i._target;
			return Fragment.type(a) ? a : vi.extend(a, i);
		},
		toFragment: function (a) {
			var i = this;
			return a || i._target;
		},
		toElement: function (a) {
			var i = this;
			return a || i._target;
		},
		toString: function (a) {
			if (!a || !expHtml.test(a)) { // no tag
				return document.createTextNode(a);
			}
			var f = $cf(), n = $ce("div").setHtml(a), n = n.firstChild, e;
			while (n) {
				e = n;
				n = n.nextSibling;
				f.appendChild(e);
			}
			n = null;
			return f;
		},
		toElements: function (a) {
			for (var i = 0, f = $cf(), l = a.length; i < l; i++) {
				f.appendChild(a[i]);
			}
			return f;
		},
		toArray: function (a) {
			for (var i = 0, f = $cf(), l = a.length; i < l; i++) {
				f.appendChild(new Fragment(a[i]).parse());
			}
			return f;
		}
	};

	new Genric("vi.DOM.Fragment", Fragment, [Element, Elements, String, Array]);

	// Event
	function Event(a, b) {
		a = a || document;
		b = b || a.getWindow().event;
		this.namespace = b.namespace || "";
		this.originalEvent = b;
		this.type = b.type;
		this.target = a;
		this.currentTarget = a;
		this.clientX = b.clientX;
		this.clientY = b.clientY;
		return this;
	}

	function EventHandler(a) {
		var v = this["{event}"];
		if (!v) {
			return true;
		}
		var s = v[a.type];
		if (!s) {
			return true;
		}
		for (var r, i = 0, m = a.namespace, e = m ? a : new Event(this, a), f = s.queue, l = f.length; i < l; i++) {
			if (e.isImmediatePropagationStopped()) {
				return false;
			}
			var n = f[i].namespace, t = n.length;
			if (m && !t) {
				continue;
			}
			if (r) {
				if (r.hasSome(n)) { // 停止执行同一命名空间的事件
					return e.stop();
				}
				r = null;
			}
			if ((!m || n.leftOf(m) !== -1) && f[i].handler.call(this, e) === false) {
				if (t > 1 && l > 1) { // 有2个以上命名空间及2个以上方法
					r = n;
				} else {
					return e.stop();
				}
			}
		}
		return true;
	}

	var objEventFix = {
		input: Support.input,
		focusin: Support.focusin,
		focusout: Support.focusout,
		mouseenter: Support.mouseenter,
		mouseleave: Support.mouseleave,
		mousewheel: Support.DOMMouseScroll,
//	DOMMouseScroll: Support.DOMMouseScroll,
//	readystatechange: Support.DOMContentLoaded,
//	DOMContentLoaded: Support.DOMContentLoaded,
		ready: Support.DOMContentLoaded
	};

	// Event type, http://www.w3.org/TR/uievents/#event-types-list
	var objEventType = {
		// Window
		pageshow: 1,
		pagehide: 1,
		hashchange: 1,
		beforeunload: 1,
//	afterprint: 1, // ie, firefox
//	beforeprint: 1, // ie, firefox
		// Element
		input: 4, // fix input/propertychange
		propertychange: 4, // fix input/propertychange
		select: 4,
		submit: 4,
		reset: 4,
		change: 4,
		mouseenter: 4, // support documentDocument
		mouseleave: 4, // support documentDocument
		// Window | Document
		DOMContentLoaded: 3, // fix DOMContentLoaded/readystatechange
		// Window | Element
		abort: 5,
		error: 5,
		resize: 5,
		focus: 5,
		blur: 5,
		focusin: 5,
		focusout: 5,
		// Document | Element
		scroll: 6,
		click: 6,
		dblclick: 6,
		contextmenu: 6,
		readystatechange: 6, // fix DOMContentLoaded/readystatechange
		selectstart: 6, // ie
		selectend: 6, // ie
		copy: 6,
		cut: 6,
		paste: 6,
		mouseover: 6,
		mouseout: 6,
		mousedown: 6,
		mouseup: 6,
		mousemove: 6,
		mousewheel: 6, // fix DOMMouseScroll/mousewheel
		DOMMouseScroll: 6, // fix DOMMouseScroll/mousewheel
		// Window | Document | Element
		ready: 7,
		load: 7,
		unload: 7,
		keydown: 7,
		keypress: 7,
		keyup: 7
	};

	Event.addType = function (a, b) {
		for (var k in objTargetType) {
			var v = objTargetType[k];
			if ((b & v.key) || (v.fix && b & objTargetType[v.ref].key)) {
				a = a.replace(/^on/, "");
				objEventType[a] && vi.error("The event target type '" + a + "' available");
				objEventType[a] = b;
				break;
			}
		}
	};

	Event.checkType = function (a, b) {
		var d = vi.type(a), i = objTargetType[d];
		i || vi.error("The event target '" + d + "' unreasonable");
		b = b.replace(/^on/, "");
		b = objEventFix[b] || b;
		var k = objEventType[b];
		k || vi.error("The event type '" + b + "' unreasonable");
		if (i.key & k) {
			return {
				target: a,
				type: b
			};
		}
		i.fix || vi.error("The event type '" + b + "' don't belong to '" + d + "'");
		return Event.checkType(a[i.fix], b);
	};

	Event.CAPTURING_PHASE = 1;
	Event.AT_TARGET = 2;
	Event.BUBBLING_PHASE = 3;

	Event.prototype = {
		// Basic Event, http://www.w3.org/TR/uievents/#event-interfaces
		defaultPrevented: false,
		propagationStopped: false,
		immediatePropagationStopped: false,
		getOriginalEvent: function () {
			return this.originalEvent;
		},
		getOriginalTarget: function () {
			var e = this.originalEvent, t = e.target || e.srcElement || this.target;
			while (t && t.nodeType === 3) {
				t = t.parentNode;
			}
			return Element.id(t);
		},
		getBubbles: function () {
			var e = this.originalEvent;
			if (e.eventPhase) {
				return e.eventPhase === Event.BUBBLING_PHASE;
			}
			var t = this.target, s = t.addData("bubbles", {}), i = s.target;
			if (i === undefined) {
				s.target = t;
				return false;
			}
			for (; i === t; i = i.parentNode) {
				delete s.target;
				return true;
			}
			delete s.target;
			return false;
		},
		stop: function () {
			this.preventDefault();
			this.stopPropagation();
			return false;
		},
		preventDefault: function () {
			var e = this.originalEvent;
			if (e) {
				e.preventDefault ? e.preventDefault() : (e.returnValue = false);
				this.defaultPrevented = true;
			}
		},
		stopPropagation: function () {
			var e = this.originalEvent;
			if (e) {
				e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
				this.propagationStopped = true;
			}
		},
		stopImmediatePropagation: function () {
			var e = this.originalEvent;
			if (e) {
				e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
				this.propagationStopped = true;
				this.immediatePropagationStopped = true;
			}
		},
		isDefaultPrevented: function () {
			return this.defaultPrevented;
		},
		isPropagationStopped: function () {
			return this.propagationStopped;
		},
		isImmediatePropagationStopped: function () {
			return this.immediatePropagationStopped;
		},
		// Mouse Event, http://www.w3.org/TR/uievents/#interface-MouseEvent
		getPageX: function () {
			var e = this.originalEvent;
			if (typeof e.pageX === "number") {
				return e.pageX;
			}
			var r = this.target.getDocumentRoot();
			return e.clientX + (r.scrollLeft || 0);
		},
		getPageY: function () {
			var e = this.originalEvent;
			if (typeof e.pageY === "number") {
				return e.pageY;
			}
			var r = this.target.getDocumentRoot();
			return e.clientY + (r.scrollTop || 0);
		},
		getRelatedTarget: function () {
			var e = this.originalEvent, t = e.relatedTarget, f = e.fromElement;
			if (!t && f) {
				t = f === this.target ? e.toElement : f;
			}
			while (t && t.nodeType === 3) {
				t = t.parentNode;
			}
			return Element.id(t);
		},
		getDetail: function () {
			var e = this.originalEvent;
			return e.detail ? (-e.detail / 3) : (e.wheelDelta / 120);
		},
		isButton: function (a) {
			var b = this.getButton();
			if (b === 0) {
				return a === "left";
			}
			if (b === 2) {
				return a === "right";
			}
			if (b === 1) {
				return a === "middle";
			}
			return false;
		},
		getButton: Support.addEventListener ? function () {
			return this.originalEvent.button || 0;
		} : function () {
			var b = this.originalEvent.button;
			if (!b || b === 1) { // 左
				return 0;
			}
			if (b === 2) { // 右
				return 2;
			}
			if (b === 4) { // 中
				return 1;
			}
			return b;
		}
	};

	new Native({
		name: "vi.DOM.Event",
		main: Event,
		write: true
	});

	function EventTarget() {
		vi.error("Illegal Constructor.");
	}

	EventTarget.__method = function (a, b) {
		Window.addMethod(a, b);
		Document.addMethod(a, b);
		Element.addMethod(a, b);
	};

	var objTargetType = {
		Window: {
			key: 1
		},
		Document: {
			key: 2,
			fix: "root",
			ref: "Element"
		},
		Element: {
			key: 4
		}
	},
	objWrapHandler = {
		ready: function (e) { // once
			var d = this.getDocument();
			if (e.type !== "DOMContentLoaded" && d.readyState !== "complete") { // in IE
				return;
			}
			var m = this.addData("dom", {});
			if (m.ready) {
				return;
			}
			m.ready = true;
			new Document(d);
			var r = EventHandler.call(this, e);
			this.removeEvent("ready");
			return r;
		}
	},
	addEventBefore = {
		ready: function (a, b, c) { // once
			var m = a.addData("dom", {});
			if (m.ready) {
				return false;
			}
			if (!c.handler || a.getDocument().readyState !== "complete") {
				return true;
			}
			window.setTimeout(function () {
				a.callEvent(b);
				a.removeEvent(b);
			}, 1);
			return false;
		},
		mousemove: function (a, b) {
			var w = a.getWindow(), r = a.getDocument().body;
			r.addClass("unselectable");
			a.setCapture && a.setCapture();
			w.Event && w.captureEvents && w.captureEvents(w.Event.MOUSEMOVE | w.Event.MOUSEUP);
			return true;
		}
	},
	addEventAfter = {
		// http://javascript.nwbox.com/IEContentLoaded/
		ready: function (a, b) {
			if (b !== "readystatechange") {
				return;
			}

			var r = a.getDocumentRoot();
			if (!r || !r.doScroll) {
				return;
			}

			var m = a.addData("dom", {});
			if (m.ready) {
				return;
			}

			var f = function () {
				if (m.ready) {
					return;
				}
				try {
					r.doScroll("left");
				} catch (e) {
					return window.setTimeout(f, 50);
				}
				a.ready();
			};
			f();
		}
	},
	removeEventAfter = {
		mousemove: function (a, b) {
			var w = a.getWindow(), r = a.getDocument().body;
			r.removeClass("unselectable");
			a.releaseCapture && a.releaseCapture();
			w.Event && w.releaseEvents && w.releaseEvents(w.Event.MOUSEMOVE | w.Event.MOUSEUP);
		}
	};

	// fix mouseenter/leave
	if (!Support.mouseenter) {
		objWrapHandler.mouseenter = objWrapHandler.mouseleave = function (e) {
			var t = this, r = e && e.relatedTarget || e.fromElement;
			return (!r || (r !== t && !t.hasChild(r))) && EventHandler.call(this, e);
		};
	}

	// fix addEventListener/attachEvent
	if (Support.addEventListener) {
		var addEventHandler = function (a, b, c, d) {
			if (c.handler) {
				return false;
			}
			var h = objWrapHandler[d] || EventHandler;
			a.addEventListener(b, h, false);
			c.originalType = d;
			c.handler = true;
			return true;
		},
		removeEventHandler = function (a, b, c, d) {
			if (!c.handler) {
				return false;
			}
			var h = objWrapHandler[d] || EventHandler;
			a.removeEventListener(b, h, false);
			delete c.originalType;
			delete c.handler;
			return true;
		};
	} else {
		var addEventHandler = function (a, b, c, d) {
			if (c.handler) {
				return false;
			}
			var h = objWrapHandler[d] || EventHandler;
			c.originalType = d;
			c.handler = h.bind(a);
			a.attachEvent("on" + b, c.handler);
			return true;
		},
		removeEventHandler = function (a, b, c, d) {
			if (!c.handler) {
				return false;
			}
			a.detachEvent("on" + b, c.handler);
			delete c.originalType;
			delete c.handler;
			return true;
		};
	}

	EventTarget.prototype = {
		data: function (a, b) {
			return vi.data(this, a, b);
		},
		getData: function (a) {
			var n = new Namespace(this);
			return n.get("{data}." + a);
		},
		setData: function (a, b) {
			var n = new Namespace(this);
			return n.set("{data}." + a, b);
		},
		addData: function (a, b) {
			var n = new Namespace(this);
			return n.add("{data}." + a, b);
		},
		removeData: function (a) {
			var n = new Namespace(this);
			return n.remove("{data}." + a);
		},
		hasData: function (a) {
			var n = new Namespace(this);
			return n.has("{data}." + a);
		},
		hasEvent: function (a, b) {
			var p = a.split("."), // 事件命名空间: type.namespace
			o = p.shift(), // 事件原始类型
			e = Event.checkType(this, o), // 检测事件类型
			g = e.target, // 兼容的事件源
			t = e.type, // 兼容的事件类型
			v = g["{event}"];
			var s = v && v[t]; // 初始化事件存储器
			return s ? b ? s.queue.has(b) : true : false;
		},
		addEvent: function (a, b) {
			var p = a.split("."), // 事件命名空间: type.namespace
			o = p.shift(), // 事件原始类型
			e = Event.checkType(this, o), // 检测事件类型
			g = e.target, // 兼容的事件源
			t = e.type, // 兼容的事件类型
			v = g["{event}"] = g["{event}"] || {}, // 初始化事件存储器
			s = v[t] = v[t] || {}; // 事件类型存储器
			if (addEventBefore[o] && addEventBefore[o](g, t, s, o) === false) {
				return this;
			}
			if (typeof b === "function") { // 事件加入处理队列
				for (var h = false, m = p.join("."), j = 0, f = s.queue || [], n = f.length; j < n; j++) {
					if (f[j].handler === b) {
						h = true;
						break;
					}
				}
				if (h) {
					m && f[j].namespace.add(m);
				} else {
					s.queue = f.set({
						namespace: m ? [m] : [],
						handler: b
					});
				}
			}
			if (addEventHandler(g, t, s, o) === false) {
				return this;
			}
			addEventAfter[o] && addEventAfter[o](g, t, s, o);
			return this;
		},
		removeEvent: function (a, b) {
			if (!a) {
				return this.clearEvent();
			}
			var p = a.split("."), // 事件命名空间: type.namespace
			o = p.shift(), // 事件原始类型
			e = Event.checkType(this, o), // 检测事件类型
			g = e.target, // 兼容的事件源
			t = e.type, // 兼容的事件类型
			s = g["{event}"]; // 事件存储器
			if (!s || !s[t]) {
				return this;
			}
			var f = s[t].queue;
			if (!f) {
				return this;
			}
			var l, h = false, i = 0, m = p.join(".");
			if (typeof b === "function") { // 从处理队列中删除指定事件
				for (l = f.length; i < l; i++) {
					if (f[i].handler === b) {
						h = true;
						break;
					}
				}
			}
			if (!m) { // 删除类型事件
				l ? h && f.splice(i, 1) : f.empty();
			} else if (l) { // 删除命名空间事件
				h && f[i].namespace.clear(function (v) {
					return v && v.indexOf(m) === 0;
				});
			} else { // 删除命名空间所有事件
				f.clear(function (v) {
					return v.namespace.some(function (n) {
						return n && n.indexOf(m) === 0;
					});
				});
			}
			if (!f.length) { // 队列中没有事件时删除事件处理器
				removeEventHandler(g, t, s[t], o);
				delete s[t];
			}
			for (var k in s) {
				break;
			}
			if (k === undefined) { // 没有其它类型事件存储器
				if (Support.deleteUndefinedProperty) {
					delete g["{event}"];
				} else if (g.nodeType === 1) {
					g.removeAttribute("{event}");
				} else {
					g["{event}"] = undefined;
				}
			}
			removeEventAfter[o] && removeEventAfter[o](g, t, s[t], o);
			return this;
		},
		callEvent: function (a) {
			var p = a.split("."), // 事件命名空间: type.namespace
			o = p.shift(), // 事件原始类型
			e = Event.checkType(this, o), // 检测事件类型
			g = e.target, // 兼容的事件源
			t = e.type, // 兼容的事件类型
			s = g["{event}"]; // 事件存储器
			return s && s[t] && (objWrapHandler[o] || EventHandler).call(g, new Event(g, {
				namespace: p.join("."), // namespace
				target: g,
				type: t
			}));
		},
		clearEvent: function (a) {
			var s = this["{event}"];
			if (!s) {
				return this;
			}
			if (typeof a === "string") {
				for (var t in s) {
					this.removeEvent(t + "." + a);
				}
			} else {
				for (var t in s) {
					removeEventHandler(this, t, s[t]);
				}
			}
			if (Support.deleteUndefinedProperty) {
				delete this["{event}"];
			} else if (this.nodeType === 1) {
				this.removeAttribute("{event}");
			} else {
				this["{event}"] = null;
			}
			return this;
		},
		cloneEvent: function (a, b) {
			// @todo
		},
		addEvents: function (a, b) {
			if (typeof a === "object") {
				for (var k in a) {
					this.addEvents(k, a[k]);
				}
			} else {
				for (var i = 0, s = vi.slice(b), l = s.length; i < l; i++) {
					for (var j = 0, n = a.split(expComma), t = n.length; j < t; j++) {
						this.addEvent(n[j], s[i]);
					}
				}
			}
			return this;
		}
	};

	["blur", "focus", "focusin", "focusout", "load", "resize", "scroll", "unload", "error", "change", "select", "submit", "keydown", "keypress", "keyup", "contextmenu",
		"click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "mouseenter", "mouseleave"].each(function (t) {
		for (var k in objTargetType) {
			var v = objTargetType[k], f = objEventType[t], i = f & v.key;
			(i || (v.fix && f & objTargetType[v.ref].key)) && DOM[k].addMethod("on" + t.ucfirst(), function (a, b, c) {
				if (!arguments.length) { // call
					return this.callEvent(t);
				}
				if (!a) { // clear
					return this.clearEvent();
				}
				if (typeof a === "function") { // add
					return this.addEvent(t, a);
				}
				if (typeof a === "string") { // add/remove namespace
					return c || vi.noset(b) ? this.removeEvent(t + "." + a, b) : this.addEvent(t + "." + a, b);
				}
				return this;
			});
		}
	});

	new Native({
		name: "vi.DOM.EventTarget",
		main: EventTarget,
		aliases: {
			addEvent: "bind",
			removeEvent: "unbind",
			callEvent: "trigger"
		}
	});

	//
	// http://www.w3.org/TR/selectors/
	//
	// 1. match selector
	// 2. prefilter type, return false then direct reback
	// 3. find type, contains filter
	// 4. reback
	//
	function Selector() {
		vi.error("Illegal Constructor.");
	}

	function Query(a, b) {
		this._selector = this._operator = a;
		this._context = b ? query(b, null, true) : [document];
		this._originalContext = this._context;
		this._count = 0;
		this._started = true;
	}

	function query(a, b, c) {
		if (!a) {
			return new Elements();
		}
		if (typeof a === "string") { // String, CSS Selector
			return Selector.find(a, b || this);
		}
		if (typeof a === "function") { // Function
			return document.ready(a);
		}
		if (a.nodeType === 1) { // Element, in parent
			return !b || !b.length || query(b, null, true).some(a.hasParent, a) ? new Elements(a) : new Elements();
		}
		if (a.nodeType === 9 || a.setTimeout) { // Window or Document
			return new Elements(a.getDocument().body);
		}
		if (typeof a.splice === "function" && typeof a.length === "number") { // ArrayLike, when window has length attr
			return new Elements(a);
		}
		return new Elements();
	}

	Selector.__method = function (a, b) {
		Window.addMethod(a, b);
		Document.addMethod(a, b);
		Element.addMethod(a, b, false, true);
	};

	Selector.faster = function (a, b, c, d) {
		typeof a === "string" || vi.error("Selector unreasonable");
		var q = new Query(a, b);
		if (!d && q.hasQsa()) {
			return q.execQsa(a);
		}
		q.start(c);
		return q.execute();
	};

	Selector.find = function (a, b, c) {
		typeof a === "string" || vi.error("Selector unreasonable");
		var q = new Query(a, b);
		if (!c && q.hasQsa()) {
			return q.execQsa(a);
		}
		while (q.next()) {
			for (var t in objQueryMatcher) {
				if (!q.start(t)) {
					continue;
				}
				if (!q.before()) {
					break;
				}
				q.find();
				if (!q.next()) {
					break;
				}
				if (q.empty()) {
					q.restart();
					break;
				}
				q.end();
			}
			if (q.noop()) {
				break;
			}
		}
		return q.reback();
	};

	Selector.filter = function (a, b) {
		if (typeof a !== "string") {
			return b;
		}
		var q = new Query(a, b);
		while (q.next()) {
			for (var t in objQueryMatcher) {
				if (!q.start(t)) {
					continue;
				}
				if (!q.before()) {
					break;
				}
				q.filter();
				if (!q.next()) {
					break;
				}
				if (q.empty()) {
					q.restart();
					break;
				}
				q.end();
			}
			if (q.noop()) {
				break;
			}
		}
		return q.reback();
	};

	var objQueryMatcher = {
		id: /^\s*#([#\w\-]*)\s*/, // #id
		"class": /^\s*\.([\.\w\-]*)\s*/, // .class
		tag: /^\s*(\w+|\*)\s*/, // tag
		attr: /^\s*\[(@?[\w\-]+)([~\^$*\|!=]?)=?([^\]]*?)\]\s*/, // [attr=val]
		pseudo: /^\s*:([\w\-]+)(?:\(([\w\s\-\+]+)\))?\s*/, // :pseudo
		group: /^\s*([\ ><-~,\+])\s*/ // #id, .class, tag...
	},
	objQueryHandler = {
		allTagFilter: function (a) {
			for (var i = 0, f = a._context, l = f.length; i < l; i++) {
				for (var j = 0, s = f[i].getElementsByTagName("*"), t = s.length; j < t; j++) {
					objQueryFilter[a._type](a, s[j]) && a._result.set(s[j]);
				}
			}
		},
		nativeFilter: function (a) {
			for (var i = 0, f = a._context, l = f.length; i < l; i++) {
				for (var j = 0, s = f[i][a._get](a._key), t = s.length; j < t; j++) {
					objQueryFilter[a._type](a, s[j]) && a._result.set(s[j]);
				}
			}
		},
		nativeGetter: function (a) {
			for (var i = 0, f = a._context, l = f.length; i < l; i++) {
				a._result.extend(f[i][a._get](a._key));
			}
		}
	},
	objQueryBefore = {
		id: function (a) {
		},
		"class": function (a) {
			a._get = Support.getElementsByClassName;
			if (a._key.has(".")) {
				var s = a._key.split(".");
				a._key = s.shift();
				if (s.length) { // if class.class... then change find "classes"
					a._type = "classes";
					a._keys = s;
				}
			}
		},
		tag: function (a) {
			a._get = "getElementsByTagName";
		},
		attr: function (a) {
			if (a._expr) {
				a._expr += "=";
				Operator.prototype[a._expr] || vi.error("Attribute operator '" + a._expr + "' unreasonable");
			} else {
				a._expr = "!=";
				a._value = null;
			}
		},
		pseudo: function (a) {
			objPseudoFinder[a._key] || vi.error("Pseudo selector E:" + a._key + " unreasonable");
			var h = objPseudoBefore[a._key];
			return !h || h(a);
		},
		group: function (a) {
			a._started && vi.error("Combinator selector unreasonable"); // also "> E"
			objGroupFinder[a._key] || vi.error("Combinator selector E " + a._key + " F unreasonable");
		}
	},
	objQueryFilter = {
		id: function (a, b) {
			return b.id && b.id === a._key;
		},
		"class": function (a, b) {
			return b.className && b.className.split(expBlank).has(a._key);
		},
		classes: function (a, b) {
			return b.className && b.className.split(expBlank).hasSome(a._keys);
		},
		tag: function (a, b) {
			return b.nodeName && b.nodeName.lower() === a._key.lower();
		},
		attr: function (a, b) {
			var v = b.getAttribute(a._key);
			return v && Operator.get(v, a._expr, a._value);
		},
		pseudo: function (a, b) {
			return objPseudoFinder[a._key](a, b);
		},
		group: function () {
			vi.error("Group selector filter unreasonable");
		}
	},
	objQueryFinder = {
		id: objQueryHandler.allTagFilter,
		"class": Support.getElementsByClassName ? objQueryHandler.nativeGetter : objQueryHandler.allTagFilter,
		"classes": Support.getElementsByClassName ? objQueryHandler.nativeFilter : objQueryHandler.allTagFilter,
		tag: objQueryHandler.nativeGetter,
		attr: objQueryHandler.allTagFilter,
		pseudo: objQueryHandler.allTagFilter,
		group: function (a) {
			if (a._key === ",") {
				a.stop();
				return;
			}
			for (var i = 0, c = objGroupFinder[a._key], f = a._context, l = f.length; i < l; i++) {
				var e = f[i][c.start];
				while (e) {
					if (e.nodeType === 1) {
						a._result.set(e);
						if (i === c.index) {
							break;
						}
					}
					e = e[c.every];
				}
			}
		}
	},
	objPseudoHandler = {
		nthChildFilter: function (a, b) {
			var p = b[a._parent];
			if (p) {
				for (var i = 0, l = p[a._start]; l; l = l[a._every]) {
					if (l.nodeType === 1 && ++i && b === l) {
						i -= a._last;
						return i === a._first || ((i % a._first) === 0 && (i / a._first) >= 0);
					}
				}
			}
			return false;
		},
		nthOfTypeFilter: function (a, b) {
			var p = b[a._parent];
			if (p) {
				for (var g = {}, l = p[a._start]; l; l = l[a._every]) {
					if (l.nodeType === 1) {
						var t = l.nodeName;
						g[t] ? g[t]++ : (g[t] = 1);
						if (b === l) {
							g[t] -= a._last;
							return g[t] === a._first || ((g[t] % a._first) === 0 && (g[t] / a._first) >= 0);
						}
					}
				}
			}
			return false;
		},
		nthExprParser: function (a) {
			var p = expNthParam.exec(a._expr);
			p && p[1] || vi.error("Pseudo selector E:" + a._key + "(" + a._expr + ") unreasonable");
			if (p[1] === "n") { // nth-child(n)

			} else if (p[1] === "2n" || p[1] === "even") { // nth-child(2n) or nth-child(even)
				a._first = 2;
				a._last = 0;
			} else if (p[1] === "2n+1" || p[1] === "odd") { // nth-child(2n+1) or nth-child(odd)
				a._first = 2;
				a._last = 1;
			} else if (p[1].has("n")) {
				a._first = p[1].toInt();
				a._last = p[2].toInt();
			} else {
				a._last = p[1].toInt();
				a._first = 0;
			}
		},
		nthExprStatic: function (a) {
			a._expr && vi.error("Pseudo selector E:" + a._key + " no expression");
			a._first = 0;
			a._last = 1;
			a._parent = "parentNode";
			a._start = "firstChild";
			a._every = "nextSibling";
		},
		nthLastExprStatic: function (a) {
			a._expr && vi.error("Pseudo selector E:" + a._key + " no expression");
			a._first = 0;
			a._last = 1;
			a._parent = "parentNode";
			a._start = "lastChild";
			a._every = "previousSibling";
		},
		nthExprDynamic: function (a) {
			objPseudoHandler.nthExprParser(a);
			a._parent = "parentNode";
			a._start = "firstChild";
			a._every = "nextSibling";
		},
		nthLastExprDynamic: function (a) {
			objPseudoHandler.nthExprParser(a);
			a._parent = "parentNode";
			a._start = "lastChild";
			a._every = "previousSibling";
		}
	},
	objPseudoBefore = {
		"nth-child": objPseudoHandler.nthExprDynamic,
		"nth-last-child": objPseudoHandler.nthLastExprDynamic,
		"first-child": objPseudoHandler.nthExprStatic,
		"last-child": objPseudoHandler.nthLastExprStatic,
		"nth-of-type": objPseudoHandler.nthExprDynamic,
		"nth-last-of-type": objPseudoHandler.nthLastExprDynamic,
		"first-of-type": objPseudoHandler.nthExprStatic,
		"last-of-type": objPseudoHandler.nthLastExprStatic,
		root: function () {
			vi.error("Pseudo selector E:root unreasonable, via getDocument()");
		},
		even: function (a) {
			a._expr && vi.error("Pseudo selector E:" + a._key + " no expression");
			a._first = 2;
			a._last = 0;
			a._parent = "parentNode";
			a._start = "firstChild";
			a._every = "nextSibling";
		},
		odd: function (a) {
			a._expr && vi.error("Pseudo selector E:" + a._key + " no expression");
			a._first = 2;
			a._last = 1;
			a._parent = "parentNode";
			a._start = "firstChild";
			a._every = "nextSibling";
		}
	},
	objPseudoFinder = {
		// E:root an E element, root of the document
		root: function () {
			vi.error("Pseudo selector E:root unreasonable, via getDocument()");
		},
		// E:nth-child(even) an E element, the n-th child of its parent
		even: objPseudoHandler.nthChildFilter,
		// E:nth-child(odd) an E element, the n-th child of its parent
		odd: objPseudoHandler.nthChildFilter,
		// E:nth-child(n) an E element, the n-th child of its parent
		"nth-child": objPseudoHandler.nthChildFilter,
		// E:nth-last-child(n) an E element, the n-th child of its parent, counting from the last one
		"nth-last-child": objPseudoHandler.nthChildFilter,
		// E:first-child an E element, first child of its parent
		"first-child": objPseudoHandler.nthChildFilter,
		// E:last-child an E element, last child of its parent
		"last-child": objPseudoHandler.nthChildFilter,
		// E:only-child an E element, only child of its parent
		"only-child": function (a, b) {
			return objPseudoFinder["first-child"](a, b) && objPseudoFinder["last-child"](a, b);
		},
		// E:nth-of-type(n) an E element, the n-th sibling of its type
		"nth-of-type": objPseudoHandler.nthOfTypeFilter,
		// E:nth-last-of-type(n) an E element, the n-th sibling of its type, counting from the last one
		"nth-last-of-type": objPseudoHandler.nthOfTypeFilter,
		// E:first-of-type an E element, first sibling of its type
		"first-of-type": objPseudoHandler.nthOfTypeFilter,
		// E:last-of-type an E element, last sibling of its type
		"last-of-type": objPseudoHandler.nthOfTypeFilter,
		// E:only-of-type an E element, only sibling of its type
		"only-of-type": function (a, b) {
			return objPseudoFinder["first-of-type"](a, b) && objPseudoFinder["last-of-type"](a, b);
		},
		// E:empty an E element that has no children (including text nodes)
		empty: function (a, b) { // default 62, also 2^[1-5]
			for (var p = a._expr || 62, e = b.firstChild; e; e = e.nextSibling) {
				if (p & Math.pow(2, e.nodeType)) {
					return false;
				}
			}
			return true;
		},
		// E:target an E element being the target of the referring URI
		target: function (a, b) {
			var i = b.getAttribute("id");
			return i && (b.nodeName.lower() === "a") && (i === location.href.after("#"));
		},
		// E:lang(fr) an element of type E in language "fr" (the document language specifies how language is determined)
		lang: function (a, b) {
			return b.lang === a._expr;
		},
		// E:enabled
		enabled: function (a, b) {
			return b.disabled === false;
		},
		// E:disabled a user interface element E which is enabled or disabled
		disabled: function (a, b) {
			return b.disabled === true;
		},
		// E:checked a user interface element E which is checked (for instance a radio-button or checkbox)
		checked: function (a, b) {
			return (b.nodeName.lower() === "input") && objGroupType[b.type] && !!b.checked;
		},
		// E:selected a user interface element E which is selected (for instance a select)
		selected: function (a, b) {
			b.parentNode.selectedIndex;
			return b.selected === true;
		},
		// E:valid a user interface element E which is valid (for instance a input, select, textarea)
		valid: function (a, b) {
			return b.name && !b.disabled && b.type && !objInvalidType[b.type];
		}
	},
	objGroupFinder = {
		// E F an F element descendant of an E element
//		" ": null,
		// E, F an F or E element appearing simultaneously
		// combinator
		",": true, // E - F an F element immediately preceded by an E element
		// prev one
		"-": {start: "previousSibling", every: "previousSibling", index: 1},
		// E > F an F element parentNode of an E element
		// parent all
		"<": {start: "parentNode", every: "parentNode", index: -1},
		// E > F an F element child of an E element
		// child all
		">": {start: "firstChild", every: "nextSibling", index: -1},
		// E + F an F element immediately preceded by an E element
		// next one
		"+": {start: "nextSibling", every: "nextSibling", index: 1},
		// E ~ F an F element preceded by an E element
		// next all
		"~": {start: "nextSibling", every: "nextSibling", index: -1}
	};

	Query.prototype = {
		_type: null, // match type
		_key: null, // #id, .class, tag; attr: name; pseudo: >, ~, +
		_expr: null, // attr: =, ^=, $=, *=, |=, !=; pseudo: (args)
		_value: null, // attr: value
		_first: null, // pseudo: element first pos
		_last: null, // pseudo: element last pos
		_series: null, // group: elements[]
		_result: null, // result elements[]
		before: function () {
			return objQueryBefore[this._type](this) !== false;
		},
		find: function () {
			this._result = [];
			objQueryFinder[this._type](this);
		},
		filter: function () {
			for (var i = 0, r = [], f = this._context, l = f.length; i < l; i++) {
				if (objQueryFilter[this._type](this, f[i])) {
					r.set(f[i]);
				}
			}
			this._context = r;
			this._result = r;
		},
		execute: function () {
			this.before() || this.find();
			return this.reback();
		},
		restart: function () {
			this._started = true;
			this._operator = this._operator.replace(expNoCommas, "");
		},
		start: function (a) {
			var m = this._operator.match(objQueryMatcher[a]);
			if (!m || !m[0]) {
				return false;
			}
			m[1] || vi.error(a.ucfirst() + " selector unreasonable");
			this._operator = this._operator.substr(m[0].length);
			this._count++;
			this._key = m[1];
			this._expr = m[2];
			this._value = m[3];
			this._type = a;
			return true;
		},
		stop: function () {
			this._series || (this._series = []);
			this._series.extend(this._context);
			this._started = true;
			this._context = this._originalContext;
		},
		end: function () {
			this._started = false;
			this._context = this._result;
		},
		next: function () {
			return !!this._operator;
		},
		noop: function () {
			return !this._count;
		},
		empty: function () {
			return !this._result || !this._result.length;
		},
		reback: function () {
			return new Elements(this._series ? this._series.include(this._result) : this._result);
		},
		hasQsa: function () {
			return !vi.debug && !!this._context[0].querySelectorAll;
		},
		execQsa: function (a) {
			for (var i = 0, r = new Elements(), f = this._context, l = f.length; i < l; i++) {
				r.extend(f[i].querySelectorAll(a));
			}
			return r;
		}
	};

	Selector.prototype = {
		query: query,
		$id: function (a, b) {
			return Selector.faster(a, this, "id", b);
		},
		$tag: function (a, b) {
			return Selector.faster(a, this, "tag", b);
		},
		$name: function (a, b) {
			return Selector.faster(a, this, "name", b);
		},
		$class: function (a, b) {
			return Selector.faster(a, this, "class", b);
		},
		find: function (a, b) {
			return Selector.find(a, this, b);
		},
		filter: function (a) {
			return Selector.filter(a, this);
		}
	};

	new Native("vi.Selector", Selector);

	// Rectangle
	function Rectangle(a, b, c, d) {
		this.left = Math.round(a) || 0;
		this.top = Math.round(b) || 0;
		this.width = Math.round(c) || 0;
		this.height = Math.round(d) || 0;
		return this.update();
	}

	Rectangle.prototype = {
		update: function () {
			this.right = this.left + this.width;
			this.bottom = this.top + this.height;
			return this;
		},
		limit: function (a) {
			a.left = a.left.limit(this.left, this.right - a.width);
			a.top = a.top.limit(this.top, this.bottom - a.height);
			return a;
		},
		inSide: function (a) {
			return this.inX(a) && this.inY(a);
		},
		inX: function (a) {
			return a.left > this.left && this.right > a.left + a.width;
		},
		inY: function (a) {
			return a.top > this.top && this.bottom > a.top + a.height;
		},
		inLeft: function (a) {
			return a.left < this.left && a.left + a.width > this.left;
		},
		inRight: function (a) {
			return a.left > this.left && a.left < this.right;
		},
		inTop: function (a) {
			return a.top < this.top && a.top + a.height > this.top;
		},
		inBottom: function (a) {
			return a.top > this.top && a.top < this.bottom;
		},
		onLeft: function (a) {
			return this.inY(a) && this.inLeft(a);
		},
		onRight: function (a) {
			return this.inY(a) && this.inRight(a);
		},
		onTop: function (a) {
			return this.inX(a) && this.inTop(a);
		},
		onBottom: function (a) {
			return this.inX(a) && this.inBottom(a);
		}
	};

	new Native("vi.Rectangle", Rectangle);

	// QueryString
	function QueryString(a) {
		this._target = a;
		return this;
	}

	QueryString.prototype = {
		_target: null,
		to: function (a, b) {
			var i = this, t = i._target, k = "to" + vi.type(t), f = i[k] || i.toString;
			return f.call(i, t, a, b);
		},
		toString: function (a, b, c) {
			return c ? c + "=" + a : a; // 键值对或值
		},
		toArray: function (a, b, c) {
			return a.subjoin(b || "&", function (v, k) {
				var q = new QueryString(v), r = c ? q.to(b, c + "[" + k + "]") : q.to(b, k);
				return r === "" ? null : r;
			});
		},
		toObject: function (a, b, c) {
			b = b || "&";
			var s = [];
			for (var k in a) {
				var q = new QueryString(a[k]),
				v = c ? q.to(b, c + "[" + k + "]") : q.to(b, k);
				s.set(v);
			}
			return s.join(b);
		},
		toElement: function (a, b, c) {
			var i = this;
			if (a.getNodeName() === "form") {
				return i.toElements(a.elements, b, c);
			}
			var v = a.getValue(true);
			if (!v && v !== "0") {
				return "";
			}
			var k = a.name;
			return c ? c + "[" + k + "]=" + v : k + "=" + v;
		},
		toElements: function (a, b, c) {
			return this.toArray(vi.slice(a), b, c);
		},
		toHash: function (a, b, c) {
			return this.toObject(a.toObject(), b, c);
		}
	};

	new Genric("vi.QueryString", QueryString, [String, Array, Element, Elements, Hash]);

	// Class
	function Class(a, b, c) {
		this || vi.error("Via new Class()");
		if (!a) {
			return this;
		}
		if (typeof a === "string") {
			a = {name: a, main: b, parent: "Class"};
		} else if (typeof a === "object") {
			a.parent = "Class";
			c = a.implement;
		} else {
			vi.error("Invalid arguments(0)");
		}
		var i = new Native(a);
		i.addMembers(Class.members);
		i.addMethods(this);
		c && Class.implement(i, c);
		return i;
	}

	Class.implement = function (a, b) {
		for (var i = 0, s = vi.slice(b), l = s.length; i < l; i++) {
			var n = vi.name(s[i]), c = a.prototype[n];
			if (!c && c !== s[i]) {
				a.addMethod(n, s[i]);
				a.addMethods(s[i].prototype);
			}
		}
	};

	Class.members = {
		implement: function () {
			for (var i = 0, l = arguments.length; i < l; i++) {
				Class.implement(this, arguments[i]);
			}
		}
	};

	new Native("vi.Class", Class);

	// Options
	function Options(a) {
		this.defaults = this.options || {};
		this.options = vi.clone(this.defaults);
		this.setOptions(a);
		return this;
	}

	var objStringType = {
		"false": false,
		"true": true,
		"null": null
	},
	objOptionAlias = {
		a: {
			url: "href"
		},
		form: {
			url: "action",
			type: "method"
		}
	};

	Options.prototype = {
		options: {},
		getOption: function (a) {
			return this.options[a];
		},
		setOption: function (a, b) {
			var i = this, o = i.options, c;
			if (vi.noset(b)) {
				return i;
			}
			if (typeof b === "string") { // string expression
				if (objStringType[b] !== undefined) { // datatype
					b = objStringType[b];
				} else if (b === "window") { // window
					b = window;
				} else if (b === "document") { // document
					b = document;
				} else if ((c = b.charAt(0)) === "@") { // namespace
					b = Namespace.get(window, b.substr(1));
				} else if (c === ":") { // json
					b = new Function("return " + b.substr(1), "data");
				}
			}
			if (typeof b !== "function") {
				o[a] = b;
			} else if (this.Events && expOnEvent.test(a)) { // add Event
				i.addEvent(a.substr(2).lower(), b);
			} else { // call function
				o[a] = b.call(i);
			}
			return i;
		},
		setOptions: function (a) {
			var i = this;
			if (!a) {
				return i;
			}
			if (Element.type(a)) { // Element
				i.options.target = a;
				for (var m = objOptionAlias[a.getNodeName()], s = a.getAllAttrs(), j = 0, l = s.length; j < l; j++) {
					var n = s[j].nodeName;
					if (n.has("vi-")) { // vi-属性
						var k = n.substr(4), v = s[j].nodeValue;
						vi.noset(v) ? m && m[k] && i.setOption(k, a.getAttr(m[k])) : i.setOption(k, v);
					}
				}
			} else if (Object.type(a)) { // Object
				for (var k in a) {
					i.setOption(k, a[k]);
				}
			}
			return i;
		}
	};

	new Class("vi.Class.Options", Options);

	// Events
	function Events(a) {
		this._events = {};
		this.addEvents(a);
		return this;
	}

	Events.prototype = {
		_events: {},
		hasEvent: function (a) {
			var s = this._events[a];
			return s && s.length > 0;
		},
		getEvent: function (a) {
			return this._events[a] || null;
		},
		addEvent: function (a, b) {
			if (b) {
				var e = this._events, s = e[a] || (e[a] = []);
				b.splice ? s.include(b) : s.set(vi.maker(b));
			}
			return this;
		},
		removeEvent: function (a, b) {
			var e = this._events, s = e[a];
			s && s.length && typeof b === "string" ? s.remove(b) : s === undefined || (delete e[a]);
			return this;
		},
		callEvent: function (a) {
			var r = null, s = this._events[a];
			if (s) {
				for (var i = 0, l = s.length, p = slice.call(arguments, 1); i < l; i++) {
					r = s[i].apply(this, p);
					if (r === false) {
						break;
					}
				}
			}
			return r;
		},
		addEvents: vi.setter("addEvent"),
		removeEvents: vi.setter("removeEvent")
	};

	new Class("vi.Class.Events", Events);

	// Plugins
	function Plugins(a) {
		this._plugins = {};
		this.addPlugins(a);
		return this;
	}

	Plugins.prototype = {
		_plugins: {},
		addPlugin: function (a, b) {
			for (var t in b) {
				var p = this._plugins[t] = this._plugins[t] || [];
				p.set([a, b[t]]);
			}
			return this;
		},
		removePlugin: function (a) {
			for (var i = 0, l = this._plugins.length; i < l; i++) {
				if (a === this._plugins[i][0]) {
					this._plugins[i].splice(i, 1);
					this.options[a] = false;
				}
			}
			return this;
		},
		callPlugin: function (a) {
			var r = null, s = this._plugins[a];
			if (s) {
				for (var i = 0, l = s.length, p = slice.call(arguments, 1); i < l; i++) {
					if (this.options[s[i][0]]) {
						r = s[i][1].apply(this, p);
						if (r === false) {
							break;
						}
					}
				}
			}
			return r;
		},
		addPlugins: vi.setter("addPlugin"),
		removePlugins: vi.setter("removePlugin")
	};

	new Class("vi.Class.Plugins", Plugins);

	// Operator
	function Operator(a, b, c) {
		this.left = a;
		this.operator = b;
		this.right = c;
		return this;
	}

	Operator.get = function (a, b, c) {
		var o = new Operator(a, b, c);
		return o[o.operator]();
	};

	Operator.prototype = {
		"+": function () {
			return this.left + this.right;
		},
		"-": function () {
			return this.left - this.right;
		},
		"*": function () {
			return this.left * this.right;
		},
		"/": function () {
			return this.left / this.right;
		},
		"==": function () {
			return this.left === this.right;
		},
		"!=": function () {
			return this.left !== this.right;
		},
		"*=": function () {
			return this["=="]() || this.left.has(this.right);
		},
		"~=": function () {
			return this["=="]() || this.left.has(" " + this.right) || this.left.has(this.right + " ");
		},
		"^=": function () {
			return this["=="]() || this.left.substr(0, this.right.length) === this.right;
		},
		"$=": function () {
			return this["=="]() || this.left.substr(this.left.length - this.right.length) === this.right;
		},
		"|=": function () {
			return this["=="]() || this.left.substr(0, this.right.length + 1) === this.right + "-";
		}
	};

	new Class("vi.Class.Operator", Operator);

	// Counter
	function Counter(a) {
		this._num = parseFloat(a) || 0;
		this._org = this._num;
		return this;
	}

	Counter.prototype = {
		decr: function () {
			return --this._num;
		},
		decrBy: function (a) {
			return this._num -= a;
		},
		incr: function () {
			return ++this._num;
		},
		incrBy: function (a) {
			return this._num += a;
		},
		get: function (a) {
			return Math.max(this._num, this._num + (a || 0));
		},
		org: function (a) {
			return this._org + (a || 0);
		},
		reset: function () {
			this._num = this._org;
			return this;
		}
	};

	new Class("vi.Class.Counter", Counter);

	//
	// http://www.cnblogs.com/cloudgamer/archive/2009/01/06/tween.html
	//
	// easeIn: 从0开始加速的缓动
	// easeOut: 减速到0的缓动
	// easeInOut: 前半段从0开始加速，后半段减速到0的缓动
	// - t: current time（当前时间）
	// - b: beginning value（初始值）
	// - c: change in value（变化量）
	// - d: duration（持续时间）
	//
	function Animate(a) {
		this.Events();
		this.Options(a);
		return this;
	}

	Animate.effects = {
		// 无缓动效果，匀速运动
		Linear: function (t, b, c, d) {
			return c * t / d + b;
		},
		// 转圈
		Round: {
			left: function (t, b, c, d, e) {
				return e.radius * Math.cos(t / 20) + b;
			},
			top: function (t, b, c, d, e) {
				return e.radius * Math.sin(t / 20) + b;
			}
		},
		// 二次方缓动（t^2）
		Quad: {
			easeIn: function (t, b, c, d) {
				return c * (t /= d) * t + b;
			},
			easeOut: function (t, b, c, d) {
				return -c * (t /= d) * (t - 2) + b;
			},
			easeInOut: function (t, b, c, d) {
				t /= d / 2;
				if (t < 1) {
					return c / 2 * t * t + b;
				}
				return -c / 2 * ((--t) * (t - 2) - 1) + b;
			}
		},
		// 三次方缓动（t^3）
		Cubic: {
			easeIn: function (t, b, c, d) {
				return c * (t /= d) * t * t + b;
			},
			easeOut: function (t, b, c, d) {
				return c * ((t = t / d - 1) * t * t + 1) + b;
			},
			easeInOut: function (t, b, c, d) {
				t /= d / 2;
				if (t < 1) {
					return c / 2 * t * t * t + b;
				}
				return c / 2 * ((t -= 2) * t * t + 2) + b;
			}
		},
		// 四次方缓动（t^4）
		Quart: {
			easeIn: function (t, b, c, d) {
				return c * (t /= d) * t * t * t + b;
			},
			easeOut: function (t, b, c, d) {
				return -c * ((t = t / d - 1) * t * t * t - 1) + b;
			},
			easeInOut: function (t, b, c, d) {
				t /= d / 2;
				if (t < 1) {
					return c / 2 * t * t * t * t + b;
				}
				return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
			}
		},
		// 五次方缓动（t^5）
		Quint: {
			easeIn: function (t, b, c, d) {
				return c * (t /= d) * t * t * t * t + b;
			},
			easeOut: function (t, b, c, d) {
				return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
			},
			easeInOut: function (t, b, c, d) {
				t /= d / 2;
				if (t < 1) {
					return c / 2 * t * t * t * t * t + b;
				}
				return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
			}
		},
		// 正弦曲线缓动（sin(t)）
		Sine: {
			easeIn: function (t, b, c, d) {
				return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
			},
			easeOut: function (t, b, c, d) {
				return c * Math.sin(t / d * (Math.PI / 2)) + b;
			},
			easeInOut: function (t, b, c, d) {
				return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
			}
		},
		// 指数曲线缓动（2^t）
		Expo: {
			easeIn: function (t, b, c, d) {
				return t === 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
			},
			easeOut: function (t, b, c, d) {
				return t === d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
			},
			easeInOut: function (t, b, c, d) {
				if (t === 0) {
					return b;
				}
				if (t === d) {
					return b + c;
				}
				t /= d / 2;
				if (t < 1) {
					return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
				}
				return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
			}
		},
		// 圆形曲线缓动（sqrt(1-t^2)）
		Circ: {
			easeIn: function (t, b, c, d) {
				return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
			},
			easeOut: function (t, b, c, d) {
				return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
			},
			easeInOut: function (t, b, c, d) {
				t /= d / 2;
				if (t < 1) {
					return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
				}
				return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
			}
		},
		// 指数衰减的正弦曲线缓动
		Elastic: {
			easeIn: function (t, b, c, d, a, p) {
				if (t === 0) {
					return b;
				}
				t /= d;
				if (t === 1) {
					return b + c;
				}
				if (!p) {
					p = d * .3;
				}
				var s;
				if (!a || a < Math.abs(c)) {
					a = c;
					s = p / 4;
				} else {
					s = p / (2 * Math.PI) * Math.asin(c / a);
				}
				return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
			},
			easeOut: function (t, b, c, d, a, p) {
				if (t === 0) {
					return b;
				}
				t /= d;
				if (t === 1) {
					return b + c;
				}
				if (!p) {
					p = d * .3;
				}
				var s;
				if (!a || a < Math.abs(c)) {
					a = c;
					s = p / 4;
				} else {
					s = p / (2 * Math.PI) * Math.asin(c / a);
				}
				return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
			},
			easeInOut: function (t, b, c, d, a, p) {
				if (t === 0) {
					return b;
				}
				t /= d / 2;
				if (t === 2) {
					return b + c;
				}
				if (!p) {
					p = d * (.3 * 1.5);
				}
				var s;
				if (!a || a < Math.abs(c)) {
					a = c;
					s = p / 4;
				} else {
					s = p / (2 * Math.PI) * Math.asin(c / a);
				}
				if (t < 1) {
					return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
				}
				return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
			}
		},
		// 超过范围的三次方缓动（(s+1)*t^3 - s*t^2）
		Back: {
			easeIn: function (t, b, c, d, s) {
				s = s || 1.70158;
				return c * (t /= d) * t * ((s + 1) * t - s) + b;
			},
			easeOut: function (t, b, c, d, s) {
				s = s || 1.70158;
				return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
			},
			easeInOut: function (t, b, c, d, s) {
				s = s || 1.70158;
				t /= d / 2;
				if (t < 1) {
					return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
				}
				return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
			}
		},
		// 指数衰减的反弹缓动
		Bounce: {
			easeIn: function (t, b, c, d) {
				return c - Animate.effects.Bounce.easeOut(d - t, 0, c, d) + b;
			},
			easeOut: function (t, b, c, d) {
				t /= d;
				if (t < (1 / 2.75)) {
					return c * (7.5625 * t * t) + b;
				}
				if (t < (2 / 2.75)) {
					return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
				}
				if (t < (2.5 / 2.75)) {
					return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
				}
				return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
			},
			easeInOut: function (t, b, c, d) {
				if (t < d / 2) {
					return Animate.effects.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
				}
				return Animate.effects.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
			}
		}
	};

	Animate.prototype = {
		_running: false,
		options: {
			target: null,
			style: null,
			start: null,
			stop: null,
			unit: "px",
			onStart: null,
			onStop: null,
			speed: 400, // 多少毫秒内完成 speed = duration / delay
			delay: 13,
			effect: "Linear",
			param: null // @todo Elastic and Back
		},
		start: function (a) {
			var i = this;
			if (i._running || i.callEvent("startbefore") === false) {
				return i;
			}
			i._running = true;
			var o = i.options, t = o.target, p = o.param,
			u = o.unit || "px", h = i.hasEvent("run"),
			n = o.stop || {}, // 目标值
			g = o.start || t.getStyles(Hash.getKeys(n)), // 初始值
			c = o.effect, s = o.speed, l = o.delay,
			as = Animate.effects, r = typeof c === "function" ? c : Namespace.get(as, c) || as.Linear, // 算子
			j = 0, d = Math.round(String.isNumber(s) ? s / l : 400 / l),
			f = function () {
				if (j >= d || !i._running) {
					i.stop(a);
					return;
				}
				j++;
				for (var k in n) {
					if (!vi.noset(g[k])) {
						var b = parseFloat(g[k]) || 0, c = parseFloat(n[k]) || 0,
						v = !b && typeof r[k] === "function" ? r[k].call(i, j, b, c - b, d, p) : r.call(i, j, b, c - b, d, p);
						t.setStyle(k, v, u);
						h && i.callEvent("run", k, v, u);
					}
				}
			};
			i._style = t.style.cssText;
			f();
			i._timer = window.setInterval(f, l);
			i.callEvent("start");
			return i;
		},
		abort: function () {
			var i = this;
			if (!i._running) {
				return i;
			}
			i._running = false;
			i.callEvent("abort");
			return i;
		},
		stop: function () {
			var i = this;
			if (!i._running) {
				return i;
			}
			var o = i.options, t = o.target;
			window.clearInterval(i._timer);
			t.style.cssText = i._style;
			i._style = i._timer = null;
			i._running = false;
			i.callEvent("stop");
			return i;
		}
	};

	new Class("vi.Class.Animate", Animate, [Events, Options]);

	// Ajax
	function Ajax(a) {
		this.Events();
		this.Options(a);
		this._xhr = Ajax.createXhr();
		this._originalXhr = this._xhr;
		return this;
	}

	// xhr status
	Ajax.UNINITIALIZED = 0;
	Ajax.LOADING = 1;
	Ajax.LOADED = 2;
	Ajax.INTERACTIVE = 3;
	Ajax.COMPLETE = 4;

	// http status
	Ajax.OK = 200;
	Ajax.IE9_NO_CONTENT = 1223;
	Ajax.MULTIPLE_CHOICES = 300;
	Ajax.NOT_MODIFIED = 304;

	Ajax.accepts = {
		xml: "application/xml, text/xml",
		html: "text/html",
		text: "text/plain",
		json: "application/json, text/javascript",
		script: "application/javascript, text/javascript"
	};

	Ajax.methods = {
		get: true,
		post: true,
		put: true,
		head: true,
		"delete": true
	};

	Ajax.options = {
		url: "",
		data: "",
		type: "get",
		dataType: "html",
		charset: "utf-8",
		username: "",
		password: "",
		context: null,
		async: true,
		evalResponse: true,
		evalScripts: false,
		urlEncoded: true,
		noCache: false,
		onSuccess: null,
		onError: null,
		onAbort: null,
		headers: {
			"X-Requested-With": "XMLHttpRequest"
		}
	};

	Ajax.prototype = {
		_xhr: null,
		_originalXhr: null,
		_running: false,
		options: Ajax.options,
		isRunning: function () {
			return this._running;
		},
		isSuccess: function () {
			var s = this._xhr.status;
			return !s || (s >= Ajax.OK && s < Ajax.MULTIPLE_CHOICES) || s === Ajax.NOT_MODIFIED || s === Ajax.IE9_NO_CONTENT;
		},
		isComplete: function () {
			return this._xhr.readyState === Ajax.COMPLETE;
		},
		getOriginalXhr: function () {
			return this._originalXhr;
		},
		setRequestHeader: function (key, value) {
			this.options.headers[key] = value;
			return this;
		},
		getAllResponseHeaders: function () {
			return this._xhr.getAllResponseHeaders();
		},
		getResponseHeader: function (a) {
			var s = this._xhr.getAllResponseHeaders();
			return s && s[a.lower()] || "";
		},
		getResponseText: function () {
			return this._xhr.responseText || "";
		},
		send: function () {
			var i = this;
			if (i._running) {
				return i;
			}

			i._running = true;

			var o = i.options, m = o.type.lower();
			Ajax.methods[m] || vi.error("Request type unreasonable");

			var u = o.url || vi.url(),
			g = u.has("?") ? "&" : "",
			x = i._xhr, q = o.data,
			d = q ? new QueryString(q).to() : "",
			t = o.dataType.lower(),
			h = o.headers || {};

			if (m === "get") {
				u += g || "?";
				u += d;
				d = null;
			} else {
				if (g) {
					var s = u.split("?");
					d += d ? g : "";
					d += s[1];
					u = s[0];
				}
				if (m === "post" && o.urlEncoded) {
					var c = "application/x-www-form-urlencoded;", r = o.charset;
					c += r ? " charset=" + r : "";
					h["Content-Type"] = c;
				}
			}

			if (o.noCache) {
				h["Cache-Control"] = "no-cache";
				u += g || "?";
				u += "_=" + Math.random();
			}

			if (Ajax.accepts[t]) {
				h.Accept = Ajax.accepts[t];
			}

			x.open(m, u, o.async);

			for (var t in h) {
				x.setRequestHeader(t, h[t]);
			}

			x.send(d);

			if (!o.async || i.isComplete()) {
				i.ready();
			} else {
				x.onreadystatechange = i.ready.bind(i);
			}

			return i;
		},
		abort: function () {
			var i = this;
			if (!i._running) {
				return i;
			}
			i._running = false;
			var x = i._xhr;
			x.abort();
			x.onreadystatechange = function () {};
			i._xhr = Ajax.createXhr();
			i.callEvent("abort");
			return i;
		},
		ready: function () {
			var i = this;
			if (!i._running || !i.isComplete()) {
				return;
			}

			i._running = false;

			var x = i._xhr;
			x.onreadystatechange = function () {
			};

			if (!i.isSuccess()) {
				i.callEvent("error", x);
				return;
			}

			var o = i.options, d = x.responseText || "", t = o.dataType.lower();

			try {
				if (t === "json") {
					o.evalResponse && (d = Ajax.parseJSON(d));
				} else if (t === "html") {
					o.evalScripts && (d = d.evalScripts());
				} else if (t === "script") {
					o.evalScripts && (d = vi.eval(d));
				} else if (t === "xml") {
					d = x.responseXML || "";
					o.evalResponse && (d = Ajax.parseXML(d));
				}
			} catch (e) {
				i.callEvent("error", x, e);
				return;
			}

			i.callEvent("success", d);
		}
	};

	var JSON = window.JSON;
	new Class({
		name: "vi.Class.Ajax",
		main: Ajax,
		implement: [Events, Options],
		members: {
			send: function (a) {
				return new Ajax(a).send();
			},
			get: function (a, b, c, d) {
				if (!d && typeof b === "function") {
					d = c;
					c = b;
					b = "";
				}
				return new Ajax({url: a, data: b, onSuccess: c, dataType: d, type: "get"}).send();
			},
			post: function (a, b, c, d) {
				if (!d && typeof b === "function") {
					d = c;
					c = b;
					b = "";
				}
				return new Ajax({url: a, data: b, onSuccess: c, dataType: d, type: "post"}).send();
			},
			getJSON: function (a, b, c) {
				return Ajax.get(a, b, c, "json");
			},
			postJSON: function (a, b, c) {
				return Ajax.post(a, b, c, "json");
			},
			parseJSON: JSON && typeof JSON.parse === "function" ? JSON.parse : function (a) {
				return expChars.test(a.replace(expNoEscape, "@").replace(expNoTokens, "]").replace(expNoBraces, "")) ? vi.eval("return " + a) : null;
			},
			parseXML: typeof window.DOMParser === "function" ? function (a) {
				var x = new DOMParser();
				return x.parseFromString(a, "application/xml");
			} : function (a) {
				var x = new ActiveXObject("Microsoft.XMLDOM");
				x.async = "false";
				x.loadXML(a);
				return x;
			},
			createXhr: typeof window.XMLHttpRequest === "function" ? function () {
				return new XMLHttpRequest();
			} : function () {
				return new ActiveXObject("Microsoft.XMLHTTP");
			}
		}
	});

	new Window();
	new Document();

})(window, undefined);