const fs = require('fs');
const path = require('path');
const os = require('os');

const { ABOUT_SCRIPTLETS_PATH, ABOUT_REDIRECTS_PATH } = require('./build-docs');

/**
 * Source file for compatibility tables
 */
const COMPATIBILITY_TABLE_DATA = path.resolve(__dirname, './compatibility-table.json');

/**
 * File with compatibility tables
 */
const COMPATIBILITY_TABLE = path.resolve(__dirname, '../wiki/compatibility-table.md');

/**
 * Returns data for compatibility tables
 */
function getTableData() {
    const rawData = fs.readFileSync(COMPATIBILITY_TABLE_DATA);
    const parsed = JSON.parse(rawData);
    return parsed;
}

/**
 * Returns markdown row of compatibility table
 * @param {{
 * adg: string,
 * ubo: string,
 * abp: string
 * }} item { an }
 */
const getRow = (id, item) => {
    let adgCell = '';
    if (item.adg) {
        if (id === 'scriptlets') {
            adgCell = `${ABOUT_SCRIPTLETS_PATH}#${item.adg}`;
        } else if (id === 'redirects') {
            adgCell = `${ABOUT_REDIRECTS_PATH}#${item.adg}`;
        }
    }

    return `| ${adgCell} | ${item.ubo || ''} | ${item.abp || ''} |${os.EOL}`;
};

/**
 * Generates table header
 */
const getTableHeader = () => {
    let res = `| AdGuard | uBO | Adblock Plus |${os.EOL}`;
    res += `|---|---|---|${os.EOL}`;
    return res;
};

/**
 * Builds markdown string with scriptlets compatibility table
 * @param {Array} data array with scriptlets names
 */
function buildTable(title, data = [], id = '') {
    // title
    let res = `# <a id="${id}"></a> ${title}${os.EOL}${os.EOL}`;
    // header
    res += getTableHeader();
    // rows
    // res += data.map(getRow).join('');
    res += data
        .map((item) => {
            const row = getRow(id, item);
            return row;
        })
        .join('');

    return res;
}

/**
 * Save tables to compatibility table
 */
function saveTables(...args) {
    const res = args.join(`${os.EOL}${os.EOL}`);
    fs.writeFileSync(COMPATIBILITY_TABLE, res);
}

/**
 * Entry function
 */
function init() {
    const { scriptlets, redirects } = getTableData();

    const scriptletsTable = buildTable(
        'Scriptlets compatibility table',
        scriptlets,
        'scriptlets',
    );
    const redirectsTable = buildTable(
        'Redirects compatibility table',
        redirects,
        'redirects',
    );

    saveTables(scriptletsTable, redirectsTable);
}

init();
