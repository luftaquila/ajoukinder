import dotenv from 'dotenv'
import jwt from 'jsonwebtoken';
import pool from '../config/mariadb';

dotenv.config();

let util = {};

util.isLogin = function(req, res, next) { // check if jwt is vaild
  const token = req.headers['x-access-token'];
  if(!token) res.status(400).json(new Response('error', '로그인 상태가 아닙니다.', 'ERR_NO_TOKEN'));
  else {
    jwt.verify(token, process.env.JWTSecret, function(err, decoded) {
      if(err) res.status(401).json(new Response('error', '로그인이 만료되었습니다.<br>다시 로그인해 주세요.', 'ERR_INVALID_TOKEN'));
      else { req.decoded = decoded; next(); }
    });
  }
};

util.isAdmin = function(req, res, next) { // check if jwt is vaild
  const token = req.headers['x-access-token'];
  if(!token) res.status(400).json(new Response('error', '로그인 상태가 아닙니다.', 'ERR_NO_TOKEN'));
  else {
    jwt.verify(token, process.env.JWTSecret, function(err, decoded) {
      if(err) res.status(401).json(new Response('error', '로그인이 만료되었습니다.<br>다시 로그인해 주세요.', 'ERR_INVALID_TOKEN'));
      else if(decoded.role == '회원') res.status(403).json(new Response('error', '관리자가 아닙니다.', 'ERR_USER_NOT_ADMIN'));
      else { req.decoded = decoded; next(); }
    });
  }
};

util.query = async function(query) { // make db query
  try {
    const db = await pool.getConnection();
    const result = await db.query(query);
    await db.end();
    return result;
  }
  catch(e) {
    console.log(e);
    throw e;
  }
}

export default util