const fs = require('fs').promises;

async function saveToJsonFile(filename, data) {
  await fs.writeFile(
    filename,
    JSON.stringify(data, null, 2),
    'utf8'
  );
  return filename;
}

module.exports = {
  saveToJsonFile
};
