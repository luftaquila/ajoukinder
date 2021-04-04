$(async function() {
  const classList = await $.ajax(`${api_base_url}/class/all`);
  const teacherList = await $.ajax(`${api_base_url}/teacher/all`);
  
  /* jquery event listeners */
  eventListener();
  
  /* class select on teacher_add generation */
  $('#class_select').html( `<option value disabled selected>학급 이름</option>` + classList.map(o => `<option value='${o.class}'>${o.class}</option>`).join('') );
  
  /* class list table initialization */
  $('#class-list').on('click', 'td', function(e) {
    // toggle isIncluded attr
    if($(this).children('input').length) {
      let data = $('#class-list').DataTable().cell(this).data();
      $.ajax({
        url: `${api_base_url}/class`,
        type: `PUT`,
        data: null,
        success: res => {
          $('#class-list').DataTable().cell(this).data(data ? 0 : 1);
        },
        error: e => Swal.fire({ icon: 'error', title: e.responseJSON.msg })
      });
    }
    else if($(this).children('i.delete_class').length) {
      $(this).children('i.delete_class').attr('data-class')
    }
  }).DataTable({
    dom: "t",
    data: classList,
    paging: false,
    ordering: false,
    columns: [
      { data: "class" },
      { data: "age" },
      { data: "isIncluded", render: (data, type, row, meta) => { return `<input class='isIncluded' type='checkbox' ${data ? 'checked' : ''}>` } },
      { render: (data, type, row, meta) => { return `<i class='delete_class fas fa-trash-alt' data-class=${row.class} style='cursor: pointer'></i>` }}
    ]
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
  
  /* teacher list table initialization */
  $('#teacher-list').on('click', 'td', function(e) {
    console.log(this);
  }).DataTable({
    dom: "t",
    data: teacherList,
    paging: false,
    ordering: false,
    columns: [
      { data: "id" },
      { data: "name" },
      { data: "class" },
      { data: "restriction", defaultContent: "<span style='color: #0645AD; border-bottom: 1px solid #0645AD; cursor: pointer;'>편집</span>" },
      { render: (data, type, row, meta) => { return `<i class='delete_teacher fas fa-trash-alt' data-teacher-id=${row.id} style='cursor: pointer'></i>` }}
    ]
  });
  datatableEdit({
    dataTable : $('#teacher-list').DataTable(),
    columnDefs : [
      { targets : 0 },
      { targets : 1 },
      { targets : 2 }
     ],
     onEdited : (prev, changed, index, cell) => {
       
     }
  });
  
  /* unit configuration table generation */
  generateUnitTable(classList, teacherList);
});

async function regen() {
  const classList = await $.ajax(`${api_base_url}/class/all`);
  const teacherList = await $.ajax(`${api_base_url}/teacher/all`);
  
  $('#class_select').html( `<option value disabled selected>학급 이름</option>` + classList.map(o => `<option value='${o.class}'>${o.class}</option>`).join('') );
  generateUnitTable(classList, teacherList);
  
  // regen table with data
  const classListDataTable = $('#class-list').DataTable();
  const teacherListDataTable = $('#teacher-list').DataTable();
  
  classListDataTable.clear();
  classListDataTable.rows.add(classList);
  classListDataTable.draw();
  
  teacherListDataTable.clear();
  teacherListDataTable.rows.add(teacherList);
  teacherListDataTable.draw();
}

function generateUnitTable(classList, teacherList) {
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
  let html = `<table style='width: 100%; max-width: 800px'><tr><td rowspan=3>학급</td><td colspan=${infant}>영아반</td><td colspan=${child}>유아반</td>`;
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
  for( const group of classList ) html += `<td rowspan=${!Number.isNaN(Number(group.age)) ? 1 : 2}>${teacherList.filter(o => o.class == group.class).length}명</td>`;
  html += `</tr>`;
  
  // 여섯 번째 줄(분류별 교사 수)
  html += `<tr>`;
  html += `<td colspan=${infant}>${infantTeacher}명</td><td colspan=${child}>${childTeacher}명</td>`;
  html += `</tr>`;
  
  html += `</table>`;
  $('div#unit-configuration').html(html);
}

function eventListener() {
  /* class add button click */
  $('#add_class').click(e => {
    const classname = $('#add_class_name').val(), classage = $('#add_class_age').val();
    if(!classname) return Swal.fire({ icon: 'error', title: '학급 이름을 입력하세요!' });
    else if(!classage) return Swal.fire({ icon: 'error', title: '학급 연령을 입력하세요!' });
    else {
      $.ajax({
        url: `${api_base_url}/class`,
        type: `POST`,
        data: { class: classname, age: classage },
        success: res => {
          if(res.status && res.result && res.result.affectedRows) {
            $('input#add_class_name, input#add_class_age').val('');
            toastr["success"](`추가되었습니다.`);
            regen();
          }
        },
        error: e => Swal.fire({ icon: 'error', title: e.responseJSON.msg })
      });
    }
  });
  
  /* teacher add button click */
  $('#add_teacher').click(e => {
    const teachercode = $('#add_teacher_code').val();
    const teachername = $('#add_teacher_name').val();
    const teacherclass = $('#class_select').val();
    if(!teachercode) return Swal.fire({ icon: 'error', title: '교사 코드를 입력하세요!' });
    else if(!teachername) return Swal.fire({ icon: 'error', title: '교사 이름을 입력하세요!' });
    else if(!teacherclass) return Swal.fire({ icon: 'error', title: '담당 학급을 선택하세요!' });    
    else {
      $.ajax({
        url: `${api_base_url}/teacher`,
        type: `POST`,
        data: { id: teachercode, name: teachername, class: teacherclass },
        success: res => {
          if(res.status && res.result && res.result.affectedRows) {
            $('input#add_teacher_code, input#add_teacher_name').val('');
            toastr["success"](`추가되었습니다.`);
            regen();
          }
        },
        error: e => Swal.fire({ icon: 'error', title: e.responseJSON.msg })
      });
    }
  });
}
