const Axios = require('axios');

const { TEAMWORK_API_KEY, TEAMWORK_PROJECT_NAME } = process.env;
let tasklistId = -1;

const axios = Axios.create({
  baseURL: 'https://keenethics.teamwork.com',
  headers: {
    Authorization: `Basic ${Buffer.from(TEAMWORK_API_KEY + ':xxx').toString(
      'base64'
    )}`
  }
});

const getAllTasklist = () => axios.get('/tasklists.json');

const getAllTasks = () => axios.get(`/tasklists/${tasklistId}/tasks.json`);

const getAllPeople = () => axios.get('/people.json');

const getTasklistID = async () => {
  try {
    const { data } = await getAllTasklist();

    const tasklist = data.tasklists.find(
      ({ projectName, name }) =>
        projectName === TEAMWORK_PROJECT_NAME && name === 'General'
    );

    return tasklist.id;
  } catch (err) {
    console.error('error getTasklistID: ', err);
    return -1;
  }
};

const getTasksName = async () => {
  try {
    const { data } = await getAllTasks();

    const tasksName = data['todo-items'].map(({ content }) => content);

    return tasksName;
  } catch (err) {
    console.error('error getTasksName: ', err);
    return null;
  }
};

const createNewTask = body => {
  if (tasklistId === -1) {
    throw new Error('tasklistId is incorrect');
  }

  return axios.post(`/tasklists/${tasklistId}/tasks.json`, body);
};

const getPeopleEmailsAndId = async () => {
  const { data: allPeople } = await getAllPeople();
  // console.log;
  const emailsAndId = allPeople.people.reduce((acc, people) => {
    if (/@keenethics.com$/.test(people['email-address'])) {
      acc[people['email-address']] = people.id;
      return acc;
    }

    return acc;
  }, {});

  return emailsAndId;
};

getTasklistID()
  .then(id => {
    tasklistId = id;
    // createNewTask({
    //   'todo-item': {
    //     content: 'test content',
    //     'responsible-party-id': '274572,356544'
    //   }
    // }).catch(err => console.log('er: ', err));
  })
  .catch(err => console.error(err));

module.exports = {
  createNewTask,
  getTasksName,
  getPeopleEmailsAndId
};
