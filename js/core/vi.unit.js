/* global vi, vi */

/**
 * vi JavaScript Framework
 *
 *  - Unit Module
 *
 * @author		jack.zhu
 * @version	v1.0.0
 *
 */

(function (vi) {

	function Unit() {
		vi.error("Illegal Constructor.");
	}

	vi.Unit = Unit;

	Unit.same = function (a, b) {
		var t = vi.type(a);
		if (t === "Undefined") {
			return false;
		}
		if (t === "Array" || t === "Object") {
			for (var k in a) {
				if (!Unit.same(a[k], b[k])) {
					return false;
				}
			}
		}
		return a === b;
	};

	Unit.report = function (a, b, c, d) {
		var r, t = 0;
		c = c || 100;
		d = d || 100;
		console.info(a + ": " + c + "ot * " + d + "it = " + (c * d) + "tt");
		var i = c;
		while (i--) {
			var l = d, s = +new Date();
			while (l--) {
				r = b();
			}
			t += (+new Date()) - s;
		}
		var v = Math.round((t / c) * 100) / 100;
		console.info("res: ", r);
		console.info("avg: " + v + "ms/ot");
		console.log("---------- Report Ending ----------");
		console.log(" ");
		return {name: a, res: r, avg: v};
	};

	Unit.vs = function (a, b, c, d) {
		a = Unit.report(a, b);
		b = Unit.report(c, d);
		if (a.avg > b.avg) {
			var d = Math.round((a.avg - b.avg) * 100) / 100;
			console.info(b.name + ": faster");
			console.info("dif: " + d + "ms/ot");
			console.warn(a.name + ": slower");
		} else if (a.avg === b.avg) {
			console.info(a.name + " equal " + b.name);
		} else {
			var d = Math.round((b.avg - a.avg) * 100) / 100;
			console.info(a.name + ": faster");
			console.info("dif: " + d + "ms/ot");
			console.warn(b.name + ": slower");
		}
		if (vi.Unit.same(a.res, b.res)) {
			console.log("res: equal");
		} else {
			console.warn("res: unequal");
		}
		console.log("---------- VS Ending ----------");
		console.log(" ");
		document.write("See console");
	};

})(window.vi);


