function () {
    function _getType(args) {//java 和 JavaScript类型映射
        var type = 0;
        if (typeof args === 'string') {
            type = 1
        } else if (typeof args === 'number') {
            type = 2
        } else if (typeof args === 'boolean') {
            type = 3
        } else if (typeof args === 'function') {
            type = 4
        } else if (args instanceof Array) {
            type = 6
        } else if (typeof args === 'object') {
            type = 5
        }
        return type
    };

    function _parseFunction(obj, name, callback) { //解析是否有回调函数
        if (typeof obj === 'function') {
            callback[name] = obj;
            obj = '[Function]::' + name;
            return
        }
        if (typeof obj !== 'object') {
            return
        }
        for (var p in obj) {
            switch (typeof obj[p]) {
            case 'object':
                var ret = name ? name + '_' + p : p;
                _parseFunction(obj[p], ret, callback);
                break;
            case 'function':
                var ret = name ? name + '_' + p : p;
                callback[ret] = (obj[p]);
                obj[p] = '[Function]::' + ret;
                break;
            default:
                break
            }
        }
    };
    this.OnJsBridgeReady = function () {
        try {
            var ready = window.onstockJsbridgeAndroidReady;
            if (ready && typeof (ready) === 'function') {
                ready()
            } else {
                var readyEvent = document.createEvent('Events');
                readyEvent.initEvent('onstockJsbridgeAndroidReady');
                document.dispatchEvent(readyEvent);
            }
        } catch (e) {
            console.error(e)
        };
    };

    function _getID() {
        return Math.floor(Math.random() * (1 << 10));
    };

    function _callJava(id, module, method, args) {
        var req = {
            id: id,
            module: module,
            method: method,
            parameters: args
        };
        return JSON.parse(prompt(JSON.stringify(req)));
    };
    this.callHandler = function () {
        try {
            var id = _getID(),
                args = [];
            //callHandlerCallback存放js调用native的回调函数信息
            if (!stockJsbridgeAndroid.callHandlerCallback) stockJsbridgeAndroid.callHandlerCallback = {};
            for (var i in arguments) {
                var name = id + '_a' + i,
                    item = arguments[i],
                    listeners = {};
                var listeners = {};
                _parseFunction(item, name, listeners);
                for (var key in listeners) {
                    stockJsbridgeAndroid.callHandlerCallback[key] = listeners[key];//js调用native的回调
                };
                args.push({
                    type: _getType(item),
                    name: name,
                    value: item
                })
            }
            var ret = _callJava(id, '@static', 'callHandler', args);
            if (ret && ret.success) {
                return ret.msg;
            } else {
                console.error(ret.msg)
            }
        } catch (e) {
            console.error(e);
        };
    };
    this.registerHandler = function () {
        try {
            var id = _getID(),
                args = [];
            //registerHandlerCallback存放native调用js的回调函数信息
            if (!stockJsbridgeAndroid.registerHandlerCallback) stockJsbridgeAndroid.registerHandlerCallback = {};
            for (var i in arguments) {
                var name = id + '_a' + i,
                    item = arguments[i],
                    listeners = {};
                var listeners = {};
                _parseFunction(item, name, listeners);
                for (var key in listeners) {
                    stockJsbridgeAndroid.registerHandlerCallback[key] = listeners[key];
                };
                args.push({
                    type: _getType(item),
                    name: name,
                    value: item
                })
            }
            var ret = _callJava(id, '@static', 'registerHandler', args);
            if (ret && ret.success) {
                return ret.msg;
            } else {
                console.error(ret.msg)
            }
        } catch (e) {
            console.error(e);
        };
    };
}
