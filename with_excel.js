var fs = require('fs');
var xlsx = require('xlsx');
var lodash = require('lodash');
var txtfilePath = process.argv[2];
var excelfilePath = process.argv[3];

var txtfile = '';
var readStream = fs.createReadStream(txtfilePath);
readStream.on('data', function(chunk) { // Get data from textfile
    txtfile += chunk;
}).on('end', function() { // When textfile has been read
    var splitData = txtfile.split('\r\n'); // Split the string on each newline
    var workbook = xlsx.readFile(excelfilePath); // Load the excelfile
    var headerIndexes = [];
    var excelData = sheetToArr(workbook.Sheets.Sheet1);
    var output = [];
    lodash.forEach(splitData, function(split) { // Copy the original array so that the updated values can be put there instead of the original.
        output.push(split);
    });
    var dirname = __dirname;
    var outputBatch = [];
    outputBatch[0] = 0;
    lodash.forEach(excelData, function(row, index) {
       if (index === 0) {
           headerIndexes = getHeaders(row, splitData); // Get the names of the values that will be changed
       } else {
           lodash.forEach(headerIndexes, function(header, index) {
               var value = splitData[header];
               var spaceSplit = value.split(' ');
               var updateValue = Number(row[index]);
               if (updateValue % 1 !== 0 && countDecimals(updateValue) < 4) {
                   updateValue = updateValue.toFixed(4);
               } else if (spaceSplit[spaceSplit.length - 1].indexOf('.') !== -1 && updateValue % 1 === 0) {
                   updateValue = updateValue.toFixed(4);
               }

               var updateValueArray = ("" +updateValue).split("");
               var originalValueArray = ("" + spaceSplit[spaceSplit.length - 1]).split("");
               if (updateValueArray.length > originalValueArray.length) { // If the new value is larger length wise we have to remove some whitespace.
                   for (var m = 0; m < updateValueArray.length - originalValueArray.length; m++) {
                       spaceSplit.splice(spaceSplit.length - 2, 1);
                   }
               } else if (updateValueArray.length < originalValueArray.length) { // If the original value is larger length wise we have to add some whitespace.
                   for (var n = 0; n < originalValueArray.length - updateValueArray.length; n++) {
                       spaceSplit.splice(spaceSplit.length - 2, 0, ' ');
                   }
               }
               spaceSplit[spaceSplit.length - 1] = updateValue;
               output[header] = spaceSplit.join(' ');
           });

           var outputString = output.join('\r\n');
           fs.writeFile('Output_with_excel/' + row[0] + '.txt', outputString, function (err) {
               if (err) {
                   return console.log(err);
               }
               // console.log('Changes saved');
           });
           outputBatch[0] += 1;
           outputBatch.push(dirname + '/Output_with_excel/' + row[0] + '.txt');
       }
    });
    var outputBatchString = outputBatch.join('\r\n');
    fs.writeFile('output_batch.txt', outputBatchString, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('batch created');
    })
});

function getHeaders(row, splitData) {
    var result = [];
    lodash.forEach(row, function(header) { // Find the indexes in the textfile for each attribute that should be changed.
        var index = lodash.findIndex(splitData, function(data) {
            return data.includes(header);
        });
        result.push(index);
    });
    return result;
}


// Gotten from https://stackoverflow.com/questions/17369098/simplest-way-of-getting-the-number-of-decimals-in-a-number-in-javascript
function countDecimals(value) {
    if (Math.floor(value) === value) return 0;
    return value.toString().split(".")[1].length || 0;
}

// Gotten from https://github.com/SheetJS/js-xlsx/issues/270
function sheetToArr(sheet) {
    var result = [];
    var row;
    var rowNum;
    var colNum;
    var range = xlsx.utils.decode_range(sheet['!ref']);
    for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++){
        row = [];
        for (colNum = range.s.c; colNum <= range.e.c; colNum++){
            var nextCell = sheet[
                xlsx.utils.encode_cell({r: rowNum, c: colNum})
                ];
            if ( typeof nextCell === 'undefined' ){
                row.push(void 0);
            } else row.push(nextCell.w);
        }
        result.push(row);
    }
    return result;
}

