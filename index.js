// const path = require('path');
const express = require('express');
// const bodyParser = require('body-parser');
// const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
// const compression = require('compression');
// const methodOverride = require('method-override');
// const Swagger = require('./swagger');

// const routes = require('./routes/index.route');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv-safe').config();
}

const app = express();
app.db = require('./models');

require('./jobs');

const teamwork = require('./services/teamwork');

// teamwork.createNewTask({
//   'todo-item': {
//     content: 'test content',
//     'responsible-party-id': '274572'
//   }
// });

// const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(helmet());
// app.use(compression());
// app.use(bodyParser.json());
// app.use(morgan('dev'));
// app.use(express.static('dist'));
// app.use('/assets', express.static('assets'));

// app.get('/*', (req, res) => res.sendFile(path.join(__dirname, `../${isProduction ? 'dist' : 'client'}/index.html`)));

const port = process.env.APP_PORT || 3001;
const host = process.env.APP_HOST || 'localhost';

app.db.sequelize
  .authenticate()
  .then(() => {
    app.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = app;
