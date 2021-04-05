$(function() {
  wp = $("#startWeek").weekpicker();
  eventListener();
});

function eventListener() {
  $('#start').click(main);
}

async function main() {
  /* initialization */
  let timetable = [];
  const startDay = new Date(wp.getYear(), 0, (1 + (wp.getWeek() - 1) * 7) - 4);
  const weekdays = {
    '월': 'mon',
    '화': 'tue',
    '수': 'wed',
    '목': 'thu',
    '금': 'fri',
    '토': 'sat'
  }
  
  for(let i = 0; i < 28; i++) {
    const targetDay = new Date(Number(startDay) + 24 * 3600000 * i);
    if(!targetDay.getDay()) continue;
    timetable.push({
      date: targetDay.format('yyyy-mm-dd'),
      day: weekdays[targetDay.format('ddd')],
      isHoliday: false,
      t0630: [],
      t0730: [],
      amH  : [],
      t0830: [],
      pmH  : [],
      t0900: [],
      L_Dty: []
    });
  }
  console.log(timetable);
}