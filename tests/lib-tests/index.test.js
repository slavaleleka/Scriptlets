/* eslint-disable max-len */

import {
    convertScriptletToAdg,
    convertAdgScriptletToUbo,
    convertRedirectToAdg,
    convertAdgRedirectToUbo,
    isValidScriptletRule,
} from '../../src/helpers/converter';

import validator from '../../src/helpers/validator';

const { test, module } = QUnit;
const name = 'scriptlets-redirects lib';

module(name);

test('Test scriptlet rule validation', (assert) => {
    let inputRule = "example.org#%#//scriptlet('abort-on-property-read', 'I10C')";
    assert.strictEqual(isValidScriptletRule(inputRule), true);

    inputRule = 'example.org##+js(setTimeout-defuser.js, [native code], 8000)';
    assert.strictEqual(isValidScriptletRule(inputRule), true);

    inputRule = 'example.org#@%#//scriptlet("ubo-aopw.js", "notDetected")';
    assert.strictEqual(isValidScriptletRule(inputRule), true);

    // no space between parameters
    inputRule = 'example.org##+js(aopr,__cad.cpm_popunder)';
    assert.strictEqual(isValidScriptletRule(inputRule), true);

    // invalid scriptlet name
    inputRule = 'example.org#@%#//scriptlet("ubo-abort-scriptlet.js", "notDetected")';
    assert.strictEqual(isValidScriptletRule(inputRule), false);

    inputRule = 'example.org#$#hide-if-has-and-matches-style \'d[id^="_"]\' \'div > s\' \'display: none\'; hide-if-contains /.*/ .p \'a[href^="/ad__c?"]\'';
    assert.strictEqual(isValidScriptletRule(inputRule), false);
});

test('Test comment', (assert) => {
    let comment = "! example.org#%#//scriptlet('abort-on-property-read', 'I10C')";
    let expComment = "! example.org#%#//scriptlet('abort-on-property-read', 'I10C')";
    assert.strictEqual(convertScriptletToAdg(comment)[0], expComment);

    comment = '! ||example.com^$xmlhttprequest,redirect=nooptext';
    expComment = '! ||example.com^$xmlhttprequest,redirect=nooptext';
    assert.strictEqual(convertScriptletToAdg(comment)[0], expComment);
});

test('Test Adguard scriptlet rule', (assert) => {
    const rule = "example.org#%#//scriptlet('abort-on-property-read', 'I10C')";
    const exp = "example.org#%#//scriptlet('abort-on-property-read', 'I10C')";
    assert.strictEqual(convertScriptletToAdg(rule)[0], exp);
});

test('Test Adguard scriptlet rule exception', (assert) => {
    const rule = "example.org#@%#//scriptlet('abort-on-property-read', 'I10C')";
    const exp = "example.org#@%#//scriptlet('abort-on-property-read', 'I10C')";
    assert.strictEqual(convertScriptletToAdg(rule)[0], exp);
});

test('Test SCRIPTLET converting - UBO -> ADG', (assert) => {
    // blocking rule
    let blockingRule = 'example.org##+js(setTimeout-defuser.js, [native code], 8000)';
    let expBlockRule = 'example.org#%#//scriptlet(\'ubo-setTimeout-defuser.js\', \'[native code]\', \'8000\')';
    assert.strictEqual(convertScriptletToAdg(blockingRule)[0], expBlockRule);

    // no space between parameters
    blockingRule = 'example.org##+js(aopr,__ad)';
    expBlockRule = 'example.org#%#//scriptlet(\'ubo-aopr.js\', \'__ad\')';
    assert.strictEqual(convertScriptletToAdg(blockingRule)[0], expBlockRule);

    // '$' as parameter
    blockingRule = 'example.org##+js(abort-current-inline-script, $, popup)';
    expBlockRule = 'example.org#%#//scriptlet(\'ubo-abort-current-inline-script.js\', \'$\', \'popup\')';
    assert.strictEqual(convertScriptletToAdg(blockingRule)[0], expBlockRule);
    // double quotes in scriptlet parameter
    blockingRule = 'example.com#@#+js(remove-attr.js, href, a[data-st-area="Header-back"])';
    expBlockRule = 'example.com#@%#//scriptlet(\'ubo-remove-attr.js\', \'href\', \'a[data-st-area="Header-back"]\')';
    assert.strictEqual(convertScriptletToAdg(blockingRule)[0], expBlockRule);
    // the same but with single quotes
    blockingRule = 'example.com#@#+js(remove-attr.js, href, a[data-st-area=\'Header-back\'])';
    assert.strictEqual(convertScriptletToAdg(blockingRule)[0], expBlockRule);
    // name without '.js' at the end
    blockingRule = 'example.org##+js(addEventListener-defuser, load, 2000)';
    expBlockRule = 'example.org#%#//scriptlet(\'ubo-addEventListener-defuser.js\', \'load\', \'2000\')';
    assert.strictEqual(convertScriptletToAdg(blockingRule)[0], expBlockRule);
    // short form of name
    blockingRule = 'example.org##+js(nano-stb, timeDown)';
    expBlockRule = 'example.org#%#//scriptlet(\'ubo-nano-stb.js\', \'timeDown\')';
    assert.strictEqual(convertScriptletToAdg(blockingRule)[0], expBlockRule);

    // whitelist rule
    let whitelistRule = 'example.org#@#+js(setTimeout-defuser.js, [native code], 8000)';
    let expectedResult = 'example.org#@%#//scriptlet(\'ubo-setTimeout-defuser.js\', \'[native code]\', \'8000\')';
    assert.strictEqual(convertScriptletToAdg(whitelistRule)[0], expectedResult);

    whitelistRule = 'example.org#@#script:inject(abort-on-property-read.js, some.prop)';
    expectedResult = 'example.org#@%#//scriptlet(\'ubo-abort-on-property-read.js\', \'some.prop\')';
    assert.strictEqual(convertScriptletToAdg(whitelistRule)[0], expectedResult);

    whitelistRule = 'example.org#@#+js(aopw, notDetected)';
    expectedResult = 'example.org#@%#//scriptlet(\'ubo-aopw.js\', \'notDetected\')';
    assert.strictEqual(convertScriptletToAdg(whitelistRule)[0], expectedResult);
});

test('Test SCRIPTLET converting - ABP -> ADG', (assert) => {
    const rule = "example.org#$#hide-if-contains li.serp-item 'li.serp-item div.label'";
    const exp = 'example.org#%#//scriptlet(\'abp-hide-if-contains\', \'li.serp-item\', \'li.serp-item div.label\')';
    assert.strictEqual(convertScriptletToAdg(rule)[0], exp);
});

test('Test SCRIPTLET converting - multiple ABP -> ADG', (assert) => {
    const rule = 'example.org#$#hide-if-has-and-matches-style \'d[id^="_"]\' \'div > s\' \'display: none\'; hide-if-contains /.*/ .p \'a[href^="/ad__c?"]\'';
    const exp1 = 'example.org#%#//scriptlet(\'abp-hide-if-has-and-matches-style\', \'d[id^="_"]\', \'div > s\', \'display: none\')';
    const exp2 = 'example.org#%#//scriptlet(\'abp-hide-if-contains\', \'/.*/\', \'.p\', \'a[href^="/ad__c?"]\')';
    const res = convertScriptletToAdg(rule);

    assert.equal(res.length, 2);
    assert.strictEqual(res[0], exp1);
    assert.strictEqual(res[1], exp2);
});

test('Test SCRIPTLET converting - ADG -> UBO', (assert) => {
    // blocking rule
    const rule = 'example.org#%#//scriptlet(\'prevent-setTimeout\', \'[native code]\', \'8000\')';
    const exp = 'example.org##+js(no-setTimeout-if, [native code], 8000)';
    assert.strictEqual(convertAdgScriptletToUbo(rule), exp);
    // scriptlet with no parameters
    const inputAdgRule = 'example.com#%#//scriptlet("prevent-adfly")';
    const expectedUboResult = 'example.com##+js(adfly-defuser)';
    assert.strictEqual(convertAdgScriptletToUbo(inputAdgRule), expectedUboResult);
    // whitelist rule
    const whitelistRule = 'example.org#@%#//scriptlet(\'prevent-setTimeout\', \'[native code]\', \'8000\')';
    const expectedResult = 'example.org#@#+js(no-setTimeout-if, [native code], 8000)';
    assert.strictEqual(convertAdgScriptletToUbo(whitelistRule), expectedResult);

    let actual = convertAdgScriptletToUbo('example.org#%#//scriptlet("ubo-abort-on-property-read.js", "alert")');
    let expected = 'example.org##+js(abort-on-property-read, alert)';
    assert.strictEqual(actual, expected);

    actual = convertAdgScriptletToUbo('example.com#%#//scriptlet("abp-abort-current-inline-script", "console.log", "Hello")');
    expected = 'example.com##+js(abort-current-inline-script, console.log, Hello)';
    assert.strictEqual(actual, expected);
});

test('Test redirect rule validation', (assert) => {
    // checks if the rule is valid AdGuard redirect by checking it's name
    let inputRule = '||example.org$xmlhttprequest,redirect=noopvast-2.0';
    assert.strictEqual(validator.isValidAdgRedirectRule(inputRule), true);

    // check if 'empty' redirect is valid
    inputRule = '||example.com/log$redirect=empty';
    assert.strictEqual(validator.isValidAdgRedirectRule(inputRule), true);

    // redirect name is wrong, but this one only for checking ADG redirect marker "redirect="
    inputRule = '||example.com/banner$image,redirect=redirect.png';
    assert.strictEqual(validator.isAdgRedirectRule(inputRule), true);

    // js-rule with 'redirect=' in it should not be considered as redirect rule
    inputRule = 'intermarche.pl#%#document.cookie = "interapp_redirect=false; path=/;";';
    assert.strictEqual(validator.isAdgRedirectRule(inputRule), false);

    // rules with 'redirect=' marker in base rule part should be skipped
    inputRule = '_redirect=*://look.$popup';
    assert.strictEqual(validator.isAdgRedirectRule(inputRule), false);

    // check is adg redirect valid for conversion to ubo
    inputRule = '||example.orf^$media,redirect=noopmp4-1s,third-party';
    assert.strictEqual(validator.isAdgRedirectCompatibleWithUbo(inputRule), true);
    // check 'empty' redirect
    inputRule = '||example.com/log$redirect=empty';
    assert.strictEqual(validator.isAdgRedirectCompatibleWithUbo(inputRule), true);
    // invalid redirect name
    inputRule = '||example.orf^$media,redirect=no-mp4';
    assert.strictEqual(validator.isAdgRedirectCompatibleWithUbo(inputRule), false);
    // no ubo analog for redirect
    inputRule = '||example.com/ad/vmap/*$xmlhttprequest,redirect=noopvmap-1.0';
    assert.strictEqual(validator.isAdgRedirectCompatibleWithUbo(inputRule), false);
    // rules with 'redirect=' marker in base rule part should be skipped
    inputRule = '_redirect=*://look.$popup';
    assert.strictEqual(validator.isAdgRedirectCompatibleWithUbo(inputRule), false);
    // js-rule with 'redirect=' in it should not be considered as redirect rule
    inputRule = 'intermarche.pl#%#document.cookie = "interapp_redirect=false; path=/;";';
    assert.strictEqual(validator.isAdgRedirectCompatibleWithUbo(inputRule), false);

    // check is ubo redirect valid for conversion
    inputRule = '||example.orf^$media,redirect=noop-1s.mp4,third-party';
    assert.strictEqual(validator.isUboRedirectCompatibleWithAdg(inputRule), true);
    // invalid redirect name
    inputRule = '||example.orf^$media,redirect=no-mp4';
    assert.strictEqual(validator.isUboRedirectCompatibleWithAdg(inputRule), false);

    // check is abp redirect valid for conversion
    inputRule = '||example.com^$script,rewrite=abp-resource:blank-js';
    assert.strictEqual(validator.isAbpRedirectCompatibleWithAdg(inputRule), true);
    // invalid redirect name
    inputRule = '||example.com^$script,rewrite=abp-resource:noop-js';
    assert.strictEqual(validator.isAbpRedirectCompatibleWithAdg(inputRule), false);

    // do not confuse with other script rules
    inputRule = 'intermarche.pl#%#document.cookie = "interapp_redirect=false; path=/;";';
    assert.strictEqual(validator.isAbpRedirectCompatibleWithAdg(inputRule), false);

    // do not confuse with other script rules
    inputRule = 'intermarche.pl#%#document.cookie = "interapp_redirect=false; path=/;";';
    assert.strictEqual(validator.isUboRedirectCompatibleWithAdg(inputRule), false);

    inputRule = '&pub_redirect=';
    assert.strictEqual(validator.isUboRedirectCompatibleWithAdg(inputRule), false);

    inputRule = '@@||popsci.com/gdpr.html?redirect=';
    assert.strictEqual(validator.isUboRedirectCompatibleWithAdg(inputRule), false);
});

test('Test Adguard redirect resource rule', (assert) => {
    const rule = '||example.com/banner$image,redirect=32x32-transparent.png';
    const exp = '||example.com/banner$image,redirect=32x32-transparent.png';
    const res = convertRedirectToAdg(rule);
    assert.strictEqual(res, exp);
});

test('Test REDIRECT converting - UBO -> ADG', (assert) => {
    let uboRule = '||example.com/banner$image,redirect=32x32.png';
    let expectedAdgRule = '||example.com/banner$image,redirect=32x32-transparent.png';
    assert.strictEqual(convertRedirectToAdg(uboRule), expectedAdgRule);

    uboRule = '||example.orf^$media,redirect=noop-1s.mp4,third-party';
    expectedAdgRule = '||example.orf^$media,redirect=noopmp4-1s,third-party';
    assert.strictEqual(convertRedirectToAdg(uboRule), expectedAdgRule);
});

test('Test REDIRECT converting - ABP -> ADG', (assert) => {
    let abpRule = '||example.com^$script,rewrite=abp-resource:blank-js';
    let expectedAdgRule = '||example.com^$script,redirect=noopjs';
    assert.strictEqual(convertRedirectToAdg(abpRule), expectedAdgRule);

    abpRule = '||*/ad/$rewrite=abp-resource:blank-mp3,domain=example.org';
    expectedAdgRule = '||*/ad/$redirect=noopmp3-0.1s,domain=example.org';
    assert.strictEqual(convertRedirectToAdg(abpRule), expectedAdgRule);
});

test('Test redirect rule validation for ADG -> UBO converting', (assert) => {
    let adgRule = '||example.com^$xmlhttprequest,redirect=nooptext';
    assert.strictEqual(validator.hasValidContentType(adgRule), true);

    adgRule = ' ||example.orf^$media,redirect=noopmp4-1s,third-party';
    assert.strictEqual(validator.hasValidContentType(adgRule), true);

    adgRule = '||example.com/images/*.png$image,important,redirect=1x1-transparent.gif,domain=example.com|example.org';
    assert.strictEqual(validator.hasValidContentType(adgRule), true);

    // abp rule ->> error because only ADG rules accepted
    assert.throws(() => {
        adgRule = '||example.com^$script,rewrite=abp-resource:blank-js';
        convertAdgRedirectToUbo(adgRule);
    }, 'unable to convert -- no such ubo redirect');

    // no source type
    adgRule = '||example.com^$important,redirect=nooptext';
    assert.strictEqual(validator.hasValidContentType(adgRule), false);

    // no source type for 'empty' is allowed
    adgRule = ' ||example.org^$redirect=empty,third-party';
    assert.strictEqual(validator.hasValidContentType(adgRule), true);

    // only text source types for 'empty' are allowed
    adgRule = ' ||example.org^$script,redirect=empty,third-party';
    assert.strictEqual(validator.hasValidContentType(adgRule), true);
    // so 'media' is not valid
    adgRule = ' ||example.org^$stylesheet,media,redirect=empty,third-party';
    assert.strictEqual(validator.hasValidContentType(adgRule), false);
});

test('Test REDIRECT converting - ADG -> UBO', (assert) => {
    let adgRule = '||example.com^$xmlhttprequest,redirect=nooptext';
    let expectedUboRule = '||example.com^$xmlhttprequest,redirect=noop.txt';
    assert.strictEqual(convertAdgRedirectToUbo(adgRule), expectedUboRule);

    adgRule = '||example.com/images/*.png$image,important,redirect=1x1-transparent.gif,domain=example.com|example.org';
    expectedUboRule = '||example.com/images/*.png$image,important,redirect=1x1.gif,domain=example.com|example.org';
    assert.strictEqual(convertAdgRedirectToUbo(adgRule), expectedUboRule);

    adgRule = '||example.com/vast/$important,redirect=empty,~thirt-party';
    expectedUboRule = '||example.com/vast/$important,redirect=empty,~thirt-party';
    assert.strictEqual(convertAdgRedirectToUbo(adgRule), expectedUboRule);

    assert.throws(() => {
        adgRule = '||example.com/ad/vmap/*$xmlhttprequest,redirect=noopvast-2.0';
        convertAdgRedirectToUbo(adgRule);
    }, 'unable to convert -- no such ubo redirect');

    assert.throws(() => {
        adgRule = '||example.com/ad/vmap/*$redirect=nooptext';
        convertAdgRedirectToUbo(adgRule);
    }, 'unable to convert -- no source type specified');
});
