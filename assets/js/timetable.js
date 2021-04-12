async function main() {
  try {
    startCount++;
    $('#output').text('STARTING...').css('color', 'white');
    $('#timetable').html('');
    
    /* timetable initialization */
    let timetable = [];
    const target = $('#calendar div.day.set');
    if(!target.length) throw new RangeError('날짜를 선택하세요!');
    for(const dom of target) timetable.push(new Day($(dom).attr('data-day'), !$(dom).hasClass('today')));
    
    /* loading data */
    const classList = await $.ajax(`${api_base_url}/class/all`);
    const teacherList = await $.ajax(`${api_base_url}/teacher/all`);
    
    /* classes and teachers initialization */
    let classes = [], teachers = [], agesIndex = { infant: [], child: [] };
    classList.filter(c => c.isIncluded == "true").forEach(c => {
      let members = [];
      teacherList.filter(t => t.class == c.class).forEach(t => {
        // 선생님 객체 생성
        let teacher = new Teacher(t.id, t.name, t.class, c.age, JSON.parse(t.restriction));
        teachers.push(teacher); // 선생님 목록에 추가
        members.push(teacher); // 학급별 선생님 목록에 추가
      });
      classes.push(new Class(c.class, c.age, members)); // 학급 목록에 추가
      
      // 나이 인덱스에 추가
      if(!agesIndex[Number(c.age)]) agesIndex[c.age] = [];
      if     (Number(c.age) && (Number(c.age) < 3)) agesIndex['infant'].push(c.class);
      else if(Number(c.age) && (Number(c.age) > 2)) agesIndex['child'].push(c.class);
      agesIndex[c.age].push(c.class);
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
      
      if(timetable[Number(i) + op].isHoliday) continue;
      
      const day = timetable[Number(i) + op].day;
      const sat_rand = Math.random() < 0.5;
      
      /* reset counts at start of week operation (tuesday) */
      if(day == 'tue') {
        teachers.forEach(t => {
          Object.entries(t.counts).forEach(([k, v]) => { t.counts[k] = 0; });
        });
      }
 
      let loop_teachers = []; // loop별 새로 복사한 선생님 목록 필요
      teachers.forEach(o => loop_teachers.push(o));
  
      /* set t0630 timetable: timetable[Number(i) + op].t0630 */
      let t0630_teachers = []; // 각 time별 새로 복사한 선생님 목록 필요
      loop_teachers.forEach(o => t0630_teachers.push(o));
  
      // 개인 제약조건 제외
      t0630_teachers = t0630_teachers.filter(t => !t.restriction.includes(`t0630|${day}`));
      
      // 누리교사 및 야간반 제외
      t0630_teachers = t0630_teachers.filter(t => !agesIndex['누리교사'].includes(t.class) && !agesIndex['야간반'].includes(t.class));
      
      // t0630_t0730, L_Dty 최대치 제한 제외
      t0630_teachers = t0630_teachers.filter(t => ((t.counts.t0630_t0730 < limits.t0630_t0730) || (t.counts.L_Dty < limits.L_Dty)));
      
      if(day == 'sat') { // 토요일일 때
        // 1주일간 t0630 제외
        t0630_teachers = t0630_teachers.filter(t => !t.counts.t0630);
        
        // 영아1 or 유아1 선택
        const tgt = sat_rand ? 'infant' : 'child';
        t0630_teachers = t0630_teachers.filter(t => agesIndex[tgt].includes(t.class));
  
        // 1명 추출 후 목록에서 제거
        const pick = t0630_teachers.splice(Math.floor(Math.random() * t0630_teachers.length), 1)[0];
        loop_teachers = loop_teachers.filter(t => t.id != pick.id);
  
        // 추출된 인원 count 증가
        pick.counts.t0630++;
        pick.counts.t0630_t0730++;
  
        // timetable에 추가
        timetable[Number(i) + op].t0630.push(pick);
      }
      else { // 토요일 아닐 때
        // 전날 L_Dty, 전날 및 다음날 t0630_t0730 제외
        const dayBefore = (Number(i) + op - 1), dayAfter = (Number(i) + op + 1);
        if(dayBefore >= 0 && dayAfter < timetable.length) {
          let target_List = [];
          target_List = target_List.concat(timetable[dayBefore].L_Dty.map(o => o.id));
          target_List = target_List.concat(timetable[dayBefore].t0630.map(o => o.id));
          target_List = target_List.concat(timetable[dayBefore].t0730.map(o => o.id));
          target_List = target_List.concat(timetable[dayAfter].t0630.map(o => o.id));
          target_List = target_List.concat(timetable[dayAfter].t0730.map(o => o.id));
          t0630_teachers = t0630_teachers.filter(t => !target_List.includes(t.id));
        }
        // !!!!! 행사 있는 연령 제외
        // !!!!! 휴가 있는 연령 제외
        if(day == 'mon') {
          // 전 주 월요일 t0630_t0730 제외
          const lastMonday = (Number(i) + op - 10);
          if(lastMonday >= 0) {
            let target_List = [];
            target_List = target_List.concat(timetable[lastMonday].t0630.map(o => o.id));
            target_List = target_List.concat(timetable[lastMonday].t0730.map(o => o.id));
            t0630_teachers = t0630_teachers.filter(t => !target_List.includes(t.id));
          }
        }
        else if (day == 'fri') {
          // 전 주 금요일 t0630_t0730 제외
          const lastFriday = (Number(i) + op - 2);
          if(lastFriday >= 0) {
            let target_List = [];
            target_List = target_List.concat(timetable[lastFriday].t0630.map(o => o.id));
            target_List = target_List.concat(timetable[lastFriday].t0730.map(o => o.id));
            t0630_teachers = t0630_teachers.filter(t => !target_List.includes(t.id));
          }
        }
        // 영아1, 유아1 선택
        const t0630_teachers_infant = t0630_teachers.filter(t => agesIndex['infant'].includes(t.class));
        const t0630_teachers_child = t0630_teachers.filter(t => agesIndex['child'].includes(t.class));
        
        // 1명 추출 후 목록에서 제거
        const pick_infant = t0630_teachers_infant.splice(Math.floor(Math.random() * t0630_teachers_infant.length), 1)[0];
        const pick_child = t0630_teachers_child.splice(Math.floor(Math.random() * t0630_teachers_child.length), 1)[0];
        // t0630_teachers = t0630_teachers.filter(t => t.id != pick_infant.id); -> 어차피 t0630 끝이라 필요없음
        loop_teachers = loop_teachers.filter(t => (t.id != pick_infant.id) && (t.id != pick_child.id));
  
        // 추출된 인원 count 증가
        pick_infant.counts.t0630++;
        pick_infant.counts.t0630_t0730++;
        pick_child.counts.t0630++;
        pick_child.counts.t0630_t0730++;
  
        // timetable에 추가
        timetable[Number(i) + op].t0630.push(pick_infant, pick_child);
      }
      
      
      /* set t0900 timetable: timetable[Number(i) + op].t0900 */
      let t0900_teachers = []; // 각 time별 새로 복사한 선생님 목록 필요
      loop_teachers.forEach(o => t0900_teachers.push(o));
      
      // 개인 제약조건 제외
      t0900_teachers = t0900_teachers.filter(t => !t.restriction.includes(`t0900|${day}`));
      
      // 누리교사 및 야간반 제외
      t0900_teachers = t0900_teachers.filter(t => !agesIndex['누리교사'].includes(t.class) && !agesIndex['야간반'].includes(t.class));
      
      // t0900 최대치 제한 제외
      t0900_teachers = t0900_teachers.filter(t => t.counts.t0900 < limits.t0900);
      
      if(day == 'mon') {
        // 전 주 월요일 t0900 제외
        const lastMonday = (Number(i) + op - 10);
        if(lastMonday >= 0) {
          let target_List = [];
          target_List = target_List.concat(timetable[lastMonday].t0900.map(o => o.id));
          t0900_teachers = t0900_teachers.filter(t => !target_List.includes(t.id));
        }
      }
      else if (day == 'fri') {
        // 전 주 금요일 t0900 제외
        const lastFriday = (Number(i) + op - 2);
        if(lastFriday >= 0) {
          let target_List = [];
          target_List = target_List.concat(timetable[lastFriday].t0900.map(o => o.id));
          t0900_teachers = t0900_teachers.filter(t => !target_List.includes(t.id));
        }
      }
      else if(day == 'sat') {
        // 1주일간 t0630 제외
        loop_teachers = loop_teachers.filter(t => !t.counts.t0630);
        
        // 영아1 or 유아1 선택 (토요일 6시와 반대)
        const tgt = !sat_rand ? 'infant' : 'child';
        loop_teachers = loop_teachers.filter(t => agesIndex[tgt].includes(t.class));
        
        // 1명 추출 후 목록에서 제거
        const pick = loop_teachers.splice(Math.floor(Math.random() * loop_teachers.length), 1)[0];
  
        // 추출된 인원 count 증가
        pick.counts.t0900++;
  
        // timetable에 추가
        timetable[Number(i) + op].t0900.push(pick);
        
        continue;
      }
      
      // 연령별 1명씩 선택
      let rand_count = 1; // 랜덤 추출 인원
      let pick = [];
      for(let m = 1; m <= 5; m++) {
        const tgt = t0900_teachers.filter(t => agesIndex[m].includes(t.class));
        pick.push(tgt[Math.floor(Math.random() * tgt.length)]);
      }
      
      pick.forEach(o => {
        if(!o) rand_count++;
        else o.counts.t0900++;
      });
      pick = pick.filter(o => o);
      const pick_id = pick.map(o => o.id);
      
      // 추출 후 목록에서 제거
      loop_teachers = loop_teachers.filter(t => !pick_id.includes(t.id));
      t0900_teachers = t0900_teachers.filter(t => !pick_id.includes(t.id));
      
      // timetable에 추가
      pick.forEach(o => timetable[Number(i) + op].t0900.push(o) );
      
      // 랜덤 출근인원 선택
      for(let r = 1; r <= rand_count; r++) {
        const pick_rand = t0900_teachers.splice(Math.floor(Math.random() * t0900_teachers.length), 1)[0];
        if(!pick_rand) return main(); // restart if no remaining teachers
        loop_teachers = loop_teachers.filter(t => t.id != pick_rand.id);
        pick_rand.counts.t0900++;
        timetable[Number(i) + op].t0900.push(pick_rand);
      }
      
      // 추출 인원들 중에서 랜덤 2명 막당직 선택
      // 행사 있는 인원 제외 !!!!!!!!
      // L_Dty 최대치 제외
      let L_Dty_targets = timetable[Number(i) + op].t0900.filter(t => (t.counts.L_Dty < limits.L_Dty));
      for(let l = 0; l < 2; l++) {
        const tgt = L_Dty_targets.splice(Math.floor(Math.random() * L_Dty_targets.length), 1)[0];
        tgt.counts.L_Dty++;
        timetable[Number(i) + op].L_Dty.push(tgt);
      }
      
      // 남은 인원들 중에서 랜덤 2명 저녁홀 선택
      // 홀 최대치 제외
      t0900_teachers = t0900_teachers.filter(t => (t.counts.hall < limits.hall));
      for(let d = 0; d < 2; d++) {
        const tgt = t0900_teachers.splice(Math.floor(Math.random() * t0900_teachers.length), 1)[0];
        if(!tgt) return main();
        loop_teachers = loop_teachers.filter(t => t.id != tgt.id);
        tgt.counts.hall++;
        tgt.counts.t0900++;
        timetable[Number(i) + op].pmH.push(tgt);
      }
      
      
      /* set t0730 timetable: timetable[Number(i) + op].t0730 */
      let t0730_teachers = []; // 각 time별 새로 복사한 선생님 목록 필요
      loop_teachers.forEach(o => t0730_teachers.push(o));
  
      // 개인 제약조건 제외
      t0730_teachers = t0730_teachers.filter(t => !t.restriction.includes(`t0730|${day}`));
      
      // 누리교사 및 야간반 제외
      t0730_teachers = t0730_teachers.filter(t => !agesIndex['누리교사'].includes(t.class) && !agesIndex['야간반'].includes(t.class));
      
      // t0630_t0730, L_Dty 최대치 제한 제외
      t0730_teachers = t0730_teachers.filter(t => ((t.counts.t0630_t0730 < limits.t0630_t0730) || (t.counts.L_Dty < limits.L_Dty)));
  
      // 전날, 다음날 t0630 제외
      const dayBefore = (Number(i) + op - 1), dayAfter = (Number(i) + op + 1);
      if(dayBefore >= 0 && dayAfter < timetable.length) {
        let target_List = [];
        target_List = target_List.concat(timetable[dayBefore].t0630.map(o => o.id));
        target_List = target_List.concat(timetable[dayAfter].t0630.map(o => o.id));
        t0730_teachers = t0730_teachers.filter(t => !target_List.includes(t.id));
      }
      
      if(day == 'mon') {
        // 전 주 월요일 t0630_t0730 제외
        const lastMonday = (Number(i) + op - 10);
        if(lastMonday >= 0) {
          let target_List = [];
          target_List = target_List.concat(timetable[lastMonday].t0630.map(o => o.id));
          target_List = target_List.concat(timetable[lastMonday].t0730.map(o => o.id));
          t0730_teachers = t0730_teachers.filter(t => !target_List.includes(t.id));
        }
      }
      else if (day == 'fri') {
        // 전 주 금요일 t0630_t0730 제외
        const lastFriday = (Number(i) + op - 2);
        if(lastFriday >= 0) {
          let target_List = [];
          target_List = target_List.concat(timetable[lastFriday].t0630.map(o => o.id));
          target_List = target_List.concat(timetable[lastFriday].t0730.map(o => o.id));
          t0730_teachers = t0730_teachers.filter(t => !target_List.includes(t.id));
        }
      }
      // 휴가 있는 연령 제외 !!!!!!!!!!!
      
      // 연령별 1명씩 선택
      let rand_cnt = 0; // 랜덤 추출 인원
      let pick_t0730 = [];
      for(let m = 1; m <= 5; m++) {
        const tgt = t0730_teachers.filter(t => agesIndex[m].includes(t.class));
        pick_t0730.push(tgt[Math.floor(Math.random() * tgt.length)]);
      }
      
      pick_t0730.forEach(o => {
        if(!o) rand_cnt++;
        else {
          o.counts.t0730++;
          o.counts.t0630_t0730++;
        }
      });
      
      // 랜덤 출근인원 선택
      for(let r = 0; r < rand_cnt; r++) {
        const pick_rand = t0730_teachers.splice(Math.floor(Math.random() * t0730_teachers.length), 1)[0];
        if(!pick_rand) return main(); // restart if no remaining teachers
        pick_rand.counts.t0730++;
        pick_rand.counts.t0630_t0730++;
        
        pick_t0730.push(pick_rand);
      }
      
      pick_t0730 = pick_t0730.filter(o => o);
      const pick_id_t0730 = pick_t0730.map(o => o.id);
      
      // 추출 후 목록에서 제거
      loop_teachers = loop_teachers.filter(t => !pick_id_t0730.includes(t.id));
      t0730_teachers = t0730_teachers.filter(t => !pick_id_t0730.includes(t.id));
      
      // timetable에 추가
      pick_t0730.forEach(o => timetable[Number(i) + op].t0730.push(o) );
        
      // 아침홀 1명 추출
      t0730_teachers = t0730_teachers.filter(t => (t.counts.hall < limits.hall));
      const amH_rand = t0730_teachers.splice(Math.floor(Math.random() * t0730_teachers.length), 1)[0];
      if(!amH_rand) return main();
      loop_teachers = loop_teachers.filter(t => t.id != amH_rand.id);
      amH_rand.counts.hall++;
      amH_rand.counts.t0730++;
      amH_rand.counts.t0630_t0730++;
      timetable[Number(i) + op].amH.push(amH_rand);
      
      
      /* set t0830 timetable: timetable[Number(i) + op].t0830 */
      let t0830_teachers = []; // 각 time별 새로 복사한 선생님 목록 필요
      loop_teachers.forEach(o => t0830_teachers.push(o));
  
      // 개인 제약조건 제외
      t0830_teachers = t0830_teachers.filter(t => !t.restriction.includes(`t0830|${day}`));
      
      // 누리교사 및 야간반 제외
      t0830_teachers = t0830_teachers.filter(t => !agesIndex['누리교사'].includes(t.class) && !agesIndex['야간반'].includes(t.class));
      
      // 휴가자 수 따라 배치 !!!!!!!!!!!!!!!!!
      
      // 남은 인원 8명 선택
      for(let p = 0; p < 8; p++) {
        const tgt = t0830_teachers.splice(Math.floor(Math.random() * t0830_teachers.length), 1)[0];
        if(!tgt) return main();
        loop_teachers = loop_teachers.filter(t => t.id != tgt.id);
        tgt.counts.t0830++;
        timetable[Number(i) + op].t0830.push(tgt);
      }
    }
    
    /* draw result */
    draw(timetable, classList);
  }
  catch(e) {
    $('#output').text('ERROR.').css('color', 'orangered');
    $('#start, #reset').attr('disabled', false);
    if(e.message.includes('날짜')) return Swal.fire({ icon: 'error', title: e.message });
    else return Swal.fire({ icon: 'error', title: `RUNTIME ERROR`, html: `<div style='font-size: 0.8rem; text-align: left;'>${e.stack.replace(/ /g, '&nbsp;')}</div>` });
  }
}

function draw(timetable, classList) {
  console.log(timetable);
  moment.locale('ko');
  let html = ``;
  for(let i = 0; i < timetable.length / 6; i++) {    
    html += `
      <table class='time-table'>
        <tr><th>시간/날짜</th> ${dateHeaderTag`${i}`} </tr>
        <tr><td>고려사항</td><td colspan=6></td></tr>
        <tr><td>6:30</td> ${timeValueTag`${i} ${'t0630'}`} </tr>
        <tr><td>7:30<br>(7:20)</td> ${timeValueTag`${i} ${'t0730'}`} </tr>
        <tr><td>8:30<br>(8:30~9:30)<br>♠(4:00~5:00)</td> ${timeValueTag`${i} ${'t0830'}`} </tr>
        <tr><td>9:00<br>(5:00~6:00)</td> ${timeValueTag`${i} ${'t0900'}`} </tr>
      </table>
    `;
  }
  html += `
    <style>
      .time-table { width: 100%; max-width: 850px; text-align: center; margin-bottom: 3rem; }
      .time-table tr th { padding: 10px 10px; border: 1px solid gray; }
      .time-table tr td { padding:  3px 10px; border: 1px solid gray; }
      .content-table { margin: 0 auto; text-align: left; }
      .content-table tr td { padding: 2px; border: none; }
      ${classColorTag`${null}`}
    </style>
  `;
  $('#timetable').html(html);
  moment.locale('en');
  
  $('#output').text(`FINISHED. (${Math.round(performance.now() - startTime) / 1000}s, ${startCount}x)`).css('color', 'dodgerblue');
  /* enabling buttons */
  $('#start, #reset').attr('disabled', false);
  
  function dateHeaderTag(str, i) {
    let tag = ``;
    for(let j = 0; j < 6; j++) tag += `<th>${moment(timetable[i * 6 + j].date, 'yyyy-MM-DD').format('M월 D일(ddd)')}</th>`;
    return tag;
  }
  function timeValueTag(str, i, target) {
    let tag = ``;
    for(let j = 0; j < 6; j++) {
      let targetArray = timetable[i * 6 + j][target];
      // !!!!!!!!!! if(target == 't0730') targetArray = targetArray.concat(timetable[i * 6 + j].amH.map(o => { o.amH = true; return o; }));
      
      let tagContent = targetArray
      .sort((a, b) => { return a.age.localeCompare(b.age) })
      .sort((a, b) => { return a.name.localeCompare(b.name) })
      .map((t, idx, arr) => `
        ${!(idx % 2) ? `<tr>` : ``}
          <td>
            <span style='font-weight: bold'>
              ${t.amH ? '(' : String.fromCharCode(9311 + classList.find(c => c.class == t.class).age * 1)}
              <span class='${t.class}'> ${t.name} </span>
              ${t.amH ? ')' : ''}
            </span>
          </td>
        ${(idx % 2) ? `</tr>` : ``}
        
      `)
      .join('');
      
      tag += `
        <td>
          <table class='content-table'>${tagContent}</table>
          ${(target == 't0830' && timetable[i * 6 + j].day != 'sat') ? `<span style='color: black; font-weight: bold'>(L) (♠ K1 K2)</span>` : ``}
        </td>`;
    }
    return tag;
  }
  function classColorTag(str) { return classList.map(c => `.${c.class} { color: ${c.color} }`).join(''); }
}

$(function() {
  $('#start').click(() => {
    /* disabling buttons */
    $('#start, #reset').attr('disabled', true);
    startTime = performance.now(), startCount = 0;
    main()
  });
  $('#reset').click(() => { 
    $('#output').text(`READY.`).css('color', 'limegreen');
    new Calendar('#calendar', [])
  }).trigger('click');
  
  $('#tooltip_page').click(() => {
    Swal.fire({
      title: '근무 시간표 작성',
      html: `
<div id='page_tooltip'>
  <b>교사 / 학급 목록을 기반으로 근무 시간표를 작성합니다.</b>
  <ol>
    <li>달력에서 날짜를 선택합니다. 선택한 날짜와 <b>같은 주 월요일부터 4주</b>가 작성 기간으로 자동으로 선택됩니다.</li>
    <li>날짜를 우클릭하면 선택 해제할 수 있습니다. (휴원일)</li>
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
div#page_tooltip ul, div#page_tooltip ol {
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
