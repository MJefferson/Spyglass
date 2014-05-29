(function(root){
  /**
  * @module Spyglass
  * @description Javascript API for PixieTV analytics
  * @author PixieTV <pixie@samsungaccelerator.com>
  * @version 1.0
  */
  function Spyglass(){}

  var defaultOptions = {
    cubeUrl: "http://pxcube-collector.herokuapp.com",
    postEndpoint: "/1.0/event/put"
  };

  /**
  * @name Spyglass.$
  * @function
  * @description a reference for Spyglass' purposes to jQuery or Zepto or whatever owns the $ variable
  */
  Spyglass.$ = root.$;

  /**
  * @name Spyglass.up
  * @function
  * @description initializes Spyglass and enables tracking of events
  * @param {string} projectId A project identifier for the tracked events
  * @param {object} options
  */
  Spyglass.up = function(projectId, options){
    Spyglass.project = projectId || "default";
    Spyglass.options = options || defaultOptions;
    Spyglass.enabled = true;
  }

  /**
  * @name Spyglass.down
  * @function
  * @description disables Spyglass and tracking of events
  */
  Spyglass.down = function(){
    Spyglass.enabled = false;
  }

  /**
  * @name Spyglass.identify
  * @function
  * @description identifies and associates tracked events with user
  * @params {string} customUID Client-provided unique id for current Spyglass user
  */
  Spyglass.identify = function(customUID){
    setUID(customUID);
  }

  /**
  * @name Spyglass.event
  * @function
  * @description tracks an event
  * @param {string} eventName Event name
  * @param {object} metadata Hash of arbitrary data to store with the event
  */
  Spyglass.event = function(eventName, metadata){
    if(Spyglass.enabled){
      postEvent(eventName, metadata);
    }
  }
  
  root.Spyglass = root.sg = Spyglass;

  /* Utilities and Polyfills
   *------------------------*/
  var spyglassUIDKey = "sg-identifier";
  
  function prependEvent(eventData){
    eventData.projectID = Spyglass.project;
    eventData.spyglassUID = getUID();
    return eventData;
  }
  
  function getUID(){
    if(localStorage.hasOwnProperty(spyglassUIDKey)){
      return localStorage.getItem(spyglassUIDKey);
    } else if(cookieStore.hasOwnProperty(spyglassUIDKey)){
      return cookieStore.getItem(spyglassUIDKey);
    } else {
      var uid = generateUID();
      setUID(uid);
      return uid;
    }
  }
  
  function setUID(uid){
    localStorage.setItem(spyglassUIDKey, uid);
    cookieStore.setItem(spyglassUIDKey, uid);
  }
  
  function postEvent(event, data){
    Spyglass.$.ajax({
      url: Spyglass.options.cubeUrl + Spyglass.options.postEndpoint,
      type: "post",
      contentType: "text/plain;charset=UTF-8",
      processData: false,
      data: JSON.stringify([{
        type: event,
        time: (new Date()).toISOString(),
        data: prependEvent(data)
      }])
    });
  }
  
  function generateUID(){
    var getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    var timestamp = Date.now();
    return timestamp + "_" + getRandomInt(10000, 99999);
  }
  
  // ISO Date Polyfill (via MDN) https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  if (!Date.prototype.toISOString ) {
    (function() {

      function pad(number) {
        if ( number < 10 ) {
          return '0' + number;
        }
        return number;
      }

      Date.prototype.toISOString = function() {
        return this.getUTCFullYear() +
          '-' + pad( this.getUTCMonth() + 1 ) +
          '-' + pad( this.getUTCDate() ) +
          'T' + pad( this.getUTCHours() ) +
          ':' + pad( this.getUTCMinutes() ) +
          ':' + pad( this.getUTCSeconds() ) +
          '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
          'Z';
      };

    }());
  };
  
  // Local Storage/Cookie Polyfill (via MDN) https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage
  
  var cookieStore = {
    getItem: function (sKey) {
      if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
      return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
    },
    key: function (nKeyId) {
      return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
    },
    setItem: function (sKey, sValue) {
      if(!sKey) { return; }
      document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
      this.length = document.cookie.match(/\=/g).length;
    },
    length: 0,
    removeItem: function (sKey) {
      if (!sKey || !this.hasOwnProperty(sKey)) { return; }
      document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      this.length--;
    },
    hasOwnProperty: function (sKey) {
      return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    }
  };
  
  if (!window.localStorage) {
    window.localStorage = cookieStore;
    window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
  }

})(window);