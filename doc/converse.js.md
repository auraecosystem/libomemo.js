
```js
// An example application, used to demonstrate how pluggable.js can
// allow a module to be made pluggable.
(function () {
    var module = this;

    // A private method, not available outside the scope of this module.
    module._showNotification = function (text) {
        /* Displays a notification message */
        var el = document.createElement('p');
        el.setAttribute('class', 'notification');
        el.appendChild(document.createTextNode(text));
        el = document.getElementById('notifications').appendChild(el);
        setTimeout(_.partial(module._fadeOut, el), 3000);
        return el;
    };

    // Another private method, not available outside the scope of this module.
    module._fadeOut = function (el) {
        /* Fades out the passed in DOM element. */
        el.style.opacity = 1;
        (function fade() {
            if ((el.style.opacity -= 0.1) < 0) {
                el.remove();
            } else {
                setTimeout(fade, 25);
            }
        })();
    };

    // Initialize this module.
    // -----------------------
    // There are two buttons for which we register event handlers.
    //
    // This will be a public method.
    module.initialize = function () {
        var notify_el = document.getElementById('notify');
        notify_el.addEventListener('click', function () {
            module._showNotification('This is a notification.');
        });

        var enable_el = document.getElementById('enable');
        enable_el.addEventListener('click', function () {
            this.setAttribute('disabled', 'disabled');
            module.pluginSocket.initializePlugins();
        });
    };

    // Register a plugin for this module.
    // ----------------------------------
    // This is a wrapper method which defers to the `registerPlugin` method
    // of pluggable.js, which is on the `pluginSocket` property of the
    // private `module` object that was made pluggable, via
    // `pluggable.enable(module).
    //
    // This will be a public method.
    module.registerPlugin = function (name, plugin) {
        module.pluginSocket.registerPlugin(name, plugin);
    };

    // Calling `pluggable.enable` on the closured `module` object, will make it
    // pluggable. Additionally, it will get the `pluginSocket` attribute, which
    // refers to the object that the plugins get plugged into.
    pluggable.enable(module);

    // Declare the two public methods
    var _public = {
        'initialize': module.initialize,
        'registerPlugin': module.registerPlugin
    };
    window.myApp = _public;
    return _public;
})();
```
Creating the plugin

So, as you can see in the example above, the module has a private method _showNotification, which will show a notification message in the page.

Let's now create a plugin which overrides this method, so that we can modify the way the notification message will be displayed.

By the way, multiple plugins can override the same method. As long as each overriding method calls the original method, via the __super__ property, the method call will travel up through all the overrides (in the reverse order in which the plugins were registered) back to the original method.

The way to call the method being overridden, is like this:

    this.__super__.methodName.apply(this, arguments);
where methodName is the name of the method. In our example, this will be showNotification.

Example plugin code

So, with that said, here's what the plugin code (which goes into the file plugin.js) will look like:
```js
(function () {
    // We call the public `registerPlugin` method from our module in app.js
    window.myApp.registerPlugin('my-plugin', {

        overrides: {
            // Here you specify your overrides of methods or objects on the
            // module that has been made pluggable.

            // Override _showNotification to change the color of notification
            // messages.
            _showNotification: function (text) {
                // When overriding a method, you can still call the original method
                // via `this.__super__`. To properly call with the proper `this`
                // context and parameters, use `.apply(this, arguments)`.
                var el = this.__super__._showNotification.apply(this, arguments);

                // Now we simply set another class on the element containing
                // the notifications, so that they'll appear in a different
                // color.
                el.setAttribute('class', el.getAttribute('class')+' extra');
            }

            // BTW, new methods which don't exist yet can also be added here.
        },

        initialize: function (socket) {
            // The initialize function gets called as soon as the plugin is
            // loaded by pluggable.js's plugin machinery.

            // We are passed in an instance of the  `PluginSocket`, which
            // represents the plugin architecture and gets created when
            // `pluggable.enable` is called on an object.

            // The `PluginSocket` instance is also accessible via the `pluginSocket`
            // attribute, on the module that was passed to `pluggable.enable`.

            // You can get hold of the module which was made pluggable
            // via the `plugged` property of the `PluginSocket` instance.

            // Once you have the module, you can access its private properties
            // and call its private methods.

            // Here, once this plugin is initialized, we show a notification.
            socket.plugged._showNotification(
                "The plugin has been enabled. Notifications are now a different color."
            );
        }
    });
})();
Custom plugin code

The plugin has three important parts to i
