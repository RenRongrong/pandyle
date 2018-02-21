var Pandyle;
(function (Pandyle) {
    Pandyle._variables = {};
    Pandyle._methods = {};
    Pandyle._filters = {};
    Pandyle._converters = {};
    Pandyle._components = {};
    function getMethod(name) {
        return Pandyle._methods[name];
    }
    Pandyle.getMethod = getMethod;
    function hasSuffix(target, suffix) {
        var reg = new RegExp('/^\w+' + suffix + '$/');
        return reg.test(target);
    }
    Pandyle.hasSuffix = hasSuffix;
    function register(name, value) {
        if ($.isFunction(value)) {
            if (hasSuffix(name, 'Filter')) {
                Pandyle._filters[name] = value;
            }
            else if (hasSuffix(name, 'Converter')) {
                Pandyle._converters[name] = value;
            }
            else {
                Pandyle._methods[name] = value;
            }
        }
        else {
            Pandyle._variables[name] = value;
        }
    }
    Pandyle.register = register;
})(Pandyle || (Pandyle = {}));
