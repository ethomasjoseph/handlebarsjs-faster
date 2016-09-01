/*!
 * handlebarsjs-faster
 *
 * Released under the MIT license.
 */
'use strict';
var hbfaster = window.hbfaster || (function(context, $) {
    // member declarations ---------------------------
    var _na,
        _checkPrecondition,
        _preinit,
        _invokeFunction,
        _initHBDataElements,
        _paintCanvases,
        _paintCanvas,
        _paintHTML,
        $_templateContents,
        $_compiledTemplate,
        $_hbCanvas,
        isEnabled,
        autoInit,
        registerPreInitCallbacks,
        init;
    
    // function definitions --------------------------
    /**
     * Checks if HandlebarsJSFaster can function, by checking the availability of the dependencies.
     * @param {boolean} logError - indicates if the error should be logged to the console.
     * @return {boolean} - true if all dependencies are met and HandlebarsJSFaster can function.
     */
    _checkPrecondition = function() {
        _na = [];
        if(typeof window.jQuery === "undefined") {
            _na.push("jQuery");
        }
        if(typeof window.Handlebars === "undefined") {
            _na.push("Handlebars");
        }
    };
    
    isEnabled = function (logError) {
        if (typeof _na === "undefined") {
            _checkPrecondition();
        }
        if( _na.length > 0 ) {
            if (logError) {
                console.error("[HandlebarsJSFaster] Cannot function since the following dependency is not loaded: " + JSON.stringify(_na));
            }
            return false;
        }
        return true;
    }
    
    _invokeFunction = function(fx) {
        if (typeof fx === "function") {
            return fx(Handlebars);
        } else if (typeof fx === "string") {
            var ctx = context;
            var namespaces = fx.split(".");
            
            // pop up the function in a namespace to reach the function
            $.each(namespaces, function(idx, ns){
                if (typeof ctx === "undefined") {
                    return false;
                }
                ctx = ctx[ns];
            });
            // now ctx is the function - invoke it
            if (typeof ctx !== "undefined") {
                return ctx(Handlebars);
            } else {
                if (typeof console !== "undefined") {
                    console.error("Specified argument '" + fx +"' is not a function.");
                }
            }
        } else {
            if (typeof console !== "undefined") {
                console.error("Specified argument is of type'" + (typeof fx) +"' and cannot be invoked. It should be either a string or a function.");
            }
        }
    };

    registerPreInitCallbacks = function(fxs) {
        if(fxs instanceof Array) {
            // iterate and call every function, if argument is array of functions
            $.each(fxs, function(idx, fx){
                _invokeFunction(fx);
            })
        } else {
            // invoke the function specified
            _invokeFunction(fxs);
        }
    };
    
    
    
    _initHBDataElements = function() {
        var $_templates = $('[data-hb-template]');
        $_templateContents = {};
        $.each($_templates, function(idx, tmpl){
            $_templateContents[$(tmpl).attr("id")] = $(tmpl).html();
        });
        
        // get the canvas
        $_hbCanvas = $('[data-hb-canvas]');
    };
    
    _paintHTML = function(compiledTmpl, data, canvas) {
        var $_html;        
        $_html = compiledTmpl(data);
        $(canvas).html($_html);
    };
    
    _paintCanvas = function(canvas) {
        var $_tmplRef,
            $_tmplObj,
            $_tmplContent,
            $_hbDataRef,
            $_hbDataObj,
            $_hbData,
            $_compiledTmpl;

        $_tmplRef = $(canvas).attr('data-hb-use-template');
        if (typeof $_tmplRef === undefined) {
            return false;
        }
        $_tmplObj = JSON.parse($_tmplRef);
        
        $_hbDataRef = $(canvas).attr('data-hb-data');
        if (typeof $_hbDataRef === undefined) {
            return false;
        }
        $_hbDataObj = JSON.parse($_hbDataRef);
        
        // get the template source
        if (typeof $_tmplObj.id !== "undefined") {
            $_tmplContent = $_templateContents[$_tmplObj.id];
        } else {
            $_tmplContent = _invokeFunction($_tmplObj.fn);
        }
        
        // compile template
        if (typeof $_compiledTemplate === "undefined") {
            $_compiledTemplate = {};
        }
        
        $_compiledTmpl = $_compiledTemplate[$_tmplContent];
        
        if (typeof $_compiledTmpl === "undefined") {
            $_compiledTmpl = Handlebars.compile($_tmplContent);
            $_compiledTemplate[$_tmplContent] = $_compiledTmpl;
        }
        
        // get the data to merge
        if (typeof $_hbDataObj.url !== "undefined") {
            $.ajax({
                url: $_hbDataObj.url,
                method: ($_hbDataObj.method && $_hbDataObj.method === 'post') ? 'POST' : 'GET',
                cache: ($_hbDataObj.cache && $_hbDataObj.cache === 'true') ? true : false,
                async: ($_hbDataObj.async && $_hbDataObj.async === 'false') ? false: true, 
                success: function(data) {
                    _paintHTML($_compiledTmpl, data, canvas);
                }
            });
        } else {
            $_hbData = _invokeFunction($_hbDataObj.fn);
            _paintHTML($_compiledTmpl, $_hbData, canvas);
        }        
    };
    
    _paintCanvases = function() {
        if (typeof $_hbCanvas === "undefined" || $_hbCanvas.length === 0) {
            _initHBDataElements();
        }
        $_compiledTemplate = {};
        
        $.each($_hbCanvas, function(idx, canvas){
            _paintCanvas(canvas);
        });
    };
    
    _preinit = function() {
        isEnabled(true);
    }
    
    init = function() {
        _initHBDataElements();
        _paintCanvases();
    };
    
    // initialize the namespace --------------------------
    _preinit();
    
    // expose public API
    return {
        isEnabled : isEnabled,
        registerPreInitCallbacks :registerPreInitCallbacks,
        init : init
    }
    
})(window, jQuery);

