// CloudMoon Ad-Free, Anti-Crash & Unlimited Playtime Engine for School Hub
(function() {
  console.log('[CloudMoon Unlimited] Initializing School Hub Native Ad-Free & Unlimited Time Engine...');

  // 0. Neutralize Ad-Shield, Playwire RAMP, Google IMA, GPT, AdSense, and Prebid globals immediately
  //    IMPORTANT: window.adsbygoogle.push MUST be a function so Ya() in 2.C7CpNCnt.js returns "clear" (not "adblock")
  try {
    window.__adEnabledCache = false;
    window.__adshieldLoaded = true;
    window.__adshieldLoading = false;
    window.__rampLoaded = true;
    window.adsbygoogle = window.adsbygoogle || { loaded: true, push: function() {} };
    if (typeof window.adsbygoogle.push !== 'function') {
      window.adsbygoogle.push = function() {};
    }
    window.pbjs = window.pbjs || { que: [], cmd: [] };
    window.googletag = window.googletag || {
      cmd: [],
      apiReady: true,
      pubadsReady: true,
      defineSlot: function() {
        return {
          addService: function() { return this; },
          setTargeting: function() { return this; },
          defineSizeMapping: function() { return this; }
        };
      },
      pubads: function() {
        return {
          enableSingleRequest: function() {},
          collapseEmptyDivs: function() {},
          addEventListener: function() {},
          removeEventListener: function() {},
          refresh: function() {},
          clear: function() {},
          setTargeting: function() { return this; }
        };
      },
      enableServices: function() {},
      display: function() {},
      destroySlots: function() { return true; },
      sizeMapping: function() {
        return {
          addSize: function() { return this; },
          build: function() { return []; }
        };
      },
      enums: { OutOfPageFormat: { REWARDED: 'REWARDED', INTERSTITIAL: 'INTERSTITIAL' } },
      defineOutOfPageSlot: function() { return null; }
    };
    window.ramp = window.ramp || {
      que: [],
      passiveMode: true,
      spaNewPage: function() { return Promise.resolve(); },
      addUnits: function() { return Promise.resolve(); },
      displayUnits: function() {},
      destroyUnits: function() { return Promise.resolve(); },
      settings: {}
    };
  } catch (_) {}

  // 1. Safe localStorage guard & forced ad-free / same-window settings
  try {
    const testKey = '__sh_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
  } catch (e) {
    console.warn('[CloudMoon] Polyfilling memory-backed localStorage');
    const memStore = {};
    const memStorage = {
      getItem: function(k) { return memStore.hasOwnProperty(k) ? memStore[k] : null; },
      setItem: function(k, v) { memStore[k] = String(v); },
      removeItem: function(k) { delete memStore[k]; },
      clear: function() { for (let k in memStore) delete memStore[k]; },
      get length() { return Object.keys(memStore).length; },
      key: function(i) { return Object.keys(memStore)[i] || null; }
    };
    try {
      Object.defineProperty(window, 'localStorage', { value: memStorage, configurable: true, writable: true });
    } catch (_) {}
  }

  try {
    const origSetItem = Storage.prototype.setItem;
    const origGetItem = Storage.prototype.getItem;
    Storage.prototype.setItem = function(k, v) {
      if (k === 'ad_enabled_cache') v = 'false';
      if (k === 'newWindowLaunch') v = 'false';
      if (k === 'enableHighLight') v = 'false';
      if (k === 'cm_fast_api_host') {
        v = JSON.stringify({ url: window.location.origin + '/cloudmoon/api', ts: Date.now() });
      }
      return origSetItem.call(this, k, v);
    };
    Storage.prototype.getItem = function(k) {
      if (k === 'ad_enabled_cache') return 'false';
      if (k === 'newWindowLaunch') return 'false';
      if (k === 'enableHighLight') return 'false';
      if (k === 'cm_fast_api_host') {
        return JSON.stringify({ url: window.location.origin + '/cloudmoon/api', ts: Date.now() });
      }
      return origGetItem.call(this, k);
    };
    if (!localStorage.getItem('selectedServer') || localStorage.getItem('selectedServer') === '0') {
      origSetItem.call(localStorage, 'selectedServer', '3');
    }
    origSetItem.call(localStorage, 'newWindowLaunch', 'false');
    origSetItem.call(localStorage, 'ad_enabled_cache', 'false');
    origSetItem.call(localStorage, 'enableHighLight', 'false');
    origSetItem.call(localStorage, 'cm_fast_api_host', JSON.stringify({ url: window.location.origin + '/cloudmoon/api', ts: Date.now() }));
    if (!localStorage.getItem('quality')) {
      origSetItem.call(localStorage, 'quality', 'HD');
    }
  } catch (e) {}

  // 1b. Ultra-Low-Latency WebRTC Playout & Receiver Optimizer
  try {
    function applyLowLatencyReceiver(receiver) {
      if (!receiver) return;
      const isApple = /iPad|iPhone|iPod|Macintosh/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isApple) {
        try { if ('playoutDelayHint' in receiver) receiver.playoutDelayHint = 0.03; } catch (_) {}
        try { if ('jitterBufferTarget' in receiver) receiver.jitterBufferTarget = 30; } catch (_) {}
        return;
      }
      try {
        if ('playoutDelayHint' in receiver) receiver.playoutDelayHint = 0.01;
      } catch (_) {}
      try {
        if ('jitterBufferTarget' in receiver) receiver.jitterBufferTarget = 10;
      } catch (_) {}
    }
    if (typeof RTCPeerConnection !== 'undefined') {
      const origAddEv = RTCPeerConnection.prototype.addEventListener;
      RTCPeerConnection.prototype.addEventListener = function(type, listener, options) {
        if (type === 'track') {
          const wrapped = function(ev) {
            if (ev && ev.receiver) applyLowLatencyReceiver(ev.receiver);
            return listener.apply(this, arguments);
          };
          return origAddEv.call(this, type, wrapped, options);
        }
        return origAddEv.apply(this, arguments);
      };
      const ontrackDesc = Object.getOwnPropertyDescriptor(RTCPeerConnection.prototype, 'ontrack');
      if (ontrackDesc && ontrackDesc.set) {
        Object.defineProperty(RTCPeerConnection.prototype, 'ontrack', {
          set: function(fn) {
            const wrapped = function(ev) {
              if (ev && ev.receiver) applyLowLatencyReceiver(ev.receiver);
              return fn ? fn.apply(this, arguments) : undefined;
            };
            return ontrackDesc.set.call(this, wrapped);
          },
          get: ontrackDesc.get,
          configurable: true
        });
      }
      const origGetReceivers = RTCPeerConnection.prototype.getReceivers;
      if (origGetReceivers) {
        RTCPeerConnection.prototype.getReceivers = function() {
          const list = origGetReceivers.apply(this, arguments) || [];
          for (let i = 0; i < list.length; i++) applyLowLatencyReceiver(list[i]);
          return list;
        };
      }
    }
    if (typeof RTCDataChannel !== 'undefined') {
      const origDcSend = RTCDataChannel.prototype.send;
      RTCDataChannel.prototype.send = function(data) {
        if (this.bufferedAmount > 65536 && typeof data === 'string' && data.startsWith('touch>Touch move')) {
          return;
        }
        return origDcSend.apply(this, arguments);
      };
    }
  } catch (_) {}

  // 1c. Ensure all inline video and audio elements on iPad/iOS have webkit-playsinline and playsinline
  try {
    const enforceInlineMedia = function(el) {
      if (!el || !el.tagName) return;
      const tag = el.tagName.toLowerCase();
      if (tag === 'video' || tag === 'audio') {
        try {
          el.setAttribute('playsinline', '');
          el.setAttribute('webkit-playsinline', '');
          el.setAttribute('x5-playsinline', '');
          el.playsInline = true;
          if ('webkitPlaysInline' in el) el.webkitPlaysInline = true;
        } catch (_) {}
      }
    };
    if (typeof MutationObserver !== 'undefined') {
      const mediaMo = new MutationObserver(function(muts) {
        for (let i = 0; i < muts.length; i++) {
          const added = muts[i].addedNodes;
          for (let j = 0; j < added.length; j++) {
            const node = added[j];
            if (node.nodeType === 1) {
              enforceInlineMedia(node);
              if (node.querySelectorAll) {
                const mediaElems = node.querySelectorAll('video, audio');
                for (let k = 0; k < mediaElems.length; k++) enforceInlineMedia(mediaElems[k]);
              }
            }
          }
        }
      });
      if (document.documentElement) {
        mediaMo.observe(document.documentElement, { childList: true, subtree: true });
      } else {
        window.addEventListener('DOMContentLoaded', function() {
          mediaMo.observe(document.documentElement, { childList: true, subtree: true });
        });
      }
    }
  } catch (_) {}

  // 2. Intercept dynamic <script> injections to block Ad-Shield, Playwire, DoubleClick, AdSense, IMA SDK
  const BLOCKED_SCRIPT_PATTERNS = [
    'cm-compat.js',
    'ramp-helper.js',
    'prebid',
    'ads/banner.js',
    'html-load.cc',
    'ad-shield',
    'intergient.com',
    'doubleclick.net',
    'googlesyndication.com',
    'imasdk.googleapis.com',
    'googleads.g.doubleclick.net',
    'adtrafficquality.google'
  ];

  function isBlockedAdUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const lower = url.toLowerCase();
    return BLOCKED_SCRIPT_PATTERNS.some(function(pat) { return lower.includes(pat); });
  }

  try {
    const origCreateElement = document.createElement.bind(document);
    document.createElement = function(tagName, options) {
      const el = origCreateElement(tagName, options);
      if (typeof tagName === 'string' && tagName.toLowerCase() === 'script') {
        let blockedSrc = '';
        const origSetAttr = el.setAttribute.bind(el);
        el.setAttribute = function(name, value) {
          if (String(name).toLowerCase() === 'src' && isBlockedAdUrl(String(value))) {
            blockedSrc = String(value);
            origSetAttr('data-blocked-ad-src', blockedSrc);
            setTimeout(function() {
              if (typeof el.onload === 'function') {
                try { el.onload(new Event('load')); } catch (_) {}
              }
              try { el.dispatchEvent(new Event('load')); } catch (_) {}
            }, 0);
            return;
          }
          return origSetAttr(name, value);
        };
        try {
          const srcDesc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
          if (srcDesc && srcDesc.set) {
            Object.defineProperty(el, 'src', {
              get: function() { return blockedSrc || srcDesc.get.call(this); },
              set: function(val) {
                if (isBlockedAdUrl(String(val))) {
                  blockedSrc = String(val);
                  origSetAttr('data-blocked-ad-src', blockedSrc);
                  setTimeout(function() {
                    if (typeof el.onload === 'function') {
                      try { el.onload(new Event('load')); } catch (_) {}
                    }
                    try { el.dispatchEvent(new Event('load')); } catch (_) {}
                  }, 0);
                  return;
                }
                return srcDesc.set.call(this, val);
              },
              configurable: true
            });
          }
        } catch (_) {}
      }
      return el;
    };
  } catch (_) {}

  // 3. Force window.open for game launch (/run-site/) to navigate in the current tab
  try {
    const origWindowOpen = window.open;
    window.open = function(url, target, features) {
      const urlStr = url ? String(url) : '';
      if (urlStr.includes('/run-site')) {
        window.location.href = urlStr;
        return window;
      }
      if (urlStr === 'about:blank') {
        const fakeWin = {
          closed: false,
          opener: null,
          close: function() { this.closed = true; },
          focus: function() {},
          location: {
            _href: 'about:blank',
            get href() { return this._href; },
            set href(v) {
              this._href = v;
              if (v && v !== 'about:blank') {
                window.location.href = v;
              }
            }
          }
        };
        return fakeWin;
      }
      return origWindowOpen ? origWindowOpen.apply(this, arguments) : null;
    };
  } catch (_) {}

  // 4. WebRTC DataChannel Kickout & AdBlock-Penalty Suppressor
  try {
    if (typeof RTCPeerConnection !== 'undefined') {
      const origCreateDc = RTCPeerConnection.prototype.createDataChannel;
      RTCPeerConnection.prototype.createDataChannel = function(label, options) {
        const dc = origCreateDc.apply(this, arguments);
        try { window.__cm_dc = dc; } catch (_) {}
        return dc;
      };
    }
  } catch (_) {}

  try {
    if (typeof RTCDataChannel !== 'undefined' && RTCDataChannel.prototype.send) {
      const origDcSend = RTCDataChannel.prototype.send;
      RTCDataChannel.prototype.send = function(data) {
        if (typeof data === 'string' && data.startsWith('adBlock>')) {
          data = 'adBlock>false';
        }
        return origDcSend.call(this, data);
      };
    }
  } catch (_) {}

  const origAddEventListener = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    if (type === 'webrtc-dc-message') {
      const wrapped = function(e) {
        if (e && typeof e.detail === 'string') {
          if (e.detail.startsWith('kickout>') || e.detail.includes('kickout') || e.detail.startsWith('noTime') || e.detail.includes('time_up')) {
            console.warn('[CloudMoon Unlimited] Blocked kickout signal:', e.detail);
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            return;
          }
        }
        return listener.apply(this, arguments);
      };
      return origAddEventListener.call(this, type, wrapped, options);
    }
    return origAddEventListener.apply(this, arguments);
  };

  try {
    const origOnMessage = Object.getOwnPropertyDescriptor(RTCDataChannel.prototype, 'onmessage');
    if (origOnMessage && origOnMessage.set) {
      Object.defineProperty(RTCDataChannel.prototype, 'onmessage', {
        set: function(fn) {
          const wrapped = function(ev) {
            if (ev && typeof ev.data === 'string' && (ev.data.startsWith('kickout>') || ev.data.includes('kickout'))) {
              console.warn('[CloudMoon Unlimited] Dropped kickout DataChannel message:', ev.data);
              return;
            }
            return fn.apply(this, arguments);
          };
          return origOnMessage.set.call(this, wrapped);
        },
        get: origOnMessage.get,
        configurable: true
      });
    }
  } catch (e) {}

  try {
    const origDcAddEventListener = RTCDataChannel.prototype.addEventListener;
    RTCDataChannel.prototype.addEventListener = function(type, listener, options) {
      if (type === 'message') {
        const wrapped = function(ev) {
          if (ev && typeof ev.data === 'string' && (ev.data.startsWith('kickout>') || ev.data.includes('kickout'))) {
            console.warn('[CloudMoon Unlimited] Dropped kickout DataChannel event listener message:', ev.data);
            return;
          }
          return listener.apply(this, arguments);
        };
        return origDcAddEventListener.call(this, type, wrapped, options);
      }
      return origDcAddEventListener.apply(this, arguments);
    };
  } catch (e) {}

  // 5. Inactivity keepalive, interaction listener & periodic background reward refill
  try {
    let lastActivityDispatch = 0;
    const reportActivity = function() {
      const now = Date.now();
      if (now - lastActivityDispatch > 5000) {
        lastActivityDispatch = now;
        try {
          window.dispatchEvent(new CustomEvent('webrtc-dc-send', { detail: 'touch>input_activity' }));
        } catch (_) {}
      }
    };
    ['keydown', 'keyup', 'mousedown', 'mouseup', 'mousemove', 'wheel', 'touchstart', 'touchmove', 'pointerdown'].forEach(function(evType) {
      window.addEventListener(evType, reportActivity, { passive: true, capture: true });
    });

    setInterval(function() {
      try {
        window.dispatchEvent(new CustomEvent('webrtc-dc-send', { detail: 'touch>keepalive' }));
      } catch (_) {}
    }, 15000);

    setInterval(function() {
      try {
        const s = window.__cm_session;
        if (s && s.token) {
          fetch('/cloudmoon/api/web/ad', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Token': s.token
            },
            body: JSON.stringify({ game: s.game || 'com.roblox.client' })
          }).catch(function() {});
        }
      } catch (_) {}
    }, 45000);

    if ((window.location.pathname || '').startsWith('/run-site')) {
      const isExitAllowed = function() {
        return !!window.__cm_intentional_exit;
      };
      try {
        const origAssign = window.location.assign;
        if (origAssign) {
          window.location.assign = function(url) {
            const u = String(url || '');
            if (!isExitAllowed() && (u === '/' || u === '/cloudmoon/' || u.startsWith(window.location.origin + '/cloudmoon'))) {
              console.warn('[CloudMoon Unlimited] Intercepted auto-navigation to home:', u);
              return;
            }
            return origAssign.apply(this, arguments);
          };
        }
      } catch (_) {}
    }
  } catch (_) {}

  // 6. WebSocket Wrapper
  try {
    const OrigWebSocket = window.WebSocket;
    const WrappedWebSocket = function(url, protocols) {
      let urlStr = String(url || '');
      if (urlStr.includes('html-load.cc') || urlStr.includes('ad-shield')) {
        const dummy = Object.create(OrigWebSocket.prototype);
        dummy.readyState = 3;
        dummy.close = function() {};
        dummy.send = function() {};
        dummy.addEventListener = function() {};
        dummy.removeEventListener = function() {};
        return dummy;
      }
      if (urlStr.includes('__sh_ws_host=')) {
        try {
          const parsed = new URL(urlStr);
          const targetHost = parsed.searchParams.get('__sh_ws_host');
          if (targetHost) {
            parsed.searchParams.delete('__sh_ws_host');
            parsed.pathname = '/cloudmoon/ws-proxy/' + targetHost + parsed.pathname;
            urlStr = parsed.toString();
          }
        } catch (_) {}
      }
      return protocols !== undefined ? new OrigWebSocket(urlStr, protocols) : new OrigWebSocket(urlStr);
    };
    WrappedWebSocket.prototype = OrigWebSocket.prototype;
    window.WebSocket = WrappedWebSocket;
  } catch (_) {}

  // 7. Global fetch interceptor
  const origFetch = window.fetch;
  window.fetch = async function(resource, init) {
    let url = typeof resource === 'string' ? resource : (resource instanceof Request ? resource.url : String(resource));

    if (url.includes('api.ip.sb/geoip')) {
      return new Response(JSON.stringify({
        ip: '127.0.0.1',
        country_code: 'JP',
        country: 'Japan',
        timezone: 'Asia/Tokyo'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (isBlockedAdUrl(url)) {
      return new Response('/* ad blocked */', { status: 200, headers: { 'Content-Type': 'application/javascript' } });
    }

    const API_HOSTS = [
      'https://api.prod.cloudmoonapp.com',
      'https://api.cloudmoon.cloudbatata.com',
      'https://api.prod.geometry.today',
      'https://hrz5zfjq02.execute-api.us-east-1.amazonaws.com',
      'https://api.prod.viewoncloud.com'
    ];
    for (let i = 0; i < API_HOSTS.length; i++) {
      if (url.includes(API_HOSTS[i])) {
        url = url.replace(API_HOSTS[i], window.location.origin + '/cloudmoon/api');
      }
    }

    if (url.endsWith('/_ping')) {
      return new Response(JSON.stringify({ code: 0, message: 'pong' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (resource instanceof Request) {
      try { resource = new Request(url, resource); } catch (_) { resource = url; }
    } else {
      resource = url;
    }

    const doFetch = (r, i) => (i !== undefined ? origFetch.call(this, r, i) : origFetch.call(this, r));

    if (url.includes('/web/ad')) {
      return new Response(JSON.stringify({
        code: 0,
        message: 'Success',
        data: { showAD: false, unlimit: false, timeSecLeft: 99999999, rewardAdPass: true, rewardHash: '', initOrientation: 3, adSource: '' }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return doFetch(resource, init);
  };
})();
