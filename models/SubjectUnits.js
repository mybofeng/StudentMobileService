/**
 * Created by linhehe on 15/8/1.
 */
var mongoose = require('mongoose');

// 上课单元(上课时间+上课地点)

var SubjectUnitSchema = new mongoose.Schema({

    Subject:{type: mongoose.Schema.Types.ObjectId, ref: 'Subject'}
});

mongoose.model('SubjectUnit', SubjectUnitSchema);