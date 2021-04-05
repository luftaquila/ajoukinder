async function main() {
  /* disabling buttons */
  $('#start, #reset').attr('disabled', true);
  
  /* timetable initialization */
  /*let*/ timetable = [];
  const target = $('#calendar div.day.set');
  if(!target.length) return Swal.fire({ icon: 'error', title: '선택된 날이 없습니다!' });
  for(const dom of target) timetable.push(new Day($(dom).attr('data-day'), !$(dom).hasClass('today')));
  
  /* loading data */
  const classList = await $.ajax(`${api_base_url}/class/all`);
  const teacherList = await $.ajax(`${api_base_url}/teacher/all`);
  
  /* classes and teachers initialization */
  /*let*/ classes = [], ages = {}, categories = {}, teachers = [];
  classList.filter(c => c.isIncluded == "true").forEach(c => {
    let members = [];
    const staffs = teacherList.filter(t => t.class == c.class); // 소속 선생님 찾기
    
    if(staffs.length) { // 소속 선생님이 존재하는 경우만
      staffs.forEach(t => {
        // 선생님 객체 생성
        let teacher = new Teacher(t.id, t.name, t.class, JSON.parse(t.restriction));
        
        teachers.push(teacher); // 선생님 목록에 추가
        members.push(teacher); // 학급별 선생님 목록에 추가
        
        // 나이별 선생님 목록에 추가
        if(!ages[c.age]) ages[c.age] = [];
        ages[c.age].push(teacher);
        
        // 분류별(영/유아/기타) 선생님 목록에 추가
        if(Number(c.age)) {
          if(Number(c.age) < 3) { // 영아 - 2세 이하
            if(!categories.infant) categories.infant = [];
            categories.infant.push(teacher);
          }
          else if(Number(c.age) > 2) { // 유아 - 3세 이상
            if(!categories.child) categories.child = [];
            categories.child.push(teacher);
          }
        }
        else {
          if(!categories.etc) categories.etc = [];
          categories.etc.push(teacher);
        }
      });
      classes.push(new Class(c.class, c.age, members)); // 학급 목록에 추가
    }
  });
  
  /* processing */
  for(const i in timetable) {
    /* setting operator value */
    let op;
    if     (timetable[i].day == 'mon') op = 1;
    else if(timetable[i].day == 'tue') op = 2;
    else if(timetable[i].day == 'wed') op = -2;
    else if(timetable[i].day == 'thu') op = -1;
    else if(timetable[i].day == 'fri') op = 0;
    else if(timetable[i].day == 'sat') op = 0;
    
    const day = timetable[Number(i) + op].day;
    
    /* reset counts at start of week operation (tuesday) */
    if(day == 'tue') {
      teachers.forEach(t => {
        Object.entries(t.counts).forEach(([k, v]) => { t.counts[k] = 0; });
      });
    }
    
    /* shuffles teacher list by ages */
    Object.entries(ages).forEach(([a, t]) => { ages[a] = t.map(x => ([Math.random(), x])).sort((x, y) => x[0] - y[0]).map(x => x[1]); });
    
    /* set t0630 timetable: timetable[Number(i) + op].t0630 */
    // 개인 제약조건 제외
    // t0630_t073 최대치 제한 제외
    if(day == 'sat') { // 토요일일 때
      // F_Dty 최대치 제한 제외 - 새벽당직 한 적 있으면 제외 - 새벽당직 기준 확인 요망
      // 영아1 or 유아1 선택
    }
    else { // 토요일 아닐 때
      // 전날 L_Dty 제외
      // 행사 있는 연령 제외
      // 전날, 다음날 t0630_t0730 제외
      // 휴가 있는 연령 제외
      if(day == 'mon' || day == 'fri') {
        // 직전 주 t0630_t0730 제외
      }
      // 영아1, 유아1 선택
    }
    
    /* set t0900 timetable: timetable[Number(i) + op].t0900 */
    // 개인 제약조건 제외
    // t0900 최대치 제한 제외
    if(day == 'mon' || day == 'fri') {
      // 직전 주 t0830_t0900 제외
    }
    else if(day == 'sat') {
      // F_Dty 최대치 제한 제외 - 새벽당직 한 적 있으면 제외 - 새벽당직 기준 확인 요망
      // 영아1 or 유아1 선택 (토요일 6시와 반대) -> ???
      continue;
    }
    // 연령별 1명씩 선택 + 랜덤 출근인원 1명 선택
    // !! 조건 체크
    
    /* set t0730 timetable: timetable[Number(i) + op].t0730 */
    // 개인 제약조건 제외
    // 작업중 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    
    
    break;
  }
  
  /* re-enable buttons */
  $('#start, #reset').attr('disabled', false);
}

$(function() {
  $('#start').click(main);
  $('#reset').click(() => new Calendar('#calendar', [])).trigger('click');
  $('#tooltip_page').click(() => {
    Swal.fire({
      title: '근무 시간표 작성',
      html: `
<div id='page_tooltip'>
  <b>교사 / 학급 목록을 기반으로 근무 시간표를 작성합니다.</b>
  <ol>
    <li>달력에서 날짜를 선택합니다. 선택한 날짜와 <b>같은 주 월요일부터 4주</b>가 작성 기간으로 자동으로 선택됩니다.</li>
    <li>근무표에서 제외할 날짜(휴원일)을 우클릭해 선택 해제합니다.</li>
    <li><kbd><i class='fas fa-play'></i> 시작</kbd> 을 클릭합니다.</li>
  </ol>
  <ul>
    <li><kbd><i class='fas fa-undo' style='transform: scaleX(-1);'></i> 리셋</kbd> 을 누르면 달력을 초기화합니다.</li>
  </ul>
</div>
<style>
div#page_tooltip {
  line-height: 1.8rem;
  font-size: 1rem;
  text-align: left;
}
div#page_tooltip ul {
  line-height: 1.5rem;
  margin-top: 0.5rem;
}
div#page_tooltip li {
  margin-bottom: 0.5rem;
}
</style>
`,
      showCloseButton: true,
      showConfirmButton: false
    });
  });
});
