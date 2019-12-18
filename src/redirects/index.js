import {
    attachDependencies,
    addCall,
    passSourceAndProps,
} from '../helpers/injector';

import * as redirectsList from './redirectsList';


const getRedirectByName = (redirectsList, name) => {
    // eslint-disable-next-line compat/compat
    const redirects = Object.values(redirectsList);
    return redirects.find((r) => r.names && r.names.indexOf(name) > -1);
};

const getRedirectCode = (name) => {
    const redirect = getRedirectByName(redirectsList, name);
    let result = attachDependencies(redirect);
    result = addCall(redirect, result);

    return passSourceAndProps({ name }, result);
};

redirects = (() => ({ getCode: getRedirectCode }))(); // eslint-disable-line no-undef