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

async function updateJSON(id, lang, launchmod, trayena) {
  try {
    const data = await fs.readFile('data.json', 'utf8');
    let jsonData = JSON.parse(data);

    if (jsonData.hasOwnProperty(id)) {
      jsonData[id].lang = lang;
      jsonData[id].launch.normal += launchmod === 'normal' ? 1 : 0;
      jsonData[id].launch.tray += launchmod === 'tray' ? 1 : 0;
      jsonData[id].trayena = trayena;
    } else {
      jsonData[id] = {
        launch: {
          normal: launchmod === 'normal' ? 1 : 0,
          tray: launchmod === 'tray' ? 1 : 0
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
  const jsonData = req.body;
  console.log('JSON:');
  const jsonDataPost = await formatJSON(jsonData);
  console.log(jsonDataPost);
  console.log('JSON End\n');

  const { id, lang, launchmod, trayena } = req.body;

  console.log('ID:', id);
  console.log('Lang:', lang);
  console.log('Launchmod:', launchmod);
  console.log('Trayena:', trayena);

  await updateJSON(id, lang, launchmod, trayena);
  await formatJSONFile('data\\id.json', 'data\\id.json');
  res.send('Ok');
});

app.listen(3000, () => {
  console.log('Server started, port 3000');
});
