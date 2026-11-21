function openGuildWarModal() {
  const html = HtmlService.createHtmlOutputFromFile('GuildWar')
    .setWidth(1400)
    .setHeight(800)
    .setTitle('XForces Guild War Logger');
  SpreadsheetApp.getUi().showModalDialog(html, '⚔️ XForces Guild War Logger');
}

function getGuildWarConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const seasons = [];
  let members = [];

  const excludedTabs = new Set(['Template', 'Boss Guild', 'Boss Guild Log']);

  sheets.forEach(s => {
    const name = s.getName().trim();
    const isWarTab = /^Season \d+$/i.test(name) || /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(name);

    if (!excludedTabs.has(name) && isWarTab) {
      seasons.push(name);
      const vals = s.getRange(4, 1, 30, 1).getValues().flat().filter(Boolean);
      if (vals.length > 0) members = vals.map(v => String(v).trim());
    }
  });

  return { seasons, members };
}

function saveGuildWarData(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(payload.season);
  if (!sheet) throw new Error('Sheet not found: ' + payload.season);

  const roundNum = Number(payload.round);
  if (!roundNum || roundNum < 1 || roundNum > 18) {
    throw new Error('กรุณาระบุ War Round ให้ถูกต้อง (1-18)');
  }
  const roundIdx = roundNum - 1;
  const winCol = 2 + (roundIdx * 2);  // Round 1 = Col B (2)
  const loseCol = 3 + (roundIdx * 2); // Round 1 = Col C (3)

  if (typeof payload.sweepAll === 'boolean') {
    sheet.getRange(1, winCol).setValue(payload.sweepAll);
  }

  if (payload.enemyGuild && payload.enemyGuild.trim() !== '') {
    sheet.getRange(37, winCol).setValue(payload.enemyGuild.trim());
  }
  if (payload.ourScore !== '' && payload.enemyScore !== '') {
    sheet.getRange(38, winCol).setValue(`${payload.ourScore} vs ${payload.enemyScore}`);
  }

  const ignRange = sheet.getRange(4, 1, 30, 1).getValues();
  const rowMap = {};
  ignRange.forEach((row, idx) => {
    if (row[0]) rowMap[String(row[0]).trim()] = 4 + idx;
  });

  let updatedCount = 0;
  payload.records.forEach(rec => {
    const targetRow = rowMap[rec.ign];
    if (targetRow) {
      sheet.getRange(targetRow, winCol).setValue(Number(rec.win));
      sheet.getRange(targetRow, loseCol).setValue(Number(rec.lose));
      updatedCount++;
    }
  });

  return `Saved Guild War ${payload.season} (Round ${roundNum}) for ${updatedCount} members!`;
}