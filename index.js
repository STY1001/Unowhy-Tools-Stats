const express = require('express');
const app = express();
const fs = require('fs').promises;
const prettier = require('prettier');
const moment = require('moment');

app.use(express.json());

/**
 * Function to format a JSON file
 * @param {string} inputFilePath - The path of the input file
 * @param {string} outputFilePath - The path of the output file
 */
async function formatJSONFile(inputFilePath, outputFilePath) {
  try {
    const data = await fs.readFile(inputFilePath, 'utf8');
    const jsonData = JSON.parse(data);
    const formattedJSON = prettier.format(JSON.stringify(jsonData), { parser: 'json' });

    await fs.writeFile(outputFilePath, formattedJSON, 'utf8');

    console.log(`JSON formatted\n`);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Function to update JSON data based on specific parameters
 * @param {string} id - The identifier
 * @param {string} version - The version
 * @param {string} build - The build
 * @param {string} utsversion - The UTS version
 * @param {string} lang - The language
 * @param {string} launchmode - The launch mode
 * @param {boolean} trayena - The tray enabled status
 * @param {boolean} isdeb - The debug version status
 * @param {boolean} wifiena - The WiFi sync enabled status
 */
async function updateJSON(id, version, build, utsversion, lang, launchmode, trayena, isdeb, wifiena) {
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

app.post('/ut-stats', async (req, res) => {
  try {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(`\n\n\n[${currentTime}] New HTTP POST request:\nJSON:`);

    const jsonDataPost = JSON.stringify(req.body, null, 2);

    console.log(jsonDataPost);
    console.log('JSON End\n');

    const { id, version, build, utsversion, lang, launchmode, trayena, isdeb, wifiena } = req.body;

    console.log('ID:', id);
    console.log('Version:', version);
    console.log('Build:', build);
    console.log('UTSVersion:', utsversion);
    console.log('Lang:', lang);
    console.log('Launch Mode:', launchmode);
    console.log('Tray Enabled:', trayena);
    console.log('Debug version:', isdeb);
    console.log('Wifi Sync Enabled:', wifiena);

    await updateJSON(id, version, build, utsversion, lang, launchmode, trayena, isdeb, wifiena);
    await formatJSONFile('data\\id.json', 'data\\id.formatted.json');

    console.log('Done !');
    res.send('OK');
  } catch (error) {
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

  let activeidCount = 0;
  let activeisdebCount = 0;
  let activetrayenaCount = 0;
  let activewifienaCount = 0;
  let activelaunchnCount = 0;
  let activelaunchtCount = 0;

  let outdatedidCount = 0;
  let outdatedisdebCount = 0;
  let outdatedtrayenaCount = 0;
  let outdatedwifienaCount = 0;
  let outdatedlaunchnCount = 0;
  let outdatedlaunchtCount = 0;

  for (const id in jsonData) {
    if (!ignoredJsonData[id]) {
      if (jsonData[id].isdeb) totalisdebCount++;
      if (jsonData[id].trayena) totaltrayenaCount++;
      if (jsonData[id].wifiena) totalwifienaCount++;
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

app.listen(3000, () => {
  console.log('Server started, port 3000');
});
