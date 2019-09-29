var date = new Date();//2019-08-31T19:50:00+03:00 saturday
var thisWeek = Math.floor((Date.parse(date) - Date.parse("2019-08-31T19:50:00+03:00")) / 604800000) + 1;
var curWeek = thisWeek;

var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById("current-date").innerHTML = date.toLocaleDateString('ru-RU', options).replace(' г.', "");
document.getElementById("week-number").innerHTML = thisWeek + " учебная неделя" + (window.matchMedia("(min-width: 1200px)").matches ? (thisWeek % 2 === 0 ? " (четная)" : " (нечетная)") : "");
if (window.matchMedia("(max-width: 1200px)").matches) {
  var d = document.getElementById("current-date").innerHTML; document.getElementById("current-date").innerHTML = d.slice(d.indexOf(" ") + 1);

}
document.getElementById("thisWeek").innerHTML = (curWeek + " ");
weekDate(thisWeek);

function weekDate(Week) {
  var date = Date.parse("2019-09-01T00:00:00+03:00");
  date = date + (1000 * 60 * 60 * 24 * 7 * (Week - 1));
  date = new Date(date);
  var diff = date.getDate() - date.getDay() + 1;
  var lastday = date.getDate() - (date.getDay()) + 7;
  date.setDate(diff);
  var offset;
  if (date.getMonth() < 9) { offset = ".0"; } else { offset = "."; }
  document.getElementById("current-start").innerHTML = date.getDate() + offset + (date.getMonth() + 1);
  date.setDate(lastday)
  if (date.getMonth() < 9) { offset = ".0"; } else { offset = "."; }
  document.getElementById("current-end").innerHTML = date.getDate() + offset + (date.getMonth() + 1);
  return diff;
}

function load_group() {
  var kurs = document.getElementById("kurs").value;
  var faculty = document.getElementById("faculty").value;
  if (kurs != 0 && faculty != 0) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        display_groups(JSON.parse(xhr.response));
      } else {
        display_groups([{ name: "Что-то не так, попробуйте позже" }]);
      }
    };
    var url = window.location.protocol + '//' + window.location.host + '/choose?kurs=' + kurs + '&faculty=' + faculty;
    xhr.open('GET', url);
    xhr.send();
  }
}
//use interface function for get requests
function load_schedule() {
  var kurs, faculty, group;
  if (document.getElementById("groups").value === '0' && localStorage.getItem("groupName") != null) {
    group = localStorage.getItem('group');
    kurs = localStorage.getItem('kurs');
    faculty = localStorage.getItem('faculty');
  } else {
    kurs = document.getElementById("kurs").value;
    group = document.getElementById("groups").value;
    faculty = document.getElementById("faculty").value;
    localStorage.setItem("kurs", kurs);
    localStorage.setItem("faculty", faculty);
    localStorage.setItem("group", group);
    localStorage.setItem("groupName", document.getElementById("groups")[document.getElementById("groups").selectedIndex].textContent);
  }
  if (group != 0) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 1) {
      } else if (xhr.readyState === 4 && xhr.status === 200) {
        display_schedule(JSON.parse(xhr.response));
      } else if (xhr.readyState === 4 && xhr.status === 304) {
        display_schedule(JSON.parse(xhr.response));
      }
    };
    var url = window.location.protocol + '//' + window.location.host + '/schedule?kurs=' + kurs + '&faculty=' + faculty + '&group=' + group;
    xhr.open('GET', url);
    xhr.send();
    if (window.matchMedia("(max-width: 1200px)").matches) {
      document.getElementById("welcome-form").classList.remove("show");
      document.getElementsByClassName("bg")[0].style.transform = "translateY(0)";
      document.getElementsByClassName("bg")[0].style.webkitTransform = "translateY(0)";
    } else {
      document.getElementById("welcome-form").style.display = "none";
    }
    document.getElementById("change-group").innerHTML = localStorage.getItem('groupName');
  }
}

function display_groups(data) {
  var adr = document.getElementById("groups");
  while (adr.firstChild) { adr.removeChild(adr.firstChild); }
  for (var i = 0; i < data.length; i++) {
    var option = document.createElement("option");
    option.value = data[i][Object.keys(data[i])];
    option.textContent = Object.keys(data[i]);
    adr.appendChild(option);
  }
}

function display_schedule(data) {
  var main = document.getElementsByTagName("main")[0];
  main.innerHTML = "";
  if (data.length === 1) { main.innerHTML += data[0]; return }
  var days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
  var times = ["9:00-10:35", "10:45-12:20", "13:00-14:35", "14:45-16:20", "16:30-18:05", "18:15-19:50", "9:00-10:30", "10:30-12:00", "12:00-13:30", "13:30-15:00", "15:00-16:30", "16:30-18:05", "18:15-19:50"];
  var mobile = window.matchMedia("(max-width: 990px)").matches;
  var lecture = '<div class="lecture"><div class="up-block"><div class="number"></div><div class="type"></div><div class="time"><span> пара</span></div></div><div class="classrooms"></div><div class="subject"></div><div class="teachers-name"></div></div>';

  for (var d = 0; d < data.length; d++) {
    main.innerHTML += '<div class="day"><div class="date"><div class="week-day">' + days[d] + '</div></div></div>';
    var last = document.getElementsByClassName("day")[d];
    var maxHeight = 0;
    for (var i = 0, start = 0, end = 0, total = 0; i < data[d].length; i++) {

      if (data[d][i].weeks.search(" " + curWeek + ",") !== -1) {

        last.innerHTML += lecture;
        last.getElementsByClassName("number")[total].innerHTML = data[d][i].number;
        last.getElementsByClassName("type")[total].innerHTML = data[d][i].type;
        last.getElementsByClassName("subject")[total].innerHTML = data[d][i].class;
        last.getElementsByClassName("classrooms")[total].innerHTML = data[d][i].cabinet;
        last.getElementsByClassName("teachers-name")[total].innerHTML = data[d][i].teacher;
        last.getElementsByClassName("time")[total].innerHTML = data[d][i].cabinet.startsWith("С") ? (times[data[d][i].number + 5]) : (times[data[d][i].number - 1]);

        if (parseInt(window.getComputedStyle(last.getElementsByClassName("subject")[total]).height) + Math.max(parseInt(window.getComputedStyle(last.getElementsByClassName("classrooms")[total]).height), parseInt(window.getComputedStyle(last.getElementsByClassName("teachers-name")[total]).height)) > maxHeight) {
          maxHeight = parseInt(window.getComputedStyle(last.getElementsByClassName("subject")[total]).height) + Math.max(parseInt(window.getComputedStyle(last.getElementsByClassName("classrooms")[total]).height), parseInt(window.getComputedStyle(last.getElementsByClassName("teachers-name")[total]).height));
        }

        start === 0 ? start = data[d][i].number : end = data[d][i].number;
        total++;
      }
    }

    total === 0 ? last.getElementsByClassName("date")[0].style.borderRadius = "7px" : 0;
    if (mobile) {
      var weekDay = document.getElementsByClassName("week-day");
      weekDay[d].innerHTML += ", " + (total !== 0 ? (total + (total > 1 ? (total < 5 ? " пары" : " пар") : " пара")) : "пар нет");
    } else {
      var mar = 72;
      for (var i = 0; i < total; i++) {
        last.getElementsByClassName("lecture")[i].style.height = (maxHeight + mar) + 'px';
      }
      last.getElementsByClassName("date")[0].style.height = (maxHeight + mar + 16) + 'px';
    }
  }

  var dateDay = new Date(2019, 8, 2 + (curWeek - 1) * 7, 19, 50, 0);//2019-09-2T19:50:00+03:00 monday
  var weekDay = document.getElementsByClassName("week-day");
  for (var juk = 0; juk < 6; juk++) {
    var offset = dateDay.getMonth() < 9 ? ".0" : ".";
    weekDay[juk].innerHTML = (dateDay.getDate()) + offset + (dateDay.getMonth() + 1) + " " + weekDay[juk].innerHTML;
    document.getElementsByClassName("date")[juk].addEventListener('click', showDay, false);
    (curWeek === thisWeek && mobile && Date.now() > dateDay.getTime()) ? document.getElementsByClassName("date")[juk].click() : 0;
    dateDay.setDate(dateDay.getDate() + 1);
  }
}

function showDay(el) {
  var mobile = window.matchMedia("(max-width: 990px)").matches;
  var list = el.currentTarget.parentNode.getElementsByClassName("lecture");
  var da = el.currentTarget.parentNode.getElementsByClassName("date");

  if (mobile) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].style.display === 'none') {
        list[i].style.display = "block";
        da[0].style = null;
      } else {
        list[i].style.display = "none";
        da[0].style.borderRadius = "7px";
        da[0].style.WebkitBorderRadius = "7px";
        da[0].style.MozBorderRadius = "7px";
      }
    }
  }
}

function changeWeek(a) {
  if ((curWeek >= 1 || a >= 0) && (a <= 0 || curWeek < 17)) {
    curWeek += a;
    document.getElementById("thisWeek").innerHTML = curWeek + " ";
    weekDate(curWeek);
    load_schedule();
  }
}

function showChoose() {
  if (window.matchMedia("(max-width: 1160px)").matches) {
    var modal = document.getElementsByClassName("modal")[0];
    var head = document.getElementsByClassName("bg")[0];
    var btn = document.getElementById("change-group");
    if (head.style.transform != "translateY(244px)") {
      head.style.transform = "translateY(244px)";
      head.style.webkitTransform = "translateY(244px)";
      modal.classList.add("show");
      btn.innerHTML = "Закрыть";
    } else {
      modal.classList.remove("show");
      head.style.transform = "translateY(0)";
      head.style.webkitTransform = "translateY(0)";
      btn.innerHTML = localStorage.getItem('groupName');
    }
  } else {
    var modal = document.getElementById("welcome-form");
    var span = document.getElementsByClassName("close")[0];
    modal.style.display = "block";
    span.onclick = function () {
      modal.style.display = "none";
    }
    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    }
  }
}

let deferredPrompt;
const addBtn = document.getElementById('add');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  addBtn.addEventListener('click', (e) => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      deferredPrompt = null;
    });
  });
});

function load_exams() {
  var kurs, faculty, group;
  if (document.getElementById("groups").value === '0' && localStorage.getItem("groupName") != null) {
    group = localStorage.getItem('group');
    kurs = localStorage.getItem('kurs');
    faculty = localStorage.getItem('faculty');
  } else {
    kurs = document.getElementById("kurs").value;
    group = document.getElementById("groups").value;
    faculty = document.getElementById("faculty").value;
    localStorage.setItem("kurs", kurs);
    localStorage.setItem("faculty", faculty);
    localStorage.setItem("group", group);
    localStorage.setItem("groupName", document.getElementById("groups")[document.getElementById("groups").selectedIndex].textContent);
  }
  if (group != 0) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 1) {
      } else if (xhr.readyState === 4 && xhr.status === 200) {
        display_exams(JSON.parse(xhr.response));
      } else if (xhr.readyState === 4 && xhr.status === 304) {
        display_exams(JSON.parse(xhr.response));
      }
    };
    var url = window.location.protocol + '//' + window.location.host + '/exam?kurs=' + kurs + '&faculty=' + faculty + '&group=' + group;
    xhr.open('GET', url);
    xhr.send();
    if (window.matchMedia("(max-width: 1200px)").matches) {
      document.getElementById("welcome-form").classList.remove("show");
      document.getElementsByClassName("bg")[0].style.transform = "translateY(0)";
      document.getElementsByClassName("bg")[0].style.webkitTransform = "translateY(0)";
    } else {
      document.getElementById("welcome-form").style.display = "none";
    }
    document.getElementById("change-group").innerHTML = localStorage.getItem('groupName');
  }
}
function display_exams(data) {
  var main = document.getElementsByTagName("main")[0];
  main.innerHTML = "";
  if (data.length === 1) { main.innerHTML += data[0]; return };
  var p = window.matchMedia("(max-width: 1200px)").matches;
  var mobile = window.matchMedia("(max-width: 990px)").matches;
  var lecture = '<div class="lecture"><div class="up-block"><div class="number"></div><div class="type"></div><div class="time"><span> пара</span></div></div><div class="classrooms"></div><div class="subject"></div><div class="teachers-name"></div></div>';

  for (var d = 0; d < data.length; d++) {
    if (p) {///rewrite without double
      main.innerHTML += '<div class="day"><div onClick="showDay(this)" class="date"><div class="week-day"></div></div></div>';
    } else {
      main.innerHTML += '<div class="day"><div class="date"><div class="week-day"></div></div></div>';
    }
    var last = document.getElementsByClassName("day")[d];
    var maxHeight = 0;
    for (var i = 0; i < 1; i++) {
      last.innerHTML += lecture;
      last.lastChild.getElementsByClassName("type")[0].innerHTML = data[d].type;
      last.lastChild.getElementsByClassName("subject")[0].innerHTML = data[d].class;
      last.lastChild.getElementsByClassName("classrooms")[0].innerHTML = data[d].cabinet;
      last.lastChild.getElementsByClassName("teachers-name")[0].innerHTML = data[d].teacher;
      last.lastChild.getElementsByClassName("time")[0].innerHTML = data[d].time;
      last.firstChild.getElementsByClassName("week-day")[0].innerHTML = data[d].weeks;
      if (parseInt(window.getComputedStyle(last.getElementsByClassName("subject")[0]).height) + Math.max(parseInt(window.getComputedStyle(last.getElementsByClassName("classrooms")[0]).height), parseInt(window.getComputedStyle(last.getElementsByClassName("teachers-name")[0]).height)) > maxHeight) {
        maxHeight = parseInt(window.getComputedStyle(last.getElementsByClassName("subject")[0]).height) + Math.max(parseInt(window.getComputedStyle(last.getElementsByClassName("classrooms")[0]).height), parseInt(window.getComputedStyle(last.getElementsByClassName("teachers-name")[0]).height));
      }

    }
    if (mobile) {
      last.getElementsByClassName("date")[0].style.borderRadius = "7px";
    } else if (p) {
      maxHeight = 0;
      for (var f = 1; f < last.childNodes.length; f++) {
        maxHeight += parseInt(window.getComputedStyle(last.getElementsByClassName("lecture")[f - 1]).height);
      }
      last.style.height = maxHeight + 'px';
    } else {
      var mar = 104;
      for (var i = 0; i < 1; i++) {
        last.getElementsByClassName("lecture")[i].style.height = (maxHeight + mar) + 'px';
      }
      last.getElementsByClassName("date")[0].style.height = (maxHeight + mar + 24) + 'px';
    }
  }
}