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
    if($(this).children('input.isIncluded').length) {
      const data = $('#class-list').DataTable().cell(this).data();
      const target = $(this).children('input.isIncluded').attr('data-class');
      
      $.ajax({
        url: `${api_base_url}/class`,
        type: `PUT`,
        data: { target: 'isIncluded', class: target, value: !(data == 'true') },
        success: res => {
          if(res.status && res.result && res.result.affectedRows) {
            toastr["success"](`수정되었습니다.`);
            regen();
          }
          else Swal.fire({ icon: 'error', title: '알 수 없는 오류입니다.', text: JSON.stringify(res) });
        },
        error: e => Swal.fire({ icon: 'error', title: e.responseJSON.msg })
      });
    }
    
    // delete row
    else if($(this).children('i.delete_class').length) {
      $.ajax({
        url: `${api_base_url}/class`,
        type: `DELETE`,
        data: { class: $(this).children('i.delete_class').attr('data-class') },
        success: res => {
          if(res.status && res.result && res.result.affectedRows) {
            toastr["warning"](`삭제되었습니다.`);
            regen();
          }
          else Swal.fire({ icon: 'error', title: '알 수 없는 오류입니다.', text: JSON.stringify(res) });
        },
        error: e => Swal.fire({ icon: 'error', title: e.responseJSON.msg })
      });
    }
  }).DataTable({
    dom: "t",
    data: classList,
    paging: false,
    ordering: false,
    columns: [
      { data: "class" },
      { data: "age" },
      { data: "isIncluded", render: (data, type, row, meta) => { return `<input data-class='${row.class}' class='isIncluded' type='checkbox' ${data == 'true' ? 'checked' : ''}>` } },
      { render: (data, type, row, meta) => { return `<i class='delete_class fas fa-trash-alt' data-class='${row.class}' style='cursor: pointer'></i>` }}
    ]
  });
  datatableEdit({
    dataTable : $('#class-list').DataTable(),
    columnDefs : [
      { targets : 0 },
      { targets : 1 }
    ],
    onEdited : (prev, changed, index, cell) => {
      let payload = {}, data = $('#class-list').DataTable().row( index.row ).data();
      
      if(prev == changed) return;
      else if(!index.column) payload.class = prev; // if class name has changed 
      else payload.class = data.class;
      payload.target = index.column ? 'age' : 'class';
      payload.value = $.trim(changed);
      
      $.ajax({
        url: `${api_base_url}/class`,
        type: `PUT`,
        data: payload,
        success: res => {
          if(res.status && res.result && res.result.affectedRows) {
            toastr["success"](`수정되었습니다.`);
            regen();
          }
          else Swal.fire({ icon: 'error', title: '알 수 없는 오류입니다.', text: JSON.stringify(res) });
        },
        error: e => Swal.fire({ icon: 'error', title: e.responseJSON.msg })
      });
     }
  });
  
  /* teacher list table initialization */
  $('#teacher-list').on('click', 'td', async function(e) {
    // delete row
    if($(this).children('i.delete_teacher').length) {
      $.ajax({
        url: `${api_base_url}/teacher`,
        type: `DELETE`,
        data: { id: $(this).children('i.delete_teacher').attr('data-teacher-id') },
        success: res => {
          if(res.status && res.result && res.result.affectedRows) {
            toastr["warning"](`삭제되었습니다.`);
            regen();
          }
          else Swal.fire({ icon: 'error', title: '알 수 없는 오류입니다.', text: JSON.stringify(res) });
        },
        error: e => Swal.fire({ icon: 'error', title: e.responseJSON.msg })
      });
    }
    
    // edit restriction
    else if($(this).children('span.edit_teacher_restriction').length) {
      const target = $(this).children('span.edit_teacher_restriction').attr('data-teacher-id');
      const targetName = $('#teacher-list').DataTable().row( $(this).parent() ).data().name;
      
      const restriction = await $.ajax(`${api_base_url}/teacher/restriction/${target}`);
      const lookup = {
        days: { '월': 'mon', '화': 'tue', '수': 'wen', '목': 'thu', '금': 'fri', '토': 'sat' },
        time: { '06:30': '0630', '07:30':'0730', '아침홀': 'amH', '08:30':'0830', '저녁홀': 'pmH', '09:00':'0900', '막당직': 'L_Dty' }
      }
      
      let html = `<div style='margin-bottom: 0.5rem; font-size: 0.9rem;'><i class='fas fa-lightbulb-exclamation' style='color: forestgreen'></i>&ensp;근무에서 제외할 날을 선택하세요.</div><table id='restrictions' data-target='${target}' style='width: 100%'>`;
      
      // table header row generation
      html += `<tr><th></th>`;
      for( const day of Object.keys(lookup.days) ) html += `<th>${day}</th>`;
      html += `</tr>`;
      
      // table rows generation
      for( const [key, value] of Object.entries(lookup.time) ) {
        html += `<tr><td>${key}</td>`;
        
        // checkbox generation
        for( const day of Object.values(lookup.days) ) {
          const dataValue = `${value}|${day}`;
          const test = restriction.find(o => o == dataValue);
          html += `<td><input type='checkbox' class='restrict' value='${dataValue}' ${ test ? `checked` : `` }></td>`;
        }
        html += `</tr>`;
      }
      
      // table footer generation
      html += `</table><div style='margin-top: 0.5rem;'><span id='toggle_restrictions' class='d-sm-inline-block btn btn-sm btn-primary shadow-sm text-white' style='font-size: 0.8rem; margin-left: 0.5rem;'><i class='far fa-check-square'></i>&ensp;전체 선택/선택해제</span></div><style>table#restrictions{text-align:center;}table#restrictions tr td {padding:5px;}table#restrictions tr th {padding:7px;}</style>`;
      
      Swal.fire({
        title: `${targetName} 선생님 제약조건 수정`,
        html: html,
        didRender: () => {
          $('span#toggle_restrictions').click(function() {
            if($('input.restrict:checked').length) $('input.restrict:checked').prop('checked', false);
            else $('input.restrict').prop('checked', true);
          });
        },
        confirmButtonText: `Save`,
        showCloseButton: true,
        showCancelButton: true
      }).then((result) => {
        if(result.isConfirmed) {
          const restrictions = $.map($('input.restrict:checked'), o => $(o).val());
          $.ajax({
            url: `${api_base_url}/teacher`,
            type: `PUT`,
            data: { target: 'restriction', value: JSON.stringify(restrictions), id: target },
            success: res => {
              if(res.status && res.result && res.result.affectedRows) {
                toastr["success"](`수정되었습니다.`);
                regen();
              }
              else Swal.fire({ icon: 'error', title: '알 수 없는 오류입니다.', text: JSON.stringify(res) });
            },
          error: e => Swal.fire({ icon: 'error', title: e.responseJSON.msg })
          });
        }
      });
    }
  }).DataTable({
    dom: "t",
    data: teacherList,
    paging: false,
    ordering: false,
    columns: [
      { data: "id" },
      { data: "name" },
      { data: "class" },
      { data: "restriction", render: (data, type, row, meta) => { return `<span class='edit_teacher_restriction' data-teacher-id='${row.id}' style='color: #0645AD; border-bottom: 1px solid #0645AD; cursor: pointer;'>편집</span>` }},
      { render: (data, type, row, meta) => { return `<i class='delete_teacher fas fa-trash-alt' data-teacher-id='${row.id}' style='cursor: pointer'></i>` }}
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
      let payload = {}, data = $('#teacher-list').DataTable().row( index.row ).data();
      
      if(prev == changed) return;
      else if(!index.column) payload.id = prev; // if id has changed 
      else payload.id = data.id;
      payload.target = index.column ? (index.column == 2 ? 'class' : 'name') : 'id';
      payload.value = $.trim(changed);
      
      // class name validation
      if(payload.target == 'class' && !$(`select#class_select option[value="${payload.value}"]`).length) {
        Swal.fire({ icon: 'error', title: '존재하지 않는 학급입니다.' });
        return regen();
      }
      
      $.ajax({
        url: `${api_base_url}/teacher`,
        type: `PUT`,
        data: payload,
        success: res => {
          if(res.status && res.result && res.result.affectedRows) {
            toastr["success"](`수정되었습니다.`);
            regen();
          }
          else Swal.fire({ icon: 'error', title: '알 수 없는 오류입니다.', text: JSON.stringify(res) });
        },
        error: e => Swal.fire({ icon: 'error', title: e.responseJSON.msg })
      });
     }
  });
  
  /* unit configuration table generation */
  generateUnitTable(classList, teacherList);
});

async function regen() {
  const classList = await $.ajax(`${api_base_url}/class/all`);
  const teacherList = await $.ajax(`${api_base_url}/teacher/all`);
  
  $('#class_select').html('');
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
  $('div#unit-configuration').html('');
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
          else Swal.fire({ icon: 'error', title: '알 수 없는 오류입니다.', text: JSON.stringify(res) });
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
          else Swal.fire({ icon: 'error', title: '알 수 없는 오류입니다.', text: JSON.stringify(res) });
        },
        error: e => Swal.fire({ icon: 'error', title: e.responseJSON.msg })
      });
    }
  });
}
