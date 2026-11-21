function openBossModal() {
  const html = HtmlService.createHtmlOutputFromFile('ExpeditionBoss')
    .setWidth(1400)
    .setHeight(800)
    .setTitle('XForces Expedition Boss Logger');
  SpreadsheetApp.getUi().showModalDialog(html, '👹 XForces Expedition Boss Logger');
}

function getBossConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  let members = [];

  const excludedTabs = new Set(['Template', 'Expedition Boss', 'Expedition Boss Log']);
  sheets.forEach(s => {
    const name = s.getName().trim();
    const isWarTab = /^Season \d+$/i.test(name) || /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(name);
    if (!excludedTabs.has(name) && isWarTab) {
      const vals = s.getRange(4, 1, 30, 1).getValues().flat().filter(Boolean);
      if (vals.length > 0) members = vals.map(v => String(v).trim());
    }
  });

  const bossSeasons = [];
  const bossSheet = ss.getSheetByName('Expedition Boss Log');
  if (bossSheet) {
    const headers = bossSheet.getRange(1, 1, 1, bossSheet.getLastColumn()).getValues()[0];
    for (let c = 1; c < headers.length; c++) {
      const h = String(headers[c]).trim();
      if (h && h !== 'หมายเหตุ' && h.toLowerCase() !== 'note') bossSeasons.push(h);
    }
  }

  let currentGuildRank = '';
  const dashboardSheet = ss.getSheetByName('Expedition Boss');
  if (dashboardSheet) {
    currentGuildRank = dashboardSheet.getRange('D5').getValue();
  }

  return { members, bossSeasons, currentGuildRank };
}

function saveBossData(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Expedition Boss Log');
  if (!sheet) throw new Error('Sheet not found: Expedition Boss Log');

  const targetSeason = String(payload.bossSeason).trim();
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());

  let targetCol = headers.indexOf(targetSeason) + 1;
  if (targetCol === 0) {
    const noteColIdx = headers.findIndex(h => h === 'หมายเหตุ' || h.toLowerCase() === 'note');
    if (noteColIdx !== -1) {
      targetCol = noteColIdx + 1;
      sheet.insertColumnBefore(targetCol);
    } else {
      targetCol = lastCol + 1;
    }
    sheet.getRange(1, targetCol).setValue(targetSeason);
    if (targetCol > 2) {
      sheet.getRange(1, targetCol - 1).copyFormatToRange(sheet, targetCol, targetCol, 1, 1);
    }
  }

  const lastRow = sheet.getLastRow();
  const existingNames = lastRow >= 2 
    ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().map(n => String(n).trim()) 
    : [];

  const rowMap = {};
  existingNames.forEach((name, idx) => {
    if (name) rowMap[name] = 2 + idx;
  });

  let updatedCount = 0;
  payload.records.forEach(rec => {
    if (!rec.ign) return;
    let targetRow = rowMap[rec.ign];
    if (!targetRow) {
      targetRow = sheet.getLastRow() + 1;
      sheet.getRange(targetRow, 1).setValue(rec.ign);
      for (let c = 2; c < targetCol; c++) {
        sheet.getRange(targetRow, c).setValue('-');
      }
      rowMap[rec.ign] = targetRow;
    }
    const cell = sheet.getRange(targetRow, targetCol);
    cell.setValue(Number(rec.score));
    cell.setNumberFormat('#,##0');
    updatedCount++;
  });

  const dashboardSheet = ss.getSheetByName('Expedition Boss');
  if (dashboardSheet) {
    dashboardSheet.getRange('D2').setValue(targetSeason);
    if (payload.guildRank !== '' && payload.guildRank !== null && payload.guildRank !== undefined) {
      dashboardSheet.getRange('D5').setValue(Number(payload.guildRank));
    }
  }

  return `Saved Expedition Boss (${targetSeason}) scores for ${updatedCount} members!`;
}