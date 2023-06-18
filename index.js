const express = require('express');
const app = express();
const fs = require('fs').promises;
const prettier = require('prettier');
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

async function updateJSON(id, lang, launchmode, trayena) {
  try {
    const data = await fs.readFile('data\\id.json', 'utf8');
    let jsonData = JSON.parse(data);

    if (jsonData.hasOwnProperty(id)) {
      jsonData[id].lang = lang;
      jsonData[id].launch.normal += launchmode === 'normal' ? 1 : 0;
      jsonData[id].launch.tray += launchmode === 'tray' ? 1 : 0;
      jsonData[id].trayena = trayena;
    } else {
      jsonData[id] = {
        launch: {
          normal: launchmode === 'normal' ? 1 : 0,
          tray: launchmode === 'tray' ? 1 : 0
        },
        lang: lang,
        trayena: trayena
      };
    }

    await fs.writeFile('data\\id.json', JSON.stringify(jsonData), 'utf8');
    console.log('\nData updated');
  } catch (error) {
    console.error(error);
  }
}

app.post('/ut-stats', async (req, res) => {
  const release = await mutex.acquire();
  try {
    console.log('\n\nNew request:');
    const jsonData = req.body;
    console.log('\nJSON:');
    const jsonDataPost = jsonData;
    console.log(jsonDataPost);
    console.log('JSON End\n');

    const { id, lang, launchmode, trayena } = req.body;

    console.log('ID:', id);
    console.log('Lang:', lang);
    console.log('Launchmode:', launchmode);
    console.log('Trayena:', trayena);

    await updateJSON(id, lang, launchmode, trayena);
    await formatJSONFile('data\\id.json', 'data\\id.json');
    res.send('Ok');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    release();
  }
});

app.listen(3000, () => {
  console.log('Server started, port 3000');
});
