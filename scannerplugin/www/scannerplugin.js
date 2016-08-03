var scannerName = "ScannerPluginBB";
var scannerBB = {
  initialize: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, scannerName, "initialize", []);
  },
  destroy:function(successCallback, errorCallback){
    cordova.exec(successCallback, errorCallback, scannerName, "destroy", []);
  }
}
module.exports = scannerBB;
