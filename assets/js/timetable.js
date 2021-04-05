$(function() {
  $('#start').click(main);
  $('#reset').click(() => new Calendar('#calendar', [])).trigger('click');
});

async function main() {
  /* disabling buttons */
  //$('#start, #reset').attr('disabled', true);
  
  /* timetable initialization */
  let timetable = [];
  const target = $('#calendar div.day.set');
  if(!target.length) return Swal.fire({ icon: 'error', title: '선택된 날이 없습니다!' });
  for(const dom of target) timetable.push(new Day($(dom).attr('data-day'), !$(dom).hasClass('today')));
  
  /* loading data */
  const classList = await $.ajax(`${api_base_url}/class/all`);
  const teacherList = await $.ajax(`${api_base_url}/teacher/all`);
  
  /* classes and teachers initialization */
  let classes = [], teachers = [];
  classList.filter(c => c.isIncluded == "true").forEach(c => {
    let members = [];
    const staffs = teacherList.filter(t => t.class == c.class); // 소속 선생님 찾기
    
    if(staffs.length) { // 소속 선생님이 존재하는 경우만
      staffs.forEach(t => {
        teachers.push(new Teacher(t.id, t.name, t.class, JSON.parse(t.restriction))); // 선생님 목록에 추가
        members.push(new Teacher(t.id, t.name, t.class, JSON.parse(t.restriction))); // 학급 선생님 목록에 추가
      });
      classes.push(new Class(c.class, c.age, members)); // 학급 목록에 추가
    }
  });
  
  console.log(timetable);
  console.log(teachers);
  console.log(classes);
  
  /* processing */
  try {
    
  }
  catch(e) {
    
  }
  finally { $('#start, #reset').attr('disabled', false); }
}