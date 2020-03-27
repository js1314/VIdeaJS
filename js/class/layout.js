
	// Layout
	function Layout(a) {
		this.Events();
		this.Options(a);
		return this;
	}

	UI.Layout = Layout;

	Layout.options = {
		namespace: "vilayout",
		titleText: "",
		bodyText: "",
		toolsText: "",
		hasHeader: true,
		hasBody: true,
		hasFooter: true,
		hasTitle: true,
		hasTools: false
	};

	Layout.prototype = {
		options: Layout.options,
		parse: function (w) {
			var i = this;
			if (i._wrapper || !w || w.nodeType !== 1) {
				return i;
			}
			var o = i.options, n = o.namespace;
			i._wrapper = w;
			i._container = w.find(n + "-container")[0];
			i._header = w.find(n + "-header")[0];
			i._title = w.find(n + "-title")[0];
			i._tools = w.find(n + "-tools")[0];
			i._body = w.find(n + "-body")[0];
			i._footer = w.find(n + "-footer")[0];
			return i;
		},
		create: function () {
			var i = this;
			if (i._wrapper) {
				return i;
			}
			var w, c, h, t, s, b, f, o = i.options, n = o.namespace;
			i._wrapper = w = document.makeElement("div");
			w.className = n + "-wrapper";
			i._container = c = document.makeElement("div");
			c.className = n + "-container";
			w.appendChild(c);
			if (o.hasHeader) {
				i._header = h = document.makeElement("div");
				h.className = n + "-header";
				c.appendChild(h);
			}
			if (o.hasTitle) {
				i._title = t = document.makeElement("div");
				t.className = n + "-title";
				t.innerHTML = o.titleText || "";
				(h || c).appendChild(t);
			}
			if (o.hasTools) {
				i._tools = s = document.makeElement("div");
				s.className = n + "-tools";
				s.innerHTML = o.toolsText || "";
				(h || c).appendChild(s);
			}
			if (o.hasBody) {
				i._body = b = document.makeElement("div");
				b.className = n + "-body";
				b.innerHTML = o.bodyText || "";
				c.appendChild(b);
			}
			if (o.hasFooter) {
				i._footer = f = document.makeElement("div");
				f.className = n + "-footer";
				c.appendChild(f);
			}
			return i;
		},
		getWrapper: function () {
			return this._wrapper;
		},
		getContainer: function () {
			return this._container;
		},
		getHeader: function () {
			return this._header;
		},
		getTitle: function () {
			return this._title;
		},
		getTools: function () {
			return this._tools;
		},
		getBody: function () {
			return this._body;
		},
		getFooter: function () {
			return this._footer;
		}
	};

	new UI("vi.UI.Layout", Layout);