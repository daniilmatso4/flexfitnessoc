// ===== FLEX FITNESS — Google Apps Script Form Handler =====
// Paste this into Extensions > Apps Script in your Google Sheet.
//
// SETUP:
// 1. Create a Google Sheet named "Flex Fitness Leads"
// 2. Tab 1: "Contact" | Tab 2: "Careers"
// 3. Paste this script in Extensions > Apps Script
// 4. Deploy > New Deployment > Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the web app URL and give it to me
// ============================================================

var CONTACT_SHEET = "Contact";
var CAREERS_SHEET = "Careers";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var formType = data.formType;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet;
    var row;
    var timestamp = new Date();

    if (formType === "contact") {
      sheet = ss.getSheetByName(CONTACT_SHEET);

      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "Timestamp", "First Name", "Last Name", "Email",
          "Phone", "Message", "Status", "Follow-up Sent"
        ]);
      }

      row = [
        timestamp,
        data.firstName || "",
        data.lastName  || "",
        data.email     || "",
        data.phone     || "",
        data.message   || "",
        "New",
        "No"
      ];

    } else if (formType === "careers") {
      sheet = ss.getSheetByName(CAREERS_SHEET);

      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "Timestamp", "Full Name", "Email", "Phone", "City",
          "Position", "Currently Employed", "Previous Gym Experience",
          "Years of Experience", "Required Qualities", "Personal Qualities",
          "Status"
        ]);
      }

      row = [
        timestamp,
        data.fullName              || "",
        data.email                 || "",
        data.phone                 || "",
        data.city                  || "",
        data.position              || "",
        data.currentlyEmployed     || "",
        data.previousGymExperience || "",
        data.yearsOfExperience     || "",
        data.requiredQualities     || "",
        data.personalQualities     || "",
        "New"
      ];

    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", message: "Unknown formType" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: "ready" }))
    .setMimeType(ContentService.MimeType.JSON);
}
