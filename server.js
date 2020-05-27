//Boilerplate stuffs
var express = require('express');
var app = express();
var handlebars = require('express-handlebars');

// Connect to the database
var mysql = require('mysql');
var pool = mysql.createPool({
  host : 'localhost',
  user : 'student',
  password : 'default',
  database : 'student'
});

app.use(express.static('public'));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('port', 4526);

// Routing

// Selecting the data
app.get('/',function(req,res,next){
  var context = {};
  pool.query('SELECT * FROM todo', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = JSON.stringify(rows);
    res.render('home', context);
  });
});

//Updating the database
app.get('/safe-update',function(req,res,next){
  var context = {};
  pool.query("SELECT * FROM todo WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      pool.query("UPDATE todo SET name=?, done=?, due=? WHERE id=? ",
        [req.query.name || curVals.name, req.query.done || curVals.done, req.query.due || curVals.due, req.query.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        context.results = "Updated " + result.changedRows + " rows.";
        res.render('home',context);
      });
    }
  });
});


//Insert query
app.get('/insert', function(req, res, next){
  var context = {};
  pool.query("INSERT INTO todo (`name`) VALUES (?)", [req.query.c], function(err, result){
    if(err){
      next(err);
      return;
    }
    context.results = "Inserted is " + result.insertId;
    res.render('home', context);
  });
});

// Empty the table
app.get('/reset-table', function(req, res, next){
  var context = {};
  pool.query("DROP TABLE IF EXISTS todo", function(err){
    var createString = "CREATE TABLE todo (" +
    "id INT PRIMARY KEY AUTO_INCREMENT," +
    "name VARCHAR(255) NOT NULL," +
    "done BOOLEAN," +
    "due DATE)"
    pool.query(createString, function(err){
      context.results = "Table reset";
    })
  });
});

app.listen(app.get('port'), function(){
  console.log('Serving is starting at port', app.get('port'));
});
