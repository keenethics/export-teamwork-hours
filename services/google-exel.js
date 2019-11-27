const { google } = require('googleapis');
const _ = require('lodash');

const { SHEET_ID, CREDS_FILE } = process.env;
const googleScopes = ['https://www.googleapis.com/auth/drive.readonly'];

const TITLE_COLUMN_INDEX = 0;

const arrayOfArraysToCollection = arr => {
  const properties = arr[TITLE_COLUMN_INDEX];
  return arr
    .slice(TITLE_COLUMN_INDEX + 1)
    .map(v =>
      _.fromPairs(properties.map((property, index) => [property, v[index]]))
    );
};

const getSheetValues = (valueRanges, rangeName) =>
  valueRanges.find(v => new RegExp(rangeName).test(v.range)).values;

const getClient = async (keyFile, scopes) =>
  google.auth.getClient({
    keyFile,
    scopes
  });

const getSheets = async spreadsheetId => {
  // TEAM_SHEET_ID
  const client = await getClient(CREDS_FILE, googleScopes);

  const sheets = google.sheets('v4');

  const table = await sheets.spreadsheets.values.batchGet({
    auth: client,
    spreadsheetId,
    ranges: ['pa tasks', 'workload (auto)']
  });

  const result = _.get(table, 'data', {});

  return result;
};

const getData = async (rangeName, sheetId) => {
  try {
    const sheetData = await getSheets(sheetId);
    const data = getSheetValues(sheetData.valueRanges, rangeName);

    return arrayOfArraysToCollection(data);
  } catch (err) {
    console.error(err);

    return null;
  }
};

const getUserAndEmail = async () => {
  const userPage = await getData('workload', SHEET_ID);
  const userAndEmail = userPage.reduce(
    (acc, user) => (acc[user.email] = user['Имя']),
    {}
  );

  return userAndEmail;
};

module.exports = {
  getPATasks: () => getData('PA tasks', SHEET_ID),
  getUserAndEmail
};
