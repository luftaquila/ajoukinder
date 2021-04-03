$(function() {
  Swal.fire({
    title: '관리자 인증이 필요합니다.',
    footer: "<span style='font-size: 0.8rem'>©" + new Date().getFullYear() + " LUFT-AQUILA, 아주대학교 전자공학과 18학번 <a href='https://luftaquila.io/'>오병준</a></span>",
    input: 'number',
    inputAttributes: { autocapitalize: 'off' },
    showCancelButton: false,
    confirmButtonText: '인증',
    showLoaderOnConfirm: true,
    preConfirm: (code) => {
      return fetch('https://luftaquila.io/ajoumaker/api/adminVerification', {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })
      })
      .then(response => {
        if(response.status == 499) throw { name : "codeNotMatchError", message : "code does not match" };
        else if (!response.ok) throw new Error(response.statusText);
        return response.json();
       })
      .catch(error => {
        if(error.name == 'codeNotMatchError')
          Swal.showValidationMessage('인증에 실패하였습니다.');
        else
          Swal.showValidationMessage(`Request failed: ${error}`);
      })
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
    if (result.isConfirmed) {
      if(result.value.length) {
        // on verification successful
        $('#contents').css('display', 'block');
        
        admins = $('#admins').DataTable({
          pagingType: "simple",
          ajax: {
            url: "https://luftaquila.io/ajoumaker/api/requestAdmins",
            type: 'POST',
            dataSrc: ''
          },
          columns: [
            { data: "name" },
            { data: "code" }
          ]
        });
        
        $.ajax({
          url: 'https://luftaquila.io/ajoumaker/api/requestSetting',
          type: 'POST',
          data: { key: 'notice' },
          success: function(res) { $('#notice').val(res[0].value); }
        });
      }
    }
  });
  
  $('#addAdmin').click(function() {
    let data = {}
    try {
      if(!$('#adminName').val().trim()) throw { name: 'invalidDataError', message: '이름을 입력하세요.' };
      else if($('#adminName').val().trim() > 10) throw { name: 'invalidDataError', message: '이름은 10자를 초과할 수 없습니다.' };
      else data.name = $('#adminName').val().trim();
      
      if(!$('#adminCode').val().trim()) throw { name: 'invalidDataError', message: '코드를 입력하세요.' };
      else data.code = $('#adminCode').val().trim();
    }
    catch(e) {
      if(e.name == 'invalidDataError') return Swal.fire(e.message, '', 'warning');
      else console.error(e);
    }
    $.ajax({
      url: 'https://luftaquila.io/ajoumaker/api/addAdmin',
      type: 'POST',
      data: data,
      success: function(res) {
        Swal.fire('관리자가 등록되었습니다.', '', 'success');
        admins.ajax.reload();
        $('#adminName').val('');
        $('#adminCode').val('');
      },
      error: function(res) {
        Swal.fire('등록에 실패했습니다.', '', 'error');
      }
    });
  });  
  $('#deleteAdmin').click(function() {
    if(!$('#deleteAdminCode').val()) return Swal.fire('코드를 입력하세요.', '', 'warning');
    $.ajax({
      url: 'https://luftaquila.io/ajoumaker/api/deleteAdmin',
      type: 'POST',
      data: { code: $('#deleteAdminCode').val() },
      success: function(res) {
        if(res.result) Swal.fire(res.msg, '', 'warning');
        else if(res.affectedRows) {
          Swal.fire('관리자가 삭제되었습니다.', '', 'success');
          admins.ajax.reload();
          $('#deleteAdminCode').val('');
        }
        else Swal.fire('등록되지 않은 코드입니다.', '', 'warning');
      },
      error: function(res) {
        Swal.fire('삭제에 실패했습니다.', '', 'error');
      }
    });
  });
  $('#updateNotice').click(function() {
    $.ajax({
      url: 'https://luftaquila.io/ajoumaker/api/updateNotice',
      type: 'POST',
      data: { notice: $('#notice').val().replace(/`/g, '"').replace(/\'/g, '"') },
      success: function(res) {
        if(res.affectedRows) Swal.fire('공지가 변경되었습니다.', '', 'success');
        else Swal.fire('공지 변경에 실패했습니다.', '특수문자는 사용할 수 없습니다.', 'warning');
      },
      error: function(res) {
        Swal.fire('공지 변경에 실패했습니다.', '특수문자는 사용할 수 없습니다.', 'warning');
      }
    });
  });
});