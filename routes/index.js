var express = require('express');
var router = express.Router();
var moment = require("moment"); // require
const { route } = require('./users');


module.exports = function(db){
router.get('/', function(req, res, next) {
  const url = req.url == "/" ? "/?page=1" : req.url;
  let query = `select * from c21 limit 2 offset 0`
  let queryCount = `select count(*) as total from c21`
  var page = parseInt(req.query.page) || 1;
  var size = 2;
  var offset = (page - 1) * size;
  let stringdata = req.query.string
  let integerdata = parseInt(req.query.integer);
  let floatdata = parseFloat(req.query.float);
  let start = req.query.start;
  let end = req.query.end;
  let booleandata = req.query.boolean;
  let params = [];
  if (page) {
    query = `select * from c21 limit ${size} offset ${offset}`;
  }

  if (stringdata || integerdata || floatdata || start || end || booleandata) {
    params.push({ stringdata, integerdata, floatdata, start, end, booleandata });
  }
  if(params.length){
    query = `select * from c21 where `
    queryCount = `select count (*) as total from c21 where`

    let flag = 0;
    let limit = ` limit 2 offset ${offset}`

    if(params[0].stringdata){
      query += ` stringdata ilike '%${params[0].stringdata}%' `
      queryCount += ` stringdata ilike '%${params[0].stringdata}%' `
      flag = 1
    }
    if(params[0].integerdata){
      if(flag == 1){
        query += ` AND`;
        queryCount += ` AND`;
      }
      query += ` integerdata = ${params[0].integerdata} `
      queryCount += ` integerdata = ${params[0].integerdata} `
      flag = 1
    }
    if(params[0].floatdata){
      if(flag == 1){
        query += ` AND`;
        queryCount += ` AND`;
      }
      query += ` floatdata = ${params[0].floatdata} `
      queryCount += ` floatdata = ${params[0].floatdata} `
      flag = 1
    }
    if (params[0].start && params[0].end) {
      if (flag == 1) {
        query += ` AND`;
        queryCount += ` AND`;
      }
      query += ` datedata between '${params[0].start}' and '${params[0].end}' `;
      queryCount += ` datedata between '${params[0].start}' and '${params[0].end}' `;
      flag = 1;
    }
    if (params[0].booleandata) {
      if (flag == 1) {
        query += ` AND`;
        queryCount += ` AND`;
      }
      query += ` booleandata = '${params[0].booleandata}' `;
      queryCount += ` booleandata = '${params[0].booleandata}' `;
    }

    query += ` ${limit}`
  }
  db.query(queryCount, (err, data) => {
    if(err){
      return res.send(err)
    }
    let jumlahData = data.rows[0].total;
    let jumlahHalaman = Math.ceil(jumlahData / 2)

    db.query(query, (err, data) => {
      if(err){
        return res.send(err)
      }
      res.render('index', { data: data.rows , moment: moment, jumlahHalaman, page, url, stringdata, integerdata, floatdata, start, end, booleandata});

    })
  })
});

router.get('/add', function(req, res, next) {
  res.render('add');
});

router.post('/add', (req, res, next) => {
  let query = `insert into c21(stringdata, integerdata, floatdata, datedata, booleandata) values('${req.body.string}', ${req.body.integer}, ${req.body.float}, '${req.body.date}', '${req.body.boolean}')`
  db.query(query, [], (err) => {
    if(err){
      return res.send(err)
    }
    res.redirect("/")
  })
})

router.get('/delete/:id', (req, res) => {
  let index = req.params.id
  let query = `delete from c21 where id = '${index}'`
  db.query(query, (err) => {
    if(err){
      return res.send(err)
    }
    res.redirect('/')
  })
})

router.get('/edit/:id', (req, res) => {
  let index = req.params.id
  let query = `select * from c21 where id = '${index}'`
  db.query(query, (err, data) => {
    if(err){
      return res.send(err)
    }
    console.log(data.rows[0].booleandata)
    res.render('edit', {data: data.rows[0], moment: moment})
  })
})

router.post('/edit/:id', (req, res) => {
  let index = req.params.id;
  let query = `update c21 set stringdata = '${req.body.string}', integerdata = ${req.body.integer}, floatdata = ${req.body.float}, datedata = '${req.body.date}', booleandata = '${req.body.boolean}' where id = '${index}'`

  db.query(query, (err) => {
    if(err){
      return res.render(err)
    }
    res.redirect('/')
  })
})

  return router;
}
