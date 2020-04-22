declare module 'play-sound' {
  type callback: (err:any) => void;

  export class Player {
    players: any;
    player: any;
    urlRegex: RegExp;

    play(filepath: string, next?:callback): void;
    play(filepath: string, options:any, next?:callback): void;
  }

  const builder: (opts:any) => Player;

  export default builder;
}
