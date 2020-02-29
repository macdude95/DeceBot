const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();
// Docs: https://github.com/Palakis/obs-websocket/blob/da9dd6f77544308f35dbe0b716c3bcf7d97913c3/docs/generated/protocol.md

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
    
    setText(sourceName, newText, color) {
        // Yellow: 65535
        // Black: 0
        // White: 16777215
        obs.send('SetTextGDIPlusProperties', {
            'source': sourceName,
            'text': newText,
            'color': color
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

    setSourceVisibility(sourceName, isVisible) {
        console.log("setting " + sourceName + ' to ' + isVisible);
        obs.send('SetSceneItemProperties', {
            'item': sourceName,
            'visible': isVisible
        }).catch(err => {
            console.log(err);
        });
    }


}
module.exports = OBSController