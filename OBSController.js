const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();
// Docs: https://github.com/Palakis/obs-websocket/blob/da9dd6f77544308f35dbe0b716c3bcf7d97913c3/docs/generated/protocol.md

const cameraContainerName = "Camera";
const webcamName = "Webcam";

class OBSController {
    constructor(command) {
        this.command = command;
        obs.connect({ address: 'localhost:4445'}).then(() => {
            console.log(`OBS Controller: Success! We're connected & authenticated.`);
        });

    }

    isSourceVisible(sourceName) {
        obs.send('GetSceneItemProperties', {
            'item': pantsName
        }).then(data => {
            return data.visible;
        }).catch(err => {
            console.log(err);
        });
    }

    setCurrentScene(sceneName) {
        obs.send('SetCurrentScene', {
            'scene-name': sceneName
        })
        .catch(err => {
            console.log(err);
        });
    }

    playVideo(name, seconds) {
        obs.send('SetSceneItemProperties', {
            'item': name,
            'visible': false
        })
        .then(data => {
            // Delay for 0.1 seconds otherwise OBS doesn't detect the source as being made visible
            setTimeout(function() {
                obs.send('SetSceneItemProperties', {
                    'item': name,
                    'visible': true
                })
                .then(data => {
                    setTimeout(function() {
                        obs.send('SetSceneItemProperties', {
                            'item': name,
                            'visible': false
                        })
                    }, seconds*1000);
                });
            }, 100);
        })
        .catch(err => {
            console.log(err);
        });
    }

    // TODO
    toggleWebcamZoom() {
        obs.send('GetSceneItemProperties', {
            'item': webcamName
        })
        .then(data => {
            console.log(data);

        })
        .catch(err => {
            console.log(err);
        });
    }


    // TODO: Make a generic cycle through that can be used for pants and camera/pic, etc. Maybe even allow passing in closures to be associated with each change (i.e. spongebob laugh)
    cycleThroughPants() {
        var pants = ["spongebobPants", "marioPants"];
        var pantsVisibleDict = {};
        for (const pantsName of pants) {
            pantsVisibleDict[pantsName] = isSourceVisible(pantsName);
        }
        
    }

    // Not Using Anymore
    swapCameraAndPic() {
        var picName = "MikeBike";
        var webcamIsVisible = false;
        var picIsVisible = false;
        // If neither are visible for some reason, only activate pic. 
        // If both are visible, hide the webcam
        obs.send('GetSceneItemProperties', {
            'item': picName
        })
        .then(data => {
            picIsVisible = data.visible;
            obs.send('GetSceneItemProperties', {
                'item': webcamName
            })
            .then(data =>  {
                webcamIsVisible = data.visible;
                if ((webcamIsVisible && picIsVisible) || (!webcamIsVisible && !picIsVisible)) {
                    webcamIsVisible = false;
                    picIsVisible = true;
                } else {
                    webcamIsVisible = !webcamIsVisible;
                    picIsVisible = !picIsVisible;
                }
                obs.send('SetSceneItemProperties', {
                    'item': webcamName,
                    "visible": webcamIsVisible
                });
                obs.send('SetSceneItemProperties', {
                    'item': picName,
                    "visible": picIsVisible
                });
            });
        })
        .catch(err => {
            console.log(err);
        });
    }

}
module.exports = OBSController