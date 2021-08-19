import express from 'express';
import util from './controllers/util.js';

import auth from './api/auth.js';
import group from './api/group.js';
import teacher from './api/teacher.js';

const app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // allow CORS requests
  req.originalPath = req.baseUrl + req.path;
  req.remoteIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  next();
});

app.use('/api/auth', auth);
app.use('/api/class', group);
app.use('/api/teacher', teacher);
app.listen(2012);
