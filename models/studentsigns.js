/**
 * Created by linhehe on 15/7/31.
 */
var mongoose = require('mongoose');

// 签到表

var studentsignSchema = new mongoose.Schema({
    //
    AddressName: String, // 签到地点

    SignInDate: Date, // 签到时间
    SignInAddress: {lat: Number,lng: Number} // 签到的位置
});

mongoose.model('Studentsign', studentsignSchema);