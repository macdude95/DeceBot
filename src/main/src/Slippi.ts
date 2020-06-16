// SPECs - https://github.com/project-slippi/slippi-wiki/blob/master/SPEC.md

// const { default: SlippiGame } = require('slp-parser-js');
import SlippiGame, { GameEndType, FrameEntryType, PreFrameUpdateType, PostFrameUpdateType, GameStartType } from 'slp-parser-js';
import chokidar from 'chokidar';
import _ from 'lodash';
import OBSController from './OBSController';

interface GameState {
    settings: any;
    detectedPunishes: any
}

interface GameData {
    game: SlippiGame,
    state: GameState
}

interface GameDataByPath {
    [path: string]: GameData
}

interface PlayerFrameEntryType {
    pre: PreFrameUpdateType;
    post: PostFrameUpdateType;
}

export default class Slippi {
    obs: OBSController | null;
    gameIsPlaying: boolean;
    playerLastHitBy: (number|null)[];
    playerPreviousActionState: (number|null)[];
    watcher: chokidar.FSWatcher;

    constructor(listenPath: string | readonly string[], obs:OBSController|null=null) {
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
        const gameByPath: GameDataByPath = {}
        this.watcher.on('change', (path) => {
            const start = Date.now();
            let gameState, settings, stats, frames, latestFrame: FrameEntryType | null, gameEnd: GameEndType | null;
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
                const frameData = _.get(latestFrame, ['players', player.playerIndex]) as PlayerFrameEntryType;
                const otherPlayerFrameData = _.get(latestFrame, ['players', (player.playerIndex + 1) % 2]) as PlayerFrameEntryType;
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

                const endMessage = _.get(endTypes, gameEnd.gameEndMethod || '') || "Unknown";

                const lrasText = gameEnd.gameEndMethod === 7 ? ` | Quitter Index: ${gameEnd.lrasInitiatorIndex}` : "";
                console.log(`[Game Complete] Type: ${endMessage}${lrasText}`);

                this.setGameIsPlaying(false, gameEnd.gameEndMethod === 7);
                this.setWinner(gameEnd, latestFrame);
            }

            // console.log(`Read took: ${Date.now() - start} ms`);
        });
    }

    setSettings(settings: GameStartType) {
        for (const player of settings.players) {
            const port = player.port;
            const tag = (player.nametag as string).length == 0 ? `P${port}` : player.nametag;
            const sourceName = `NameTag${port}`;
            this.obs && this.obs.setText(sourceName, tag, 16777215);
        }
    }

    setWinner(gameEnd: GameEndType, latestFrame: FrameEntryType|null) {
        if (gameEnd.lrasInitiatorIndex == -1) {
            // console.log(latestFrame);
            // // frameData.post.stocksRemaining
            // for (const frame of latestFrame.players) {
            //     const frameData = player.pre
            // }
            // const found = array.find(function(element) {
            //   return element > 4;
            // });
            const winnerPlayerIndex = (latestFrame as any).players.findIndex(function(frameData: PlayerFrameEntryType) {
               return (frameData.post.stocksRemaining as number) > 0;
            })
            const sourceName =`NameTag${winnerPlayerIndex + 1}`;
            this.obs && this.obs.setText(sourceName, null, 65535);
        }
    }

    checkForDunk(frameData: any, playerIndex: string | number, otherPlayerFrameData: any) {
        const playerDied = this.didPlayerJustDie(frameData, playerIndex, "bottom");
        if(playerDied) {
            console.log(`Player ${playerIndex}'s action state when they died: ` + this.playerPreviousActionState[playerIndex as number]);
        }
        if (playerDied && this.playerPreviousActionState[playerIndex as number] == 88) {
            this.playerDunkEvent(playerIndex.toString(), this.playerIsPressingButton("A", otherPlayerFrameData));
        }
    }

    checkForSD(frameData: PlayerFrameEntryType, playerIndex: string | number) {
        const playerDied = this.didPlayerJustDie(frameData, playerIndex, "bottom");
        if (playerDied && this.playerLastHitBy[playerIndex as number] == 6) {
            this.playerSDEvent(playerIndex.toString(), this.playerIsPressingButton("A", frameData));
        }
    }

    didPlayerJustDie(frameData: PlayerFrameEntryType, playerIndex: string | number, side: string) {
        // TODO: logic for other sides
        if (side == "bottom") {
            return frameData.post.actionStateId == 0 && this.playerPreviousActionState[playerIndex as number] != 0;
        }
        return false;
    }

    setGameIsPlaying(newValue: boolean, noContest=false) {
        if (this.gameIsPlaying == newValue) {
            return;
        }
        this.gameIsPlaying = newValue;

        const delaySeconds = (newValue || noContest) ? 0 : 2;
        setTimeout(() => {
            const sceneName = newValue ? "Melee" : "Just Me Scene";
            this.obs && this.obs.setCurrentScene(sceneName);
        }, delaySeconds*1000);

    }

    playerSDEvent(playerIndex: string, triggerEvent: boolean) {
        console.log("Player " + playerIndex + " SDed");
        if (triggerEvent) {
            this.obs && this.obs.playVideo("ArmsOfAngels", 5);
        }
    }

    playerDunkEvent(playerIndex: string, triggerEvent: boolean) {
        console.log("Player " + playerIndex + " got DUNKED!");
        if (triggerEvent) {
            this.obs && this.obs.playVideo("SlamJam", 5);
        }
    }

    playerIsPressingButton(button: string, frameData: PlayerFrameEntryType) {
        // xxxS YXBA xLRZ UDRL
        if (button == "A" || button == "a") {
            return (0b100000000 & (frameData.pre.buttons as number)) > 0;
        }
        // TODO: logic for other buttons
        return false;
    }

}
