const express = require('express');
const app = express();
const fsall = require('fs');
const fs = require('fs').promises;
const prettier = require('prettier');
const moment = require('moment');

app.use(express.json());
app.use(express.text({ limit: '10mb' }));
try {
  if (!fsall.existsSync('data')) {
    fsall.mkdirSync('data');
  }
  if (!fsall.existsSync('data\\crash')) {
    fsall.mkdirSync('data\\crash');
  }
  if (!fsall.existsSync('data\\ignoredid.json')) {
    fsall.writeFileSync('data\\ignoredid.json', JSON.stringify({}), 'utf8');
  }
  if (!fsall.existsSync('data\\id.json')) {
    fsall.writeFileSync('data\\id.json', JSON.stringify({}), 'utf8');
  }
  if (!fsall.existsSync('data\\usage.json')) {
    fsall.writeFileSync('data\\usage.json', JSON.stringify({}), 'utf8');
  }
  if (!fsall.existsSync('data\\crash.json')) {
    fsall.writeFileSync('data\\crash.json', JSON.stringify({}), 'utf8');
  }
  if (!fsall.existsSync('data\\check.json')) {
    fsall.writeFileSync('data\\check.json', JSON.stringify({}), 'utf8');
  }
}
catch (error) {
  write2error(error);
  process.exit(1);
}

/**
 * Function to log to a file and to the console
 * @param {string} log - The log to write
 */
function write2log(log) {
  console.log(`${log}`);
  fsall.appendFileSync('logs\\logs.log', `${log}\n`);
}

/**
 * Function to log error to a file and to the console
 * @param {string} error - The error to write
 */
function write2error(error) {
  console.error(`${error}`);
  fsall.appendFileSync('logs\\errors.log', `${error}\n`);
}

/**
 * Function to format a JSON file
 * @param {string} inputFile - The path of the input JSON file
 * @param {string} outputFile - The path of the output formatted JSON file
 */
async function formatJSONFile(inputFile, outputFile) {
  try {
    const data = await fs.readFile(inputFile, 'utf8');
    const jsonData = JSON.parse(data);
    const formattedData = prettier.format(JSON.stringify(jsonData), { parser: 'json' });
    await fs.writeFile(outputFile, formattedData, 'utf8');
    write2log('JSON file formatted');
  } catch (error) {
    write2error(error);
  }
}

/**
 * Function to update ID JSON data based on specific parameters
 * @param {string} id - The identifier
 * @param {string} version - The version
 * @param {string} build - The build
 * @param {string} utsversion - The UTS version
 * @param {string} pcmodel - The PC model
 * @param {string} pcyear - The PC year
 * @param {boolean} weirdpc - The weird PC status
 * @param {string} defaultos - The default OS status
 * @param {string} osversion - The OS version
 * @param {string} lang - The language
 * @param {string} launchmode - The launch mode
 * @param {boolean} trayena - The tray enabled status
 * @param {boolean} isdeb - The debug version status
 * @param {boolean} wifiena - The WiFi sync enabled status
 */
async function updateID(id, version, build, utsversion, pcmodel, pcyear, weirdpc, defaultos, osversion, lang, launchmode, trayena, isdeb, wifiena) {
  try {
    const data = await fs.readFile('data\\id.json', 'utf8');
    let jsonData = JSON.parse(data);

    if (jsonData.hasOwnProperty(id)) {
      write2log('\nID already exists, updating data');
    } else {
      write2log('\nID does not already exist, creating data');
    }

    jsonData[id] = {
      launch: {
        normal: launchmode === 'normal' ? 1 : 0,
        tray: launchmode === 'tray' ? 1 : 0
      },
      version,
      build,
      utsversion,
      pcmodel,
      pcyear,
      weirdpc,
      defaultos,
      osversion,
      lang,
      trayena,
      isdeb,
      wifiena,
      lastrequest: moment().format('YYYY-MM-DD HH:mm:ss')
    };

    await fs.writeFile('data\\id.json', JSON.stringify(jsonData), 'utf8');

    write2log('Data updated');
  } catch (error) {
    write2error(error);
  }
}

/**
 * Function to update usage JSON data based on specific parameters
 * @param {string} id - The identifier
 * @param {string} action - The action
*/
async function updateUsage(id, action) {
  try {
    const data = await fs.readFile('data\\usage.json', 'utf8');
    let jsonData = JSON.parse(data);

    if (jsonData.hasOwnProperty(id)) {
      write2log('\nID already exists, updating data');
    } else {
      write2log('\nID does not already exist, creating data');
    }

    if (jsonData[id]) {
      jsonData[id][action] = jsonData[id][action] ? jsonData[id][action] + 1 : 1;
    } else {
      jsonData[id] = {
        [action]: 1
      };
    }

    await fs.writeFile('data\\usage.json', JSON.stringify(jsonData), 'utf8');

    write2log('Data updated');
  } catch (error) {
    write2error(error);
  }
}

/**
 * Function to update crash JSON data based on specific parameters
 * @param {string} id - The identifier
 * @param {string} version - The version
 * @param {string} build - The build
 * @param {string} utsversion - The UTS version
 * @param {boolean} isdeb - The debug version status
 * @param {string} crashid - The crash identifier
 */
async function updateCrash(id, version, build, utsversion, isdeb, crashid, message) {
  try {
    const data = await fs.readFile('data\\crash.json', 'utf8');
    let jsonData = JSON.parse(data);

    if (jsonData.hasOwnProperty(id)) {
      write2log('\nID already exists, updating data');
    } else {
      write2log('\nID does not already exist, creating data');
    };

    jsonData[id] = jsonData[id] || {};
    jsonData[id][crashid] = ({
      version,
      build,
      utsversion,
      isdeb,
      message,
      date: moment().format('YYYY-MM-DD HH:mm:ss')
    });

    await fs.writeFile('data\\crash.json', JSON.stringify(jsonData), 'utf8');

    write2log('Data added');
  } catch (error) {
    write2error(error);
  }
}

/**
 * Function to update check JSON data based on specific parameters
 * @param {string} id - The identifier
 * @param {string} check - The check
 */
async function updateCheck(id, check) {
  try {
    const data = await fs.readFile('data\\check.json', 'utf8');
    let jsonData = JSON.parse(data);

    if (jsonData.hasOwnProperty(id)) {
      write2log('\nID already exists, updating data');
    } else {
      write2log('\nID does not already exist, creating data');
    }

    jsonData[id] = check;

    await fs.writeFile('data\\check.json', JSON.stringify(jsonData), 'utf8');

    write2log('Data updated');
  } catch (error) {
    write2error(error);
  }
}

app.post('/ut-stats', async (req, res) => {
  try {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    write2log(`\n\n\n[${currentTime}] New HTTP POST request (/ut-stats):\nJSON:`);

    const jsonDataPost = JSON.stringify(req.body, null, 2);

    write2log(jsonDataPost);
    write2log('JSON End\n');

    const { id, version, build, utsversion, pcmodel, pcyear, weirdpc, defaultos, osversion, lang, launchmode, trayena, isdeb, wifiena } = req.body;

    write2log('ID:', id);
    write2log('Version:', version);
    write2log('Build:', build);
    write2log('UTS Version:', utsversion);
    write2log('PC Model:', pcmodel);
    write2log('PC Year:', pcyear);
    write2log('Weird PC:', weirdpc);
    write2log('Default OS:', defaultos);
    write2log('OS Version:', osversion);
    write2log('Lang:', lang);
    write2log('Launch Mode:', launchmode);
    write2log('Tray Enabled:', trayena);
    write2log('Debug version:', isdeb);
    write2log('Wifi Sync Enabled:', wifiena);

    await updateID(id, version, build, utsversion, pcmodel, pcyear, weirdpc, defaultos, osversion, lang, launchmode, trayena, isdeb, wifiena);
    await formatJSONFile('data\\id.json', 'data\\id.formatted.json');

    write2log('Done !');
    res.send('OK');
  } catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ut-stats/usage', async (req, res) => {
  try {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    write2log(`\n\n\n[${currentTime}] New HTTP POST request (/ut-stats/usage):\nJSON:`);

    const jsonDataPost = JSON.stringify(req.body, null, 2);

    write2log(jsonDataPost);
    write2log('JSON End\n');

    const { id, action } = req.body;

    write2log('ID:', id);
    write2log('Action:', action);

    await updateUsage(id, action);
    await formatJSONFile('data\\usage.json', 'data\\usage.formatted.json');

    write2log('Done !');
    res.send('OK');
  } catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ut-stats/crash', async (req, res) => {
  try {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    write2log(`\n\n\n[${currentTime}] New HTTP POST request (/ut-stats/crash):\nJSON:`);

    const jsonDataPost = JSON.stringify(req.body, null, 2);

    write2log(jsonDataPost);
    write2log('JSON End\n');

    const { id, version, build, utsversion, isdeb, crashid, message } = req.body;

    write2log('ID:', id);
    write2log('Version:', version);
    write2log('Build:', build);
    write2log('UTS Version:', utsversion);
    write2log('Debug version:', isdeb);
    write2log('Crash ID:', crashid);
    write2log('Message:', message);

    await updateCrash(id, version, build, utsversion, isdeb, crashid, message);
    await formatJSONFile('data\\crash.json', 'data\\crash.formatted.json');

    write2log('Done !');
    res.send('OK');
  } catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ut-stats/crash/logs', async (req, res) => {
  try {
    const crashid = req.headers['crashid'];
    const logstext = req.body;
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    write2log(`\n\n\n[${currentTime}] New HTTP POST request (/ut-stats/crash/logs):\n`);
    write2log(`Crash ID: ${crashid}`);

    await fs.writeFile(`data\\crash\\${crashid}.log`, logstext, 'utf8');

    write2log('Done !');
    res.send('OK');
  } catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ut-stats/check', async (req, res) => {
  try {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    write2log(`\n\n\n[${currentTime}] New HTTP POST request (/ut-stats/check):\nJSON:`);

    const jsonDataPost = JSON.stringify(req.body, null, 2);

    write2log(jsonDataPost);
    write2log('JSON End\n');

    const { id, check } = req.body;

    write2log('ID:', id);
    write2log('Check:', check);

    await updateCheck(id, check);
    await formatJSONFile('data\\check.json', 'data\\check.formatted.json');

    write2log('Done !');
    res.send('OK');
  }
  catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/ut-stats', async (req, res) => {
  const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
  write2log(`\n\n\n[${currentTime}] New HTTP GET request (/ut-stats)\n`);

  const repconst = {
    Name: 'Unowhy Tools Stats',
    Author: 'STY1001',
    Git: 'https://github.com/STY1001/Unowhy-Tools-Stats.git',
    Status: 'OK'
  };
  const repconstString = JSON.stringify(repconst, null, 2);

  res.setHeader('Content-Type', 'application/json');
  res.send(repconstString);
});

app.get('/ut-stats/get-stats', async (req, res) => {
  const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
  write2log(`\n\n\n[${currentTime}] New HTTP GET request (/ut-stats/get-stats)\n`);

  let data = await fs.readFile('data\\id.json', 'utf8');
  const jsonData = JSON.parse(data);

  data = await fs.readFile('data\\ignoredid.json', 'utf8');
  const ignoredJsonData = JSON.parse(data);



  let totalidCount = Object.keys(jsonData).length - Object.keys(ignoredJsonData).length;
  let totalisdebCount = 0;
  let totaltrayenaCount = 0;
  let totalwifienaCount = 0;
  let totallaunchnCount = 0;
  let totallaunchtCount = 0;
  let totaldefaultosCount = 0;
  let totalweirdpcCount = 0;

  let activeidCount = 0;
  let activeisdebCount = 0;
  let activetrayenaCount = 0;
  let activewifienaCount = 0;
  let activelaunchnCount = 0;
  let activelaunchtCount = 0;
  let activedefaultosCount = 0;
  let activeweirdpcCount = 0;

  let outdatedidCount = 0;
  let outdatedisdebCount = 0;
  let outdatedtrayenaCount = 0;
  let outdatedwifienaCount = 0;
  let outdatedlaunchnCount = 0;
  let outdatedlaunchtCount = 0;
  let outdateddefaultosCount = 0;
  let outdatedweirdpcCount = 0;

  for (const id in jsonData) {
    if (!ignoredJsonData[id]) {
      if (jsonData[id].isdeb) totalisdebCount++;
      if (jsonData[id].trayena) totaltrayenaCount++;
      if (jsonData[id].wifiena) totalwifienaCount++;
      if (jsonData[id].defaultos) totaldefaultosCount++;
      if (jsonData[id].weirdpc) totalweirdpcCount++;
      totallaunchnCount += jsonData[id].launch.normal;
      totallaunchtCount += jsonData[id].launch.tray;
    }
  }

  for (const id in jsonData) {
    if (!ignoredJsonData[id]) {
      const lastRequestDate = moment(jsonData[id].lastrequest, 'YYYY-MM-DD HH:mm:ss');
      if (lastRequestDate.isAfter(moment().subtract(1, 'months'))) {
        activeidCount++;
        if (jsonData[id].isdeb) activeisdebCount++;
        if (jsonData[id].trayena) activetrayenaCount++;
        if (jsonData[id].wifiena) activewifienaCount++;
        if (jsonData[id].defaultos) activedefaultosCount++;
        if (jsonData[id].weirdpc) activeweirdpcCount++;
        activelaunchnCount += jsonData[id].launch.normal;
        activelaunchtCount += jsonData[id].launch.tray;
      }
    }
  }

  for (const id in jsonData) {
    if (!ignoredJsonData[id]) {
      const lastRequestDate = moment(jsonData[id].lastrequest, 'YYYY-MM-DD HH:mm:ss');
      if (lastRequestDate.isBefore(moment().subtract(1, 'months'))) {
        outdatedidCount++;
        if (jsonData[id].isdeb) outdatedisdebCount++;
        if (jsonData[id].trayena) outdatedtrayenaCount++;
        if (jsonData[id].wifiena) outdatedwifienaCount++;
        if (jsonData[id].defaultos) outdateddefaultosCount++;
        if (jsonData[id].weirdpc) outdatedweirdpcCount++;
        outdatedlaunchnCount += jsonData[id].launch.normal;
        outdatedlaunchtCount += jsonData[id].launch.tray;
      }
    }
  }

  const totalconst = {
    idcount: totalidCount,
    versioncount: {},
    buildcount: {},
    utsversioncount: {},
    pcmodelcount: {},
    pcyearcount: {},
    weirdpccount: totalweirdpcCount,
    defaultoscount: totaldefaultosCount,
    osversioncount: {},
    langcount: {},
    isdebcount: totalisdebCount,
    trayenacount: totaltrayenaCount,
    wifienacount: totalwifienaCount,
    launchcount: {
      normal: totallaunchnCount,
      tray: totallaunchtCount
    }
  };

  const activeconst = {
    idcount: activeidCount,
    versioncount: {},
    buildcount: {},
    utsversioncount: {},
    pcmodelcount: {},
    pcyearcount: {},
    weirdpccount: activeweirdpcCount,
    defaultoscount: activedefaultosCount,
    osversioncount: {},
    langcount: {},
    isdebcount: activeisdebCount,
    trayenacount: activetrayenaCount,
    wifienacount: activewifienaCount,
    launchcount: {
      normal: activelaunchnCount,
      tray: activelaunchtCount
    }
  };

  const outdatedconst = {
    idcount: outdatedidCount,
    versioncount: {},
    buildcount: {},
    utsversioncount: {},
    pcmodelcount: {},
    pcyearcount: {},
    weirdpccount: outdatedweirdpcCount,
    defaultoscount: outdateddefaultosCount,
    osversioncount: {},
    langcount: {},
    isdebcount: outdatedisdebCount,
    trayenacount: outdatedtrayenaCount,
    wifienacount: outdatedwifienaCount,
    launchcount: {
      normal: outdatedlaunchnCount,
      tray: outdatedlaunchtCount
    }
  };

  for (const id in jsonData) {
    if (!ignoredJsonData[id]) {
      const lang = jsonData[id].lang;

      if (totalconst.langcount[lang]) {
        totalconst.langcount[lang]++;
      } else {
        totalconst.langcount[lang] = 1;
      }

      const version = jsonData[id].version;

      if (totalconst.versioncount[version]) {
        totalconst.versioncount[version]++;
      } else {
        totalconst.versioncount[version] = 1;
      }

      const build = jsonData[id].build;
      if (totalconst.buildcount[build]) {
        totalconst.buildcount[build]++;
      } else {
        totalconst.buildcount[build] = 1;
      }

      const utsversion = jsonData[id].utsversion;
      if (totalconst.utsversioncount[utsversion]) {
        totalconst.utsversioncount[utsversion]++;
      } else {
        totalconst.utsversioncount[utsversion] = 1;
      }

      const pcmodel = jsonData[id].pcmodel;
      if (totalconst.pcmodelcount[pcmodel]) {
        totalconst.pcmodelcount[pcmodel]++;
      } else {
        totalconst.pcmodelcount[pcmodel] = 1;
      }

      const pcyear = jsonData[id].pcyear;
      if (totalconst.pcyearcount[pcyear]) {
        totalconst.pcyearcount[pcyear]++;
      } else {
        totalconst.pcyearcount[pcyear] = 1;
      }

      const osversion = jsonData[id].osversion;
      if (totalconst.osversioncount[osversion]) {
        totalconst.osversioncount[osversion]++;
      } else {
        totalconst.osversioncount[osversion] = 1;
      }
    }
  }

  for (const id in jsonData) {
    if (!ignoredJsonData[id]) {
      const lastRequestDate = moment(jsonData[id].lastrequest, 'YYYY-MM-DD HH:mm:ss');
      if (lastRequestDate.isAfter(moment().subtract(1, 'months'))) {
        const lang = jsonData[id].lang;

        if (activeconst.langcount[lang]) {
          activeconst.langcount[lang]++;
        } else {
          activeconst.langcount[lang] = 1;
        }

        const version = jsonData[id].version;

        if (activeconst.versioncount[version]) {
          activeconst.versioncount[version]++;
        } else {
          activeconst.versioncount[version] = 1;
        }

        const build = jsonData[id].build;
        if (activeconst.buildcount[build]) {
          activeconst.buildcount[build]++;
        } else {
          activeconst.buildcount[build] = 1;
        }

        const utsversion = jsonData[id].utsversion;
        if (activeconst.utsversioncount[utsversion]) {
          activeconst.utsversioncount[utsversion]++;
        } else {
          activeconst.utsversioncount[utsversion] = 1;
        }

        const pcmodel = jsonData[id].pcmodel;
        if (activeconst.pcmodelcount[pcmodel]) {
          activeconst.pcmodelcount[pcmodel]++;
        }
        else {
          activeconst.pcmodelcount[pcmodel] = 1;
        }

        const pcyear = jsonData[id].pcyear;
        if (activeconst.pcyearcount[pcyear]) {
          activeconst.pcyearcount[pcyear]++;
        } else {
          activeconst.pcyearcount[pcyear] = 1;
        }

        const osversion = jsonData[id].osversion;
        if (activeconst.osversioncount[osversion]) {
          activeconst.osversioncount[osversion]++;
        } else {
          activeconst.osversioncount[osversion] = 1;
        }
      }
    }
  }

  for (const id in jsonData) {
    if (!ignoredJsonData[id]) {
      const lastRequestDate = moment(jsonData[id].lastrequest, 'YYYY-MM-DD HH:mm:ss');
      if (lastRequestDate.isBefore(moment().subtract(1, 'months'))) {
        const lang = jsonData[id].lang;

        if (outdatedconst.langcount[lang]) {
          outdatedconst.langcount[lang]++;
        } else {
          outdatedconst.langcount[lang] = 1;
        }

        const version = jsonData[id].version;

        if (outdatedconst.versioncount[version]) {
          outdatedconst.versioncount[version]++;
        } else {
          outdatedconst.versioncount[version] = 1;
        }

        const build = jsonData[id].build;
        if (outdatedconst.buildcount[build]) {
          outdatedconst.buildcount[build]++;
        } else {
          outdatedconst.buildcount[build] = 1;
        }

        const utsversion = jsonData[id].utsversion;
        if (outdatedconst.utsversioncount[utsversion]) {
          outdatedconst.utsversioncount[utsversion]++;
        } else {
          outdatedconst.utsversioncount[utsversion] = 1;
        }

        const pcmodel = jsonData[id].pcmodel;
        if (outdatedconst.pcmodelcount[pcmodel]) {
          outdatedconst.pcmodelcount[pcmodel]++;
        } else {
          outdatedconst.pcmodelcount[pcmodel] = 1;
        }

        const pcyear = jsonData[id].pcyear;
        if (outdatedconst.pcyearcount[pcyear]) {
          outdatedconst.pcyearcount[pcyear]++;
        } else {
          outdatedconst.pcyearcount[pcyear] = 1;
        }

        const osversion = jsonData[id].osversion;
        if (outdatedconst.osversioncount[osversion]) {
          outdatedconst.osversioncount[osversion]++;
        } else {
          outdatedconst.osversioncount[osversion] = 1;
        }
      }
    }
  }

  const repconst = {
    total: totalconst,
    active: activeconst,
    outdated: outdatedconst
  }

  const repconstString = JSON.stringify(repconst, null, 2);

  res.setHeader('Content-Type', 'application/json');
  res.send(repconstString);
});

app.get('/ut-stats/get-stats/usage', async (req, res) => {
  const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
  write2log(`\n\n\n[${currentTime}] New HTTP GET request (/ut-stats/get-stats/usage)\n`);

  let data = await fs.readFile('data\\usage.json', 'utf8');
  const jsonData = JSON.parse(data);

  let totalcount = 0;
  let actioncount = {};

  for (const id in jsonData) {
    for (const action in jsonData[id]) {
      totalcount += jsonData[id][action];

      if (actioncount[action]) {
        actioncount[action] += jsonData[id][action];
      } else {
        actioncount[action] = jsonData[id][action];
      }
    }
  }

  const repconst = {
    totalcount,
    actioncount
  }

  const repconstString = JSON.stringify(repconst, null, 2);

  res.setHeader('Content-Type', 'application/json');
  res.send(repconstString);
});

app.get('/ut-stats/get-stats/check', async (req, res) => {
  const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
  write2log(`\n\n\n[${currentTime}] New HTTP GET request (/ut-stats/get-stats/check)\n`);

  let data = await fs.readFile('data\\check.json', 'utf8');
  const jsonData = JSON.parse(data);

  let checkcount = {};

  for (const id in jsonData) {
    for (const check in jsonData[id]) {
      if (checkcount[check]) {
        if (jsonData[id][check] == true) {
          checkcount[check]++;
        }
      } else {
        if (jsonData[id][check] == true) {
          checkcount[check] = 1;
        }
        else {
          checkcount[check] = 0;
        }
      }
    }
  }

  const repconst = {
    checkcount
  }

  const repconstString = JSON.stringify(repconst, null, 2);

  res.setHeader('Content-Type', 'application/json');
  res.send(repconstString);
});

app.listen(3000, () => {
  write2log('Server started, port 3000');
});
