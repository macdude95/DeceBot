// SPECs - https://github.com/project-slippi/slippi-wiki/blob/master/SPEC.md

const { default: SlippiGame } = require('slp-parser-js');
const chokidar = require('chokidar');
const _ = require('lodash');

class Slippi {
    constructor(listenPath, obs=null) {
        this.obs = obs;
        this.gameIsPlaying = false;
        this.playerLastHitBy = [-1,-1,-1,-1];
        this.playerPreviousActionState = [-1,-1,-1,-1];

        // console.log(`Listening for Slippi data at ${listenPath}`)
        this.watcher = chokidar.watch(listenPath, {
            // ignored: "!*.slp", // TODO: This doesn't work. Use regex?
            depth: 0,
            persistent: true,
            usePolling: true,
            ignoreInitial: true,
        });

        this.run();
    }

    run() {
        var gameByPath = {}
        this.watcher.on('change', (path) => {
            const start = Date.now();
            let gameState, settings, stats, frames, latestFrame, gameEnd;
            try {
                let game = _.get(gameByPath, [path, 'game']);
                if (!game) {
                    console.log("new game");
                    // console.log(`New file at: ${path}`);
                    game = new SlippiGame(path);
                    gameByPath[path] = {
                        game: game,
                        state: {
                            settings: null,
                            detectedPunishes: {},
                        }
                    };
                    settings = game.getSettings();
                    this.setSettings(settings);
                }

                gameState = _.get(gameByPath, [path, 'state']);

                settings = game.getSettings();

                frames = game.getFrames();
                latestFrame = game.getLatestFrame();
                gameEnd = game.getGameEnd();
            } catch (err) {
                console.log(err);
                return;
            }

            if (!gameState.settings && settings) {
                // console.log(`[Game Start] New game has started`);
                gameState.settings = settings;
            }

            // console.log(`We have ${_.size(frames)} frames.`);
            this.setGameIsPlaying(true);
            _.forEach(settings.players, player => {
                const frameData = _.get(latestFrame, ['players', player.playerIndex]);
                const otherPlayerFrameData = _.get(latestFrame, ['players', (player.playerIndex + 1) % 2]);
                if (!frameData) {
                    return;
                }

                this.checkForSD(frameData, player.playerIndex);
                this.checkForDunk(frameData, player.playerIndex, otherPlayerFrameData);

                // console.log(
                //     `[Port ${player.port}] ${frameData.post.percent.toFixed(1)}% | ` +
                //     `${frameData.post.stocksRemaining} stocks`
                // );

                // Save values for future
                this.playerLastHitBy[player.playerIndex] = frameData.post.lastHitBy;
                this.playerPreviousActionState[player.playerIndex] = frameData.post.actionStateId;
            });

            if (gameEnd) {
                // NOTE: These values and the quitter index will not work until 2.0.0 recording code is
                // NOTE: used. This code has not been publicly released yet as it still has issues
                const endTypes = {
                    1: "TIME!",
                    2: "GAME!",
                    7: "No Contest",
                };

                const endMessage = _.get(endTypes, gameEnd.gameEndMethod) || "Unknown";

                const lrasText = gameEnd.gameEndMethod === 7 ? ` | Quitter Index: ${gameEnd.lrasInitiatorIndex}` : "";
                console.log(`[Game Complete] Type: ${endMessage}${lrasText}`);
                
                this.setGameIsPlaying(false, gameEnd.gameEndMethod === 7);
                this.setWinner(gameEnd, latestFrame);
            }

            // console.log(`Read took: ${Date.now() - start} ms`);
        });
    }

    setSettings(settings) {
        for (const player of settings.players) {
            var port = player.port;
            var tag = player.nametag.length == 0 ? `P${port}` : player.nametag;
            var sourceName = `NameTag${port}`;
            this.obs.setText(sourceName, tag, 16777215);
        }
    }

    setWinner(gameEnd, latestFrame) {
        if (gameEnd.lrasInitiatorIndex == -1) {
            // console.log(latestFrame);
            // // frameData.post.stocksRemaining
            // for (const frame of latestFrame.players) {
            //     const frameData = player.pre
            // }
            // var found = array.find(function(element) { 
            //   return element > 4; 
            // }); 
            var winnerPlayerIndex = latestFrame.players.findIndex(function(frameData) {
               return frameData.post.stocksRemaining > 0;
            })
            var sourceName =`NameTag${winnerPlayerIndex + 1}`;
            this.obs.setText(sourceName, null, 65535);
        }
    }

    checkForDunk(frameData, playerIndex, otherPlayerFrameData) {
        var playerDied = this.didPlayerJustDie(frameData, playerIndex, "bottom");
        if(playerDied) {
            console.log(`Player ${playerIndex}'s action state when they died: ` + this.playerPreviousActionState[playerIndex]);
        }
        if (playerDied && this.playerPreviousActionState[playerIndex] == 88) {
            this.playerDunkEvent(playerIndex, this.playerIsPressingButton("A", otherPlayerFrameData));
        }
    }

    checkForSD(frameData, playerIndex) {
        var playerDied = this.didPlayerJustDie(frameData, playerIndex, "bottom");
        if (playerDied && this.playerLastHitBy[playerIndex] == 6) {
            this.playerSDEvent(playerIndex, this.playerIsPressingButton("A", frameData));
        }
    }

    didPlayerJustDie(frameData, playerIndex, side) {
        // TODO: logic for other sides
        if (side == "bottom") {
            return frameData.post.actionStateId == 0 && this.playerPreviousActionState[playerIndex] != 0;
        }
        return false;
    }

    setGameIsPlaying(newValue, noContest=false) {
        var obs = this.obs;
        if (this.gameIsPlaying == newValue) {
            return;
        }
        this.gameIsPlaying = newValue;

        var delaySeconds = (newValue || noContest) ? 0 : 2;
        setTimeout(function() {
            var sceneName = newValue ? "Melee" : "Just Me Scene";
            obs.setCurrentScene(sceneName);
        }, delaySeconds*1000);
        
    }

    playerSDEvent(playerIndex, triggerEvent) {
        console.log("Player " + playerIndex + " SDed");
        if (triggerEvent) {
            this.obs.playVideo("ArmsOfAngels", 5);
        }
    }

    playerDunkEvent(playerIndex, triggerEvent) {
        console.log("Player " + playerIndex + " got DUNKED!");
        if (triggerEvent) {
            this.obs.playVideo("SlamJam", 5);
        }
    }

    playerIsPressingButton(button, frameData) {
        // xxxS YXBA xLRZ UDRL
        if (button == "A" || button == "a") {
            return (parseInt("0000000100000000",2) & frameData.pre.buttons) > 0;
        }
        // TODO: logic for other buttons
        return false;
    }

}
module.exports = Slippi