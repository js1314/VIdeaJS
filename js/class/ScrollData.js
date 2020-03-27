/**
 * 随滚动条加载数据
 * 
 * @author		jack
 * @version	v1.0.0
 * 
 */

function ScrollData(url) {
	this.children("Request", url);
	this.children("Template", query(this.tplContainerClassName));
	this.children("Pagination", query(this.pageContainerClassName));
	this._sdGuid = VI.guid("viScrollData-");
	this._sdContainer = query(this.sdContainerClassName);
	this._sdLoading = query(this.sdLoadingClassName);
	this._loadMore = query(this.sdLoadMoreClassName);
	this.bindScrollEvent();
}

ScrollData.prototype = {
	_sdGuid: null,
	_sdContainer: null,
	_sdLoading: null,
	_sdRefersh: false,
	_loadMore: null,
	_lockScroll: false,
	_scrollTop: 0,
	_currPage: 1,
	_waterFallCount: 0,
	isWaterFall: false,
	moduleWidth: 0,
	moduleLeft: 10,
	moduleTop: 10,
	sdWrapperClassName: ".vi-ScrollData-wrapper",
	sdContainerClassName: ".vi-ScrollData-container",
	sdModuleClassName: ".vi-ScrollData-module",
	tplContainerClassName: ".vi-Template-container",
	pageContainerClassName: ".vi-Pagination-container",
	sdLoadingClassName: ".vi-ScrollData-loading",
	sdLoadMoreClassName: ".vi-ScrollData-more",
	autoPage: 3,
	morePage: 3,
	moreSize: 20,
	type: "json",
	hasMore: function() {
		return this._currPage > this.autoPage;
	},
	hasPage: function() {
		if (this._currPage > (this.autoPage + this.morePage)) {
			return true;
		}
		if (!this.urlParams) {
			return false;
		}
		var matches = this.urlParams.match(/pagesize=(\d+)/i);
		this.pageSize = (matches && matches[1].toInt()) || this.moreSize;
		matches = this.urlParams.match(/page=(\d+)/i);
		this.page = (matches && matches[1].toInt()) || this.page;
		return (this.pageSize / this.moreSize) >= this._currPage;
	},
	disposeWaterFall: function() {
		if (!this.isWaterFall) {
			return;
		}
		var mods = this._sdContainer.query(" > " + this.sdModuleClassName),
		size = mods.length,
		group = {},
		height = 0,
		left = this.moduleWidth + this.moduleLeft,
		row = this._sdContainer.getWidth() / left,
		style = {
			position: "absolute",
			height: "auto",
			top: 0,
			left: 0
		};
		for (var i = 0; i < size; i++) {
			var index = i % row;
			group[index] = group[index] || [];
			group[index].set(mods[i]);
		}
		this._sdContainer.setStyle("height", "auto");
		for (var index in group) {
			style.top = 0;
			style.left = index * left;
			for (var j = 0, mod = group[index], t = mod.length; j < t; j++) {
				style.top += mod[j].setStyles(style).getHeight() + this.moduleTop;
				height = Math.max(height, style.top - this.moduleTop);
			}
		}
		this._sdContainer.setStyle("height", height);
	},
	bindScrollEvent: function() {
		if (this._sdContainer) {
			this._scroll = this._scroll || this.scroll.bind(this);
			window.addEvent(this._sdGuid + ".scroll", this._scroll);
		}
	},
	unbindScrollEvent: function() {
		if (this._sdContainer && this._scroll) {
			window.removeEvent(this._sdGuid + ".scroll", this._scroll);
			this._scroll = null;
		}
	},
	bindMoreEvent: function() {
		if (this._loadMore) {
			this._loadModule = this._loadModule || this.loadModule.bind(this);
			this._loadMore.addEvent(this._sdGuid + ".click", this._loadModule);
		}
	},
	unbindMoreEvent: function() {
		if (this._loadMore && this._loadModule) {
			this._loadMore.removeEvent(this._sdGuid + ".click", this._loadModule);
			this._loadModule = null;
		}
	},
	loadModule: function() {
		if (this.hasPage()) {
			this.data = this.urlParams;
		} else {
			this.data = Pagination.urlParams(this.urlParams);
			this.data += "&page=" + this._currPage + "&pageSize=" + this.pageSize;
		}
		this._lockScroll = true;
		this.getRealContainer().hide();
		this._loadMore.hide();
		this._sdLoading.show();
		this.send();
		return this;
	},
	ajaxPage: function(a) {
		this._sdRefersh = true;
		this.loadModule();
	},
	scroll: function() {
		if (this._lockScroll) {
			return false;
		}
		var scrollTop = window.getScrollTop() + window.screen.availHeight;
		if (this._scrollTop >= scrollTop) {
			return false;
		}
		this._scrollTop = scrollTop;
		var lastChild = this._sdContainer.getLast(),
		offsetTop = lastChild.getOffsetTop() + lastChild.getHeight();
		if (scrollTop < offsetTop) {
			return false;
		}
		this._sdRefersh = false;
		this.loadModule();
		return true;
	},
	success: function(data) {
		this._sdLoading.hide();
		this._lockScroll = false;
		if (!data || data.error) {
			return;
		}
		var html = this.parseForEach(data.rows);
		this._sdRefersh ? this._sdContainer.setHtml(html) : this._sdContainer.append(html);
		this.disposeWaterFall();
		this._currPage++;
		if (this.hasPage()) {
			this.unbindScrollEvent();
			this.unbindMoreEvent();
			this.count = data.count;
			this.pageSize = (this._currPage - 1) * this.pageSize;
			this._currPage = 1;
			this.appendToContainer();
			return;
		}
		if (this.hasMore()) {
			this.unbindScrollEvent();
			this.bindMoreEvent();
			this._loadMore.show();
			return;
		}
	}
};

new Class({
	name: "ScrollData",
	main: ScrollData,
	implement: ["Template", "Pagination"]
});