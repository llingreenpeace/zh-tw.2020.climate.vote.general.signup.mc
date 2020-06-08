```
var gSheetId = "1XBYWec9H79G0titBfH4qil5ZcIlwSNasx2yzohULMEA"
var gets = {}
var posts = {}

// method {string} create|read
// sheetName {string}
// data [{k:v, ...}, ...]

function doGet(e) {
  var e = e || {};
  var params = e.parameter || {};
  var sheetName = params.sheetName || "votes_summary",
    method = params.method || "read";

  var SpreadSheet = SpreadsheetApp.openById(gSheetId);
  var sheet = SpreadSheet.getSheetByName(sheetName);

  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();

  var range= sheet.getRange(1, 1, lastRow, lastColumn);

  var values = range.getValues();
  if (params.sheetName == "notes") {
    values = formatNotesResponse(values);
  } else if (params.sheetName == "epa") {
  // environmental protection agency
    values = formatEPAResponse(values);
  } else if (params.sheetName == "video_serial_number") {
  // serial number exchange
    values = getSerialCodeByEmail(values, params.email);
    if (!values.code) {
      return jsonResponse({
        status: "Error",
        message: values
      })
    }
  }

  var response = {}
  response.status = "OK"
  response.values = values

  return jsonResponse(response)
}

function doPost(e) {
  var postData = e.postData ? JSON.parse(e.postData.contents) : {};
  var sheetName = e.parameter.sheetName

  if ( !sheetName) {
    return jsonResponse({
      status: "Error",
      message: "sheetName is required"
    })
  }

  var SpreadSheet = SpreadsheetApp.openById(gSheetId);
  var sheet = SpreadSheet.getSheetByName(sheetName);
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  var headers = range.getValues();
  var headerRow = headers[0]

  console.log('headers', headers)

  // convert the header column name to its index
  var nameToId = {}
  for (var i = 0; i<headerRow.length; i++) {
    nameToId[headerRow[i]] = i
  }

  // prepare the rows to append
  var rowsToAppend = []
  for (var i = 0; i<postData.rows.length; i++) {
    var row = postData.rows[i]
    var thisRowToAppend = new Array(headerRow.length)

    for (var k in nameToId) {
      if (k in row) {
        thisRowToAppend[nameToId[k]] = row[k]
      } else {
        thisRowToAppend[nameToId[k]] = ""
      }
    }

    if ("created_at" in nameToId) {
      thisRowToAppend[nameToId["created_at"]] = nowDateString();
    }

    rowsToAppend.push(thisRowToAppend)
  }


  // append to the sheet
  if (rowsToAppend.length>0) {
    sheet.getRange(
      sheet.getLastRow()+1, 1,
      rowsToAppend.length, headerRow.length).setValues(rowsToAppend);
  }

  return jsonResponse({
    status: "OK",
    e: e,
    body: postData,
    rowsToAppend: rowsToAppend,
    rowsToAppendlength: rowsToAppend.length,
    headerRow: headerRow,
    headerRowlength: headerRow.length,
    nameToId: nameToId
  })

}

/** HELPER FUNCTIONS **/

function nowDateString () {
  var date = new Date();
  var dateStr =
    date.getFullYear() + "/" +
    ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
    ("00" + date.getDate()).slice(-2)+
    " " +
    ("00" + date.getHours()).slice(-2) + ":" +
    ("00" + date.getMinutes()).slice(-2) + ":" +
    ("00" + date.getSeconds()).slice(-2);

  return dateStr
}

function jsonResponse(response) {
  var JSONString = JSON.stringify(response);
  return ContentService.createTextOutput(JSONString)
      .setMimeType(ContentService.MimeType.JSON);
}

function getSerialCodeByEmail (values, email) {
  
  if (!email) {
    return "email not provided"
  }
  
  var SpreadSheet = SpreadsheetApp.openById(gSheetId);
  var epa = SpreadSheet.getSheetByName("epa");
  var video_serial_number = SpreadSheet.getSheetByName("video_serial_number");
  
  var target = values.filter(function (value) {
    return value[1] === email
  });
  
  var checkEPAEmails = epa.getRange(1, 2, epa.getLastRow(), 1).getValues().map(function (item) {
    return item[0]
  }).indexOf(email);
  
  if (checkEPAEmails === -1) {
    return "該Email尚未參與連署"
  }
  
  if (target.length === 0) {
    
    target = values.filter(function (value, index) {
      value[3] = index + 1
      return !value[1]
    });
        
    if (target.length > 0) {
      target = target[0]
      video_serial_number.getRange(target[3], 2, 1, 2).setValues([[email, nowDateString()]]);
      
      target = video_serial_number.getRange(target[3], 1, 1, 3).getValues();
      
    } else {
      return "序號已兌換完畢"
    }
    
  }
  
  return {
    code: target[0][0],
    email: target[0][1],
    create_at: target[0][2],
  }
  
}


function formatNotesResponse (values) {
  var res = [];
  var random10Old = [];
  var newest20 = [];
  
  values = values.filter(function (value) {
    if (value[3] !== '') {
      return value
    }
  });
  
  if (values.length <= 20) {
    for (var i = 1; i < values.length; i++) {
      var rowData = {
        last_name: values[i][2],
        message: values[i][3],
        created_at: values[i][4]
      };
      if (i < 11) {
        random10Old.push(rowData);
      }
      newest20.push(rowData);
    }
  } else {
    var random10 = getRandom10(1, values.length-10);
    for (var i = 1; i < values.length; i++) {
      if (random10.indexOf(i) != -1) {
        var rowData = {
          last_name: values[i][2],
          message: values[i][3],
          created_at: values[i][4]
        };
        random10Old.push(rowData);
      }
      if (i >= values.length-20) {
        var rowData = {
          last_name: values[i][2],
          message: values[i][3],
          created_at: values[i][4]
        };
        newest20.push(rowData);
      }
    }
  }
  
  return {
    random10Old: random10Old,
    newest20: newest20
  }
}

// EPA for environmental protection agency opinion submit
function formatEPAResponse (values) {

  values = values.filter(function (value) {
    if (value[5] === true) {
      return value
    }
  });

  return values
}

function getRandom10(from, to){
  var listNumbers = [];
  var tenRandomNumbers = [];
  for(var i = from; i <= to; i++) {
    listNumbers.push(i);
  }
  for(var i = 0; i < 10; i++) {
    var index = getRandomNumber(0, listNumbers.length);
    tenRandomNumbers.push(listNumbers[parseInt(index)]);
    listNumbers.splice(index, 1);
  }
  return tenRandomNumbers;
}

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}