/**
 * Created by linhehe on 15/12/4.
 */
var mongoose = require('mongoose');

var  VersionSchema = new mongoose.Schema(
    {
        currentVersion:String,
        androidUpdateUrl:String,
        iosUpdateUrl:String
    });
mongoose.model('Version', VersionSchema);