const moment = require('moment');
const schedule = require('node-schedule');

const googleExel = require('../services/google-exel');
const teamwork = require('../services/teamwork');

async function createTasks() {
  try {
    const exelData = await googleExel.getPATasks();
    const usersAndEmail = await googleExel.getUserAndEmail();
    const peopleEmailsAndId = await teamwork.getPeopleEmailsAndId();

    console.log('peopleEmailsAndId: ', peopleEmailsAndId);

    const tasks = exelData.map(exelRow => {
      return {
        'due-date': moment(exelRow['Дедлайн'], 'DD.MM.YYYY').format('YYYYMMDD'),
        content: exelRow['Опис'],
        description: exelRow['Як (вимоги)'],
        tags: exelRow['РГ№'],
        completed: exelRow['Коментар'] === 'Затверджено',
        'responsible-party-id':
          peopleEmailsAndId[usersAndEmail['Відповідальний']]
      };
    });

    // console.log('tasks: ', tasks);

    // for (const task of tasks) {
    //   console.log();
    //   await teamwork.createNewTask({ 'todo-item': task });
    // }
  } catch (err) {
    console.error('scheduleJob error: ', err);
  }
}

const j = schedule.scheduleJob('0 0 0 */1 * *', createTasks);

setTimeout(createTasks, 4000);

module.exports = j;
