$(async function() {
  const classList = await $.ajax(`${api_base_url}/class/all`);
  const teacherList = await $.ajax(`${api_base_url}/teacher/all`);
  
  $('#class-list').DataTable({
    dom: "t",
    data: classList,
    paging: false,
    ordering: false,
    columns: [
      { data: "class" },
      { data: "age" },
      { data: "isIncluded", render: function(data, type, row, meta) { return `<input class='isIncluded' type='checkbox' ${data ? 'checked' : ''}>` } },
      { defaultContent: "<i class='fas fa-trash-alt' style='cursor: pointer'></i>" }
    ]
  });
  $('#class-list').on('click', 'td', function(e) {
    if($(this).children('input').length) {
      let data = $('#class-list').DataTable().cell(this).data();
      $('#class-list').DataTable().cell(this).data(data ? 0 : 1);
    }
    else if($(this).children('i').length) {
      // delete row
    }
  });
  datatableEdit({
    dataTable : $('#class-list').DataTable(),
    columnDefs : [
      { targets : 0 },
      { targets : 1 }
     ],
     onEdited : (prev, changed, index, cell) => {
       
     }
  });
  
  /* generating teacher list table */
  $('#teacher-list').DataTable({
    dom: "t",
    data: teacherList,
    paging: false,
    ordering: false,
    columns: [
      { data: "id" },
      { data: "name" },
      { data: "class" },
      { data: "restriction" }
    ]
  });
  $('#teacher-list').on('click', 'td', function(e) {
    
  });
  datatableEdit({
    dataTable : $('#teacher-list').DataTable(),
    columnDefs : [
      
     ],
     onEdited : (prev, changed, index, cell) => {
       
     }
  });
  
  generateUnitTable(classList, teacherList);
});

function regen() {
  const classList = await $.ajax(`${api_base_url}/class/all`);
  const teacherList = await $.ajax(`${api_base_url}/teacher/all`);
  generateUnitTable(classList, teacherList);
  
  // regen table with data
}

function generateUnitTable(classList, teacherList) {
  console.log(classList, teacherList)
  let infant = 0, child = 0, infantTeacher = 0, childTeacher = 0;
  const ageList = classList.map(o => o.age), ageCounts = {};
  ageList.forEach(x => { ageCounts[x] = (ageCounts[x] || 0) + 1 });
  
  Object.keys(ageCounts).forEach(o => {
    infant += (Number(o) && Number(o) < 3) ? ageCounts[o] : 0;
    child += (Number(o) && Number(o) > 2) ? ageCounts[o] : 0;
  });
  teacherList.forEach(o => {
    const target = classList.find(c => o.class == c.class);
    infantTeacher += (Number(target.age) && Number(target.age) < 3) ? 1 : 0;
    childTeacher += (Number(target.age) && Number(target.age) > 2) ? 1 : 0;
  });
  
  // 첫 번째 줄(분류)
  let html = `<table><tr><td rowspan=3>학급</td><td colspan=${infant}>영아반</td><td colspan=${child}>유아반</td>`;
  for( const group of ageList.filter(o => Number.isNaN(Number(o))) ) html += `<td rowspan=2>${group}</td>`;
  html += `</tr>`;
  
  // 두 번째 줄(연령)
  html += `<tr>`;
  for( const age of Object.keys(ageCounts) ) {
    if( !Number.isNaN(Number(age)) ) html += `<td colspan=${ageCounts[age]}>${age}세</td>`;
  }
  html += `</tr>`;
  
  // 세 번째 줄(학급)
  html += `<tr>`;
  for( const group of classList ) html += `<td>${group.class}</td>`;
  html += `</tr>`;
  
  // 네 번째 줄(교사 목록)
  html += `<tr><td rowspan=4>교사</td>`;
  for( const group of classList ) {
    const teachers = teacherList.filter(o => o.class == group.class).map(o => o.name).join('<br>');
    html += `<td>${teachers}</td>`;
  }
  html += `</tr>`;
  
  // 다섯 번째 줄(학급별 교사 수)
  html += `<tr>`;
  for( const group of classList ) {
    html += `<td rowspan=${!Number.isNaN(Number(group.age)) ? 1 : 2}>${teacherList.filter(o => o.class == group.class).length}명</td>`;
  }
  html += `</tr>`;
  
  // 여섯 번째 줄(분류별 교사 수)
  html += `<tr>`;
  html += `<td colspan=${infant}>${infantTeacher}명</td><td colspan=${child}>${childTeacher}명</td>`;
  html += `</tr>`;
  
  html += `</table>`;
  $('div#unit-configuration').html(html);
}