// ===== FLEX FITNESS — Apps Script v2 (form handler + Twilio SMS) =====
// Paste this into Extensions > Apps Script in the connected Google Sheet.
// Replace the Twilio credentials below with real values.
// Then: Deploy > Manage Deployments > Edit (pencil) > New Version > Deploy
// Keep the same deployment so the site's SCRIPT_URL keeps working.
// =====================================================================

// ===== Sheet tab names =====
var CONTACT_SHEET = "Contact";
var CAREERS_SHEET = "Careers";

// ===== Twilio credentials — REPLACE before deploy =====
var TWILIO_SID   = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
var TWILIO_TOKEN = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
var TWILIO_FROM  = "+1XXXXXXXXXX"; // must be E.164, e.g. +19495551234

// ===== Main webhook =====
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.formType === "contact") return handleContact(ss, data);
    if (data.formType === "careers") return handleCareers(ss, data);

    return jsonResponse({ result: "error", message: "Unknown formType" });
  } catch (err) {
    Logger.log("doPost error: " + err.toString());
    return jsonResponse({ result: "error", message: err.toString() });
  }
}

function doGet(e) {
  return jsonResponse({ result: "ready" });
}

// ===== Contact form =====
function handleContact(ss, data) {
  var sheet = ss.getSheetByName(CONTACT_SHEET) || ss.insertSheet(CONTACT_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp", "First Name", "Last Name", "Email",
      "Phone", "Message", "Status", "SMS Result"
    ]);
  }

  var firstName = (data.firstName || "").trim();
  var phone     = (data.phone || "").trim();
  var smsResult = "Not attempted";

  if (phone.replace(/[^0-9]/g, "").length >= 10) {
    smsResult = sendSMS(phone, firstName);
  }

  sheet.appendRow([
    new Date(),
    firstName,
    (data.lastName || "").trim(),
    (data.email || "").trim(),
    phone,
    (data.message || "").trim(),
    "New",
    smsResult
  ]);

  return jsonResponse({ result: "success", sms: smsResult });
}

// ===== Careers form =====
function handleCareers(ss, data) {
  var sheet = ss.getSheetByName(CAREERS_SHEET) || ss.insertSheet(CAREERS_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp", "Full Name", "Email", "Phone", "City",
      "Position", "Currently Employed", "Previous Gym Experience",
      "Years of Experience", "Required Qualities", "Personal Qualities",
      "Status"
    ]);
  }
  sheet.appendRow([
    new Date(),
    (data.fullName              || "").trim(),
    (data.email                 || "").trim(),
    (data.phone                 || "").trim(),
    (data.city                  || "").trim(),
    (data.position              || "").trim(),
    (data.currentlyEmployed     || "").trim(),
    (data.previousGymExperience || "").trim(),
    (data.yearsOfExperience     || "").trim(),
    (data.requiredQualities     || "").trim(),
    (data.personalQualities     || "").trim(),
    "New"
  ]);
  return jsonResponse({ result: "success" });
}

// ===== Twilio SMS =====
function sendSMS(rawPhone, firstName) {
  var to = toE164(rawPhone);
  if (!to) return "Failed: invalid phone";

  var greeting = firstName ? ("Hey " + firstName + "!") : "Hey there!";
  var body =
    greeting + " Thanks for reaching out to Flex Fitness OC.\n\n" +
    "Location: 23641 Ridge Route Dr, Suite B, Laguna Hills, CA 92653\n" +
    "Hours: Mon-Fri 5AM-8PM | Sat-Sun 8AM-5PM\n\n" +
    "Memberships:\n" +
    "- Staffed Hours: $84.95/mo\n" +
    "- 24/7 Access: $124.95/mo\n\n" +
    "Reply to this text with any questions and a team member will be in touch.\n\n" +
    "- Flex Fitness Team";

  var url = "https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_SID + "/Messages.json";
  var options = {
    method: "post",
    headers: {
      "Authorization": "Basic " + Utilities.base64Encode(TWILIO_SID + ":" + TWILIO_TOKEN)
    },
    payload: { "To": to, "From": TWILIO_FROM, "Body": body },
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    var text = response.getContentText();
    Logger.log("Twilio status=" + code + " body=" + text);

    if (code >= 200 && code < 300) {
      var parsed = {};
      try { parsed = JSON.parse(text); } catch (_) {}
      return "Sent (sid=" + (parsed.sid || "?") + ")";
    }
    var err = {};
    try { err = JSON.parse(text); } catch (_) {}
    return "Failed: code=" + (err.code || code) + " " + (err.message || text).substring(0, 200);
  } catch (e) {
    Logger.log("SMS fetch exception: " + e.toString());
    return "Failed: " + e.toString();
  }
}

function toE164(raw) {
  var d = (raw || "").replace(/[^0-9]/g, "");
  if (d.length === 11 && d.charAt(0) === "1") return "+" + d;
  if (d.length === 10) return "+1" + d;
  return null;
}

// ===== Utility =====
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== TEST FUNCTIONS (run directly from the editor) =====

// 1. Verifies your TWILIO_SID and TWILIO_TOKEN without sending anything.
//    Run this FIRST. If it returns 200, creds are good.
function testCredentials() {
  var url = "https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_SID + ".json";
  var options = {
    method: "get",
    headers: { "Authorization": "Basic " + Utilities.base64Encode(TWILIO_SID + ":" + TWILIO_TOKEN) },
    muteHttpExceptions: true
  };
  var r = UrlFetchApp.fetch(url, options);
  Logger.log("== testCredentials ==");
  Logger.log("Status: " + r.getResponseCode());
  Logger.log("Body:   " + r.getContentText());
}

// 2. Send a real test SMS. Put your own number in TEST_PHONE first.
function testSMS() {
  var TEST_PHONE = "+1XXXXXXXXXX"; // your cell phone in E.164
  var result = sendSMS(TEST_PHONE, "Daniel");
  Logger.log("== testSMS ==");
  Logger.log("Result: " + result);
}
