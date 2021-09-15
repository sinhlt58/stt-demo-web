export const { REACT_APP_VOICE_ASSISTANT_API_URL = '' } = process.env;
export const { REACT_APP_SPEECH_TO_TEXT_ENDPOINT = '' } = process.env
export const { REACT_APP_STT_SOCKETIO_ENDPOINT = '' } = process.env


export enum WS_STATE {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3,
}

export const END_OF_FILE = 'EOF';
