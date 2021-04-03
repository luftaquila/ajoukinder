import express from 'express';
import bodyParser from 'body-parser';

import util from '../controllers/util.js';

let router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.get(`/all`, async (req, res) => {
  const list = await util.query(`SELECT * FROM teacher;`);
  res.send(list);
});
export default router