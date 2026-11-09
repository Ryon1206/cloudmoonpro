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
    'imasdk.
