const express = require('express');
const app = express();
const fs = require('fs').promises;
const prettier = require('prettier');
const moment = require('moment');
app.use(express.json());

//Function to format JSON
async function formatJSONFile(inputFilePath, outputFilePath) {
  try {
    const data = await fs.readFile(inputFilePath, 'utf8');
    const jsonData = JSON.parse(data);
    const formattedJSON = prettier.format(JSON.stringify(jsonData), { parser: 'json' });

    await fs.writeFile(outputFilePath, formattedJSON, 'utf8');
    console.log(`JSON formated\n`);
  } catch (error) {
  }
}

//Function to update data in JSON
async function updateJSON(id, version, build, lang, launchmode, trayena, isdeb) {
  try {
    const data = await fs.readFile('data\\id.json', 'utf8');
    let jsonData = JSON.parse(data);

    if (jsonData.hasOwnProperty(id)) {
      console.log('\nID already exist, updating data');
      jsonData[id].version = version;
      jsonData[id].build = build;
      jsonData[id].lang = lang;
      jsonData[id].launch.normal += launchmode === 'normal' ? 1 : 0;
      jsonData[id].launch.tray += launchmode === 'tray' ? 1 : 0;
      jsonData[id].trayena = trayena;
      jsonData[id].isdeb = isdeb;
    } else {
      console.log('\nID does not already exist, creating data');
      jsonData[id] = {
        launch: {
          normal: launchmode === 'normal' ? 1 : 0,
          tray: launchmode === 'tray' ? 1 : 0
        },
        version: version,
        build: build,
        lang: lang,
        trayena: trayena,
        isdeb: isdeb
      };
    }

    await fs.writeFile('data\\id.json', JSON.stringify(jsonData), 'utf8');
    console.log('Data updated');
  } catch (error) {
    console.error(error);
  }
}

app.post('/ut-stats', async (req, res) => {
  try {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log('\n\n\n[', currentTime, ']  New HTTP POST request:');
    const jsonData = req.body;
    console.log('\nJSON:');
    const jsonDataPost = jsonData;
    console.log(jsonDataPost);
    console.log('JSON End\n');

    const { id, version, build, lang, launchmode, trayena, isdeb } = req.body;

    console.log('ID:', id);
    console.log('Version:', version);
    console.log('Build:', build);
    console.log('Lang:', lang);
    console.log('Launch Mode:', launchmode);
    console.log('Tray Enabled:', trayena);
    console.log('Debug version:', isdeb);

    await updateJSON(id, version, build, lang, launchmode, trayena, isdeb);
    await formatJSONFile('data\\id.json', 'data\\id.formatted.json')
    console.log('Done !')
    res.send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
  }
});

app.get('/ut-stats', async (req, res) => {
  const repconst = 'Unowhy Tools Stats by STY1001 │ https://github.com/STY1001/Unowhy-Tools-Stats │ API is OK';
  res.setHeader('Content-Type', 'application/json');
  res.send(repconst);
});

app.get('/ut-stats/get-stats', async (req, res) => {
  const inputFilePath = 'data\\id.json';
  const data = await fs.readFile(inputFilePath, 'utf8');
  const jsonData = JSON.parse(data);

  const idCount = Object.keys(jsonData).length;
  let isdebCount = 0;
  for (const id in jsonData) {
    if (jsonData[id].isdeb === true) {
      isdebCount++;
    }
  }
  let launchnCount = 0;
  let launchtCount = 0;
  for (const id in jsonData) {
    launchnCount = launchnCount + jsonData[id].launch.normal;
    launchtCount = launchtCount + jsonData[id].launch.tray;
  }

  const repconst = {
    "idcount": idCount,
    "isdebcount": isdebCount,
    "versioncount": {
    },
    "buildcount": {
    },
    "launchcount": {
      "normal": launchnCount,
      "tray": launchtCount
    },
  };

  for (const id in jsonData) {
    const version = jsonData[id].version;
    if (repconst.versioncount[version]) {
      repconst.versioncount[version]++;
    } else {
      repconst.versioncount[version] = 1;
    }
  }

  for (const id in jsonData) {
    const build = jsonData[id].build;
    if (repconst.buildcount[build]) {
      repconst.buildcount[build]++;
    } else {
      repconst.buildcount[build] = 1;
    }
  }

  const repconstString = JSON.stringify(repconst, null, 2);
  res.setHeader('Content-Type', 'application/json');
  res.send(repconstString);
});

app.listen(3000, () => {
  console.log('Server started, port 3000');
});
