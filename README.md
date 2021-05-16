## A plugin for vite-app to watch lazy folder and trigge update

## Use Case
When you have some code like this for auto import all modules in folder;
```js
//src/views/lazy/index.js
const modules = import.meta.glob('./*.jsx')
```
or 
```js
//src/store/index.js
const modules = import.meta.globEager('./*.js');
```
You may notice, in the lazy folder, add new file while you developing. Vite update will not trigge,becuase the new file isn't in the watch list;


## Install
```bash
yarn add vite-plugin-watch-lazy-folder -D
```
or 
```bash
npm i vite-plugin-watch-lazy-folder -D
```
## Usage
```js
import { defineConfig } from 'vite';
import watchLazyFolder from 'vite-plugin-watch-lazy-folder';

export default defineConfig({
  plugins: [
    watchLazyFolder([
      {
        folder: './src/views/lazy',
        triggeFile: 'index.js',
      },
    ]),
  ],
```

The parameter is WatchConfig[]
```ts
interface WatchConfig {
  /**The folder you wanna watch */
  folder: string;

  /**
   *  The file to trigge HMR;
   *  Would be resolve to  $folder/index.js;
   *  If undefined, will trigger restart;
   */
  triggeFile?: string;
}
```