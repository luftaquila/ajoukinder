/* 작업할 것 */
// 휴가/연수/행사자 반영 -> 수동 수정으로 전환
// Google SpreadSheet에 전송 구현

api_base_url = '/ajoukinder/api';

limits = {
  t0630_t0730 : 2,
  t0900       : 2,
  L_Dty       : 1,
  hall        : 1
}

class Day {
  constructor(date, isHoliday) {
    this.date = date;
    this.day = moment(date, 'yyyy-MM-DD').format('ddd').toLowerCase();
    this.isHoliday = isHoliday;
    this.t0630 = [];
    this.t0730 = [];
    this.amH   = [];
    this.t0830 = [];
    this.pmH   = [];
    this.t0900 = [];
    this.L_Dty = [];
  }
}

class Class {
  constructor(name, age, members) {
    this.name = name;
    this.age = age;
    this.members = members;
  }
}

class Teacher {
  constructor(id, name, group, age, restriction) {
    this.id = id;
    this.name = name;
    this.class = group;
    this.age = age;
    this.restriction = restriction;
    
    this.counts = {
      t0630       : 0,
      t0630_t0730 : 0,
      t0830       : 0,
      t0900       : 0,
      L_Dty       : 0,
      hall        : 0
    }
  }
}

$(function() {
  $('#sidebarToggle').trigger('click');
  $('#devinfo').click(function(e) {
    e.preventDefault();
    Swal.fire({
      title: `개발자 정보 <i class="fad fa-person-sign"></i>`,
      html: `
<div style='font-size: 1rem'>
  아주대학교 어린이집 일정관리체계 개발자 <b>오병준</b>입니다.<br>
  서비스 이용 중 오류 제보, 기능 수정 및 추가 등이 필요하면 아래 연락처로 연락 주세요.
</div>
<br>
<div style='width: fit-content; margin: 0px auto; text-align: left; font-size: 1rem;'>
  <i class='fas fa-fw fa-envelope'></i> <a href='mailto:mail@luftaquila.io'>mail@luftaquila.io</a><br>
  <i class='fas fa-fw fa-comment'></i> <a target="_blank" href="http://qr.kakao.com/talk/RmgKn.t2Sxgy8I7hwdhuYZQF1vc-">카카오톡(ID: luftaquila)</a><br>
  <i class='fas fa-fw fa-mobile-android'></i> <a href='tel:010-9479-3691'>010-9479-3691</a><br>
</div>
`,
      showCloseButton: true,
      showConfirmButton: false
    });
  });
});