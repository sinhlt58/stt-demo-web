import { REACT_APP_SPEECH_TO_TEXT_ENDPOINT, WS_STATE } from '../constants/constants';;

let socket: WebSocket;

const onSocketOpened = (event: any) => {
    console.log("Socket connected");
}

const onInitSocketError = (event: any) => {
    console.log("Error init Websocket!");
    console.log(event);
}

export const getSocket = (): WebSocket => {
    if (!socket || socket.readyState === WS_STATE.CLOSING || socket.readyState === WS_STATE.CLOSED) {
        console.log(REACT_APP_SPEECH_TO_TEXT_ENDPOINT)
        socket = new WebSocket(REACT_APP_SPEECH_TO_TEXT_ENDPOINT, []);
        socket.onopen = onSocketOpened;
        socket.onerror = onInitSocketError;
    }
    return socket;
};
