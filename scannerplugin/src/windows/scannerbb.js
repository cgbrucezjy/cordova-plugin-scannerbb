
var _scanner = null;
var _claimedScanner = null;

module.exports = {

  initialize: function (successCallback, errorCallback) {
 // Create the barcode scanner. 
        //WinJS.log("Creating barcode scanner object.", "sample", "status")
        document.getElementById("scenarioOutputScanData").textContent = "Creating barcode scanner object.";
        var deviceSelector = Windows.Devices.PointOfService.BarcodeScanner.getDeviceSelector();
        Windows.Devices.Enumeration.DeviceInformation.findAllAsync(deviceSelector, null).then(function (deviceCollection) {
            if (deviceCollection === null || deviceCollection.length == 0) {
                //WinJS.log("Barcode scanner not found. Please connect a barcode scanner.", "sample", "error");
                errorCallback({ error: "initialize", message: "Barcode scanner not found. Please connect a barcode scanner." });
            } 
            else {
              //successCallback({ 'output': "Ready to scan. Device ID: "});
              var deviceSelector = deviceCollection[0].id;
                    Windows.Devices.PointOfService.BarcodeScanner.fromIdAsync(deviceSelector).then(function (scanner) {
                    if (scanner !== null) {
                        _scanner = scanner;

                        // After successful creation, claim the scanner for exclusive use and enable it so that data reveived events are received.
                        scanner.claimScannerAsync().done(function (claimedScanner) {
                            if (claimedScanner !== null) {
                                _claimedScanner = claimedScanner;

                                // Ask the API to decode the data by default. By setting this, API will decode the raw data from the barcode scanner and 
                                // send the ScanDataLabel and ScanDataType in the DataReceived event
                                claimedScanner.isDecodeDataEnabled = true;

                                // After successfully claiming, attach the datareceived event handler.
                                claimedScanner.addEventListener("datareceived", onDataReceived);

                                // It is always a good idea to have a release device requested event handler. If this event is not handled, there are chances of another app can 
                                // claim ownsership of the barcode scanner.
                                claimedScanner.addEventListener("releasedevicerequested", onReleasedeviceRequested);

                                // Enable the scanner.
                                // Note: If the scanner is not enabled (i.e. EnableAsync not called), attaching the event handler will not be any useful because the API will not fire the event 
                                // if the claimedScanner has not beed Enabled
                                claimedScanner.enableAsync().done(function () {

                                    //WinJS.log("Ready to scan. Device ID: " + _claimedScanner.deviceId, "sample", "status");
                                    successCallback({ 'output': "Ready to scan. Device ID: " + _claimedScanner.deviceId});
                                }, function error(e) {
                                    //WinJS.log("Enable barcode scanner failed: " + e.message, "sample", "error")
                                    errorCallback({ error: "initialize", message: "Enable barcode scanner failed: " + e.message });
                                });

                            } else {
                                //WinJS.log("Claim barcode scanner failed.", "sample", "error");
                                errorCallback({ error: "initialize", message: "Claim barcode scanner failed." });
                            }
                        }, function error(e) {
                           // WinJS.log("Claim barcode scanner failed: " + e.message, "sample", "error");
                            errorCallback({ error: "initialize", message: "Claim barcode scanner failed: " + e.message });
                        });

                    } else {
                        //WinJS.log("Barcode scanner not found. Please connect a barcode scanner.", "sample", "error");
                        errorCallback({ error: "initialize", message: "Barcode scanner not found 2. Please connect a barcode scanner."+deviceSelector });
                    }

                }, function error(e) {
                    //WinJS.log("Barcode scanner FromIdAsync unsuccessful: " + e.message, "sample", "error");
                    errorCallback({ error: "initialize", message: "Barcode scanner FromIdAsync unsuccessful: " + e.message });
                });
            }         
        });


            
                


            

  },
  destroy:function(successCallback, errorCallback){
        if (_claimedScanner !== null) {
            _claimedScanner.removeEventListener("datareceived", onDataReceived);
            _claimedScanner.removeEventListener("releasedevicerequested", onReleasedeviceRequested);
            _claimedScanner.close();
            _claimedScanner = null;
            successCallback({ 'output': "scanner stopped with eventListener cleared" });
        }
        _scanner = null;
        successCallback({ 'output': "scanner stopped" });
        //document.getElementById("scenarioOutputScanData").textContent = "Scanner Destroyed";

  }
};
// Event handler for the Release Device Requested event fired when barcode scanner receives Claim request from another application
function onReleasedeviceRequested(args) {
    _claimedScanner.retainDevice();
    //WinJS.log("Event ReleaseDeviceRequested received. Retaining the barcode scanner.", "sample", "status");
}

// Event handler for the DataReceived event fired when a barcode is scanned by the barcode scanner 
function onDataReceived(args) {
    var tempScanType = Windows.Devices.PointOfService.BarcodeSymbologies.getName(args.report.scanDataType);

    //document.getElementById("scenarioOutputScanDataType").textContent = tempScanType;
    //document.getElementById("scenarioOutputScanData").textContent = getDataLabelString(args.report.scanDataLabel, args.report.scanDataType);
    if(document.activeElement.tagName=="INPUT")
    {
      document.activeElement.value  = getDataLabelString(args.report.scanDataLabel, args.report.scanDataType);
    }
    
    //document.getElementById("scenarioOutputScanDataFormatted").textContent = getDataLabelString(args.report.scanDataLabel, args.report.scanDataType);
}

function getDataString(data) {
        var result = "";

        if (data === null) {
            result = "No data";
        }
        else {
            // Just to show that we have the raw data, we'll print the value of the bytes.
            // Arbitrarily limit the number of bytes printed to 20 so the UI isn't overloaded.
            var MAX_BYTES_TO_PRINT = 20;
            var bytesToPrint = (data.length < MAX_BYTES_TO_PRINT) ? data.length : MAX_BYTES_TO_PRINT;

            var reader = Windows.Storage.Streams.DataReader.fromBuffer(data);

            for (var byteIndex = 0; byteIndex < bytesToPrint; ++byteIndex) {
                result += reader.readByte().toString(16) + " ";
            }

            if (bytesToPrint < data.length) {
                result += "...";
            }
        }

        return result;
    }
function getDataLabelString(data, scanDataType) {

        var result = null;

        // Only certain data types contain encoded text.
        //   To keep this simple, we'll just decode a few of them.
        if (data === null) {
            result = "No data";
        }
        else {
            switch (Windows.Devices.PointOfService.BarcodeSymbologies.getName(scanDataType)) {
                case "Upca":
                case "UpcaAdd2":
                case "UpcaAdd5":
                case "Upce":
                case "UpceAdd2":
                case "UpceAdd5":
                case "Ean8":
                case "TfStd":

                    // The UPC, EAN8, and 2 of 5 families encode the digits 0..9
                    // which are then sent to the app in a UTF8 string (like "01234").
                    // This is not an exhaustive list of symbologies that can be converted to a string

                    var reader = Windows.Storage.Streams.DataReader.fromBuffer(data);
                    result = reader.readString(data.length);
                    break;
                default:

                    // Some other symbologies (typically 2-D symbologies) contain binary data that
                    //  should not be converted to text.
                    result = "Decoded data unavailable. Raw label data: " + getDataString(data);
                    break;
            }
        }

        return result;
    };
require("cordova/exec/proxy").add("ScannerPluginBB", module.exports);
