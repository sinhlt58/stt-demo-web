import io from "socket.io-client";
import { REACT_APP_STT_SOCKETIO_ENDPOINT } from '../constants/constants';

let socketio: any = null;

export function getSocketIO(){
    if (!socketio){
        socketio = io(REACT_APP_STT_SOCKETIO_ENDPOINT);
    }
    return socketio;
}
