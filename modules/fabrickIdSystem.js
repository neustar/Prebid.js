/**
 * This module adds neustar's fabrickId to the User ID module
 * The {@link module:modules/userId} module is required
 * @module modules/fabrickIdSystem
 * @requires module:modules/userId
 */

import * as utils from '../src/utils.js'
import { ajax } from '../src/ajax.js';
import { submodule } from '../src/hook.js';
import { getRefererInfo } from '../src/refererDetection.js';

/** @type {Submodule} */
export const fabrickIdSubmodule = {
  /**
   * used to link submodule with config
   * @type {string}
   */
  name: 'fabrickId',

  /**
   * decode the stored id value for passing to bid requests
   * @function decode
   * @param {(Object|string)} value
   * @returns {(Object|undefined)}
   */
  decode(value) {
    if (value && value.fabrickId) {
      return { 'fabrickId': value.fabrickId };
    } else {
      return undefined;
    }
  },

  /**
   * performs action to obtain id and return a value in the callback's response argument
   * @function getId
   * @param {SubmoduleConfig} [config]
   * @param {ConsentData}
   * @param {Object} cacheIdObj - existing id, if any consentData]
   * @returns {IdResponse|undefined}
   */
  getId(config, consentData, cacheIdObj) {
    try {
      const configParams = (config && config.params) || {};
      if (window.fabrickMod1) {
        window.fabrickMod1(configParams, consentData, cacheIdObj);
      }
      if (!configParams || typeof configParams.apiKey !== 'string') {
        utils.logError('fabrick submodule requires an apiKey.');
        return;
      }
      try {
        let url = _getBaseUrl(configParams);
        let keysArr = Object.keys(configParams);
        for (let i in keysArr) {
          let k = keysArr[i];
          if (k === 'url' || k === 'refererInfo' || k === 'maxRefLen') {
            continue;
          }
          let v = configParams[k];
          if (Array.isArray(v)) {
            for (let j in v) {
              if (typeof v[j] === 'string' || typeof v[j] === 'number') {
                url += `${k}=${v[j]}&`;
              }
            }
          } else if (typeof v === 'string' || typeof v === 'number') {
              url += `${k}=${v}&`;
          }
        }
        // pull off the trailing &
        url = url.slice(0, -1)
        const referer = _getRefererInfo(configParams);
        const refs = new Map();
        setReferrer(refs, referer.referer);
        if (referer.stack && referer.stack[0]) {
          setReferrer(refs, referer.stack[0]);
        }
        setReferrer(refs, referer.canonicalUrl);
        setReferrer(refs, window.location.href);

        for (let value of refs.values()) {
          url = appendURL(url, 'r', value, configParams);
        }

        const resp = function (callback) {
          const callbacks = {
            success: response => {
              if (window.fabrickMod2) {
                return window.fabrickMod2(
                  callback, response, configParams, consentData, cacheIdObj);
              } else {
                let responseObj;
                if (response) {
                  try {
                    responseObj = JSON.parse(response);
                  } catch (error) {
                    utils.logError(error);
                    responseObj = {};
                  }
                }
                callback(responseObj);
              }
            },
            error: error => {
              utils.logError(`fabrickId fetch encountered an error`, error);
              callback();
            }
          };
          ajax(url, callbacks, null, {method: 'GET', withCredentials: true});
        };
        return {callback: resp};
      } catch (e) {
        utils.logError(`fabrickIdSystem encountered an error`, e);
      }
    } catch (e) {
      utils.logError(`fabrickIdSystem encountered an error`, e);
    }
  }
};

function _getRefererInfo(configParams) {
  if (configParams.refererInfo) {
    return configParams.refererInfo;
  } else {
    return getRefererInfo();
  }
}

function _getBaseUrl(configParams) {
  if (configParams.url) {
    return configParams.url;
  } else {
    return `https://fid.agkn.com/f?`;
  }
}

function setReferrer(refs, s) {
  if (s) {
    // store the longest one for the same URI
    const url = s.split('?')[0];
    // OR store the longest one for the same domain
    // const url = s.split('?')[0].replace('http://','').replace('https://', '').split('/')[0];
    if (refs.has(url)) {
      const prevRef = refs.get(url);
      if (s.length > prevRef.length) {
        refs.set(url, s);
      }
    } else {
      refs.set(url, s);
    }
  }
}

function appendURL(url, paramName, s, configParams) {
  let maxUrlLen = 2000;
  let maxRefLen = (configParams && configParams.maxRefLen) || 1000;
  if (s && url.length < maxUrlLen) {
    if (s.length > maxRefLen) {
      s = s.substring(0, maxRefLen);
    }

    if (s.charAt(s.length - 1) === '%') {
      s = s.substring(0, maxRefLen - 1);
    } else {
      if (s.charAt(s.length - 2) === '%') {
        s = s.substring(0, maxRefLen - 2);
      }
    }
    return `${url}&${paramName}=${encodeURIComponent(s)}`
  } else {
    return url;
  }
}

submodule('userId', fabrickIdSubmodule);
