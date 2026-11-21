function onOpen() {
  const menu = SpreadsheetApp.getUi().createMenu('⚔️ XForces Tools');

  if (typeof openGuildWarModal === 'function') {
    menu.addItem('⚔️ Upload Guild War', 'openGuildWarModal');
  }
  if (typeof openBossModal === 'function') {
    menu.addItem('👹 Upload Expedition Boss', 'openBossModal');
  }

  menu.addToUi();
}