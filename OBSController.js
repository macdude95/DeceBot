const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();
// Docs: https://github.com/Palakis/obs-websocket/blob/da9dd6f77544308f35dbe0b716c3bcf7d97913c3/docs/generated/protocol.md

const cameraContainerName = "Camera";
const webcamName = "Webcam";

class OBSController {
    constructor(command) {
        this.command = command;
        obs.connect().then(() => {
            console.log(`OBS Controller: Success! We're connected & authenticated.`);
        });

    }

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

    setCurrentScene(sceneName) {
        obs.send('SetCurrentScene', {
            'scene-name': sceneName
        })
        .catch(err => {
            console.log(err);
        });
    }
}
module.exports = OBSController