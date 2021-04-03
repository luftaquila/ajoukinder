$(function() {
  collegeDict = {
    '공과대학': ['기계공학과', '산업공학과', '화학공학과', '신소재공학과', '응용화학생명공학과', '환경안전공학과', '건설시스템공학과', '교통시스템공학과', '건축학과', '건축공학과', '융합시스템공학과'],
    '정보통신대학': ['전자공학과', '소프트웨어학과', '사이버보안학과', '미디어학과', '국방디지털융합학과'],
    '자연과학대학': ['수학과', '물리학과', '화학과', '생명과학과'],
    '경영대학': ['경영학과', 'e-비즈니스학과', '금융공학과', '글로벌경영학과'],
    '인문대학': ['국어국문학과', '영어영문학과', '불어불문학과', '사학과', '문화콘텐츠학과'],
    '사회과학대학': ['경제학과', '행정학과', '심리학과', '사회학과', '정치외교학과', '스포츠레저학과'],
    '의과대학': ['의학과'],
    '간호대학': ['간호학과'],
    '약학대학': ['약학과'],
    '국제학부': ['국제통상전공', '지역연구전공(일본)', '지역연구전공(중국)'],
    '다산학부대학': ['다산학부대학'],
    '기타': ['기타']
  };
  
  var collegeList = '<option value="" disabled selected>소속 1</option>';
  for (var college in collegeDict) collegeList += '<option value="' + college + '">' + college + '</option>';
  $('#unit').html(collegeList).change();
  $('#unit').change(function () {
    if($(this).val() == '기타')
      $('#belonging').replaceWith($("<input placeholder='소속' id='belonging' class='form-control bg-white border-dark small' style='width:10rem!important; display: inline-block;' required/>"));
    else {
      $('#belonging').replaceWith($("<select placeholder='학과' id='belonging' class='form-control bg-white border-dark small' style='width:10rem!important; display: inline-block;' required/>"));
      var departmentList = '';
      for (var i in collegeDict[$(this).val()]) departmentList += '<option value="' + collegeDict[$(this).val()][i] + '">' + collegeDict[$(this).val()][i] + '</option>';
      $('#belonging').html(departmentList);
    }
  });
  
  $.ajax({
    url: 'https://luftaquila.io/ajoumaker/api/requestSetting',
    type: 'POST',
    data: { key: 'notice' },
    success: function(res) { $('#notice').html(res[0].value); }
  });
  
  $("#DATA").submit(function(event) {
    event.preventDefault();
    // data validation
    let data = {}
    try {
      if(!$('#name').val().trim()) throw { name : "dataValidationFailedError", message : "이름을 입력하세요." };
      else if($('#name').val().trim().length > 10) throw { name : "dataValidationFailedError", message : "이름은 10글자를 초과할 수 없습니다." };
      else data.name = $('#name').val().trim();
      
      if(!$('#contact').val().trim().match(/010-\d{4}-\d{4}/)) throw { name : "dataValidationFailedError", message : "전화번호가 올바르지 않습니다." };
      else data.phone = $('#contact').val().trim();
      
      if(!$('#belonging').val().trim()) throw { name : "dataValidationFailedError", message : "소속을 입력하세요." };
      else if($('#belonging').val().trim().length > 20) throw { name : "dataValidationFailedError", message : "소속은 20글자를 초과할 수 없습니다." };
      else data.affiliation = $('#belonging').val().trim();
      
      if($('#purpose').val().length > 30) throw { name : "dataValidationFailedError", message : "사용 목적은 30자 이내로 입력하세요." };
      else data.purpose = $('#purpose').val();
      
      data.machine = $('input:radio[name=machine]:checked').val() + machineNumReturn();
      data.usage = machineUse($('input:radio[name=machine]:checked').attr('id'));
      data.identity = $('input:radio[name=ppl]:checked').val();
      data.cost = feeCalc($('input:radio[name=machine]:checked').attr('id'), $('input:radio[name=ppl]:checked').val(), Number($('input:checkbox[name=discount]:checked').length));
      data.payment = $('input:radio[name=pay]:checked').val();
    }
    catch(e) { 
      if(e.name == 'dataValidationFailedError') return Swal.fire(e.message, '', 'warning');
      else console.error(e);
    }
    
    Swal.fire({
      title: '관리자 인증이 필요합니다.',
      footer: "<span style='font-size: 0.8rem'>©" + new Date().getFullYear() + " LUFT-AQUILA, 아주대학교 전자공학과 18학번 <a href='https://luftaquila.io/'>오병준</a></span>",
      input: 'number',
      inputAttributes: { autocapitalize: 'off' },
      showCancelButton: true,
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
          data.responsibility = result.value[0].name;
          $.ajax({
            url: 'https://luftaquila.io/ajoumaker/api/apply',
            type: 'POST',
            data: data,
            success: function(res) {
              Swal.fire('등록되었습니다.' , '', 'success');
            },
	          error: function(jqXHR, textStatus, errorThrown) {
              Swal.fire('등록에 실패했습니다.' , jqXHR + textStatus + errorThrown, 'error');
            },
            complete: function() {
              $('#DATA')[0].reset();
              $('#machineSelect').css('display', 'none');
              $('#belonging').replaceWith("<select placeholder='학과' id='belonging' class='form-control bg-white border-dark small' style='width:10rem!important; display: inline-block;' required><option value='' selected disabled>소속 2</option></select>");
            }
          });
        }
      }
    });
  });
  
  $('#manualFee').click(function() {
    $('input:checkbox[name=discount]').attr('checked', false);
    $('#discountWrap').css('display', 'none');
    $('#feeInfo').html('<input type="radio" id="manualActivate" checked> 수동 입력</input><br>요금 : <input type="text" id="manualCost" style="width:70px"/> 원');
    $('#manualFee').attr('style', 'display: none!important');
    $('#manualCost').keyup(function(event) {
      event = event || window.event;
      this.value = addComma(this.value.replace(/[^\d]+/g, ''));
    });
  });
  
  $('input:radio[name=ppl], input:radio[name=pay]').click(function() {
    if($('input:radio[name=ppl]:checked').val() == '교내구성원' && $('input:radio[name=pay]:checked').val() == '선불') {
      machine = $('input:radio[name=machine]:checked').attr('id');
      if(machine == 'cubicon' || machine == 'sindo' || machine == 'onyx' || machine == 'freeform' || machine == 'zortrax')
        $('#discountWrap').css('display', 'inline');
    }
    else {
      $('input:checkbox[name=discount]').prop('checked', false);
      $('#discountWrap').css('display', 'none');
    }
    $('#feeInfo').html('요금 : ' + addComma(feeCalc($('input:radio[name=machine]:checked').attr('id'), $('input:radio[name=ppl]:checked').val(), $('input:checkbox[name=discount]').prop('checked'))) + '원');
    $('#manualFee').css('display', 'inline-block');
  });
  
  $('#normal').click(function() {
    $('#machineDetail').html('');
    $('#payment').html('');
    $('#machineSelect').css('display', 'block');
    $('.machineWrapper').css('display', 'none');
    $('#normalWrapper').css('display', 'block');
    $('#feeInfo').html('');
    $('#discountWrap').css('display', 'none');
    $('#submitWrapper').css('display', 'none');
    $('input:radio[name=machine]:checked').prop('checked', false);
    $('#manualFee').css('display', 'inline-block');
  });
  
  $('#industrial').click(function() {
    $('#machineDetail').html('');
    $('#payment').html('');
    $('#machineSelect').css('display', 'block');
    $('.machineWrapper').css('display', 'none');
    $('#industrialWrapper').css('display', 'block');
    $('#feeInfo').html('');
    $('#discountWrap').css('display', 'none');
    $('#submitWrapper').css('display', 'none');
    $('input:radio[name=machine]:checked').prop('checked', false);
    $('#manualFee').css('display', 'inline-block');
  });
  
  $('#others').click(function() {
    $('#machineDetail').html('');
    $('#payment').html('');
    $('#machineSelect').css('display', 'block');
    $('.machineWrapper').css('display', 'none');
    $('#othersWrapper').css('display', 'block');
    $('#feeInfo').html('');
    $('#discountWrap').css('display', 'none');
    $('#submitWrapper').css('display', 'none');
    $('input:radio[name=machine]:checked').prop('checked', false);
  });
  
  payment_time_str = '사용 시간 : <input id="usehour" name="cost" type="number" required style="width:40px" min="0"/>시간 <input id="usemin" name="cost" type="number" required style="width:40px" min="0" max="59"/>분';
  payment_area_str = '인쇄 면적 : <input id="xaxis" name="cost" type="number" required style="width:40px"/>mm * <input id="yaxis" name="cost" type="number" required style="width:40px"/>mm';
  
  $('#cubicon').click(function() {
    clickReset();
    if($('input:radio[name=ppl]:checked').val() == '교내구성원' && $('input:radio[name=pay]:checked').val() == '선불') $('#discountWrap').css('display', 'inline');
    cubicon_str = "<div style='margin-bottom: 0.5rem;'>장비 번호</div>" +
    "<label for='C1'><input type='radio' id='C1' name='machineNum' value='C1' required> 1</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='C2'><input type='radio' id='C2' name='machineNum' value='C2'> 2</label><br>" +
    "<label for='C3'><input type='radio' id='C3' name='machineNum' value='C3'> 3</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='C4'><input type='radio' id='C4' name='machineNum' value='C4'> 4</label><br>" +
    "<label for='C5'><input type='radio' id='C5' name='machineNum' value='C5'> 5</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='C6'><input type='radio' id='C6' name='machineNum' value='C6'> 6</label><br>" +
    "<label for='C7'><input type='radio' id='C7' name='machineNum' value='C7'> 7</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='C8'><input type='radio' id='C8' name='machineNum' value='C8'> 8</label><br>" +
    "<label for='C9'><input type='radio' id='C9' name='machineNum' value='C9'> 9</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='C10'><input type='radio' id='C10' name='machineNum' value='C10'> 10</label><br>" +
    "<label for='C11'><input type='radio' id='C11' name='machineNum' value='C11'> 11</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='C12'><input type='radio' id='C12' name='machineNum' value='C12'> 12</label><br>" +
    "<label for='C13'><input type='radio' id='C13' name='machineNum' value='C13'> 13</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='C14'><input type='radio' id='C14' name='machineNum' value='C14'> 14</label><br>";
    $('#payment').html(payment_time_str);
    $('#machineDetail').html(cubicon_str);
    keyupReset();
  });
  
  $('#sindo').click(function() {
    clickReset();
    if($('input:radio[name=ppl]:checked').val() == '교내구성원' && $('input:radio[name=pay]:checked').val() == '선불') $('#discountWrap').css('display', 'inline');
    sindo_str = "<div style='margin-bottom: 0.5rem;'>장비 번호</div>" +
    "<label for='S1'><input type='radio' id='S1' name='machineNum' value='S1' required> 1</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='S2'><input type='radio' id='S2' name='machineNum' value='S2'> 2</label><br>" +
    "<label for='S3'><input type='radio' id='S3' name='machineNum' value='S3'> 3</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='S4'><input type='radio' id='S4' name='machineNum' value='S4'> 4</label><br>" +
    "<label for='S5'><input type='radio' id='S5' name='machineNum' value='S5'> 5</label><br>";
    $('#payment').html(payment_time_str);
    $('#machineDetail').html(sindo_str);
    keyupReset();
  });
  
  $('#onyx').click(function() {
    clickReset();
    if($('input:radio[name=ppl]:checked').val() == '교내구성원' && $('input:radio[name=pay]:checked').val() == '선불') $('#discountWrap').css('display', 'inline');
    onyx_str = "<div style='margin-bottom: 0.5rem;'>장비 번호</div>" +
    "<label for='O1'><input type='radio' id='O1' name='machineNum' value='O1' required> 1</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='O2'><input type='radio' id='O2' name='machineNum' value='O2'> 2</label><br>" +
    "<label for='O3'><input type='radio' id='O3' name='machineNum' value='O3'> 3</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='O4'><input type='radio' id='O4' name='machineNum' value='O4'> 4</label><br>" +
    "<label for='O5'><input type='radio' id='O5' name='machineNum' value='O5'> 5</label><br>";
    $('#payment').html(payment_time_str);
    $('#machineDetail').html(onyx_str);
    keyupReset();
  });
  
  $('#freeform').click(function() {
    clickReset();
    if($('input:radio[name=ppl]:checked').val() == '교내구성원' && $('input:radio[name=pay]:checked').val() == '선불') $('#discountWrap').css('display', 'inline');
    freeform_str = "<div style='margin-bottom: 0.5rem;'>장비 번호</div>" +
    "<label for='F1'><input type='radio' id='F1' name='machineNum' value='F1' required> 1</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='F2'><input type='radio' id='F2' name='machineNum' value='F2'> 2</label><br>";
    $('#payment').html(payment_time_str);
    $('#machineDetail').html(freeform_str);
    keyupReset();
  });
  
  $('#zortrax').click(function() {
    clickReset();
    if($('input:radio[name=ppl]:checked').val() == '교내구성원' && $('input:radio[name=pay]:checked').val() == '선불') $('#discountWrap').css('display', 'inline');
    $('#payment').html(payment_time_str);
    keyupReset();
  });
  
  $('#laser').click(function() {
    clickReset();
    laser_str = "<div style='margin-bottom: 0.5rem;'>장비 번호</div>" +
    "<label for='L1'><input type='radio' id='L1' name='machineNum' value='L1' required> 1</label>&nbsp;&nbsp;&nbsp;" +
    "<label for='L2'><input type='radio' id='L2' name='machineNum' value='L2'> 2</label><br>";
    $('#payment').html(payment_time_str);
    $('#machineDetail').html(laser_str);
    keyupReset();
  });
  
  $('#plotter').click(function() {
    clickReset();
    $('#payment').html(payment_area_str);
    keyupReset();
  });
  
  $('#cutter').click(function() {
    clickReset();
    $('#payment').html(payment_time_str);
    keyupReset();
  });
  
  $('#uv').click(function() {
    clickReset();
    $('#payment').html(payment_area_str);
    keyupReset();
  });
  
  $('#x7').click(function() {
    clickReset();
    $('#payment').html(payment_time_str + '<br>강화 재료 : 카본 <input id="mainMaterial" name="cost" type="number" required style="width:60px"/>cc<br>');
    keyupReset();
  });
  
  $('#objet350').click(function() {
    clickReset();
    payment_str = '사용 재료<br>메인 재료 <input id="mainMaterial" name="cost" type="number" required style="width:60px"/>g<br>보조 재료 <input id="subMaterial" name="cost" type="number" required style="width:60px"/>g<br>';
    $('#payment').html(payment_str);
    keyupReset();
  });
  
  $('#f370').click(function() {
    clickReset();
    $('#payment').html(payment_time_str);
    keyupReset();
  });
  
  $('#xfab').click(function() {
    clickReset();
    payment_str = '사용 재료 : 메인 <input id="mainMaterial" name="cost" type="number" required style="width:60px"/>g';
    $('#payment').html(payment_str);
    keyupReset();
  });
  
  $('#3d').click(function() {
    clickReset();
    $('#payment').html(payment_time_str);
    keyupReset();
  });
  
  $('#laptop').click(function() {
    clickReset();
    payment_str = '사용 대수 : <input id="rentalNum" type="number" required style="width:40px"/> 대<br><span style="line-height:10%"><br></span>사용 기간<br><input id="rentalFromDate" type="date" required style="width: 110px"/> ~ <input id="rentalToDate" type="date" required style="width: 110px"/><br><span style="line-height:30%"><br></span>'
    $('#payment').html(payment_str);
    keyupReset();
    $('#manualFee').trigger('click');
  });
  
  $('#room').click(function() {
    payment_str = '사용 호수 : <input id="roomBorrow" type="number" required style="width:40px"/> 호<br><span style="line-height:10%"><br></span>사용 기간<br><input id="borrowFromDate" type="date" required style="width: 110px"/> ~ <input id="borrowToDate" type="date" required style="width: 110px"/><br><span style="line-height:30%"><br></span>사용 시간<br><input id="borrowFromTime" type="time" required style="width: 110px"/> ~ <input id="borrowToTime" type="time" required style="width: 110px"/><br><span style="line-height:10%"><br></span>'
    $('#payment').html(payment_str);
    keyupReset();
    $('#manualFee').trigger('click');
  });
  
  $('#contact').keyup(function(event) {
    event = event || window.event;
    this.value = autoHypen(this.value.trim());
    function autoHypen(str) {
      str = str.replace(/[^0-9]/g, '');
      if( str.length < 4) { return str; }
      else if(str.length < 8) { return str.substr(0, 3) + '-' + str.substr(3); }
      else { return str.substr(0, 3) + '-' + str.substr(3, 4) + '-' + str.substr(7); }
      return str;
    }
  });
});

function feeCalc(machine, type, discount) {
  if(type == '수동 입력'){
    return $('#manualCost').val().replace(/[^\d]+/g, '');
  }
  if(machine == 'cubicon' || machine == 'sindo') {
    var hour = Number($('#usehour').val()), min = Number($('#usemin').val());
    if(type == '교내구성원') {
      if(discount) return calc(1500, 6, hour, min);
      else return calc(1500, 0, hour, min);
    }
    else return calc(2000, 0, hour, min);
  }
  else if(machine == 'zortrax') {
    var hour = Number($('#usehour').val()), min = Number($('#usemin').val());
    if(type == '교내구성원') {
      if(discount) return calc(1500, 2, hour, min);
      else return calc(1500, 0, hour, min);
    }
    else return calc(2000, 0, hour, min);
  }
  else if(machine == 'onyx') {
    var hour = Number($('#usehour').val()), min = Number($('#usemin').val());
    if(type == '교내구성원') {
      if(discount) return calc(5000, 2, hour, min);
      else return calc(5000, 0, hour, min);
    }
    else return calc(7000, 0, hour, min);
  }
  else if(machine == 'freeform') {
    var hour = Number($('#usehour').val()), min = Number($('#usemin').val());
    if(type == '교내구성원') {
      if(discount) return calc(4000, 1, hour, min);
      else return calc(4000, 0, hour, min);
    }
    else return calc(6000, 0, hour, min);
  }
  else if(machine == 'laser') {
    var hour = Number($('#usehour').val()), min = Number($('#usemin').val());
    if(type == '교내구성원') return calc(1500, 0, hour, min);
    else return calc(2500, 0, hour, min);
  }
  else if(machine == 'plotter') {
    var area = $('#xaxis').val() * $('#yaxis').val();
    fee = area / 100;
    if(type == '교내구성원') return Math.round(fee * 5 / 1000) * 100;
    else return Math.round(fee * 5 / 1000) * 100;
  }
  else if(machine == 'cutter') {
    var hour = Number($('#usehour').val()), min = Number($('#usemin').val());
    if(type == '교내구성원') return calc(1500, 0, hour, min);
    else return calc(2500, 0, hour, min);
  }
  else if(machine == 'uv') {
    var area = $('#xaxis').val() * $('#yaxis').val();
    fee = area / 100;
    if(type == '교내구성원') return Math.round(fee * 8 / 100) * 100;
    else return Math.round(fee * 8 / 100) * 100;
  }
  else if(machine == 'x7') {
    var hour = Number($('#usehour').val()), min = Number($('#usemin').val());
    if(type == '교내구성원') return calc(3500, 0, hour, min) + Number($('#mainMaterial').val()) * 5000;
    else return calc(6500, 0, hour, min) + Number($('#mainMaterial').val()) * 9000;
  }
  else if(machine == 'objet350') {
    if(type == '교내구성원') return Math.round(($('#mainMaterial').val() * 400 + $('#subMaterial').val() * 150) / 100) * 100;
    else return Math.round(($('#mainMaterial').val() * 700 + $('#subMaterial').val() * 250) / 100) * 100;
  }
  else if(machine == 'f370') {
    var hour = Number($('#usehour').val()), min = Number($('#usemin').val());
    if(type == '교내구성원') return calc(14000, 0, hour, min);
    else return calc(20000, 0, hour, min);
  }
  else if(machine == 'xfab') {
    if(type == '교내구성원') return $('#mainMaterial').val() * 400;
    else return $('#mainMaterial').val() * 600;
  }
  else if(machine == '3d') {
    var hour = Number($('#usehour').val()), min = Number($('#usemin').val());
    if(type == '교내구성원') return calc(6000, 0, hour, min);
    else return calc(12000, 0, hour, min);
  }
}

function calc(fee, sub, hour, min) {
  var price = Number(fee) * (hour - Number(sub) + (min / 60));
  return price <= 0 ? 0 : price < Number(fee) ? Number(fee) : Math.round(price / 100) * 100;
}

function machineUse(machine) {
  if(machine == 'cubicon' || machine == 'sindo' || machine == 'onyx' || machine == 'freeform' || machine == 'zortrax' || machine == 'laser' || machine == 'cutter' || machine == 'f370' || machine == '3d')
    return Number($('#usehour').val()) + '시간 ' + Number($('#usemin').val()) + '분';
  
  else if(machine == 'plotter' || machine == 'uv')
    return Number($('#xaxis').val()) + 'mm * ' + Number($('#yaxis').val()) + 'mm';
  
  else if(machine == 'x7')
    return Number($('#usehour').val()) + '시간 ' + Number($('#usemin').val()) + '분 / 카본 : ' + Number($('#mainMaterial').val()) + 'cc';
  
  else if(machine == 'objet350')
    return '메인 : ' + Number($('#mainMaterial').val()) + 'g / 서브 : ' + Number($('#subMaterial').val()) + 'g';
  
  else if(machine == 'xfab')
    return '메인 : ' +  Number($('#mainMaterial').val()) + 'g';
  
  else if(machine == 'laptop')
    return '노트북 ' + Number($('#rentalNum').val()) + '대 대여 / ' + $('#rentalFromDate').val() + ' ~ ' + $('#rentalToDate').val();
  
  else if(machine == 'room')
    return '강의실 ' + Number($('#roomBorrow').val()) + '호 대실 / ' + $('#borrowFromDate').val() + ' ~ ' + $('#borrowToDate').val();
}

function machineNumReturn() {
  if(!$('#plotter:checked, #cutter:checked, #uv:checked, #x7:checked, #objet350:checked, #f370:checked, #xfab:checked, #zortrax:checked, #3d:checked, #laptop:checked, #room:checked').length)
    return ' ' + $('input:radio[name=machineNum]:checked').val().substr(1, 1) + '번';
  
  else return '';
}
function clickReset() {
  $('#feeInfo').css('display', 'inline');
  $('#machineDetail').html('');
  $('#payment').html('');
  $('#feeInfo').html('요금 : 0원');
  $('#discountWrap').css('display', 'none');
}
function keyupReset() {
  $('#submitWrapper').css('display', 'block');
  $('#usehour').keyup(function(event) {
    event = event || window.event;
    this.value = autoLimit(this.value.trim(), 3);
  });
  $('#usemin').keyup(function(event) {
    event = event || window.event;
    this.value = autoLimit(this.value.trim(), 2);
  });
  $('input[name=cost]').keyup(function() {
    if(!$('#manualActivate').attr('checked')) {
      $('#feeInfo').html('요금 : ' + addComma(feeCalc($('input:radio[name=machine]:checked').attr('id'), $('input:radio[name=ppl]:checked').val(), Number($('input:checkbox[name=discount]:checked').length))) + '원');
    }
  });
  $('#discountWrap').click(function() {
    $('#feeInfo').html('요금 : ' + addComma(feeCalc($('input:radio[name=machine]:checked').attr('id'), $('input:radio[name=ppl]:checked').val(), Number($('input:checkbox[name=discount]:checked').length))) + '원');
  });
}
function autoLimit(str, num) {
  if(str.length > num) { return str.substr(0, num); }
  return str;
}
function addComma(x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function isNum(s) {
  s += '';
  if (s == '' || isNaN(s)) return false;
  return true;
}