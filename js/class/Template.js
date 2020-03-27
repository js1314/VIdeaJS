/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function Template(elem) {
	elem = new Element(elem);
	this._tplString = elem.getHtml().join("").replace(/url=/g, "src=");
	elem.destroy();
	return this;
}

Template.prototype = {
	_tplString: "",
	variableSign: "$",
	leftDelimiter: "[",
	rightDelimiter: "]",
	tplContainerClassName: ".vi-Template-container",
	parseForEach: function(rows) {
		var html = "";
		if (rows) {
			for (var i = 0, l = rows.length; i < l; i++) {
				html += this.parseForIn(rows[i]);
			}
		}
		if (html) {
			var exp = new RegExp("\\" + this.leftDelimiter + this.variableSign + "\\w+\\" + this.rightDelimiter, "g");
			if (exp.test(html)) {
				html = html.replace(exp, "");
			}
		}
		return html;
	},
	parseForIn: function(row) {
		var tpl = this._tplString,
		ret = "";
		for (var key in row) {
			var name = this.leftDelimiter + this.variableSign + key + this.rightDelimiter;
			if (tpl.indexOf(name) > -1) {
				tpl = tpl.replace(name, String(row[key]));
				ret = tpl;
			}
		}
		return ret;
	}
};

new Class({
	name: "Template",
	main: Template
});

