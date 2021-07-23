const https = require('https');
const fs = require('fs');
const path = require("path");

const itemIds = [
    171266,
    171274,
    171290,
    168589,
    180457,
    176811,
    171275,
    171291,
    171370,
    171315,
    171268,
    171276,
    171292,
    171269,
    171285,
    184090,
    171270,
    171278,
    171349,
    171428,
    170554,
    171263,
    171271,
    171350,
    168586,
    171264,
    171272,
    171351,
    171267,
    171301,
    183823,
    171289,
    169701,
    171273,
    171286,
    171352,
    171287,
    168583,
    171288,
    183950
];

function getUrl(url) {
    return new Promise((resolve, reject) => {
        let data = '';
        https.get(url, resp => {
            resp.on('data', chunk => data += chunk);
            resp.on('end', () => resolve(data));
        }).on('error', err => reject(err));
    });
}

/**
 *
 * @param text {string}
 */
function extractInfo(text) {
    const name = /<name><!\[CDATA\[(.+?)]]/.exec(text)[1];
    const sellGold = /<span class="moneygold">(\d+?)<\/span>/.exec(text)?.[1] ?? 0;
    const sellSilver = /<span class="moneysilver">(\d+?)<\/span>/.exec(text)?.[1] ?? 0;
    const sellCopper = /<span class="moneycopper">(\d+?)<\/span>/.exec(text)?.[1] ?? 0;
    const sellPrice = +sellCopper + +sellSilver * 100 + +sellGold * 10000;
    const buyPrice = /"buyprice":(\d+),/.exec(text)?.[1] ?? null;
    const regents = [...text.matchAll(/<reagent.+?id="(\d+?)".+?count="(\d+?)/g)].map(([_, id, count]) => ({id: +id, count: +count}));
    return {
        name,
        sellPrice: sellPrice,
        buyPrice: buyPrice === null ? null : +buyPrice,
        regents
    };
}

async function getInfos() {
    const toVisit = [...itemIds];
    const visited = new Set();
    const infos = new Map();
    for (const itemId of toVisit) {
        if (visited.has(itemId)) {
            continue;
        }
        visited.add(itemId);
        const text = await getUrl(`https://www.wowhead.com/item=${itemId}&xml`);
        const info = extractInfo(text);
        console.log('text', itemId, 'is', info);
        toVisit.push(...info.regents.map(a => a.id));
        infos.set(itemId, info);
    }
    return infos;
}

function writeToFileJson(filePath, object) {
    const text = `// Generated at: ${new Date().toISOString()}\n` +
        'export default ' + JSON.stringify(object, null, 2) +
        ';\n';
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, text, {encoding: 'utf8'}, err => reject(err));
        resolve();
    });
}

function getData() {
    return new Promise((resolve, reject) => {
        fs.readFile('/Applications/World of Warcraft/_retail_/Interface/Addons/TradeSkillMaster_AppHelper/AppData.lua', 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

async function getSaleRates() {
    const data = await getData();
    let dataEU = data.split('\n')[1];
    dataEU = dataEU.substr(dataEU.indexOf(',data={{'));
    const matchArrays = [...dataEU.matchAll(/{+?(.+?),(.+?),(.+?),(.+?),(.+?),(.+?)}+?/g)];
    return matchArrays.map(([_, id, marketValue, historical, sale, soldperday, percent]) => ({id: id, percent: +`0.${percent}`}));
}

async function main() {
    const rates = await getSaleRates();
    async function writeSaleRates() {
        const saleRates = {};
        for (const itemId of itemIds) {
            const percent = rates.find(a => a.id === `${itemId}`)?.percent;
            if (percent) {
                saleRates[itemId] = percent;
            }
        }
        await writeToFileJson(path.join(__dirname, 'src', 'app', 'data', 'sellRate.ts'), saleRates);
    }
    await writeSaleRates();

    const infos = await getInfos();

    async function writeItemMap() {
        const itemMap = {};
        for (const [itemId, info] of infos.entries()) {
            itemMap[itemId] = info.name;
        }
        await writeToFileJson(path.join(__dirname, 'src', 'app', 'data', 'itemMap.ts'), itemMap);
    }

    async function writeRecipes() {
        const recipes = {};
        for (const [itemId, info] of infos.entries()) {
            recipes[itemId] = info.regents.reduce((prev, cur) => {
                prev[cur.id] = cur.count;
                return prev;
            }, {});
            if (Object.values(recipes[itemId]).length === 0) {
                delete recipes[itemId];
            }
        }
        await writeToFileJson(path.join(__dirname, 'src', 'app', 'data', 'recipes.ts'), recipes);
    }

    async function writeSellPrices() {
        const sellPrices = {};
        for (const [itemId, info] of infos.entries()) {
            sellPrices[itemId] = info.sellPrice;
        }
        await writeToFileJson(path.join(__dirname, 'src', 'app', 'data', 'sellPrices.ts'), sellPrices);
    }

    async function writeVendors() {
        const sellPrices = {};
        for (const [itemId, info] of infos.entries()) {
            if (info.buyPrice) {
                sellPrices[itemId] = info.buyPrice;
                if (itemId === 180732) {
                    sellPrices[itemId] /= 20;
                }
            }
        }
        await writeToFileJson(path.join(__dirname, 'src', 'app', 'data', 'vendors.ts'), sellPrices);
    }

    await writeItemMap();
    await writeRecipes();
    await writeSellPrices();
    await writeVendors();
}

main()
    .then(() => console.log('Goodbye!'))
    .catch(err => console.error(err));
