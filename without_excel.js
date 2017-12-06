var fs = require('fs');
var filename = process.argv[2];
var changeElements = [];
for (var i = 3; i < process.argv.length; i++) {
    if (i % 2 !== 0 ) {
        changeElements.push({name: process.argv[i], value: process.argv[i + 1]}); // add values from terminal into object
    }
}
var data = '';
var readStream = fs.createReadStream(filename);
readStream.on('data', function(chunk) { // Get data from textfile
    data += chunk;
}).on('end', function() { // When textfile has been read
    var splitData = data.split('\r\n'); // Split the string on each newline
    var outputString = '';
    for (j in splitData) {
        for (k in changeElements) {
            if (splitData[j].includes(changeElements[k].name)) { // If the value has been entered
                spaceSplit = splitData[j].split(' '); // Split string into array on each whitespace
                if (spaceSplit[spaceSplit.length - 1].indexOf('.') !== -1) { // If the original value has decimals, also add decimals
                    updateValue = Number(changeElements[k].value).toFixed(4);
                } else { // Otherwise let it be
                    updateValue = changeElements[k].value;
                }
                lengthOfUpdateValue = (""+updateValue).split(""); // Get amount of numbers in updatevalue
                lengthOfOriginalValue = (""+spaceSplit[spaceSplit.length - 1]).split(""); // Get amount of numbers in original value
                if (lengthOfUpdateValue > lengthOfOriginalValue) { // If the new value is larger length wise we have to remove some whitespace.
                    for (m = 0; m < lengthOfOriginalValue - lengthOfUpdateValue; m++) {
                        spaceSplit.splice(spaceSplit.length - 2, 0, ' ');
                    }
                } else if (lengthOfUpdateValue < lengthOfOriginalValue) { // If the original value is larger length wise we have to add some whitespace.
                    for (m = 0; m < lengthOfOriginalValue - lengthOfUpdateValue; m++) {
                        spaceSplit.splice(spaceSplit.length - 2, 1);
                    }
                }
                spaceSplit[spaceSplit.length - 1] = updateValue; // Update the sought value
                spaceSplit = spaceSplit.join(' '); // Put back into string
                splitData[j] = spaceSplit;
            }
        }
        outputString += splitData[j] + '\r\n';
    }
    fs.writeFile('output_without_excel.txt', outputString, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('Changes saved');
    });
});
