/**
 * Created by linhehe on 15/7/31.
 */
var mongoose = require('mongoose');

// 签到表

var SignInSchema = new mongoose.Schema({
    //
    Student: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
    Subject:{type: mongoose.Schema.Types.ObjectId, ref: 'Subject'},

    IsVacation: Number, // 是否请假 （0为否，1为是）

    FirstSignInTime: Date, // 上课前的签到时间
    SecondSignInTime: Date, // 下课前的签到时间

    FirstSignInState: Number, // 上课前的签到状态；0：未签到；1：签到成功；-1：无效签到；2：迟到
    SecondSignInState: Number, // 下课前的签退状态；0：未签退；1：签退成功；-1：无效签退；2：迟到
    Ctnot: { type: Number, default: 0 } // 迟到：-1；旷课：旷课节数；请假：-2；默认状态为：0；
});

mongoose.model('SignIn', SignInSchema);