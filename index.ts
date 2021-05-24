import fs from 'fs';
import nodePath from 'path';
import { Plugin } from 'vite'

const PLUGIN_NAME = 'vite-plugin-watch-lazy-folder';
let defoTriggeFile = 'vite.config.js';


function init(watchList: WatchConfig[], root: string): WatchConfig[] {
  if (watchList.some(w => !w.folder)) {
    console.error('folder is required!');
    return [];
  }
  return watchList.map(w => {
    return {
      folder: nodePath.resolve(root, w.folder),
      triggeFile: w.triggeFile
        ? nodePath.resolve(root, w.folder, w.triggeFile)
        : defoTriggeFile,
    };
  });
}

function touch(path: string) {
  const time = new Date();
  try {
    fs.utimesSync(path, time, time);
  } catch (err) {
    fs.closeSync(fs.openSync(path, 'w'));
  }
}

function isPathEqualOrContains(dir: string, folder: string) {
  let replaced = dir.replace(folder, '');
  let cuted = dir.substr(folder.length);
  return replaced === cuted;
}
export default function watchLazyFolder(watchList: WatchConfig[]): Plugin {
  let _watchList: WatchConfig[] = []
  const recentAddMap = new Map<string, boolean>();

  return {
    name: PLUGIN_NAME,
    configResolved(config) {
      if (fs.existsSync('vite.config.ts')) {
        defoTriggeFile = 'vite.config.ts'
      }
      _watchList = init(watchList, config.root);

    },
    configureServer(server) {
      server.watcher.add(_watchList.map(w => w.folder));

      server.watcher.on('add', function (path) {
        let obj = nodePath.parse(path);
        if (_watchList.some(w => isPathEqualOrContains(obj.dir, w.folder))) {
          recentAddMap.set(path, false);
        }
      });

      server.watcher.on('change', function (path) {
        if (
          recentAddMap.size < 1
          || recentAddMap.get(path)
          || !recentAddMap.has(path)
        ) return;

        let target = _watchList.find(w => isPathEqualOrContains(nodePath.parse(path).dir, w.folder));
        if (!target) return;

        console.log('\x1B[36m%s\x1B[37m%s', `[${PLUGIN_NAME}]`, ' new file detected');
        setTimeout(touch, 300, target.triggeFile);
        recentAddMap.set(path, true);
      });
    },
  };
}
interface WatchConfig {
  /**The folder you wanna watch */
  folder: string;

  /**
   *  The file to trigge HMR;
   *  Would be resolve to  $folder/index.js;
   *  If undefined,after new file change will trigger restart;
   */
  triggeFile?: string;
}
