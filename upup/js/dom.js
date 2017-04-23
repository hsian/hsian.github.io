/*! HTML - v0.12.1 - 2014-10-22
* http://nbubna.github.io/HTML/
* Copyright (c) 2014 ESHA Research; Licensed MIT, GPL 
* rename Util 2015-10-13*/
(function(window, document, Observer) {
    "use strict";
    
    var _ = {
        version: "0.12.1",
        slice: Array.prototype.slice,
        list: function(list, force) {
            if (force || !list.each) {
                if (!list.slice){ list = _.slice.call(list); }     
                _.methods(list);
                list.each(function(i){
                     _.methods(i);
                });
                if (list.length){ _.children(list[0], list); }// proxy dot-traversal into first element
            } 
            return list;
        },
        node: function(node, force) {
            if (force || !node.each) {
                _.methods(node);             
                _.children(node);
            }
            return node;
        },
        methods: function(o) {
            for (var method in _.fn) {
                _.define(o, method, _.fn[method]);
            }
        },
        children: function(node, list) {
            var children = node._children = {};
            for (var i=0, m=node.childNodes.length; i<m; i++) {
                var child = node.childNodes[i],
                    key = _.key(child);
                (children[key]||(children[key]=[])).push(child);
                _.define(node, key);
                if (list){ _.define(list, key, undefined, node); }
            }
            return children;
        },
        key: function(node) {
            return node.tagName ? node.tagName.toLowerCase() : '_other';
        },
        define: function(o, key, val, node) {
            if (!(key in o)) { try {// never redefine, never fail
                node = node || o;// children needn't belong to define's target
                Object.defineProperty(o, key,
                    val !== undefined ? { value: val } :
                    {
                        get: function() {
                            if (!node._children){ _.children(node); }
                            return _.list(node._children[key]||[]);
                        }
                    }
                );
            } catch (e) {} }
        },
        mutation: function(e) {
            var node = e.target;// only wipe cache for 3rd party changes
            delete node[node._internal ? '_internal' : '_children'];
        },
        unique: function(node, i, arr){ return arr.indexOf(node) === i; },
        fn: {
            each: function(fn) {
                var self = this.forEach ? this : [this],
                    results = [],
                    prop, args;
                if (typeof fn === "string") {
                    prop = _.resolve[fn] || fn;// e.g. _.resolve['+class'] = 'classList.add';
                    args = _.slice.call(arguments, 1);
                    fn = function(el, i){ return _.resolve(prop, el, args, i); };
                }
                for (var i=0,m=self.length, result; i<m; i++) {
                    result = fn.call(self, _.node(self[i]), i, self);

                    if (result || (prop && result !== undefined)) {
                        if (result.forEach) {
                            results.push.apply(results, result);
                        } else {
                            results.push(result);
                        }
                    }
                }
                return !results[0] && results[0] !== false ? this :
                    results[0] instanceof Node ? _.list(results.filter(_.unique)) :
                    //self.length === 1 ? results[0] :
                    results;
            },
            find: function() {
                try{ window.console.warn('find() is deprecated. Please use query().'); }
                finally{ return this.query.apply(this, arguments); }
            },
            query: function(selector, count) {
                var mark = selector.charAt(0);
                //暂时只区别id
                (mark !== '#') && (mark = '*'); 
                return  _.typeHandle[mark].call(this,selector,count);
                
            },
            only: function(b, e) {
                var self = this.forEach ? this : [this];
                return _.list(
                    b >= 0 || b < 0 ?
                        self.slice(b, e || (b + 1) || undefined) :
                        self.filter(
                            typeof b === "function" ? b :
                            function(el){ return el.matches(b); }
                        )
                );
            },
            all: function(prop, inclusive, _results) {
                _results = _results || [];
                var self = this.forEach ? this : [this];
                if (inclusive){ _results.push.apply(_results, self); }
                for (var i=0, m=self.length; i<m; i++) {
                    var node = self[i];
                    if (prop in node && node[prop]) {
                        HTML.ify(node[prop]).all(prop, true, _results);
                    }
                }
                return _.list(_results.filter(_.unique));
            }
        },
        resolve: function(_key, _el, args, i) {
            var key = _key, el = _el;// copy prefixed originals so we can recover them if need be
            args = args.length ? _.fill(args, i, el) : null;
            if (key.indexOf('.') > 0) {
                var keys = key.split('.');
                while (keys.length > 1 && (el = el[key = keys.shift()])){}
                // if lookup failed, reset to originals
                el = el || _el;
                key = el ? keys[0] : _key;
            }
            var val = el[key];
            if (val !== undefined) {
                if (typeof val === "function") { return val.apply(el, args); }
                else if (args) { el[key] = args[0]; }
                else { return val; }
            }
            else if (args) {
                if (args[0] === null){ _el.removeAttribute(_key); }
                else { _el.setAttribute(_key, args[0]); }
            } else { return _el.getAttribute(_key); }
        },
        fill: function(args, index, el) {
            var ret = [];
            for (var i=0,m=args.length; i<m; i++) {
                var arg = args[i],
                    type = typeof arg;
                ret[i] = type === "string" ? arg.replace(/\$\{i\}/g, index) :
                         type === "function" ? arg(el, index, args) :
                         arg;
            }
            return ret;
        },
        //可判断类型，然后调用对象的typeHandle函数，以后拓展选择器时候有用！
        /*elType : function(){
            var m = Object.keys(_.typeHandle).join('');
            var regex = '[a-z'+m+']{0,1}(?:"[^"]*"|[^"'+m+']){0,}';
            return new RegExp(regex, 'g');
        },*/
        typeHandle : {
            '#' : function(selector){
                var el = this.querySelector(selector);
                return _.node(el);
            },
            '*' : function(selector,count){

                var self = this.forEach ? this : [this];
                for (var list=[], i=0, m=self.length; i<m && (!count || list.length < count); i++) {
                    if (count === list.length + 1) {

                        var node = self[i].querySelector(selector);
                        if (node){ list.push(node); }
                    } else {
                        var nodes = self[i].querySelectorAll(selector);

                        for (var j=0, l=nodes.length; j<l && (!count || list.length < count); j++) {
                            list.push(nodes[j]);
                        }
                    }
                }             

                return _.list(list);
            },
        },
    };

    var HTML = _.node(document.documentElement);// early availability
    HTML._ = _;
    _.define(HTML, 'ify', function(o, force) {
        return !o || 'length' in o ? _.list(o||[], force) : _.node(o, force);
    });
    // ensure element.matches(selector) availability
    var Ep = Element.prototype,
        aS = 'atchesSelector';
    _.define(Ep, 'matches', Ep['m'] || Ep['webkitM'+aS] || Ep['mozM'+aS] || Ep['msM'+aS]);
    // watch for changes in children
    if (Observer) {
        new Observer(function(list){ list.forEach(_.mutation); })
            .observe(HTML, { childList: true, subtree: true });
    } else {
        document.addEventListener("DOMSubtreeModified", _.mutation);
    }
    // export 
    if (typeof define === 'function' && define.amd) {
        define(function(){ return HTML; });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = HTML;
    } else {
        window[HTML.getAttribute('data-html-reference')||'HTML'] = HTML;
    }
    // eventual consistency
    document.addEventListener("DOMContentLoaded", function(){ _.node(HTML, true); });

})(window, document, window.MutationObserver);

/*!
 * add (添加节点)
 * 官方新增功能 HTML.body.add('div'); // returns a newly added div element
 */
(function(document, _) {
    "use strict";

    var add = _.fn.add = function(arg, ref) {
        return this.each(function(node) {
            return add.all(node, arg, ref);
        });
    };
    add.all = function(node, arg, ref) {
        if (typeof arg === "string") {// turn arg into an appendable
            return add.create(node, arg, ref);
        }
        if (!(arg instanceof Node) && 'length' in arg) {// array of append-ables
            var ret = [];
            for (var i=0,m=arg.length; i<m; i++) {
                ret.push(add.all(node, arg[i], ref));
            }
            return ret;
        }
        add.insert(node, arg, ref);// arg is an append-able     
        return arg;
    };
    add.create = function(node, tag, ref) {    
        return add.insert(node, document.createElement(tag), ref);
    };
    add.insert = function(node, child, ref) {
        var sibling = add.find(node, ref);
        if (sibling) {
            node.insertBefore(child, sibling);
        } else {
            node.appendChild(child);
        }
        _.updated(node);
        return child;
    };
    add.find = function(node, ref) {
        switch (typeof ref) {
            case "string": return node[ref+'Child'];
            case "number": return node.children[ref];
            case "object": return ref;
            case "function": return ref.call(node, node);
        }
    };

    _.updated = function(node) {
        node._internal = true;
        _.children(node);
    };

    _.fn.remove = function(chain) {
        return this.each(function(node) {
            var parent = node.parentNode;
            if (parent) {
                parent.removeChild(node);
                _.updated(parent);
                if (chain){ return parent; }
            }
        });
    };

})(document, document.documentElement._);

/*!
 * add 的拓展； 上面只是单纯的插入一个节点 
 * 拓展后可以按照语法插入过个子节点 并且添加属性
 */

(function(document, _) {
    "use strict";

    var add = _.fn.add;
    add.create = function(node, code, ref) {    
        var parts = code.match(add.emmetRE()).filter(Boolean), //array.filter能过滤掉值为空数组元素
            root = document.createDocumentFragment(),
            el = document.createElement(parts[0]);
            root.appendChild(el);
        for (var i=1,m=parts.length; i<m; i++) {
            var part = parts[i];
            el = add.emmet[part.charAt(0)].call(el, part.substr(1), root) || el;
        }
        add.insert(node, root, ref);
        return el;
    };
    add.emmetRE = function() {
        var m = Object.keys(add.emmet).join('');
        var regex = '[a-z'+m+']{0,1}(?:"[^"]*"|[^"'+m+']){0,}';
        return new RegExp(regex, 'g');
    };
    add.emmet = {
        '#': function(id) {
            this.id = id;
        },
        '.': function(cls) {
            var list = this.getAttribute('class') || '';
            list = list + (list ? ' ' : '') + cls;
            if (list.length) {
                this.setAttribute('class', list);
            }
        },
        '[': function(attrs) {
            attrs = attrs.substr(0, attrs.length-1).match(/(?:[^\s"]+|"[^"]*")+/g);
            for (var i=0,m=attrs.length; i<m; i++) {
                var attr = attrs[i].split('=');
                this.setAttribute(attr[0], (attr[1] || '').replace(/"/g, ''));
            }
        },
        '>': function(tag) {
            if (tag) {
                var el = document.createElement(tag);
                this.appendChild(el);
                return el;
            }
            return this;
        },
        '+': function(tag, root) {
            return add.emmet['>'].call(this.parentNode || root, tag);
        },
        '*': function(count) {
            var parent = this.parentNode,
                els = [this];
            for (var i=1; i<count; i++) {
                els.push(this.cloneNode(true));
                parent.appendChild(els[i]);
            }
            //TODO: numbering for els
            return els;
        },
        '^': function(tag, root) {
            return add.emmet['+'].call(this.parentNode || root, tag, root);
        },
        '{': function(text) {
            this.appendChild(document.createTextNode(text.substr(0, text.length-1)));
        }
    };

})(document, document.documentElement._);

/*! 功能拓展*/
(function(document,_){
    "use strict";

    _.fn.addClass = function(name){
        var len = this.length;
        while(len--){
            if(!_.fn.hasClass.call(this[len],name)){
                this[len].className = this[len].className.replace(/^\s+|\s+$/g, '') + ' ' + name;
            }
        }
        return this;
    };

    _.fn.removeClass = function(name){
        var regex = new RegExp('\\s*('+name+')','i');
        var len = this.length;
        while(len--){
            if(_.fn.hasClass.call(this[len],name)){
                this[len].className = this[len].className.replace(regex,'');
            }
        }
    };

    _.fn.hasClass = function(name){
        var regex = new RegExp(name,'i');
        return regex.test(this.className);
    };

    _.fn.show = function(){
        return _.showHide(this,true);
    };

    _.fn.hide = function(){

        return _.showHide(this);

    };

    _.showHide = function(el,show){
        var isArr = _.isArray(el);
        var _showHide = function(isArr,el,property){
            if(isArr){
                var len = el.length;
                while(len--){
                    el[len].style.display = property;
                }
            }else{
                el.style.display = property;
            }
        }
        show === true ? _showHide(isArr,el,'block') : _showHide(isArr,el,'none');
    };

    //反正0和>0的数
    _.isArray = function(o){
        return Object.prototype.toString.call(o).indexOf('Array') + 1;
    }

})(document,document.documentElement._);


/**
 * 常用的方法集合
 */

//获取url的地址栏参数
function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

/**
 * ajax封装
 * 执行基本ajax请求,返回XMLHttpRequest
 * Ajax.request(url,{
 *      async   是否异步 true(默认)
 *      method  请求方式 POST or GET(默认)
 *      data    请求参数 (键值对字符串)
 *      success 请求成功后响应函数，参数为xhr
 *      failure 请求失败后响应函数，参数为xhr
 * });
 *
 */
Ajax = {
    request : function(url,opt){
        function fn(){};
        var async   = opt.async !== false,
            method  = opt.method    || 'GET',
            encode  = opt.encode    || 'UTF-8',
            data    = opt.data      || null,
            success = opt.success   || fn,
            failure = opt.failure   || fn,
            method  = method.toUpperCase();

        if(data && typeof data == 'object'){//对象转换成字符串键值对
            data = Ajax._serialize(data);
        }        
        if(method == 'GET' && data){
            url += (url.indexOf('?') == -1 ? '?' : '&') + data;
            data = null;
        }
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.onreadystatechange = function(){
            Ajax._onStateChange(xhr,success,failure);
        };
        xhr.open(method,url,async);
        if(method == 'POST'){
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=' + encode);
        }
        xhr.send(data);
        return xhr;
    },
    _serialize : function (obj){
        var a = [];
        for(var k in obj){
            var val = obj[k];
            if(val.constructor == Array){
                for(var i=0,len=val.length;i<len;i++){
                    a.push(k + '=' + encodeURIComponent(val[i]));
                }
            }else{
                a.push(k + '=' + encodeURIComponent(val));
            }
        }
        return a.join('&');
    },
    _onStateChange :　function(xhr,success,failure){
        if(xhr.readyState == 4){
            var s = xhr.status;
            if(s>= 200 && s < 300){
                success(xhr);
            }else{
                failure(xhr);
            }
        }else{}
    }
};

/**
 * objectExtends
 * @obj 需要集合的第一个对象
 * @newProperties 或更改的对象
 */
function objectExtend(obj, newProperties) {
    var key;
    for(key in newProperties) {
        if(newProperties.hasOwnProperty(key)) {
            obj[key] = newProperties[key];
        }
    }
    return obj;
};

/**
 * 跨文件存取数据
 */
var handleData = {
    value : null,
    set : function(obj){
        this.value = obj;
    },
    get : function(){
         return this.value;
    }
}


