const moment = require('moment');
const schedule = require('node-schedule');

const googleExel = require('../services/google-exel');
const teamwork = require('../services/teamwork');

const getAllTasks = async () => {
  let result = [];

  const recursive = async (page = 1) => {
    const {
      headers,
      data: { 'todo-items': teamworkExistTasks }
    } = await teamwork.getAllTasks(page);

    result = [...result, ...teamworkExistTasks];

    if (page !== +headers['x-pages']) {
      return recursive(page + 1);
    }
  };

  await recursive();

  return result;
};

async function createTasks() {
  try {
    const exelData = await googleExel.getPATasks();
    const usersAndEmail = await googleExel.getUserAndEmail();
    const peopleEmailsAndId = await teamwork.getPeopleEmailsAndId();
    const teamworkExistTasks = await getAllTasks();
    const teamworkContents = teamworkExistTasks.map(({ content }) => content);
    const exelFilteredData = exelData.filter(
      data =>
        teamworkContents.indexOf(data['Опис'].trim().replace(/[“”]/g, '"')) ===
        -1
    );

    const tasks = exelFilteredData.map(exelRow => {
      return {
        'due-date': moment(
          (exelRow['Дедлайн'] !== 'пауза' && exelRow['Дедлайн'] !== '') ||
            /\d\d\.\d\d\.\d\d\d\d/.test(exelRow['Дедлайн'])
            ? exelRow['Дедлайн']
            : moment().format('DD.MM.YYYY'),
          'DD.MM.YYYY'
        ).format('YYYYMMDD'),
        content: exelRow['Опис'],
        description: exelRow['Як (вимоги)'],
        tags: exelRow['РГ№'],
        completed: exelRow['Коментар'] === 'Затверджено',
        'responsible-party-id':
          peopleEmailsAndId[usersAndEmail[exelRow['Відповідальний']]]
      };
    });

    for (const task of tasks) {
      await teamwork.createNewTask({ 'todo-item': task });
    }

    console.log('Copy completed');
  } catch (err) {
    console.error('scheduleJob error: ', err);
  }
}

const j = schedule.scheduleJob('0 0 0 */1 * *', createTasks);

module.exports = j;
