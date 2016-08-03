# cordova-plugin-scannerbb
windows builtin scanner plugin for cordova

NOTE
This only works with windows 10 phone with built in scanner

this plugin only contains to method
cannerBB.initialize(successhandler,errorhandler)  : starts the scanner and add datareceived listener, after successfully initialized, you should be able to start scanning, and result should be populated to the focused input box.

cannerBB.destroy(successhandler,errorhandler) : stop scanner feature, basically set the scanner to null. you should not be able to scan after this is called

sample typescript code

scannerBB.initialize((o) => {
            console.log("success!");
            
            output = o.output;
            document.getElementById("scenarioOutputScanData").textContent = output;
        }, (e) => {
            console.log("fail!");
            document.getElementById("scenarioOutputScanData").textContent = "fail!";
            this.navCtrl.present(Alert.create({
                title: "Scan Results",
                subTitle: e.message,
                buttons: ["Close"]
            }));
            });
            
          scannerBB.destroy((output) => {
            document.getElementById("scenarioOutputScanData").textContent = output.output;
        }, (e) => {
            console.log("fail!");
            document.getElementById("scenarioOutputScanData").textContent =e;
        });
