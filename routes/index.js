var express = require('express');

var router = express.Router();

var xlsx = require('node-xlsx');

var async = require('async');


// 百度推送
var BaiduPush = require('baidu-push');
// iOS
var pushOptionIos = {
    apiKey: 'Cah0L02R0IjXVMTmdUfslgGp',
    secretKey: 'fcHdCBk7GjfL2EkPLa2RwAbqg2EmsHKL'
    // timeout: 2000, // optional - default is: 5000
    // agent: false   // optional - default is: maxSockets = 20
};
//Android
var pushOptionAndroid = {
    apiKey: 'wxI0mtmoZz0EckGca0RTAGii',
    secretKey: 'Lb1cOhuacPptmDRF8LBeFe7wOzpXoqZ0'
    // timeout: 2000, // optional - default is: 5000
    // agent: false   // optional - default is: maxSockets = 20
};

//声明数据库
var mongoose = require('mongoose');

// mongodb://linhehe:linhehe@113.31.89.205:27017/test
// mongodb://linhehe:hyg&1qaz2wSX@113.31.89.205:27017/school

//声明数据库链接
mongoose.connect('mongodb://linhehe:linhehe@113.31.89.205:27017/test', function (err) {
    if (err) {
        console.error(err);
    } else {
        console.log('mongodb connected');
    }
});

//声明调用的模型
require('../models/Students');
require('../models/Teachers');
require('../models/Classes');
require('../models/Professions');
require('../models/Colleges');
require('../models/Schools');
require('../models/Addresses');

require('../models/SubjectUnits');
require('../models/Subjects');
require('../models/SignIns');
require('../models/Vacations');
require('../models/Messages');
require('../models/Excels');
require('../models/Versions');

//在数据库中开辟一块区域用于存储模型Myclass的值
var Student = mongoose.model('Student');
var Class = mongoose.model('Class');
var Teacher = mongoose.model('Teacher');
var Address = mongoose.model('Address');


var SubjectUnit = mongoose.model('SubjectUnit');
var Subject = mongoose.model('Subject');
var SignIn = mongoose.model('SignIn');
var Vacation = mongoose.model('Vacation');
var Message = mongoose.model('Message');
var Profession = mongoose.model('Profession');
var College = mongoose.model('College');
var School = mongoose.model('School');
var Excel = mongoose.model('Excel');
var Version = mongoose.model('Version');


var obj = xlsx.parse('public/files/kcb.xls');

var httpAddress = 'http://113.31.89.205:4343/images/';

//var i = 0;
//while(i<obj.length){
//  console.log('name = ' + obj[i].name + '; i = '+ i + 'data = ' + obj[i].data[0]);
//  var excel = new Excel({ClassName: obj[i].name, Number: i});
//  excel.save();
//  i++;
//}

//AddressName: String,
//    Address: {lat: Number,lng: Number},
//Scope: Number // 范围

//var add1 = new Address({
//  AddressName:'S3',
//  Address:{lat:113.36099,lng:22.132202},
//  Scope:0.0000000754
//})
//add1.save();


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


//用户注册第一步、判断手机账号

//忘记密码第二步、修改密码并保存
router.post('/save_password', function (req, res, next) {
    Student.findOneAndUpdate({
        Phone: req.body.Phone,
        Number: req.body.Number
    }, {Password: req.body.Password}, function (err, doc) {
        if (err) {
            next(err)
        }
        else {
            res.json(doc);
        }
    })
});


//用户登陆
router.get('/login', function (req, res, next) {
    console.log(req.query);
    if (req.query.type == '学生') {
        Student.findOne({Number: req.query.Number, Password: req.query.Password})
            .populate('Classes')
            .exec(function (err, doc) {
                if (err) {
                    next(err)
                }
                else {
                    if (doc) {
                        res.json(doc);
                        doc.Device = req.query.Device;
                        doc.save();
                    } else {
                        res.send('请输入正确的信息');
                    }
                }
            });
    }
    else {
        Teacher.findOne({Number: req.query.Number, Password: req.query.Password}, function (err, doc) {

            if (err) {
                next(err)
            }
            else {
                if (doc) {
                    res.json(doc);
                    console.log(doc);
                }
                else {
                    res.send('请输入正确的信息');
                }
            }
        })
    }
});

//学生端的数据
//学生端、获取我的班级信息
router.get('/myclass', function (req, res, next) {
    Student.find({Classes: req.query.Classes}, function(err,students){
        if(err){
            next(err);
        } else{
            for(var i=0; i<students.length; i++){
                students[i].Photo = httpAddress + students[i].Photo;
            }
            res.jsonp(students);
        }
    });
});

//学生端、获取我的班级成员的详细信息
router.get('/myclass_infor', function (req, res, next) {
    Student.findOne({_id: req.query.id}, function (err, doc) {
        if (err) {
            next(err)
        }
        else {
            doc.Photo = httpAddress + doc.Photo
            res.json(doc)
        }
    })
});

//学生端、获取个人信息
router.get('/student_person', function (req, res, next) {
    Student.findOne({Number: req.query.Number}, function (err, doc) {
        if (err) {
            next(err);
        }
        else {
            if (doc != null) {
                doc.Photo = httpAddress + doc.Photo;
                res.jsonp(doc)
            } else {
                res.jsonp("不存在此学号用户，请重新登录");
            }
        }
    })
});

//学生端、保存个人修改信息
router.post('/change_informations', function (req, res, next) {
    if (req.body.tag == 'QQ') {
        Student.findOneAndUpdate({Number: req.body.Number}, {QQ: req.body.Infors}, function (err, doc) {
            if (err != null) {
                next(err);
            }
            else {
                res.json('QQ');
            }
        })
    }
    else if (req.body.tag == '籍贯') {
        Student.findOneAndUpdate({Number: req.body.Number}, {Native: req.body.Infors}, function (err, doc) {
            if (err != null) {
                next(err);
            }
            else {
                res.json('籍贯')
            }
        })
    }
});


//学生端、保存手机号
router.post('/stu_change_phone', function (req, res, next) {
    Teacher.findOne({Phone: req.body.Phone}, function (err, doc) {
        if (err) {
            next(err)
        }
        else {
            if (doc == null) {
                Student.findOne({Phone: req.body.Phone}, function (err, docs) {
                    if (err) {
                        next(err)
                    }
                    else {
                        if (docs == null) {
                            Student.findOneAndUpdate({Number: req.body.Number}, {Phone: req.body.Phone}, function (err, doc1) {
                                if (err != null) {
                                    next(err);
                                }
                                else {
                                    res.json(doc1);
                                    console.log('修改的手机号' + doc1.Phone);
                                }
                            })
                        }
                        else {
                            docs = null;
                            res.json(docs);
                        }
                    }
                })
            }
            else {
                doc = null;
                res.json(doc);
            }
        }
    });
});
//学生端、修改密码、确定修改密码
router.post('/stu_change_password', function (req, res, next) {
    Student.findOneAndUpdate({
            Number: req.body.Number,
            Password: req.body.Old_password
        }, {Password: req.body.Sure_password}, function (err, doc) {
            if (err) {
                next(err)
            }
            else {
                res.json(doc);
            }
        }
    )
});

//学生端、保存图片地址并将图片名称写入数据库
router.post('/stu_files', function (req, res, next) {
    Student.findOneAndUpdate({Number: req.body.photo_name}, {Photo: req.files.file.name}, function (err, doc) {
        if (err != null) {
            next(err);
        }
        else {
            res.json(doc);
        }
    })
});

//学生端、我的老师
router.get('/MyTeachers', function (req, res, next) {
    console.log(req.query.classes);
    var aa = req.query.classes;
    var array = [];
    Teacher.find({}, function (err, doc) {
        if (err) {
            next(err);
        }
        else {
            for (i = 0; i < doc.length; i++) {
                for (j = 0; j < doc[i].Classes.length; j++) {
                    console.log(doc[i].Classes[j]);
                    if (doc[i].Classes[j] == aa) {
                        array.push(doc[i]);
                    }
                    else {
                    }
                }
            }
            console.log(array.length);
            res.json(array);
        }
    })
})


//教师端的数据

//教师端、获取个人信息
router.get('/teacher_person', function (req, res, next) {
    Teacher.findOne({Number: req.query.Number}, function (err, doc) {
        if (err != null) {
            next(err);
        }
        else {
            console.log(doc);
            doc.Photo = httpAddress + doc.Photo
            res.json(doc)
        }
    })
});

//教师端、保存个人修改信息
router.post('/tea_change_informations', function (req, res, next) {
    if (req.body.tag == 'QQ') {
        Teacher.findOneAndUpdate({Number: req.body.Number}, {QQ: req.body.Infors}, function (err, doc) {
            if (err != null) {
                next(err);
            }
            else {
                res.json('QQ');
            }
        })
    }
    else if (req.body.tag == '邮箱') {
        Teacher.findOneAndUpdate({Number: req.body.Number}, {Email: req.body.Infors}, function (err, doc) {
            if (err != null) {
                next(err);
            }
            else {
                res.json('邮箱')
            }
        })
    }
});


//教师端、保存手机号
router.post('/tea_change_phone', function (req, res, next) {
    Student.findOne({Phone: req.body.Phone}, function (err, doc) {
        if (err) {
            next(err)
        }
        else {
            if (doc == null) {
                Teacher.findOne({Phone: req.body.Phone}, function (err, docs) {
                    if (err) {
                        next(err)
                    }
                    else {
                        if (docs == null) {
                            Teacher.findOneAndUpdate({Number: req.body.Number}, {Phone: req.body.Phone}, function (err, doc1) {
                                if (err != null) {
                                    next(err);
                                }
                                else {
                                    res.json(doc1);
                                    console.log('修改的手机号' + doc1.Phone);
                                }
                            })
                        }
                        else {
                            docs = null;
                            res.json(docs);
                        }
                    }
                })
            }
            else {
                doc = null;
                res.json(doc);
            }
        }
    });
});
//教师端、修改密码、确定修改密码
router.post('/tea_change_password', function (req, res, next) {
    Teacher.findOneAndUpdate({
            Number: req.body.Number,
            Password: req.body.Old_password
        }, {Password: req.body.Sure_password}, function (err, doc) {
            if (err) {
                next(err)
            }
            else {
                res.json(doc);
            }
        }
    )
});

//教师端、保存图片地址并将图片名称写入数据库
router.post('/tea_files', function (req, res, next) {
    Teacher.findOneAndUpdate({Number: req.body.photo_name}, {Photo: req.files.file.name}, function (err, doc) {
        if (err != null) {
            next(err);
        }
        else {
            res.json(doc);
        }
    })
});


////学生端、获取我的班级信息
//router.get('/myclass',function(req,res,next){
//  Class.findOne({_id:req.query.Classes})
//      .populate('Students')
//      .exec(function(err,doc){
//        if(err){next(err);}
//        else{
//          console.log(doc.Students.length)
//          for(i=0;i<doc.Students.length;i++) {
//            doc.Students[i].Photo = 'http://172.16.42.130:3000/images/'+doc.Students[i].Photo;
//          }
//          res.json(doc.Students);
//        }
//      })
//});

//老师页面的学院列表信息
router.get('/tea_college', function (req, res, next) {
    College.find({}, function (err, doc) {
        if (err) {
            next(err)
        }
        else {
            console.log(doc);
            res.json(doc);
        }
    })
});

//老师页面的专业信息
router.get('/tea_profession', function (req, res, next) {
    Profession.find({College: req.query.collegeId}, function(err, professions){
        if(err) next(err);
        res.jsonp(professions);
    });
});

//老师页面的班级列表信息
router.get('/tea_class', function (req, res, next) {
    Class.find({Profession: req.query.professionId}, function(err,classes){
        if(err) next(err);
        res.json(classes);
    });
    //Class.find({Profession: req.query.professionId}, function(err, classes){
    //    if(err){
    //        next(err);
    //    } else{
    //        if(classes){
    //            res.jsonp(classes);
    //        }
    //    }
    //});
});
//老师页面的班级成员列表信息
router.get('/tea_student', function (req, res, next) {
    Student.find({Classes: req.query.Classes}, function(err,students){
        if(err){
            next(err);
        } else{
            for(var i=0; i<students.length; i++){
                students[i].Photo = httpAddress + students[i].Photo;
            }
            res.jsonp(students);
        }
    });
});
//老师页面的班级成员的详细信息
router.get('/tea_stu_preson', function (req, res, next) {
    Student.findOne({_id: req.query.StudentId}, function (err, doc) {
        if (err) {
            next(err)
        }
        else {
            doc.Photo = httpAddress + doc.Photo
            res.json(doc)
        }
    })
});


// ******* 请假
// *学生申请*
router.post('/vacation', function (req, res, next) {
    //
    console.log(req.body);
    var BeginDate = new Date(req.body.BeginDate);
    //BeginDate.setHours(24,00,00);
    var EndDate = new Date(req.body.EndDate);
    //EndDate.setHours(24,00,00);
    var vacation = new Vacation({
        Student: req.body.Student,
        BeginDate: BeginDate,
        EndDate: EndDate,
        Reason: req.body.Reason,
        VacationTime: new Date(req.body.VacationTime)
    });

    //{"request_id":1656472935,"response_params":{"success_amount":1,"resource_ids":["msgid#8622333945414970548"]}
    //{"request_id":430228101,"response_params":{"success_amount":1,"resource_ids":["msgid#5545290654518020164"]}

    Student.findOne({_id: req.body.Student}, function (err, stu) {
        if (err) {
            next(err);
        } else {
            if (stu) {
                if (stu.Device == "Android") {
                    var client = BaiduPush.createClient(pushOptionAndroid);
                    var option = {
                        push_type: 2,
                        tag: stu.ClassTeacher,
                        msg_keys: "testkey",
                        device_type: 3,
                        messages: {"title": "请假申请", "description": "您有1条新的请假申请"},
                        deploy_status: 1,
                        message_type: 1
                    };
                } else {
                    var client = BaiduPush.createClient(pushOptionIos);
                    var option = {
                        push_type: 2,
                        tag: stu.ClassTeacher,
                        device_type: 4,
                        messages: {"aps": {"alert": "您有1条新的请假申请"}},
                        deploy_status: 1,
                        message_type: 1
                    };
                }
                client.pushMsg(option, function (error, result) {
                    if (error) {
                        res.send('服务器错误');
                    } else {
                        if (result.response_params.success_amount == 1) {
                            vacation.save();
                            res.send('提交成功');
                        } else {
                            res.send('提交失败，请重试');
                        }
                    }
                });
            } else {
                res.send('error');
            }
        }
    });
});
// *教师查看申请*
router.get('/checkVacation', function (req, res, next) {
    //
    var i = 0;
    var StudentName = [];
    if (req.query._id) {
        //
        if (req.query.tag == 'GetClass') {
            //
            Class.findOne({_id: req.query._id}, function (err, classes) {
                //
                res.json(classes);
            });
        } else {
            Vacation.find({_id: req.query._id})
                .populate("Student")
                .exec(function (err, vacations) {
                    //
                    res.json(vacations);
                });
        }
    } else {
        Vacation.find({})
            .populate("Student")
            .exec(function (err, vacations) {
                //
                console.log(vacations);
                res.json(vacations);
            });
    }
});
// *教师审批*
router.put('/verify', function (req, res, next) {
    //
    Vacation.findOne({_id: req.body._id}, function (err, vacations) {
        //
        if (err) {
            next(err);
        } else {
            //林改
            if (req.body.Status == '1') {
                SignIn.update({
                    BeginSubjectDate: {$gte: vacations.BeginDate},
                    EndSubjectDate: {$lte: vacations.EndDate},
                    StudentId: vacations.Student
                }, {$set: {IsVacation: 1, Ctnot: -2}}, {multi: true}, function (err, signIns) {
                    //
                    if (err) {
                        next(err);
                    } else {
                        //
                        console.log(signIns);
                    }
                });
            }
        }
    });
    //
    Vacation.findOne({_id: req.body._id}, function (err, vacation) {
        if (err) {
            next(err);
        } else {
            if (vacation) {
                Teacher.findOne({_id: req.body.TeacherId}, function (err, teacher) {
                    if (err) {
                        next(err);
                    } else {
                        if (teacher) {
                            if (teacher.Device == 'Android') {
                                var client = BaiduPush.createClient(pushOptionAndroid);
                                var option = {
                                    push_type: 2,
                                    tag: vacation.Student,
                                    msg_keys: "testkey",
                                    device_type: 3,
                                    messages: {"title": "审核结果通知", "description": "你的请假已审批，请查看"},
                                    deploy_status: 1,
                                    message_type: 1
                                }
                            } else {
                                var client = BaiduPush.createClient(pushOptionIos);
                                var option = {
                                    push_type: 2,
                                    tag: vacation.Student,
                                    device_type: 4,
                                    messages: {"aps": {"alert": "你的请假已审批，请查看"}},
                                    deploy_status: 1,
                                    message_type: 1
                                }
                            }
                            client.pushMsg(option, function (error, result) {
                                if (error) {
                                    res.send('信息推送服务器错误');
                                } else {
                                    if (result.response_params.success_amount == 1) {
                                        vacation.Status = req.body.Status;
                                        vacation.save();
                                        res.send('推送成功');
                                    } else {
                                        res.send('推送失败，请重试');
                                    }
                                }
                            });
                        } else {
                            res.send('error');
                        }
                    }
                });
            }
        }
    });

});
// *学生查看申请结果*
router.get('/viewResults', function (req, res, next) {
    //
    Vacation.find({Student: req.query.Student}, function (err, vacations) {
        //
        if (err) {
            next(err);
        } else {
            console.log(vacations);
            res.json(vacations);
        }
    });
});
// 请假 *******

// ******* 调课
// *获取教师调课可选但班级*
router.get('/getClassesName', function (req, res, next) {
    Teacher.find({_id: '55ed546d5ef0f1be065579ce'})
        .populate('Classes')
        .exec(function (err, teacher) {
            //
            console.log(teacher[0].Classes);
            res.json(teacher[0].Classes);
        });
});


// ******* 教师-检查权限
router.get('/CheckPurview', function (req, res, next) {
    //
    console.log(req.query.TeacherId);
    Teacher.findOne({_id: req.query.TeacherId}, function (err, teacher) {
        //
        if (err) {
            next(err);
        } else {
            console.log("Purview = " + teacher.Purview);
            res.json(teacher.Purview);
        }
    });
});
// 教师-检查权限 *******

// ******* 教师-信息发送
router.get('/GetInformation', function (req, res, next) {
    //
    console.log(req.query);
    if (req.query.tag == 'GetCollege') {
        College.find({}, function (err, college) {
            //
            res.json(college);
        });
    }
    if (req.query.tag == 'GetProfession') {
        College.findOne({CollegeName: req.query.CollegeName}, function(err, college){
            if(err){
                next(err);
            } else{
                if(college){
                    Profession.find({College: college._id}, function(err, professions){
                        if(err){
                            next(err);
                        } else{
                            res.jsonp(professions);
                        }
                    })
                }
            }
        });
    }
    if (req.query.tag == 'GetClasses') {

        Profession.findOne({ProfessionName: req.query.ProfessionName}, function(err, profession){
            if(err){
                next(err);
            } else{
                Class.find({Profession: profession._id}, function(err, classes){
                    if(err){
                        next(err);
                    } else{
                        res.jsonp(classes);
                    }
                });
            }
        });
    }
});
router.post('/SendMessage', function (req, res, next) {
    //
    var date = new Date();
    if (req.body.ClassId == '全院') {
        //
        client.push().setPlatform('ios', 'android')
            .setAudience(JPush.tag(req.body.CollegeId))
            .setNotification(req.body.Content, JPush.ios(req.body.Content, req.body.Title), JPush.android(req.body.Content, req.body.Title, 2))
            .setOptions(null, 60)
            .send(function (err, res) {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log('Sendno: ' + res.sendno);
                    console.log('Msg_id: ' + res.msg_id);
                }
            });
        //
        var message = new Message({
            //
            Title: req.body.Title,
            Content: req.body.Content,
            MessageDate: date, // 信息发送的时间
            Teacher: mongoose.Types.ObjectId(req.body.Teacher),
            College: mongoose.Types.ObjectId(req.body.CollegeId)
            //ActivityDate: req.body.ActivityDate, // 活动时间(选填)
            //Address: req.body.Address // 活动地点(选填)
        });
    }
    else if (req.body.ClassId == '全专业') {
        //
        client.push().setPlatform('ios', 'android')
            .setAudience(JPush.tag(req.body.ProfessionId))
            .setNotification(req.body.Content, JPush.ios(req.body.Content, req.body.Title), JPush.android(req.body.Content, req.body.Title, 2))
            .setOptions(null, 60)
            .send(function (err, res) {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log('Sendno: ' + res.sendno);
                    console.log('Msg_id: ' + res.msg_id);
                }
            });
        //
        var message = new Message({
            //
            Title: req.body.Title,
            Content: req.body.Content,
            MessageDate: date, // 信息发送的时间
            Teacher: mongoose.Types.ObjectId(req.body.Teacher),
            College: mongoose.Types.ObjectId(req.body.CollegeId), // 信息接受的学院
            Profession: mongoose.Types.ObjectId(req.body.ProfessionId) // 信息接受的专业
            //ActivityDate: req.body.ActivityDate, // 活动时间(选填)
            //Address: req.body.Address // 活动地点(选填)
        });
    }
    else {
        //
        client.push().setPlatform('ios', 'android')
            .setAudience(JPush.tag(req.body.ClassId))
            .setNotification(req.body.Content, JPush.ios(req.body.Content, req.body.Title), JPush.android(req.body.Content, req.body.Title, 2))
            .setOptions(null, 60)
            .send(function (err, res) {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log('Sendno: ' + res.sendno);
                    console.log('Msg_id: ' + res.msg_id);
                }
            });
        //
        var message = new Message({
            //
            Title: req.body.Title,
            Content: req.body.Content,
            MessageDate: date, // 信息发送的时间
            Teacher: mongoose.Types.ObjectId(req.body.Teacher),
            College: mongoose.Types.ObjectId(req.body.CollegeId), // 信息接受的学院
            Profession: mongoose.Types.ObjectId(req.body.ProfessionId), // 信息接受的专业
            Class: mongoose.Types.ObjectId(req.body.ClassId) // 信息接受的班级
            //ActivityDate: req.body.ActivityDate, // 活动时间(选填)
            //Address: req.body.Address // 活动地点(选填)
        });
    }
    message.save(function (err) {
        if (err) {
            next(err);
        } else {
            res.send('信息发送成功');
        }
    });
});
// 教师-信息发送 *******

// ******* 学生接收信息
router.get('/GetMessage', function (req, res, next) {
    //
    console.error(req.query);
    Message.find({
        $or: [
            {College: req.query.CollegeId, Profession: req.query.ProfessionId, Class: req.query.ClassId},
            {College: req.query.CollegeId, Profession: req.query.ProfessionId, Class: null},
            {College: req.query.CollegeId, Profession: null, Class: null}]
    }, function (err, messages) {
        //
        console.log(messages);
        res.json(messages);
    });
});
// 学生接收信息 ******* BC09106E-C882-4982-87D9-135D8F39DE19

router.get('/getClassName', function (req, res, next) {
    console.log(req.query);
    Class.findOne({_id: req.query.ClassId}, function (err, className) {
        if (err) {
            next(err);
        } else {
            console.log(className.ClassName);
            res.json(className.ClassName);
        }
    })
});
router.get('/gkb', function (req, res, next) {
    //
    //console.error(req.query.classes);
    query = new RegExp(req.query.classes, 'i');

    Excel.findOne({ClassName: query}, function (err, doc) {
        if(doc != null){
            console.log(doc.Number);

            var obj = xlsx.parse('public/files/kcb.xls');
            res.json(obj[doc.Number]);
        } else{
            res.jsonp('您的班级尚未添加课程信息，请联系管理员添加');
        }
    });

});


//老师的，先放一边
router.get('/getSignIn', function (req, res, next) {
    //
    var beginDay = new Date("2015-11-3");
    var now = new Date();
    SignIn.find({
        ClassId: req.query.ClassId,
        BeginSubjectDate: {$gte: beginDay},
        EndSubjectDate: {$lte: new Date()},
        Ctnot: {$gte: 0}
    })
        .populate('StudentId')
        .exec(function (err, signs) {
            var array = [];
            signs.forEach(function (item, callback) {
                //
                if (array.length != 0) {
                    array.forEach(function (arr, callback) {
                        //
                        if (arr.StudentId.toString() == item.StudentId._id.toString()) {
                            //
                            arr.Ctnot = parseInt(arr.Ctnot) + parseInt(item.Ctnot)
                        } else {
                            //
                            array.push({
                                StudentId: item.StudentId._id,
                                StudentName: item.StudentId.StudentName,
                                Photo: httpAddress + item.StudentId.Photo,
                                Ctnot: item.Ctnot,
                                SubjectName: item.SubjectName,
                                BeginSubjectDate: item.BeginSubjectDate,
                                EndSubjectDate: item.EndSubjectDate
                            })
                        }
                    });
                } else {
                    array.push({
                        StudentId: item.StudentId._id,
                        StudentName: item.StudentId.StudentName,
                        Photo: httpAddress + item.StudentId.Photo,
                        Ctnot: item.Ctnot,
                        SubjectName: item.SubjectName,
                        BeginSubjectDate: item.BeginSubjectDate,
                        EndSubjectDate: item.EndSubjectDate
                    })
                }
            });
            res.json(array);
        });

});
//先放一边
router.get('/StudentViewCtnot', function (req, res, next) {
    //
    var beginDay = new Date("2015-11-3");
    var now = new Date();

    SignIn.find({
        StudentId: req.query.StudentId,
        BeginSubjectDate: {$gte: beginDay},
        EndSubjectDate: {$lte: new Date()},
        Ctnot: {$gte: 0}
    })
        .populate('StudentId')
        .exec(function (err, signs) {
            var array = [];
            signs.forEach(function (item, callback) {
                //
                if (array.length != 0) {
                    array.forEach(function (arr, callback) {
                        //
                        if (arr.StudentId.toString() == item.StudentId._id.toString()) {
                            //
                            arr.Ctnot = parseInt(arr.Ctnot) + parseInt(item.Ctnot)
                        } else {
                            //
                            array.push({
                                StudentId: item.StudentId._id,
                                StudentName: item.StudentId.StudentName,
                                Photo: httpAddress + item.StudentId.Photo,
                                Ctnot: item.Ctnot,
                                SubjectName: item.SubjectName,
                                BeginSubjectDate: item.BeginSubjectDate,
                                EndSubjectDate: item.EndSubjectDate
                            })
                        }
                    });
                } else {
                    array.push({
                        StudentId: item.StudentId._id,
                        StudentName: item.StudentId.StudentName,
                        Photo: httpAddress + item.StudentId.Photo,
                        Ctnot: item.Ctnot,
                        SubjectName: item.SubjectName,
                        BeginSubjectDate: item.BeginSubjectDate,
                        EndSubjectDate: item.EndSubjectDate
                    })
                }
            });
            res.json(array);
        });

    //SignIn.find({StudentId: req.query.StudentId, BeginSubjectDate: {$gte: beginDay}, EndSubjectDate: {$lte: now}, SecondSignInState: 1, FirstSignInState: -1, IsVacation: 0})
    //    .populate('StudentId')
    //    .exec(function(err,signs){
    //      var array = [];
    //      signs.forEach(function(item, callback){
    //        //
    //        if(array.length != 0){
    //          array.forEach(function(arr, callback){
    //            //
    //            if(arr.StudentId.toString() == item.StudentId._id.toString()){
    //              //
    //              arr.Ctnot = parseInt(arr.Ctnot)+parseInt(Ctnot(item.BeginSubjectDate, item.EndSubjectDate, item.FirstSignInTime, item.SecondSignInTime))
    //            } else{
    //              //
    //              array.push({
    //                StudentId: item.StudentId._id,
    //                StudentName: item.StudentId.StudentName,
    //                Photo: httpAddress+ item.StudentId.Photo,
    //                Ctnot: Ctnot(item.BeginSubjectDate, item.EndSubjectDate, item.FirstSignInTime, item.SecondSignInTime),
    //                SubjectName: item.SubjectName,
    //                BeginSubjectDate: item.BeginSubjectDate,
    //                EndSubjectDate: item.EndSubjectDate
    //              })
    //            }
    //          });
    //        } else{
    //          array.push({
    //            StudentId: item.StudentId._id,
    //            StudentName: item.StudentId.StudentName,
    //            Photo: httpAddress+ item.StudentId.Photo,
    //            Ctnot: Ctnot(item.BeginSubjectDate, item.EndSubjectDate, item.FirstSignInTime, item.SecondSignInTime),
    //            SubjectName: item.SubjectName,
    //            BeginSubjectDate: item.BeginSubjectDate,
    //            EndSubjectDate: item.EndSubjectDate
    //          })
    //        }
    //      });
    //      console.log(array);
    //      res.json(array);
    //    });
});
//先放一边
router.get('/getSignInfor', function (req, res, next) {
    SignIn.find({
        StudentId: req.query.StudentId,
        IsSignIn: 0,
        BeginSubjectDate: {$gte: new Date('2015-9-17')},
        EndSubjectDate: {$lte: new Date()}
    }, function (err, signs) {
        //
        console.log(signs);
        res.json(signs);
    });
});



//管理后台的老师登陆
router.get('/manage_login', function (req, res, next) {
    Teacher.findOne({Number: req.query.Number, Password: req.query.Password}, function (err, doc) {
        if (err) {
            next(err)
        }
        else {
            if (doc) {
                res.json(doc);
            }
            else {
                res.send('请输入正确的信息');
            }
        }
    })
});

// 签到 林写
router.post('/SignIn', function (req, res, next) {
    function CountSignIn(startTime, signinTime) {
        var result = (signinTime.getHours() - startTime.getHours()) * 60 + (signinTime.getMinutes() - startTime.getMinutes());
        return result;
    }

    Subject.findOne({
        "Class": req.body.ClassId,
        BeginSubjectDate: {$lte: new Date(new Date().setMinutes(new Date().getMinutes()+15))},
        EndSubjectDate: {$gte: new Date(new Date().setMinutes(new Date().getMinutes()-10))}
    }, function (err, doc1) {
        if(err) next(err);
        if(doc1 != null)
        {
            SignIn.findOne({Subject:doc1._id,Student:req.body.StudentId},function(err,doc){
                if(err) next(err);
                if (doc) {
                    //console.log(typeof signs.FirstSignInState);
                    if (doc.FirstSignInState == 0) {
                        if (CountSignIn(doc1.BeginSubjectDate, new Date()) <= 0) {

                            doc.FirstSignInState = 1;
                            doc.FirstSignInTime = new Date();
                            doc.save();
                            res.send('签到成功');
                        } else if (CountSignIn(doc1.BeginSubjectDate, new Date()) > 0 && CountSignIn(doc1.BeginSubjectDate, new Date()) <= 10) {
                            console.log('迟到');
                            doc.FirstSignInState = 2;
                            doc.FirstSignInTime = new Date();
                            doc.save();
                            res.send('签到成功，但你迟到了');
                        } else {
                            console.log('无效签到');
                            doc.FirstSignInState = -1;
                            doc.FirstSignInTime = new Date();
                            doc.save();
                            res.send('签到成功,但会考虑你的旷课节数');
                        }
                    } else {
                        res.send('你已经签到了');
                    }
                } else {
                    res.send('现在不是签到时间');
                }
            });
        }else
        {
            res.send('现在不是签到时间');
        }
    });
});

// 签退 //林写
router.post('/SignOut', function (req, res, next) {
    function CountSignOut(endTime, signinTime) {
        var result = (endTime.getHours() - signinTime.getHours()) * 60 + (endTime.getMinutes() - signinTime.getMinutes());
        return result;
    }
    var date = new Date();
    Subject.findOne({
        "Class": req.body.ClassId,
        BeginSubjectDate: {$lte: new Date(new Date().setMinutes(new Date().getMinutes()+15))},
        EndSubjectDate: {$gte: new Date(new Date().setMinutes(new Date().getMinutes() - 10))}
    }, function (err, doc1) {
        if(err) next(err);
        if(doc1 != null)
        {
            SignIn.findOne({Subject:doc1._id,Student:req.body.StudentId},function(err,doc){
                if(err) next(err);
                if (doc) {
                    if(doc.FirstSignInState ==0)
                    {
                        res.send('你还没有签到,请先签到再签退');
                    }else if (doc.SecondSignInState == 0) {
                        if(CountSignOut(doc1.EndSubjectDate, date) >10)
                        {
                            doc.SecondSignInState = -1;
                            doc.SecondSignInTime = date;
                            doc.save();
                            res.send('还没到预定的签退时间,无效签退,会算你的旷课');
                        }else if(CountSignOut(doc1.EndSubjectDate, date) <=10 && CountSignOut(doc1.EndSubjectDate, date) >=-10)
                        {
                            doc.SecondSignInState = 1;
                            doc.SecondSignInTime = date;
                            doc.save();
                            res.send('签退成功');
                        }
                    } else {
                        res.send('你已经签退了');
                    }
                } else {
                    res.send('现在不是签退或签到时间');
                }
            });
        }else
        {
            res.send('现在不是签退或签到时间');
        }

    });
});



//function Ctnot(startTime, endTime, signInTime, signOutTime) {
//    //
//    if (startTime && endTime && signInTime && signOutTime) {
//        if (((signInTime.getHours() - startTime.getHours()) * 60 + (signInTime.getMinutes() - startTime.getMinutes())) <= 25) {
//            c = -1;
//            return c;
//        } else {
//            // a: 应该上课的节数
//            var a = ((endTime.getHours() - startTime.getHours()) * 60 + (endTime.getMinutes() - startTime.getMinutes())) / 55;
//            // b: 实际上课的节数
//            var b = ((signOutTime.getHours() - signInTime.getHours()) * 60 + (signOutTime.getMinutes() - signInTime.getMinutes())) / 55;
//            //
//            //var c = parseInt(a)-parseInt(b);
//            var c = (1 - Math.round(b) / parseInt(a)) * parseInt(a);
//            return c;
//        }
//    } else if (startTime && endTime && signInTime) {
//        // a: 应该上课的节数
//        var a = ((endTime.getHours() - startTime.getHours()) * 60 + (endTime.getMinutes() - startTime.getMinutes())) / 55;
//        // b: 实际上课的节数
//        var b = 0;
//        //
//        //var c = parseInt(a)-parseInt(b);
//        var c = parseInt(a);
//        return c;
//    } else if (startTime && endTime && signOutTime) {
//        // a: 应该上课的节数
//        var a = ((endTime.getHours() - startTime.getHours()) * 60 + (endTime.getMinutes() - startTime.getMinutes())) / 55;
//        // b: 实际上课的节数
//        var b = 0;
//        //
//        //var c = parseInt(a)-parseInt(b);
//        var c = parseInt(a);
//        return c;
//    } else {
//        // a: 应该上课的节数
//        var a = ((endTime.getHours() - startTime.getHours()) * 60 + (endTime.getMinutes() - startTime.getMinutes())) / 55;
//        // b: 实际上课的节数
//        var b = 0;
//        //
//        //var c = parseInt(a)-parseInt(b);
//        var c = parseInt(a);
//        return c;
//    }
//}
function CountNumOfSubject(Begin,End){
    var result = ((End.getHours() - Begin.getHours())*60 + (End.getMinutes()-Begin.getMinutes())) / 45;
    return parseInt(result);
}
function CountNumOfSign(Begin,End,SingIn,SignOut){
    var result = ((End.getHours() - Begin.getHours())*60 + (End.getMinutes()-Begin.getMinutes())) -
        ((SignOut.getHours() - SingIn.getHours())*60 + (SignOut.getMinutes()-SingIn.getMinutes()));
    //result = result / 45 ? (result/45) : 1;
    result = Math.ceil(result);
    if(result > CountNumOfSubject(Begin,End)){
        result = CountNumOfSubject(Begin,End);
    }
    return result;
}

var schedule = require('node-schedule');

var rule1 = new schedule.RecurrenceRule();
var rule2 = new schedule.RecurrenceRule();
var rule3 = new schedule.RecurrenceRule();
var rule4 = new schedule.RecurrenceRule();

rule1.hour = 10;
rule1.minute = 05;
rule2.hour = 12;
rule2.minute = 05;
rule3.hour = 17;
rule3.minute = 20;
rule4.hour = 22;
rule4.minute = 05;

var j1 = schedule.scheduleJob(rule1, function () {
    //
    var today_Begin = new Date();
    today_Begin.setHours(7, 00, 00);
    var today_End = new Date();
    //today_End.setHours(23, 00, 00);
    //
    Subject.find({BeginSubjectDate:{$gte: today_Begin}, EndSubjectDate: {$lte: today_End}}, function(err, subjects){
        async.each(subjects, function(subject, callback1){
            //
            SignIn.find({Subject: subject._id})
                .populate('Subject')
                .exec(function(err,signs){
                    if(err){
                        next(err);
                    } else{
                        if(signs){
                            signs.forEach(function(item){
                                var NumOfSub = CountNumOfSubject(item.Subject.BeginSubjectDate,item.Subject.EndSubjectDate);
                                if(item.FirstSignInState == 0 || item.SecondSignInState == 0){
                                    // 全矿
                                    item.Ctnot = NumOfSub;
                                    item.StaticsDate = new Date();
                                    item.save();
                                }
                                else if(item.FirstSignInState == 2 && item.SecondSignInState == 1){
                                    // 迟到
                                    item.Ctnot = -1;
                                    item.StaticsDate = new Date();
                                    item.save();
                                }
                                else if(item.FirstSignInState == 1 && item.SecondSignInState == 1){
                                    // 正常
                                }
                                else{
                                    // 计算旷课
                                    item.Ctnot = CountNumOfSign(item.Subject.BeginSubjectDate,item.Subject.EndSubjectDate,item.FirstSignInTime,item.SecondSignInTime);
                                    item.StaticsDate = new Date();
                                    item.save();
                                }
                            });
                        }
                    }
                    callback1();
                });
        }, function(err){
            //
        });
    });
});
var j2 = schedule.scheduleJob(rule1, function () {
    //
    var today_Begin = new Date();
    today_Begin.setHours(9, 50, 00);
    var today_End = new Date();
    //today_End.setHours(23, 00, 00);
    //
    Subject.find({BeginSubjectDate:{$gte: today_Begin}, EndSubjectDate: {$lte: today_End}}, function(err, subjects){
        async.each(subjects, function(subject, callback1){
            //
            SignIn.find({Subject: subject._id})
                .populate('Subject')
                .exec(function(err,signs){
                    if(err){
                        next(err);
                    } else{
                        if(signs){
                            signs.forEach(function(item){
                                var NumOfSub = CountNumOfSubject(item.Subject.BeginSubjectDate,item.Subject.EndSubjectDate);
                                if(item.FirstSignInState == 0 || item.SecondSignInState == 0){
                                    // 全矿
                                    item.Ctnot = NumOfSub;
                                    item.StaticsDate = new Date();
                                    item.save();
                                }
                                else if(item.FirstSignInState == 2 && item.SecondSignInState == 1){
                                    // 迟到
                                    item.Ctnot = -1;
                                    item.StaticsDate = new Date();
                                    item.save();
                                }
                                else if(item.FirstSignInState == 1 && item.SecondSignInState == 1){
                                    // 正常
                                }
                                else{
                                    // 计算旷课
                                    item.Ctnot = CountNumOfSign(item.Subject.BeginSubjectDate,item.Subject.EndSubjectDate,item.FirstSignInTime,item.SecondSignInTime);
                                    item.StaticsDate = new Date();
                                    item.save();
                                }
                            });
                        }
                    }
                    callback1();
                });
        }, function(err){
            //
        });
    });
});
var j3 = schedule.scheduleJob(rule1, function () {
    //
    var today_Begin = new Date();
    today_Begin.setHours(14, 10, 00);
    var today_End = new Date();
    //today_End.setHours(23, 00, 00);
    //
    Subject.find({BeginSubjectDate:{$gte: today_Begin}, EndSubjectDate: {$lte: today_End}}, function(err, subjects){
        async.each(subjects, function(subject, callback1){
            //
            SignIn.find({Subject: subject._id})
                .populate('Subject')
                .exec(function(err,signs){
                    if(err){
                        next(err);
                    } else{
                        if(signs){
                            signs.forEach(function(item){
                                var NumOfSub = CountNumOfSubject(item.Subject.BeginSubjectDate,item.Subject.EndSubjectDate);
                                if(item.FirstSignInState == 0 || item.SecondSignInState == 0){
                                    // 全矿
                                    item.Ctnot = NumOfSub;
                                    item.StaticsDate = new Date();
                                    item.save();
                                }
                                else if(item.FirstSignInState == 2 && item.SecondSignInState == 1){
                                    // 迟到
                                    item.Ctnot = -1;
                                    item.StaticsDate = new Date();
                                    item.save();
                                }
                                else if(item.FirstSignInState == 1 && item.SecondSignInState == 1){
                                    // 正常
                                }
                                else{
                                    // 计算旷课
                                    item.Ctnot = CountNumOfSign(item.Subject.BeginSubjectDate,item.Subject.EndSubjectDate,item.FirstSignInTime,item.SecondSignInTime);
                                    item.StaticsDate = new Date();
                                    item.save();
                                }
                            });
                        }
                    }
                    callback1();
                });
        }, function(err){
            //
        });
    });
});
var j4 = schedule.scheduleJob(rule1, function () {
    //
    var today_Begin = new Date();
    today_Begin.setHours(18, 00, 00);
    var today_End = new Date();
    //today_End.setHours(23, 00, 00);
    //
    Subject.find({BeginSubjectDate:{$gte: today_Begin}, EndSubjectDate: {$lte: today_End}}, function(err, subjects){
        async.each(subjects, function(subject, callback1){
            //
            SignIn.find({Subject: subject._id})
                .populate('Subject')
                .exec(function(err,signs){
                    if(err){
                        next(err);
                    } else{
                        if(signs){
                            signs.forEach(function(item){
                                var NumOfSub = CountNumOfSubject(item.Subject.BeginSubjectDate,item.Subject.EndSubjectDate);
                                if(item.FirstSignInState == 0 || item.SecondSignInState == 0){
                                    // 全矿
                                    item.Ctnot = NumOfSub;
                                    item.StaticsDate = new Date();
                                    item.save();
                                }
                                else if(item.FirstSignInState == 2 && item.SecondSignInState == 1){
                                    // 迟到
                                    item.Ctnot = -1;
                                    item.StaticsDate = new Date();
                                    item.save();
                                }
                                else if(item.FirstSignInState == 1 && item.SecondSignInState == 1){
                                    // 正常
                                }
                                else{
                                    // 计算旷课
                                    item.Ctnot = CountNumOfSign(item.Subject.BeginSubjectDate,item.Subject.EndSubjectDate,item.FirstSignInTime,item.SecondSignInTime);
                                    item.StaticsDate = new Date();
                                    item.save();
                                }
                            });
                        }
                    }
                    callback1();
                });
        }, function(err){
            //
        });
    });
});

// 学委查看考勤状况
router.get('/SubjectNameInfo',function(req,res,next){

    Subject.distinct('SubjectName',{Class:req.query.ClassId},function(err,doc){
        if(err) next(err);
        res.jsonp(doc);
    });
});
router.get('/SubjectInfo',function(req,res,next){
    Subject.find({SubjectName:req.query.SubjectName,Class:req.query.ClassId},function(err,doc){
        //
        if(err) next(err);
        res.jsonp(doc);
        //
    });
});
router.get('/SignInInfo',function(req,res,next){
    SignIn.find({Subject:req.query.Subject},function(err,doc){
        if(err) next(err);
        res.jsonp(doc);
    }).populate('Student')
});

router.get('/versions', function (req, res, next) {
    Version.findOne({}, function (error, doc) {
        //
        if (error) next(error);
        res.jsonp(doc);
        //
    });
});




// 教师端


module.exports = router;

//1161,1990

