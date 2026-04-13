// ===== FLEX FITNESS — Google Apps Script Form Handler + Twilio SMS =====
// Paste this into Extensions > Apps Script in your Google Sheet.
// Then Deploy > Manage Deployments > Edit > New Version > Deploy
// =====================================================================

var CONTACT_SHEET = "Contact";
var CAREERS_SHEET = "Careers";

// Twilio credentials — paste your real values here in Google Apps Script
// DO NOT commit real credentials to GitHub
var TWILIO_SID = "YOUR_TWILIO_SID";
var TWILIO_TOKEN = "YOUR_TWILIO_TOKEN";
var TWILIO_FROM = "YOUR_TWILIO_PHONE";

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

      sheet.appendRow(row);

      // Send SMS follow-up if phone number provided
      var phone = (data.phone || "").trim();
      var firstName = (data.firstName || "").trim();
      if (phone.length >= 10) {
        try {
          sendFollowUpSMS(phone, firstName);
          // Update "Follow-up Sent" column to "Yes"
          var lastRow = sheet.getLastRow();
          sheet.getRange(lastRow, 8).setValue("Yes");
        } catch (smsErr) {
          Logger.log("SMS error: " + smsErr.toString());
        }
      }

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

      sheet.appendRow(row);

    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", message: "Unknown formType" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendFollowUpSMS(toPhone, firstName) {
  // Format phone number - ensure it starts with +1
  var phone = toPhone.replace(/[^0-9]/g, "");
  if (phone.length === 10) phone = "1" + phone;
  if (phone.charAt(0) !== "+") phone = "+" + phone;

  var greeting = firstName ? ("Hey " + firstName + "!") : "Hey there!";

  var message = greeting + " Thanks for reaching out to Flex Fitness OC! "
    + "Here's what we offer:\n\n"
    + "Location: 23641 Ridge Route Dr, Suite B, Laguna Hills, CA 92653\n"
    + "Hours: Mon-Fri 5AM-8PM | Sat-Sun 8AM-5PM\n\n"
    + "Memberships:\n"
    + "- Staffed Hours: $84.95/mo\n"
    + "- 24/7 Access: $124.95/mo\n\n"
    + "Want to try a FREE session? Reply YES and we'll get you scheduled!\n\n"
    + "- Flex Fitness Team";

  var url = "https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_SID + "/Messages.json";

  var options = {
    method: "post",
    headers: {
      "Authorization": "Basic " + Utilities.base64Encode(TWILIO_SID + ":" + TWILIO_TOKEN)
    },
    payload: {
      "To": phone,
      "From": TWILIO_FROM,
      "Body": message
    },
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  Logger.log("Twilio response: " + response.getContentText());
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: "ready" }))
    .setMimeType(ContentService.MimeType.JSON);
}
