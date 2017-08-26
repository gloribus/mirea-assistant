Date.prototype.getWeek = function () {
    let onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

let institutes = {};
let institute = null;
let group = null;
let week = 'odd';

$(document).ready(() => {
  loading(true);

  api.group_get_all((err, res) => {
    if(err){
      console.log(err);
    } else {
      for(let i = 0; i < res.groups.length; i++){
        if(!institutes[res.groups[i].institute]) institutes[res.groups[i].institute] = [];

        institutes[res.groups[i].institute].push(res.groups[i].group);
      }

      $('#institute_value').html('');

      for(let key in institutes){
        let model = '<div class="item" data-value="'+key+'" onclick="selectInstitute('+key+')">'+api.institute_get_type(key)+'</div>';

        $('#institute_value').append(model);
      }

      $('#institute_dropdown').dropdown();

      loadSelected();
    }

    loading(false);
  });
});

function selectInstitute(inst){
  let groups = institutes[inst];

  institute = inst;

  $('#group_value').html('');

  for(let i = 0; i < groups.length; i++){
    let model = '<div class="item" data-value="'+groups[i]+'" onclick="selectGroup(\''+groups[i]+'\')">'+convertGroupName(groups[i])+'</div>';

    $('#group_value').append(model);
  }

  $('#group_dropdown').dropdown();

  enable('group', false);
}

function selectGroup(grp){
  group = grp;

  saveSelected();

  $('#week_dropdown').dropdown();

  $('[data-value="'+getWeek()+'"]').click();

  enable('week', false);
}

function selectWeek(type){
  week = type;

  api.schedule_get({ term : getTerm(), institute : institute, group : group }, (err, res) => {
    if(err){
      console.log(err);
    } else {
      $('#schedule').text('');

      let schedule = res.schedule;

      for(let i = 0; i < schedule.days.length; i++){
        renderDay(i, schedule.days[i]);
      }

      highlightCurrentDay();
      highlightCurrentClass();
    }
  });
}

function saveSelected(){
  localStorage.setItem('institute', institute);
  localStorage.setItem('group', group);
}

function loadSelected(){
  if(!localStorage.getItem("group")) return;

  $('[onclick="selectInstitute('+localStorage.getItem("institute")+')"]').click();

  $('[onclick="selectGroup(\''+localStorage.getItem("group")+'\')"]').click();
}

function convertGroupName(name){
  name = name.replace('i','И');
  name = name.replace('k','К');
  name = name.replace('b','Б');
  name = name.replace('o','О');
  name = name.replace('a','А');
  name = name.replace('v','В');
  name = name.replace('n','Н');

  return name;
}

function loading(load){
  $('#form').removeClass('loading');

  if(load){
    $('#form').addClass('loading');
  }
}

function enable(field, e){
  $('#'+field).removeClass('disabled');

  if(e){
    $('#'+field).addClass('disabled');
  }
}

function getTerm(){
  let date = new Date();
  return date.getFullYear().toString().substr(-2) + "" + Math.ceil(date.getMonth() / 6).toString();
}

function highlightCurrentDay(){
  let date = new Date();
  let day = date.getDay();

  $('#table-'+day).addClass('teal');
}

function getWeek(){
  let now = new Date();
  let september = new Date(now.getFullYear()+"-09-01");

  if(september.getWeek() % 2 == 0){
    if((now.getWeek() + 1) % 2 == 0){
      return 'even';
    } else {
      return 'odd';
    }
  } else {
    if(now.getWeek() % 2 == 0){
      return 'even';
    } else {
      return 'odd';
    }
  }
}

function highlightCurrentClass(){
  let date = new Date();
  let day = date.getDay();

  let time = (Math.floor(Date.now()/1000) + 60*60*3) % 86400;

  if(32400 < time && time < 37800){
    $('#table-'+day+'-0').addClass('active');

    console.log(day, 0);
  }

  if(38400 < time && time < 43800){
    $('#table-'+day+'-1').addClass('active');

    console.log(day, 1);
  }

  if(46800 < time && time < 52200){
    $('#table-'+day+'-2').addClass('active');

    console.log(day, 2);
  }

  if(52800 < time && time < 58200){
    $('#table-'+day+'-3').addClass('active');

    console.log(day, 3);
  }

  if(58800 < time && time < 64200){
    $('#table-'+day+'-4').addClass('active');

    console.log(day, 4);
  }

  if(64800 < time && time < 70200){
    $('#table-'+day+'-5').addClass('active');

    console.log(day, 5);
  }
}

function renderDay(day, classes){
  let days = {
    0 : 'Понедельник',
    1 : 'Вторник',
    2 : 'Среда',
    3 : 'Четверг',
    4 : 'Пятница',
    5 : 'Суббота'
  };

  let time = {
    0 : '9:00 - 10:30',
    1 : '10:40 - 12:10',
    2 : '13:00 - 14:30',
    3 : '14:40 - 16:10',
    4 : '16:20 - 17:50',
    5 : '18:00 - 19:30'
  };

  let types = {
    0 : 'ЛК',
    1 : 'ПР',
    2 : 'ЛАБ',
    12 : 'ПР + ЛАБ',
    10 : 'ПР + ЛК',
    20 : 'ЛАБ + ЛК'
  };

  let classes_model = '';

  for(let i = 0; i < classes.length; i++){
    let name = classes[i][week].name ? classes[i][week].name : "-";
    let room = classes[i][week].room ? classes[i][week].room : "-";
    let teacher = classes[i][week].teacher ? classes[i][week].teacher : "-";
    let type = types[classes[i][week].type] ? ", " + types[classes[i][week].type] : "";

    classes_model += '<tr id="table-'+day+'-'+i+'">\
      <td>'+(i+1)+'</td>\
      <td>'+time[i]+'</td>\
      <td>'+name+type+'</td>\
      <td>'+room+'</td>\
      <td>'+teacher+'</td>\
    </tr>';
  }

  let model = '<div class="column">\
    <h3 class="header">'+days[day]+'</h3>\
    <table class="ui compact unstackable striped table" id="table-'+day+'">\
      <thead>\
        <tr>\
          <th>#</th>\
          <th><i class="wait icon"></i></th>\
          <th><i class="book icon"></i></th>\
          <th><i class="map icon"></i></th>\
          <th><i class="user icon"></i></th>\
        </tr>\
      </thead>\
      <tbody>\
        '+classes_model+'\
      </tbody>\
    </table>\
  </div>';

  $('#schedule').append(model);
}

function about(){
  $('#about-modal').modal('show');
}
