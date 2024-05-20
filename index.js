const express = require('express');
const app = express();
const fs = require('fs').promises;
const prettier = require('prettier');
const moment = require('moment');

app.use(express.json());
app.use(express.text({limit: '10mb'}));

if (!fs.existsSync('data')) {
  fs.mkdir('data');
}
if (!fs.existsSync('data\\crash')) {
  fs.mkdir('data\\crash');
}
if (!fs.existsSync('data\\ignoredid.json')) {
  fs.writeFile('data\\ignoredid.json', '{}', 'utf8');
}
if (!fs.existsSync('data\\id.json')) {
  fs.writeFile('data\\id.json', '{}', 'utf8');
}
if (!fs.existsSync('data\\usage.json')) {
  fs.writeFile('data\\usage.json', '{}', 'utf8');
}
if (!fs.existsSync('data\\crash.json')) {
  fs.writeFile('data\\crash.json', '{}', 'utf8');
}
if (!fs.existsSync('data\\check.json')) {
  fs.writeFile('data\\check.json', '{}', 'utf8');
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
    console.log('JSON file formatted');
  } catch (error) {
    console.error(error);
  }
}

/**
 * Function to update ID JSON data based on specific parameters
 * @param {string} id - The identifier
 * @param {string} version - The version
 * @param {string} build - The build
 * @param {string} utsversion - The UTS version
 * @param {string} pcyear - The PC year
 * @param {string} defaultos - The default OS status
 * @param {string} osversion - The OS version
 * @param {string} lang - The language
 * @param {string} launchmode - The launch mode
 * @param {boolean} trayena - The tray enabled status
 * @param {boolean} isdeb - The debug version status
 * @param {boolean} wifiena - The WiFi sync enabled status
 */
async function updateID(id, version, build, utsversion, pcyear, weirdpc, defaultos, osversion, lang, launchmode, trayena, isdeb, wifiena) {
  try {
    const data = await fs.readFile('data\\id.json', 'utf8');
    let jsonData = JSON.parse(data);

    if (jsonData.hasOwnProperty(id)) {
      console.log('\nID already exists, updating data');
    } else {
      console.log('\nID does not already exist, creating data');
    }

    jsonData[id] = {
      launch: {
        normal: launchmode === 'normal' ? 1 : 0,
        tray: launchmode === 'tray' ? 1 : 0
      },
      version,
      build,
      utsversion,
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

    console.log('Data updated');
  } catch (error) {
    console.error(error);
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
      console.log('\nID already exists, updating data');
    } else {
      console.log('\nID does not already exist, creating data');
    }

    if (jsonData[id]) {
      jsonData[id][action] = jsonData[id][action] ? jsonData[id][action] + 1 : 1;
    } else {
      jsonData[id] = {
        [action]: 1
      };
    }

    await fs.writeFile('data\\usage.json', JSON.stringify(jsonData), 'utf8');

    console.log('Data updated');
  } catch (error) {
    console.error(error);
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
      console.log('\nID already exists, updating data');
    } else {
      console.log('\nID does not already exist, creating data');
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

    console.log('Data added');
  } catch (error) {
    console.error(error);
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
      console.log('\nID already exists, updating data');
    } else {
      console.log('\nID does not already exist, creating data');
    }

    jsonData[id] = check;

    await fs.writeFile('data\\check.json', JSON.stringify(jsonData), 'utf8');

    console.log('Data updated');
  } catch (error) {
    console.error(error);
  }
}

app.post('/ut-stats', async (req, res) => {
  try {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(`\n\n\n[${currentTime}] New HTTP POST request (/ut-stats):\nJSON:`);

    const jsonDataPost = JSON.stringify(req.body, null, 2);

    console.log(jsonDataPost);
    console.log('JSON End\n');

    const { id, version, build, utsversion, pcyear, weirdpc, defaultos, osversion, lang, launchmode, trayena, isdeb, wifiena } = req.body;

    console.log('ID:', id);
    console.log('Version:', version);
    console.log('Build:', build);
    console.log('UTS Version:', utsversion);
    console.log('PC Year:', pcyear);
    console.log('Weird PC:', weirdpc);
    console.log('Default OS:', defaultos);
    console.log('OS Version:', osversion);
    console.log('Lang:', lang);
    console.log('Launch Mode:', launchmode);
    console.log('Tray Enabled:', trayena);
    console.log('Debug version:', isdeb);
    console.log('Wifi Sync Enabled:', wifiena);

    await updateID(id, version, build, utsversion, pcyear, weirdpc, defaultos, osversion, lang, launchmode, trayena, isdeb, wifiena);
    await formatJSONFile('data\\id.json', 'data\\id.formatted.json');

    console.log('Done !');
    res.send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ut-stats/usage', async (req, res) => {
  try {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(`\n\n\n[${currentTime}] New HTTP POST request (/ut-stats/usage):\nJSON:`);

    const jsonDataPost = JSON.stringify(req.body, null, 2);

    console.log(jsonDataPost);
    console.log('JSON End\n');

    const { id, action } = req.body;

    console.log('ID:', id);
    console.log('Action:', action);

    await updateUsage(id, action);
    await formatJSONFile('data\\usage.json', 'data\\usage.formatted.json');

    console.log('Done !');
    res.send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ut-stats/crash', async (req, res) => {
  try {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(`\n\n\n[${currentTime}] New HTTP POST request (/ut-stats/crash):\nJSON:`);

    const jsonDataPost = JSON.stringify(req.body, null, 2);

    console.log(jsonDataPost);
    console.log('JSON End\n');

    const { id, version, build, utsversion, isdeb, crashid, message } = req.body;

    console.log('ID:', id);
    console.log('Version:', version);
    console.log('Build:', build);
    console.log('UTS Version:', utsversion);
    console.log('Debug version:', isdeb);
    console.log('Crash ID:', crashid);
    console.log('Message:', message);

    await updateCrash(id, version, build, utsversion, isdeb, crashid, message);
    await formatJSONFile('data\\crash.json', 'data\\crash.formatted.json');

    console.log('Done !');
    res.send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ut-stats/crash/logs', async (req, res) => {
  try {
    const crashid = req.headers['crashid'];
    const logstext = req.body;
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(`\n\n\n[${currentTime}] New HTTP POST request (/ut-stats/crash/logs):\n`);
    console.log(`Crash ID: ${crashid}`);

    await fs.writeFile(`data\\crash\\${crashid}.log`, logstext, 'utf8');
    
    console.log('Done !');
    res.send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ut-stats/check', async (req, res) => {
  try{
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(`\n\n\n[${currentTime}] New HTTP POST request (/ut-stats/check):\nJSON:`);

    const jsonDataPost = JSON.stringify(req.body, null, 2);

    console.log(jsonDataPost);
    console.log('JSON End\n');

    const { id, check } = req.body;

    console.log('ID:', id);
    console.log('Check:', check);
    
    await updateCheck(id, check);
    await formatJSONFile('data\\check.json', 'data\\check.formatted.json');

    console.log('Done !');
    res.send('OK');
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/ut-stats', async (req, res) => {
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

app.listen(3000, () => {
  console.log('Server started, port 3000');
});
