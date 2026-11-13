import {createApp} from './app.js';
import {getPool} from './db.js';
const port=Number(process.env.PORT)||3001;
createApp(getPool).listen(port,'0.0.0.0',()=>console.log(`Movilidad Urbana: puerto ${port}`));
