const express = require('express');
const app = express();
const fs = require('fs').promises;
const prettier = require('prettier');
const moment = require('moment');
app.use(express.json());

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
    console.log('Done !')
    res.send('Ok');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
  }
});

app.listen(3000, () => {
  console.log('Server started, port 3000');
});
