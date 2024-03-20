//
//  Blocker.js
//  YouTubeAntiAds
//
//  Created by Nikita Alpatiev on 3/21/24.
//
// ==UserScript==
// @name         Youtube adblock
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  enough with the ads!
// @author       N.A.
// @match        https://*.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @run-at       document-start
// ==/UserScript==
// Patches the ads for cold loading

(function() {
    var ytInitialPlayerResponse = null;
    function getter() {
        return ytInitialPlayerResponse;
    }
    function setter(data) {
        ytInitialPlayerResponse = { ...data, adPlacements: [] };
    }
    if (window.ytInitialPlayerResponse) {
        Object.defineProperty(window.ytInitialPlayerResponse, 'adPlacements', {
            get: () => [],
            set: (a) => undefined,
            configurable: true
        });
    } else {
        Object.defineProperty(window, 'ytInitialPlayerResponse', {
            get: getter,
            set: setter,
            configurable: true
        });
    }
})();
(function() {
    console.log(">>> (blocker) replacing mfs..");
    const {fetch: origFetch} = window;
    window.fetch = async (...args) => {
        const response = await origFetch(...args);
        if (response.url.includes('/youtubei/v1/player')) {
            const text = () =>
            response
            .clone()
            .text()
            .then((data) => data.replace(/adPlacements/, 'odPlacement'));
            response.text = text;
            console.log(">>> blocker replaced ads");
            return response;
        }
        return response;
    };
})();

(function() {
    window.autoClick = setInterval(function() {
        try {
            const btn = document.querySelector('.videoAdUiSkipButton,.ytp-ad-skip-button')
            if (btn) {
                btn.click();
                console.log(">>> (blocker) clicked on skip ad");
            }
            const ad = document.querySelector('.ad-showing');
            if (ad) {
                document.querySelector('video').playbackRate = 10;
                console.log(">>> (blocker) increased playback rate");
            }
        } catch (ex) {
            console.error(">>> (blocker) error:", ex);
        }
    }, 100);
    window.inlineAdsInterval = setInterval(function() {
        try {
            const div = document.querySelector('#player-ads');
            if (div) {
                div.parentNode.removeChild(div);
                console.log(">>> (blocker) removed inline ad");
            }
        } catch (ex) {
            console.error(">>> (blocker) error:", ex);
        }
    }, 500);
})();
