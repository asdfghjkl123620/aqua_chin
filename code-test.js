const coupon_code = require('coupon-code')


console.log(coupon_code.generate({ parts : 4 }));
console.log(coupon_code.generate({ parts : 4 ,partLen : 3 }));
console.log(coupon_code.generate({ parts : 5 ,partLen : 3  }));