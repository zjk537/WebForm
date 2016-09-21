var LK = {
	version:"1.0",
	host:"",
	key:"LK",
	expire_days:3600,
	cmds:[],
	tracker:function()
	{
		var that = this.tracker;
		that.timestamp = this.getTimestamp();
		that.prop = {};
		//发送请求
		that.log = function (param){
			var img = new Image(1, 1);
			img.onLoad = function (){};
			img.src = LK.buildUrl(param);
		};
	},
	//处理命令队列
	submit:function()
	{
		this.tracker();
		for(var i in this.cmds)
		{
			var line = this.cmds[i];
			var args = Array.prototype.slice.call(line, 1);
			if(!window[this.key])
				window[this.key] = this;
			window[this.key][line[0]].apply(this.tracker, args);
		}
	},
	setSiteId:function(siteid)
	{
		this.siteid = siteid;
	},
	//跟踪PV
	trackPageView:function()
	{
		this.log('');
	},
	addRegisteraction:function (user_name,email_address,user_email)
	{
		if(!this.prop.trans)
			this.prop.trans = {};
		
		var trans = {};
		trans.user_name = user_name;
		trans.email_address = email_address;
		trans.user_email = user_email;		
		 
		this.prop.trans[user_name] = trans; 
	},
	addTransaction:function (order_id, order_source, total, tax, shipping, gateway, city, state, country)
	{
		if(!this.prop.trans)
			this.prop.trans = {};
		
		var trans = {};
		trans.order_id = order_id;
		trans.order_source = encodeURIComponent(order_source);
		trans.total = total;
		trans.tax = tax;
		trans.shipping = shipping;
		trans.gateway = encodeURIComponent(gateway);
		trans.city = encodeURIComponent(city);
		trans.state = encodeURIComponent(state);
		trans.country = encodeURIComponent(country);
		trans.items = [];
		this.prop.trans[order_id] = trans; 
	},
	addTransactionLineItem:function (order_id, sku, product_name, category, unit_price, quantity)
	{
		var li = {};
		li.li_order_id = order_id;
		li.li_sku = encodeURIComponent(sku);
		li.li_product_name = encodeURIComponent(product_name);
		li.li_category = encodeURIComponent(category);
		li.li_unit_price = encodeURIComponent(unit_price);
		li.li_quantity = quantity;
		var order = this.prop.trans[order_id];
		var items = order['items'];
		items.push(li);
		order['items'] = items;
		this.prop.trans[order_id] = order;
	},
	trackTransaction:function()
	{
		var param = "";
		for(var o in this.prop.trans)
		{
			for(var k in this.prop.trans[o])
			{
				var v = this.prop.trans[o][k];
				if(typeof v === 'object')
					for(var t in v)
						for(var ta in v[t])
							param += "&" + ta + "=" + v[t][ta];
				else
					param += "&" + k + "=" + v;
			}
		}
		this.log(param);
	},
	//构建URL
	buildUrl:function (param)
	{
		var that = this.tracker;
		var url = "";
		url += this.host;
		url += "?siteid=" + that.siteid;
		url += "&visitor_id=" + this.getVisitorId();
		url += "&page_title=" + this.getPageTitle();
		url += "&tourl=" + this.getUrl();
		url += "&referrer=" + this.getReferrer();
		url += param;
		url += "&version=" + this.version;
		return url;
	},
	setCookie:function (name, value, days, path, domain, secure)
	{
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var domain_arr = location.hostname.split('.');
		
		if(domain_arr.length == 2)
			domain = location.hostname;
		else	
		{
			domain_arr.shift();
			domain = "." + domain_arr.join('.');
		}	
		document.cookie = name + "=" + escape(value) +
			((days) ? "; expires=" + date.toGMTString() : "") +
			"; path=/"  +
			"; domain=" + domain +
			((secure) ? "; secure" : "");
	},
	readAllCookies : function ()
	{
		var jar = {};
		var ca = document.cookie.split(';');
		if (ca) {
			for (var i = 0; i < ca.length; i++) {
				var cat = this.util.trim(ca[i]);
				var pos = this.util.strpos(cat, '=');
				var key = cat.substring(0, pos);
				var value = cat.substring(pos + 1, cat.length);
				if (!jar.hasOwnProperty(key)) {
					jar[key] = [];
				}
				jar[key].push(value);
			}
			return jar;
		}
	},
	getCookie : function (name) 
	{
		var jar = this.readAllCookies();
		if (jar) {
			if (jar.hasOwnProperty(name)) {
				return jar[name][0];
			} else {
				return "";
			}
		}
	},
	getTimestamp:function()
	{
		return Math.round(new Date().getTime() / 1000);
	},
	getVisitorId:function()
	{
		
		var visitorId = this.getCookie("lk_vuid");
		if(visitorId)
		{
			return visitorId;
		}
		else
		{
			var time = new Date().getTime();
			var random = Math.round(Math.random() * 1000000);
			visitorId = time + "" + random;
			this.setVisitorId(visitorId);
			return visitorId;
		}
	},
	setVisitorId:function(visitorId)
	{
		this.setCookie('lk_vuid', visitorId, this.expire_days);
	},
	getPageTitle:function()
	{
		try {
                var t = document.getElementsByTagName("title");
                return encodeURIComponent(t[0].text);
        } catch (e) {return "";}
		//var t = document.getElementsByTagName("title");
		//return t == null ? encodeURIComponent(t[0].text) : '';
	},
	getUrl:function()
	{
		//访问 URL
		var tourl = location.href;
		return encodeURIComponent(tourl);
	},
	getReferrer:function()
	{
		//来源URL
		var referrer = document.referrer;
		return encodeURIComponent(referrer);
	},
	util:{
		trim:function(str)
		{
			return str.replace(/(^\s+)|(\s+$)/, '');
		},
		strpos:function(haystack, needle, offset)
		{
			var i = (haystack + '').indexOf(needle, (offset || 0));
			return i === -1 ? false : i;
		}
	}
};

(function(){
	var lk = LK;
	lk.host = "__lk.gif"/*tpa=http://www.zikker.com/__lk.gif*/;
	if(lk_cmds)
		lk.cmds = lk_cmds;
	
	lk.submit();
})(); 
