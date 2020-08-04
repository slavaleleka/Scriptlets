import { hit, toRegExp } from '../helpers';

/* eslint-disable max-len */
/**
 * @scriptlet adjust-setTimeout
 *
 * @description
 * Adjusts timeout for specified setTimout() callbacks.
 *
 * Related UBO scriptlet:
 * https://github.com/gorhill/uBlock/wiki/Resources-Library#nano-settimeout-boosterjs-
 *
 * **Syntax**
 * ```
 * example.org#%#//scriptlet('adjust-setTimeout'[, match [, timeout[, boost]]])
 * ```
 *
 * - `match` - optional, string/regular expression, matching in stringified callback function
 * - `timeout` - optional, defaults to 1000, decimal integer, matching setTimout delay
 * - `boost` - optional, default to 0.05, float, capped at 50 times for up and down (0.02...50), timeout multiplier
 *
 * **Examples**
 * 1. Adjust all setTimeout() x20 times where timeout equal 1000ms:
 *     ```
 *     example.org#%#//scriptlet('adjust-setTimeout')
 *     ```
 *
 * 2. Adjust all setTimeout() x20 times where callback mathed with `example` and timeout equal 1000ms
 *     ```
 *     example.org#%#//scriptlet('adjust-setTimeout', 'example')
 *     ```
 *
 * 3. Adjust all setTimeout() x20 times where callback mathed with `example` and timeout equal 400ms
 *     ```
 *     example.org#%#//scriptlet('adjust-setTimeout', 'example', '400')
 *     ```
 *
 * 4. Slow down setTimeout() x2 times where callback matched with `example` and timeout equal 1000ms
 *     ```
 *     example.org#%#//scriptlet('adjust-setTimeout', 'example', '', '2')
 *     ```
 * 5.  Adjust all setTimeout() x50 times where timeout equal 2000ms
 *     ```
 *     example.org#%#//scriptlet('adjust-setTimeout', '', '2000', '0.02')
 *     ```
 */
/* eslint-enable max-len */
export function adjustSetTimeout(source, match, timeout, boost) {
    const nativeTimeout = window.setTimeout;
    const nativeIsNaN = Number.isNaN || window.isNaN; // eslint-disable-line compat/compat
    const nativeIsFinite = Number.isFinite || window.isFinite; // eslint-disable-line compat/compat

    timeout = parseInt(timeout, 10);
    timeout = nativeIsNaN(timeout) ? 1000 : timeout;

    boost = parseFloat(boost);
    boost = nativeIsNaN(boost) || !nativeIsFinite(boost) ? 0.05 : boost;

    match = match ? toRegExp(match) : toRegExp('/.?/');

    if (boost < 0.02) {
        boost = 0.02;
    }
    if (boost > 50) {
        boost = 50;
    }

    const timeoutWrapper = (cb, d, ...args) => {
        if (d === timeout && match.test(cb.toString())) {
            d *= boost;
            hit(source);
        }
        return nativeTimeout.apply(window, [cb, d, ...args]);
    };
    window.setTimeout = timeoutWrapper;
}

adjustSetTimeout.names = [
    'adjust-setTimeout',
    // aliases are needed for matching the related scriptlet converted into our syntax
    'nano-setTimeout-booster.js',
    'ubo-nano-setTimeout-booster.js',
    'nano-stb.js',
    'ubo-nano-stb.js',
    'ubo-nano-setTimeout-booster',
    'ubo-nano-stb',
];

adjustSetTimeout.injections = [toRegExp, hit];
