import express from 'express';
import bodyParser from 'body-parser';

import util from '../controllers/util.js';

let router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

router.get(`/all`, async (req, res) => {
  const list = await util.query(`SELECT * FROM teacher ORDER BY class;`);
  res.send(list);
});

router.post('/', async (req, res) => {
  try {
    const result = await util.query(`INSERT INTO teacher(id, name, class, restriction) VALUES('${req.body.id}', '${req.body.name}', '${req.body.class}', '[]');`);
    res.send({ status: true, result: result });
  }
  catch(e) {
    if(e.code == 'ER_DUP_ENTRY') res.status(400).send({ status: false, code: e.code, msg: `이미 존재하는 교사 코드입니다.` });
    else res.status(400).send({ status: false, code: e.code, msg: `알 수 없는 오류입니다.<br>${e.code}` });
  }
});

router.delete('/', async (req, res) => {
  try {
    const result = await util.query(`DELETE FROM teacher WHERE id='${req.body.id}';`);
    res.send({ status: true, result: result });
  }
  catch(e) {
    res.status(400).send({ status: false, code: e.code, msg: `알 수 없는 오류입니다.<br>${e.code}` });
  }
});

router.put('/', async (req, res) => {
  try {
    const result = await util.query(`UPDATE teacher SET ${req.body.target}='${req.body.value}' WHERE id='${req.body.id}';`);
    res.send({ status: true, result: result });
  }
  catch(e) {
    res.status(400).send({ status: false, code: e.code, msg: `알 수 없는 오류입니다.<br>${e.code}` });
  }
});


router.get(`/restriction/:id`, async (req, res) => {
  const restriction = await util.query(`SELECT restriction FROM teacher WHERE id='${req.params.id}' LIMIT 1;`);
  res.send(JSON.parse(restriction[0].restriction));
});

router.delete(`/restrictions`, async (req, res) => {
  const result = await util.query(`UPDATE teacher SET restriction='[]';`);
  res.send({ status: true, result: result });
});

  
export default router