import OBSWebSocket from 'obs-websocket-js';


const obs = new OBSWebSocket();
// Docs: https://github.com/Palakis/obs-websocket/blob/da9dd6f77544308f35dbe0b716c3bcf7d97913c3/docs/generated/protocol.md

export default class OBSController {
    constructor() {
        obs.connect({ address: 'localhost:4445'}).then(() => {
            console.log(`OBS Controller: Success! We're connected & authenticated.`);
        });

    }

    isSourceVisible(sourceName: string) {
        obs.send('GetSceneItemProperties', {
            'item': sourceName
        }).then(data => {
            return data.visible;
        }).catch(err => {
            console.log(err);
        });
    }

    setCurrentScene(sceneName: string) {
        obs.send('SetCurrentScene', {
            'scene-name': sceneName
        })
        .catch(err => {
            console.log(err);
        });
    }

    setText(sourceName: string, newText: string|null, color: number) {
        // Yellow: 65535
        // Black: 0
        // White: 16777215
        obs.send('SetTextGDIPlusProperties', {
            source: sourceName,
            text: newText as string,
            color
            // 'color': color
        })
        .catch((err:any) => {
            console.log(err);
        });
    }

    async playVideo(name: string, seconds: number) {
        const defaultSceneItemProps = {
            item: name,
            bounds: {},
            scale: {},
            crop: {},
            position: {}
        };
        try {
            await obs.send('SetSceneItemProperties', {
                ...defaultSceneItemProps,
                visible: false
            })
            // Delay for 0.1 seconds otherwise OBS doesn't detect the source as being made visible
            setTimeout(async () => {
                await obs.send('SetSceneItemProperties', {
                    ...defaultSceneItemProps,
                    visible: true
                })
                setTimeout(function() {
                    obs.send('SetSceneItemProperties', {
                        ...defaultSceneItemProps,
                        visible: false
                    })
                }, seconds*1000);
            }, 100);
        } catch(err) {
            console.log(err);
        };
    }

    setSourceVisibility(sourceName:string, isVisible:boolean) {
        console.log("setting " + sourceName + ' to ' + isVisible);
        obs.send('SetSceneItemProperties', {
            item: sourceName,
            visible: isVisible,
            bounds: {},
            scale: {},
            crop: {},
            position: {}
        }).catch(err => {
            console.log(err);
        });
    }


}
