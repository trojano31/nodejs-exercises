const fs = require('fs');

function calculateCalibrationValues(filename) {
  let sum = 0;

  const fileContent = fs.readFileSync(filename, 'utf-8');
  const lines = fileContent.split('\n');

  for (let line of lines) {
    const trimmedLine = line.trim();
    let calibrationValue = extractCalibrationValue(trimmedLine);
    sum += calibrationValue.length ? parseCalibrationValue(calibrationValue) : 0;
  }

  return sum;
}

function extractCalibrationValue(line) {
  let calibrationValue = [];
  let chars = '';

  for (let i = 0; i <= line.length; i++) {
    const char = line[i] ?? ';'

    if (!isNaN(Number(char))) {
      calibrationValue.push(char);
      chars = '';
    } else {
      chars += char
      const numberFromChars = getNumberFromChars(chars);

      if (numberFromChars) {
        calibrationValue.push(numberFromChars);
        chars = '';
      }
    }
  }

  return calibrationValue;
}

function getNumberFromChars(chars) {
  const numberMap = {
    'one': '1',
    'two': '2',
    'three': '3',
    'four': '4',
    'five': '5',
    'six': '6',
    'seven': '7',
    'eight': '8',
    'nine': '9'
  };

  for (let [word, number] of Object.entries(numberMap)) {
    if (chars.includes(word)) {
      return number;
    }
  }

  return null;
}

function parseCalibrationValue(calibrationValue) {
  return Number(`${calibrationValue[0]}${calibrationValue[calibrationValue.length - 1]}`);
}

const sum = calculateCalibrationValues('input.txt');
console.log('Sum:', sum);
