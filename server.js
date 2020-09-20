const express = require('express');
var compression = require('compression')
var request = require('request');
var cheerio = require('cheerio');
const https = require("https");
var fs = require('fs');
var low = require('lowdb')
var FileSync = require('lowdb/adapters/FileSync')
var bodyParser = require('body-parser');
var adapter = new FileSync('groups.json')
var db = low(adapter)
const app = express();

app.enable('trust proxy');
app.use(compression());
app.use(function (req, res, next) {
  if (req.secure) {
    next();
  } else {
    //change next 2 strings for local testing
    //res.redirect('https://' + req.headers.host + req.url);
    next();
  }
});
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.get('/', function (req, res) {
  res.render('pages/index'); //val: title <%= val %> 
});
app.get('/humans.txt', function (req, res) {
  res.render('pages/humans'); //val: title <%= val %> 
});
app.get('/updates', function (req, res) {
  res.render('pages/updates'); //val: title <%= val %> 
});
app.get('/exams', function (req, res) {
  res.render('pages/exams'); //val: title <%= val %> 
});
//'https://cabinet.sut.ru/raspisanie_all_new?faculty=' + faculty + '&choice=1&type_z=1&schet=205.1920/1&kurs=' + kurs
app.get('/choose', function (req, res) {
  var groups = [];
  var kurs = req.query.kurs - 1;
  var faculty = req.query.faculty + "";
  var users = db.get(faculty).value()
  users[kurs].forEach(function (user) {
    groups.push(user);
  });
  groups.unshift({ "Группа": 0 });
  res.send(groups);
});
//https://cabinet.sut.ru/raspisanie_all_new?schet=205.1819/2&type_z=1&faculty=50029&kurs=1&group=53768
//https://cabinet.sut.ru/raspisanie_all_new?type_z=1
app.get('/schedule', function (req, res) {
  var schedule = [];
  var kurs = req.query.kurs;
  var faculty = req.query.faculty;
  var group = req.query.group;
  //console.log(kurs +" " +faculty+ " "+group);
  var url = 'http://cabinet.sut.ru/raspisanie_all_new?type_z=1&faculty=' + faculty + "&kurs=" + kurs + "&group=" + group;
  //console.log(url);
  request(url, function (error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);
      if ($("p").text() === "� ��������� ������ ���� ������ �� ��������. ���������� � ���������� ��������������.") {
        res.send(["<section><h1>Упс, что-то пошло не по плану...</h1><p>Мы уже работаем над устранением проблемы.</p><p>Попробуйте зайти немного позднее.</p></section>"]);
      } else {

        for (var i = 1; i < 7; i++) {
          var pairs = [];
          $("#rightpanel tr td .pair[weekday^=" + i + "]").each(function (index, element) {
            var num = $(this).attr('pair');
            var clas = $('strong', this).text().replace('Элективные дисциплины по физической культуре и спорту', 'Физическая культура и спорт');
            var wek = $('.weeks', this).text().replace('н', ',').replace(/\(|\)/g, " ");
            num > 80 ? num -= 82 : num -= 1;
            //console.log(pairs.length, pairs.length > 0 ? pairs[pairs.length-1].number : 0);
            if (pairs.length > 0 && num === pairs[pairs.length - 1].number && clas === pairs[pairs.length - 1].class && pairs[pairs.length - 1].weeks === wek) {
              pairs[pairs.length - 1].teacher += '\n' + $('.teacher', this).text().replace(/,|-./g, "\n");
              pairs[pairs.length - 1].cabinet === $('.aud', this).text().replace(/ ауд.: |;| Б22|-0/g, '').replace(/ткомплекс|тивный комплекс\/1/, "т.\nКомпл.").replace("; ", "\n") ? "" : pairs[pairs.length - 1].cabinet += '\n' + $('.aud', this).text().replace(/ ауд.: |;| Б22|-0/g, '').replace(/Спорткомплекс|Спортивный комплекс\/1/, "").replace("\n", "");

            } else {
              pairs[pairs.length] = {
                number: num,
                class: clas,
                type: $('.type', this).text().replace(/\(|\)/g, "").replace("Практические занятия", "Практика").replace("ораторная работа", ". раб."),
                cabinet: $('.aud', this).text().replace(/ ауд.: |;| Б22|-0/g, '').replace(/ткомплекс|тивный комплекс\/1/, "т.\nКомпл.").replace("; ", "\n"),
                teacher: $('.teacher', this).text().replace(/,|-./g, "\n"),
                weeks: wek
              }
            }
          });
          schedule[i - 1] = pairs;
        }
        res.send(schedule);
      }
    } else { console.log(error) }
  });
});
app.get('/exam', function (req, res) {
  var pairs = [];
  var kurs = req.query.kurs;
  var faculty = req.query.faculty;
  var group = req.query.group;
  var url = 'https://cabinet.sut.ru/raspisanie_all_new?schet=205.1920/2&type_z=2&faculty=' + faculty + "&kurs=" + kurs + "&group=" + group;
  request(url, function (error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);
      if ($("#rightpanel").text().includes("Занятий для выбранной группы не найдено")) { res.send(["<section><h1>Расписание экзаменов этой группы пока недоступно</h1><p>Попробуйте зайти немного позднее.</p></section>"]); } else {
        $(".pair").each(function (index, element) {
          var time = $('td', this).eq(1).text();
          var clas = $('.subect', this).text().replace('Элективные дисциплины по физической культуре и спорту', 'Физическая культура и спорт');
          var wek = $('td', this).eq(0).text().replace('.2019', ' ');

          //console.log(pairs.length, pairs.length > 0 ? pairs[pairs.length-1].number : 0);
          if (pairs.length > 0 && clas === pairs[pairs.length - 1].class && pairs[pairs.length - 1].weeks === wek) {
            pairs[pairs.length - 1].teacher += '\n' + $('.teacher', this).text().replace(/,|-./g, "\n");
            pairs[pairs.length - 1].cabinet === $('.aud', this).text().replace(/ ауд.: |;| Б22|-0/g, '').replace(" пр.Большевиков,22,к.", '/').replace(/ткомплекс|тивный комплекс\/1/, "т.\nКомпл.").replace("; ", "\n") ? "" : pairs[pairs.length - 1].cabinet += '\n' + $('.aud', this).text().replace(/ ауд.: |;| Б22|-0/g, '').replace(/Спорткомплекс|Спортивный комплекс\/1/, "").replace("\n", "");

          } else {
            pairs[pairs.length] = {
              time: time,
              class: clas,
              type: $('.type', this).text().replace(/\(|\)/g, "").replace("Практические занятия", "Практика").replace("ораторная работа", ". раб.").replace("ация", '.'),
              cabinet: $('.aud', this).text().replace(/ ауд.: |;| Б22|-0/g, '').replace(/ткомплекс|тивный комплекс\/1/, "т.\nКомпл.").replace("; ", "\n").replace(" пр.Большевиков,22,к.", '/'),
              teacher: $('.teacher', this).text().slice(0, $('.teacher', this).text().search(/\. /i)),
              weeks: wek
            }
          }
        });
        res.send(pairs);
      }
    } else { console.log("err") }
  });
});
app.get('/teachers', function (req, res) {
  var teachers = [];
  var kurs = req.query.kurs;
  var faculty = req.query.faculty;
  var group = req.query.group;
  var url = 'https://cabinet.sut.ru/raspisanie_all_new?schet=205.1920/2&type_z=1&faculty=' + faculty + "&kurs=" + kurs + "&group=" + group;
  request(url, function (error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);
      for (var i = 1; i < 7; i++) {
        var teacher;
        $("#rightpanel tr td .pair[weekday^=" + i + "]").each(function (index, element) {
          teacher = $('.teacher', this).text().replace(/,|-./g, "\n");
          if (!teachers.includes(teacher)) { teachers.push(teacher); }
        });
      }
      res.send(teachers);
    } else { console.log("err") }
  });
});
app.get('*', function (req, res) {
  res.redirect('/');
});
const listener = app.listen(process.env.PORT, function () {
  console.log('Ты сел на ' + listener.address().port + ' порт');
});
