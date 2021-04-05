api_base_url = '/ajoukinder/api';

limits = {
  Hall        : 0,
  F_Dty       : 1,
  L_Dty       : 0,
  t0630_t0730 : 2,
  t0900       : 0
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
  
  test() {
    return this;
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
  constructor(id, name, group, restriction) {
    this.id = id;
    this.name = name;
    this.class = group;
    this.restriction = restriction.length ? restriction : null;
    
    this.counts = {
      Hall        : 0,
      F_Dty       : 0,
      L_Dty       : 0,
      t0630_t0730 : 0,
      t0900       : 0
    }
  }
}