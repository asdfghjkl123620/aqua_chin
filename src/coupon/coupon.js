const express = require('express');
const moment = require('moment-timezone');

const multer = require("multer");
const upload = multer({dest: 'tmp_uploads/'});

const fs = require('fs');

const db = require(__dirname + '/../db_connect');
var async = require('async');

const router = express.Router();

const coupon_code = require('coupon-code')


//新增優惠//傳入資料提供賣家新增優惠券
router.get('/insert_coup',(req,res)=>{
    //將資料庫預設的優惠券選項post到前端//將資料表中的欄位資料提取出來和並並顯示
    const sql_coup_join = "SELECT `coup_cate_id` from \`cupon_cate\`";
    const sql_minus = "SELECT `over_minus_id`,`over_minus` FROM `over_minus_price`";
    const sql_overPerc = "SELECT `over_perc_id`,`over_perc` FROM `over_perc`";
    const sql_overPrice = "SELECT `	over_price_id `,`over_price` FROM `over_price`";
    const sql_over_piece = "SELECT `over_piece_id `,`over_piece` FROM `over_piece`";
    const sql_givi_set = "SELECT `givi_cate_id`,`givi_name`,`givi_img` FROM `givi_set`";

    //後端自動生成的折扣碼傳到前端去
    const code1 = coupon_code.generate({ parts : 3 ,partLen : 3});
    const code2 = coupon_code.generate({ parts : 3 ,partLen : 4 });
    const code3 = coupon_code.generate({ parts : 3 ,partLen : 5 });
    var return_data = { "code1": code1, "code2": code2, "code3": code3 };
    // var return_data ={}
    async.parallel([
        (parallel_done)=> { 
            db.query(sql_coup_join, {}, function(err,results){
                if(err) return parallel_done(err);
                return_data.table1 = results;
                parallel_done();
            });
         }, (parallel_done)=> { 
            db.query(sql_minus, {}, function(err,results){
                if(err) return parallel_done(err);
                return_data.table2 = results;
                parallel_done();
            });
         }, (parallel_done) =>{ 
            db.query(sql_overPerc, {}, function(err,results){
                if(err) return parallel_done(err);
                return_data.table3 = results;
                parallel_done();
            });
         }, (parallel_done)=> { 
            db.query(sql_overPrice, {}, function(err,results){
                if(err) return parallel_done(err);
                return_data.table4 = results;
                parallel_done();
            });
         },(parallel_done)=> { 
            db.query(sql_over_piece, {}, function(err,results){
                if(err) return parallel_done(err);
                return_data.table5 = results;
                parallel_done();
            });
         },(parallel_done)=> { 
            db.query(sql_givi_set, {}, function(err,results){
                if(err) return parallel_done(err);
                return_data.table6 = results;
                parallel_done();
            });
         }
    ],(err)=>{
        if (err) console.log(err);
        res.json(return_data);
     
    });
    


});

router.post('/insert_coup',upload.single("img"),(req,res)=>{
    const output = {
        success:false,
        error:'',
        status:0,
        body:req.body,
        result: {}
    };


    //資料要分三張資料表儲存
    switch(req.body.coup_cate_id){
                    case "coup001":
                    //第一種折扣碼生成函式
                    

                    const insert_sql1 =  `INSERT INTO \`coup01_allorder\` 
                        (\`coup_id\`,\`coup_code\`,\`coup_name\`, \`coup_img\`, 
                        \`coup_over\`,\`coup_PriOrPer\`,\`coup_start\`,\`coup_end\`,
                        \`coup_times\`, \`create_time\`) 
                    VALUES (? , ? , ? , ? , ? , ? , ? , ? , ? , NOW());`;

                    let imgFileName_1;
                    if ( req.file && req.file.originalname ) {
                        imgFileName_1 = 'CUP01' + moment(new Date()).format('YYYYMMDDHHmmss') + "." +req.file.originalname.split('.')[1]
                        fs.rename(req.file.path, './public/images/'+ imgFileName_1,()=>{}) 
                    } else {
                        imgFileName_1 = 'noImg.jpg'
                    }



                     const insert_sql_Params1 = [
                        req.body.coup_id,
                        req.body.coup_code,
                        req.body.coup_name,
                        imgFileName_1,
                        req.body.coup_over,
                        req.body.coup_PriOrPer,
                        req.body.coup_start,
                        req.body.coup_end,
                        req.body.coup_times,
                        req.body.create_time,
                    ];
                    db.queryAsync(insert_sql1,insert_sql_Params1)
                        .then(r=>{
                    //可以針對affectrow進行驗證affectrow<1,傳過來是沒有資料的
                    output.result = r;
                    output.success = true;
                    console.log('result:', r);
                    return res.json( output);
                })
                .catch(error=>{
                    console.log(error)
                    // return res.send(error);
                    return res.json(output);            
                }); 
                        break;
                    case "coup002":
                       //第二種折扣碼生成函式//這裡生成的折扣碼要套用到商品上

                        const insert_sql2 =  `INSERT INTO \`coup02_goods\` 
                        (\`coup_id\`,\`coup_code\`,\`coup_name\`, \`coup_img\`, 
                        \`coup_over\`,\`coup_PriOrPer\`,\`coup_start\`,\`coup_end\`,
                        \`coup_times\`, \`create_time\`) 
                        VALUES (? , ? , ? , ? , ? , ? , ? , ? , ? , NOW());`;

                        let imgFileName_2;
                        if ( req.file && req.file.originalname ) {
                            imgFileName_2 = 'CUP02' + moment(new Date()).format('YYYYMMDDHHmmss') + "." +req.file.originalname.split('.')[1]
                            fs.rename(req.file.path, './public/images/'+ imgFileName_2,()=>{}) 
                        } else {
                            imgFileName_2 = 'noImg.jpg'
                        }
    



                        const insert_sql_Params2 = [
                            req.body.coup_id,
                            req.body.coup_code,
                            req.body.coup_name,
                            imgFileName_2,
                            req.body.coup_over,
                            req.body.coup_PriOrPer,
                            req.body.coup_start,
                            req.body.coup_end,
                            req.body.coup_times,
                            req.body.create_time,
                            req.body.update_time,
                        ];
                    db.queryAsync(insert_sql2,insert_sql_Params2)
                    .then(r=>{
                        //可以針對affectrow進行驗證affectrow<1,傳過來是沒有資料的
                        output.result = r;
                        output.success = true;
                        console.log('result:', r);
                        return res.json( output);
                    })
                    .catch(error=>{
                        console.log(error)
                        // return res.send(error);
                        return res.json(output);            
                    }); 
                        break;
                    case "coup003":
                    //    //第三種折扣碼生成函式



                        const insert_sql3 =  `INSERT INTO \`coup03_givi\` 
                        (\`givi_cate_id\`,\`coup_id\`,\`coup_code\`,\`coup_name\`, \`coup_img\`, 
                        \`coup_over\`,\`givi_piece\`,\`coup_times\`,\`coup_start\`,\`coup_end\`
                        , \`create_time\`) 
                        VALUES (? ,? , ? , ? , ? , ? , ? , ? , ? , ? , NOW());`;

                        let imgFileName_3;
                        if ( req.file && req.file.originalname ) {
                            imgFileName_3 = 'CUP03' + moment(new Date()).format('YYYYMMDDHHmmss') + "." +req.file.originalname.split('.')[1]
                            fs.rename(req.file.path, './public/images/'+ imgFileName_3,()=>{}) 
                        } else {
                            imgFileName_3 = 'noImg.jpg'
                        }
    


                    const insert_sql_Params3 = [
                        req.body.givi_cate_id,
                        req.body.coup_id,
                        req.body.coup_code,
                        req.body.coup_name,
                        imgFileName_3,
                        req.body.coup_over,
                        req.body.givi_piece,
                        req.body.coup_times,
                        req.body.coup_start,
                        req.body.coup_end,
                        req.body.create_time,
                    ];
                    db.queryAsync(insert_sql3,insert_sql_Params3)
                    .then(r=>{
                        //可以針對affectrow進行驗證affectrow<1,傳過來是沒有資料的
                        output.result = r;
                        output.success = true;
                        console.log('result:', r);
                        return res.json( output);
                    })
                    .catch(error=>{
                        console.log(error)
                        // return res.send(error);
                        return res.json(output);            
                    }); 
                        break;
      
    }
             
});

//修改優惠從前端傳過來的資料
router.get('/edit_coup/:coup_cate_id/:coup_id',(req,res)=>{
    
    if(req.params.coup_cate_id === "coup001") {
        const sql = "select * from `coup01_allorder` where coup_id=?";
        db.queryAsync(sql,[req.params.coup_id])
        .then(result=>{
  
            if(!result || !result.length) {
                //沒有資料狀況
                res.redirect(req.baseUrl);
            } else {
                // result[0].birthday = moment(result[0].birthday).format(dateFormat);
                // res.render('connected_book/edit', {
                //     row: result[0],
                //     url: req.baseUrl + req.url,
                // });

                res.json(result)
            }
        })
        .catch(error=>{
            res.redirect(req.baseUrl);
        })
    }else if(req.params.coup_cate_id === "coup002"){
        const sql = "select * from `coup02_goods` where coup_id=?";
        db.queryAsync(sql,[req.params.coup_id])
        .then(result=>{
            if(!result || !result.length) {
                //沒有資料狀況
                res.redirect(req.baseUrl);
            } else {
                res.json(result)
            }
        })
        .catch(error=>{
            res.redirect(req.baseUrl);
        })
    }else {
        const sql = "select * from `coup03_givi` where coup_id=?";

        db.queryAsync(sql,[req.params.coup_id])
        .then(result=>{

            if(!result || !result.length) {
                //沒有資料狀況
                res.redirect(req.baseUrl);
            } else {

                res.json(result)
            }
        })
        .catch(error=>{
            res.redirect(req.baseUrl);
        })
    }
    
  
});


router.post('/edit_coup/:coup_cate_id/:coup_id',upload.single("img"),(req,res)=>{
    const output = {
        success:false,
        error:'',
        status:0,
        body:req.body,
        result: {}
    };
    if(req.params.coup_cate_id === "coup001") {
        const update_sql_1 = `update \`coup01_allorder\`
        set coup_name = ?,
            coup_img = ?,
            coup_over = ?,
            coup_PriOrPe = ?,
            coup_start = ?,
            coup_end = ?,
            coup_times = ? `;

            let sql_update_Param_1 = [
          
                req.body.coup_name,
                req.body.coup_over,
                req.body.coup_PriOrPe,
                req.body.coup_start,
                req.body.coup_end,
                req.body.coup_times,

            ];


            if( req.file && req.file.originalname ){
                let imgFileName1 = 'coup001' + moment(new Date()).format('YYYYMMDDHHmmss') + '.' + req.file.originalname.split('.')[1];
                fs.rename(req.file.path, './public/images/'+ imgFileName1,()=>{});
                update_sql_1 += `,coup_img = ? where coup_id = ?`;
                console.log(update_sql_1);
                sql_update_Param_1.push(imgFileName,req.body.coup_id);
            } else {
                update_sql += `where coup_id = ?`;
                console.log(update_sql_1);
        
                sql_update_Param_1.push(req.params.coup_id);
        
        
            }
            console.log(update_sql);
            db.queryAsync(update_sql,sql_update_Param_1)
            .then(r=>{
                output.result = r;
                output.success = true;
                console.log('result:',r);
                // res.redirect('/connected_book/1');
                return res.json(output);
            }) 
            .catch(error=>{
                console.log(error)
                // return res.send(error);
                return res.json(output);            
            });     
    }else if(req.params.coup_cate_id === "coup002"){
        const update_sql_2 = `update \`coup02_goods\`
        set coup_name = ?,
            coup_img = ?,
            coup_over = ?,
            coup_PriOrPe = ?,
            coup_start = ?,
            coup_end = ?,
            coup_times = ? `;
            let sql_update_Param_2 = [
          
                req.body.coup_name,
                req.body.coup_over,
                req.body.coup_PriOrPe,
                req.body.coup_start,
                req.body.coup_end,
                req.body.coup_times,

            ];


            if( req.file && req.file.originalname ){
                let imgFileName2 = 'coup002' + moment(new Date()).format('YYYYMMDDHHmmss') + '.' + req.file.originalname.split('.')[1];
                fs.rename(req.file.path, './public/images/'+ imgFileName2,()=>{});
                update_sql_2 += `,coup_img = ? where coup_id = ?`;
                console.log(update_sql_2);
                sql_update_Param_2.push(imgFileName,req.body.coup_id);
            } else {
                update_sql_2 += `where coup_id = ?`;
                console.log(update_sql_2);
        
                sql_update_Param_2.push(req.params.coup_id);
        
        
            }
            console.log(update_sql_2);
            db.queryAsync(update_sql_2,sql_update_Param_2)
            .then(r=>{
                output.result = r;
                output.success = true;
                console.log('result:',r);
                // res.redirect('/connected_book/1');
                return res.json(output);
            }) 
            .catch(error=>{
                console.log(error)
                // return res.send(error);
                return res.json(output);            
            });     
    }else{
        const update_sql_3 = `update \`coup03_givi\`
        set givi_cate_id = ?,          
            coup_name = ?,
            coup_img = ?,
            coup_over = ?,
            givi_piece = ?,
            coup_times = ?,
            coup_start = ?,
            coup_end = ? `;

            let sql_update_Param_3 = [
                req.body.givi_cate_id,
                req.body.coup_name,
                req.body.coup_over,
                req.body.givi_piece,
                req.body.coup_times,
                req.body.coup_start,
                req.body.coup_end,
              

            ];


            if( req.file && req.file.originalname ){
                let imgFileName3 = 'coup003' + moment(new Date()).format('YYYYMMDDHHmmss') + '.' + req.file.originalname.split('.')[1];
                fs.rename(req.file.path, './public/images/'+ imgFileName3,()=>{});
                update_sql_3 += `,coup_img = ? where coup_id = ?`;
                console.log(update_sql_3);
                sql_update_Param_3.push(imgFileName,req.body.coup_id);
            } else {
                update_sql_3 += `where coup_id = ?`;
                console.log(update_sql_3);
        
                sql_update_Param_3.push(req.params.coup_id);
        
        
            }
            console.log(update_sql_3);
            db.queryAsync(update_sql_3,sql_update_Param_3)
            .then(r=>{
                output.result = r;
                output.success = true;
                console.log('result:',r);
                // res.redirect('/connected_book/1');
                return res.json(output);
            }) 
            .catch(error=>{
                console.log(error)
                // return res.send(error);
                return res.json(output);            
            });     
     
    }
 
    
    //2.產生各自的正則驗證規則
   
    // if(!req.body.email || birthday_pattern.test(req.body.birthday)){
    //     output.error = '請填寫合法的 birthday';
    //     output.status = 460;
    //     return res.json(output);
    // }

});
//刪除優惠

router.get('/del/:coup_cate_id/:coup_id',(req,res)=>{
    const output = {
        success:false,
        error:'',
        status:0,
        body:req.body,
        result: {}
    };
    // if ( req.session.userAccess !=='1' ) {
    //     res.redirect('/connected_book/1')
    // }
    if(req.params.coup_cate_id === "coup001") {
        const sql = `DELETE FROM coup01_allorder WHERE coup_id = ${req.params.coup_id}`
        db.query(sql,(error,result)=>{
            if (error) console.log(error)
            res.redirect('/seller/coupon')
        })
    }else if(req.params.coup_cate_id === "coup002"){
        const sql = `DELETE FROM coup02_goods WHERE coup_id = ${req.params.coup_id}`
        db.query(sql,(error,result)=>{
            if (error) console.log(error)
            res.redirect('/seller/coupon')
        })
    }else{
        const sql = `DELETE FROM coup03_givi WHERE coup_id = ${req.params.coup_id}`
        db.query(sql,(error,result)=>{
            if (error) console.log(error)
            res.redirect('/seller/coupon')
        })
    }
  
})
/*
    預計從前台接收的資料
    GET /coupon?coup_cate_id=優惠券類型&coup_over=超過金額&sort=排序類型(類型,方法)&page=頁碼
    coup_cate_id =    優惠券類型
    coup_over =   超過金額
    coup_PriOrPer  = 決定要用啪數或是金額折扣
    sort =    排序類型  (類型,方法) 
    page =    頁碼
*/
//查詢優惠

//排序
router.get('/coupon',(req,res)=>{
    const testsql = 'SELECT * FROM `basic_information`';
    db.queryAsync(testsql)
    .then(r=>{
        res.json(r);
    })
    
})


// router.get('/coupon',(req,res)=>{
//     const perPage = 6;
//     const searchType = req.query.coup_cate_id  ? ` WHERE \`coup_cate_id\` = '${req.query.coup_cate_id}' ` : '';
    
//     if( searchType === ` WHERE \`coup_cate_id\` = "coup001" `){
//         const searchCoup_over = req.query.coup_cate_id && req.query.coup_over ? ` WHERE \`coup_cate_id\` = '${req.query.coup_cate_id}' AND \`coup_over\` = '${req.query.coup_over}' ` : '';
//         const searchCoup_PriOrPer = req.query.coup_cate_id && req.query.coup_over && req.query.coup_PriOrPer ? ` WHERE \`coup_cate_id\` = '${req.query.coup_cate_id}' AND \`coup_over\` = '${req.query.coup_over}'  AND \`coup_PriOrPer\` = '${req.query.coup_PriOrPer}' ` : '';
//         const sort = req.query.sort ? ` ORDER BY \`${req.query.sort.split(',')[0]}\` ${req.query.sort.split(',')[1]}` : ` ORDER BY \`created_at\` DESC`
        
//         const total_sql_1 = `SELECT COUNT(1) as 'rows' FROM \`coup01_allorder\` ${searchCoup_over}${searchCoup_PriOrPer}`
//     }else if(searchType === ` WHERE \`coup_cate_id\` = "coup002" `){

//     }else{

//     }
//     const searchLevel = req.query.type && req.query.level ? ` WHERE \`classType\` = '${req.query.type}' AND \`classLevel\` = '${req.query.level}' ` : '';
//     const sort = req.query.sort ? ` ORDER BY \`${req.query.sort.split(',')[0]}\` ${req.query.sort.split(',')[1]}` : ` ORDER BY \`created_at\` DESC`
//     const total_sql = `SELECT COUNT(1) as 'rows' FROM \`class_data\` ${searchType}${searchLevel}`
//     let page = req.query.page ? parseInt(req.query.page) : 1;
//     let totalRows;
//     let totalPages;

//     db.queryAsync(total_sql)
//     .then(result=>{
//         totalRows = result[0].rows;
//         if ( totalRows===0 ) {
//             return false
//         } else {
//             totalPages = Math.ceil(totalRows/perPage);
//             if (page<1) page=1;
//             if (page>totalPages) page=totalPages;

//             const sql = `   SELECT \`classId\`,\`className\`,\`classType\`,\`classLevel\`,\`classLocation\`,\`classStartDate\`,\`classIntroduction\`,\`classImg\`,\`classPrice\`
//                             FROM \`class_data\`
//                             ${searchType}${searchLevel}
//                             ${sort}
//                             LIMIT  ${(page-1)*perPage}, ${perPage}`
//             return db.queryAsync(sql);
//         }
//     })
//     .then(result=>{
//         if ( result.length>0 ) {
//             res.json({
//                 'status' :        200,
//                 'msg':            '請求成功',
//                 'searchType' :    req.query.type,
//                 'searchLevel' :   req.query.level,
//                 'sortType' :      req.query.sort,
//                 page,
//                 totalRows,
//                 totalPages,
//                 result
//         })
//         } else {
//             res.json({
//                 'status' :        404,
//                 'msg':            '查無任何資料',
//                 'searchType' :    req.query.type,
//                 'searchLevel' :   req.query.level,
//                 'sortType' :      req.query.sort,
//             })
//         }
//     })
// });
//列出卡片優惠資料
module.exports = router;