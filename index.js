const express = require('express');
const app = express();
const fsall = require('fs');
const fs = require('fs').promises;
const moment = require('moment');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config();

const port = process.env.PORT || 3000;
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ut_stats',
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0
};
app.use(express.json());
app.use(express.text({ limit: '16mb' }));


write2log(`UT Stats server\nby STY1001\nStarting...`);

if (!fsall.existsSync('logs')) {
  fsall.mkdirSync('logs');
  write2log('Created logs directory');
}

// Connect to the database
write2log(`Connecting to database at ${dbConfig.host}...`);
const dbConnection = mysql.createPool(dbConfig);

/**
 * Function to log to a file and to the console
 * @param {string} log - The log to write
 */
function write2log(log) {
  console.log(`${log}`);
  fsall.appendFileSync(path.join('logs', 'logs.log'), `${log}\n`);
}

/**
 * Function to log error to a file and to the console
 * @param {string} error - The error to write
 */
function write2error(error) {
  console.error(`${error}`);
  fsall.appendFileSync(path.join('logs', 'errors.log'), `${error}\n`);
}

/**
 * Function to check if a string is a valid UUID
 * @param {string} id - The string to check
 * @return {boolean} - Returns true if the string is a valid UUID, false otherwise
 */
function isUUID(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Function to log a new request
 * @param {object} req - The request object
 */
function logNewRequest(req) {
  const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
  write2log(`\n[${currentTime}] New ${req.method} request (${req.originalUrl})`);
}

/**
 * Function to check if a string contains prototype pollution
 * @param {string} str - The string to check
 * @return {boolean} - Returns true if the string contains prototype pollution, false otherwise
 */
function isProtoPollution(str) {
  const protoPollutionRegex = /__proto__|constructor|prototype/;
  return protoPollutionRegex.test(str);
}

/**
 * Function to normalize booleans in an object
 * @param {object} obj - The object to normalize
 * @return {object} - Returns the object with normalized booleans
 */
function normalizeBooleans(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      if (obj[key].toLowerCase() === 'true') {
        obj[key] = true;
      } else if (obj[key].toLowerCase() === 'false') {
        obj[key] = false;
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      normalizeBooleans(obj[key]);
    }
  }
  return obj;
}

app.post('/ut-stats', async (req, res) => {
  try {
    logNewRequest(req);
    if (isProtoPollution(JSON.stringify(req.body))) {
      write2error('Prototype pollution detected in request body');
      res.status(400).send('Invalid request');
      return;
    }
    const normalizedBody = normalizeBooleans(req.body);
    const { id, version, build, utsversion, pcmodel, weirdpc, defaultos, osversion, lang, launchmode, trayena, isdeb, wifiena } = normalizedBody;
    if (!isUUID(id)) {
      write2error(`Invalid ID format: ${id}`);
      res.status(400).send('Invalid request');
      return;
    }

    write2log(`ID: ${id}\nVersion: ${version}\nBuild: ${build}\nUTS Version: ${utsversion}\nPC Model: ${pcmodel}\nWeird PC: ${weirdpc}\nDefault OS: ${defaultos}\nOS Version: ${osversion}\nLang: ${lang}\nLaunch Mode: ${launchmode}\nTray Enabled: ${trayena}\nDebug version: ${isdeb}\nWifi Sync Enabled: ${wifiena}`);

    const sql1 = `INSERT INTO ids (id, version, build, utsversion, pcmodel, weirdpc, defaultos, osversion, lang, trayena, isdeb, wifiena, lastrequest)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    version = VALUES(version),
    build = VALUES(build),
    utsversion = VALUES(utsversion),
    pcmodel = VALUES(pcmodel),
    weirdpc = VALUES(weirdpc),
    defaultos = VALUES(defaultos),
    osversion = VALUES(osversion),
    lang = VALUES(lang),
    trayena = VALUES(trayena),
    isdeb = VALUES(isdeb),
    wifiena = VALUES(wifiena),
    lastrequest = VALUES(lastrequest);`
    const lastRequest = moment().format('YYYY-MM-DD HH:mm:ss');
    const values = [id, version, build, utsversion, pcmodel, weirdpc, defaultos, osversion, lang, trayena, isdeb, wifiena, lastRequest];

    try {
      await dbConnection.execute(sql1, values);
      write2log(`Data for ID ${id} updated successfully.`);
    } catch (dbError) {
      write2error(`Database error: ${dbError}`);
      res.status(500).send('Database error');
      return;
    }

    if (launchmode === 'tray') {
      const sql2 = `INSERT INTO launches(id, normal, tray)
      VALUES (?, 0, 1) 
      ON DUPLICATE KEY UPDATE tray = tray + 1;`;
      const values2 = [id];
      try {
        await dbConnection.execute(sql2, values2);
        write2log(`Tray launch count for ID ${id} updated successfully.`);
      } catch (dbError) {
        write2error(`Database error: ${dbError}`);
        res.status(500).send('Database error');
        return;
      }
    }
    if (launchmode === 'normal') {
      const sql2 = `INSERT INTO launches(id, normal, tray)
      VALUES (?, 1, 0) 
      ON DUPLICATE KEY UPDATE normal = normal + 1;`;
      const values2 = [id];
      try {
        await dbConnection.execute(sql2, values2);
        write2log(`Normal launch count for ID ${id} updated successfully.`);
      } catch (dbError) {
        write2error(`Database error: ${dbError}`);
        res.status(500).send('Database error');
        return;
      }
    }

    write2log('Done !');
    res.send('OK');
  } catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ut-stats/usage', async (req, res) => {
  try {
    logNewRequest(req);
    if (isProtoPollution(JSON.stringify(req.body))) {
      write2error('Prototype pollution detected in request body');
      res.status(400).send('Invalid request');
      return;
    }
    const { id, action } = req.body;
    if (!isUUID(id)) {
      write2error(`Invalid ID format: ${id}`);
      res.status(400).send('Invalid ID');
      return;
    }

    write2error(`ID: ${id}\nAction: ${action}`);

    const sql = `INSERT INTO usages (id, action, count)
    VALUES (?, ?, 1)
    ON DUPLICATE KEY UPDATE count = count + 1;`;
    const values = [id, action];
    try {
      await dbConnection.execute(sql, values);
      write2log(`Usage action ${action} for ID ${id} updated successfully.`);
    }
    catch (dbError) {
      write2error(`Database error: ${dbError}`);
      res.status(500).send('Database error');
      return;
    }

    write2log('Done !');
    res.send('OK');
  } catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ut-stats/crash', async (req, res) => {
  try {
    logNewRequest(req);
    if (isProtoPollution(JSON.stringify(req.body))) {
      write2error('Prototype pollution detected in request body');
      res.status(400).send('Invalid request');
      return;
    }
    const normalizedBody = normalizeBooleans(req.body);
    const { id, version, build, utsversion, isdeb, crashid, message } = normalizedBody;
    if (!isUUID(id)) {
      write2error(`Invalid ID format: ${id}`);
      res.status(400).send('Invalid ID');
      return;
    }
    if (!isUUID(crashid)) {
      write2error(`Invalid Crash ID format: ${crashid}`);
      res.status(400).send('Invalid Crash ID');
      return;
    }
    write2log(`ID: ${id}\nVersion: ${version}\nBuild: ${build}\nUTS Version: ${utsversion}\nDebug version: ${isdeb}\nCrash ID: ${crashid}\nMessage: ${message}`);

    const sql = `INSERT INTO crashes (id, version, build, utsversion, isdeb, crash, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    version = VALUES(version),
    build = VALUES(build),
    utsversion = VALUES(utsversion),
    isdeb = VALUES(isdeb),
    crash = VALUES(crash),
    message = VALUES(message);`;
    const values = [id, version, build, utsversion, isdeb, crashid, message];
    try {
      await dbConnection.execute(sql, values);
      write2log(`Crash data for ID ${id} updated successfully.`);
    } catch (dbError) {
      write2error(`Database error: ${dbError}`);
      res.status(500).send('Database error');
      return;
    }

    write2log('Done !');
    res.send('OK');
  } catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ut-stats/crash/logs', async (req, res) => {
  try {
    logNewRequest(req);
    if (isProtoPollution(JSON.stringify(req.body))) {
      write2error('Prototype pollution detected in request body');
      res.status(400).send('Invalid request');
      return;
    }
    const crashid = req.headers['crashid'];
    if (!isUUID(crashid)) {
      write2error(`Invalid Crash ID format: ${crashid}`);
      res.status(400).send('Invalid Crash ID');
      return;
    }

    const logstext = req.body;
    write2log(`Crash ID: ${crashid}`);

    const sql = `INSERT INTO logs (crash, log)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE
    log = VALUES(log);`;
    const values = [crashid, logstext];
    try {
      await dbConnection.execute(sql, values);
      write2log(`Logs for Crash ID ${crashid} updated successfully.`);
    }
    catch (dbError) {
      write2error(`Database error: ${dbError}`);
      res.status(500).send('Database error');
      return;
    }

    write2log('Done !');
    res.send('OK');
  } catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ut-stats/check', async (req, res) => {
  try {
    logNewRequest(req);
    if (isProtoPollution(JSON.stringify(req.body))) {
      write2error('Prototype pollution detected in request body');
      res.status(400).send('Invalid request');
      return;
    }
    const { id, check } = req.body;
    if (!isUUID(id)) {
      write2error(`Invalid ID format: ${id}`);
      res.status(400).send('Invalid ID');
      return;
    }

    write2log(`ID: ${id}\nCheck:`);
    for (const [key, value] of Object.entries(check)) {
      write2log(`  ${key}: ${value}`);
    }

    for (const [key, value] of Object.entries(check)) {
      const sql = `INSERT INTO checks (id, variable, value)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
      value = VALUES(value);`;
      const values = [id, key, value];
      try {
        await dbConnection.execute(sql, values);
      } catch (dbError) {
        write2error(`Database error: ${dbError}`);
        res.status(500).send('Database error');
        return;
      }
    }
    write2log(`Checks for ID ${id} updated successfully.`);

    write2log('Done !');
    res.send('OK');
  }
  catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/ut-stats', async (req, res) => {
  logNewRequest(req);

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
  try {
    logNewRequest(req);

    const oneMonthAgo = moment().subtract(1, 'months').format('YYYY-MM-DD');

    const scopes = {
      total: 'WHERE 1',
      active: `WHERE ids.lastrequest IS NOT NULL AND ids.lastrequest > '${oneMonthAgo}'`,
      outdated: `WHERE ids.lastrequest IS NULL OR ids.lastrequest <= '${oneMonthAgo}'`
    };

    const result = {};

    for (const [key, where] of Object.entries(scopes)) {
      const [idcount] = await dbConnection.execute(`SELECT COUNT(*) AS count FROM ids ${where}`);
      const [isdebcount] = await dbConnection.execute(`SELECT COUNT(*) AS count FROM ids ${where && where + ' AND isdeb = 1'}`);
      const [trayenacount] = await dbConnection.execute(`SELECT COUNT(*) AS count FROM ids ${where && where + ' AND trayena = 1'}`);
      const [wifienacount] = await dbConnection.execute(`SELECT COUNT(*) AS count FROM ids ${where && where + ' AND wifiena = 1'}`);
      const [defaultoscount] = await dbConnection.execute(`SELECT COUNT(*) AS count FROM ids ${where && where + ' AND defaultos = 1'}`);
      const [weirdpccount] = await dbConnection.execute(`SELECT COUNT(*) AS count FROM ids ${where && where + ' AND weirdpc = 1'}`);

      const [versioncount] = await dbConnection.execute(`SELECT version, COUNT(*) AS count FROM ids ${where} GROUP BY version ORDER BY version ASC`);
      const [buildcount] = await dbConnection.execute(`SELECT build, COUNT(*) AS count FROM ids ${where} GROUP BY build ORDER BY build ASC`);
      const [utsversioncount] = await dbConnection.execute(`SELECT utsversion, COUNT(*) AS count FROM ids ${where} GROUP BY utsversion ORDER BY utsversion ASC`);
      const [pcmodelcount] = await dbConnection.execute(`SELECT pcmodel, COUNT(*) AS count FROM ids ${where} GROUP BY pcmodel ORDER BY pcmodel ASC`);
      const [osversioncount] = await dbConnection.execute(`SELECT osversion, COUNT(*) AS count FROM ids ${where} GROUP BY osversion ORDER BY osversion ASC`);
      const [langcount] = await dbConnection.execute(`SELECT lang, COUNT(*) AS count FROM ids ${where} GROUP BY lang ORDER BY lang ASC`);

      const formatGroup = (rows, field) =>
        rows.reduce((acc, row) => {
          acc[row[field]] = Number(row.count);
          return acc;
        }, {});

      result[key] = {
        id: Number(idcount[0].count),
        isdeb: Number(isdebcount[0].count),
        trayena: Number(trayenacount[0].count),
        wifiena: Number(wifienacount[0].count),
        defaultos: Number(defaultoscount[0].count),
        weirdpc: Number(weirdpccount[0].count),
        version: formatGroup(versioncount, 'version'),
        build: formatGroup(buildcount, 'build'),
        utsversion: formatGroup(utsversioncount, 'utsversion'),
        pcmodel: formatGroup(pcmodelcount, 'pcmodel'),
        osversion: formatGroup(osversioncount, 'osversion'),
        lang: formatGroup(langcount, 'lang')
      };
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  }
  catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/ut-stats/get-stats/launch', async (req, res) => {
  try {
    logNewRequest(req);

    const [normalLaunches] = await dbConnection.execute(`SELECT SUM(normal) AS count FROM launches`);
    const [trayLaunches] = await dbConnection.execute(`SELECT SUM(tray) AS count FROM launches`);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      total: Number(trayLaunches[0].count) + Number(normalLaunches[0].count),
      mode: {
        normal: Number(normalLaunches[0].count),
        tray: Number(trayLaunches[0].count)
      }
    }, null, 2));
  }
  catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/ut-stats/get-stats/usage', async (req, res) => {
  try {
    logNewRequest(req);

    const [usage] = await dbConnection.execute(`SELECT action, SUM(count) AS count FROM usages GROUP BY action ORDER BY action ASC`);

    const usageCount = usage.reduce((acc, row) => {
      acc[row.action] = Number(row.count);
      return acc;
    }, {});

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      total: Object.values(usageCount).reduce((sum, count) => sum + count, 0),
      action: usageCount
    }, null, 2));
  }
  catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/ut-stats/get-stats/check', async (req, res) => {
  try {
    logNewRequest(req);

    const [checks] = await dbConnection.execute(`SELECT variable, value, COUNT(*) AS count FROM checks GROUP BY variable, value ORDER BY variable ASC`);

    const checkCount = checks.reduce((acc, row) => {
      if (!acc[row.variable]) {
        acc[row.variable] = {};
      }
      acc[row.variable][row.value] = Number(row.count);
      return acc;
    }, {});

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(checkCount, null, 2));
  }
  catch (error) {
    write2error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  write2log(`Started on port ${port}\n`);
});
