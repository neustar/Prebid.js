import * as utils from '../../../src/utils.js';
import {server} from '../../mocks/xhr.js';

import * as fabrickIdSystem from 'modules/fabrickIdSystem.js';

const defaultConfigParams = {
  apiKey: '123',
  e: 'abc',
  p: ['def', 'hij'],
  url: 'http://localhost:9999/test/mocks/fabrickId.json?'
};
const responseHeader = {'Content-Type': 'application/json'}
const fabrickIdSubmodule = fabrickIdSystem.fabrickIdSubmodule;

describe('Fabrick ID System', function() {
  let logErrorStub;

  beforeEach(function () {
    logErrorStub = sinon.stub(utils, 'logError');
  });

  afterEach(function () {
    logErrorStub.restore();
    fabrickIdSubmodule.getRefererInfoOverride = null;
  });

  it('should log an error if no configParams were passed into getId', function () {
    fabrickIdSubmodule.getId();
    expect(logErrorStub.calledOnce).to.be.true;
  });

  it('should error on json parsing', function() {
    let submoduleCallback = fabrickIdSubmodule.getId({
      name: 'fabrickId',
      params: defaultConfigParams
    }).callback;
    let callBackSpy = sinon.spy();
    submoduleCallback(callBackSpy);
    let request = server.requests[0];
    request.respond(
      200,
      responseHeader,
      '] this is not json {'
    );
    expect(callBackSpy.calledOnce).to.be.true;
    expect(logErrorStub.calledOnce).to.be.true;
  });

  it('should truncate the params', function() {
    let r = '';
    for (let i = 0; i < 1500; i++) {
      r += 'r';
    }
    let configParams = Object.assign({}, defaultConfigParams, {
      refererInfo: {
        referer: r,
        stack: ['s-0'],
        canonicalUrl: 'cu-0'
      }
    });
    let submoduleCallback = fabrickIdSubmodule.getId({
      name: 'fabrickId',
      params: configParams
    }).callback;
    let callBackSpy = sinon.spy();
    submoduleCallback(callBackSpy);
    let request = server.requests[0];
    r = '';
    for (let i = 0; i < 1000; i++) {
      r += 'r';
    }
    expect(request.url).to.match(new RegExp(`r=${r}&r=`));
    request.respond(
      200,
      responseHeader,
      JSON.stringify({})
    );
    expect(callBackSpy.calledOnce).to.be.true;
    expect(logErrorStub.calledOnce).to.be.false;
  });

  it('should complete successfully', function() {
    let urlWithoutQueryString = 'https://shareably.net/50-trucos-telefonos/';
    let truncatedUrlWithQueryString = `${urlWithoutQueryString}?utm_source=fb_ads&utm_medium=facebook&utm_campaign=a114a820-cd13-45be-8c62-aee8478782bd&fbclid=IwAR0sSxu-bbcpojGhuGbeGKRGQmBJH0Td1907C0pNvMPBw8EDgjE-JuTGCbQ`;
    let fullUrlWithQueryString = `${truncatedUrlWithQueryString}%3D`;
    let configParams = Object.assign({}, defaultConfigParams, {
      refererInfo: {
        referer: fullUrlWithQueryString,
        stack: [urlWithoutQueryString],
        canonicalUrl: 'cu-0'
      },
      maxRefLen: 200
    });
    let submoduleCallback = fabrickIdSubmodule.getId({
      name: 'fabrickId',
      params: configParams
    }).callback;
    let callBackSpy = sinon.spy();
    submoduleCallback(callBackSpy);
    let request = server.requests[0];
    expect(request.url).to.match(new RegExp(`r=${encodeURIComponent(truncatedUrlWithQueryString)}&r=cu-0&r=http`));
    // ensure the stack url isn't included since it's a duplicate
    expect(request.url.length).to.be.lt(365);
    request.respond(
      200,
      responseHeader,
      JSON.stringify({})
    );
    expect(callBackSpy.calledOnce).to.be.true;
    expect(logErrorStub.calledOnce).to.be.false;
  });
});
