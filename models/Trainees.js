/**
 * Created by linhehe on 15/12/8.
 */
var mongoose = require('mongoose');

var TraineeSchema = new mongoose.Schema({
    //大三实习
    CompanyName: String,//公司名称
    CompanyPhone: String,//公司电话
    Companyperson: String,//公司负责人联系方式
    AddressName: String,
    Address: {lat: Number,lng: Number},//地理坐标
    Sigin_sum: String//签到次数
});

mongoose.model('Trainee', TraineeSchema);