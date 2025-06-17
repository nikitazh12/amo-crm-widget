function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const templateId = data.templateId;
  
  try {
    // Копируем шаблон
    const documentCopy = DriveApp.getFileById(templateId).makeCopy();
    const doc = DocumentApp.openById(documentCopy.getId());
    const body = doc.getBody();
    
    // Заменяем плейсхолдеры
    Object.keys(data.lead).forEach(key => {
      body.replaceText(`{{lead.${key}}}`, data.lead[key] || '');
    });
    
    Object.keys(data.contact).forEach(key => {
      body.replaceText(`{{contact.${key}}}`, data.contact[key] || '');
    });
    
    doc.saveAndClose();
    
    // Делаем документ доступным по ссылке
    documentCopy.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      url: documentCopy.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
