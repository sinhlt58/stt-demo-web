import { Box } from "@material-ui/core";
import MicIcon from '@material-ui/icons/Mic';
import StopIcon from '@material-ui/icons/Stop';
import { Fragment, useEffect, useState } from "react";
import RecordRTC, {StereoAudioRecorder} from 'recordrtc'
import { END_OF_FILE, WS_STATE } from "../constants/constants";
import { voiceAssistantService } from "../services/voice.assistant.service";
import { getSocket } from "../services/websocket";
import { getSocketIO } from "../services/socketio";

import { useStyles } from "./home.style";


let ackCount = 0;

const HomePage = () => {
    let [isMicOn, setIsMicOn] = useState(false);
    let [recorder, setRecorder] = useState<any>(undefined);
    let [localAudioStream, setLocalAudioStream] = useState<any>(undefined);
    let [blobURL, setBlobURL] = useState<any>(undefined);
    let [sttText, setSttText] = useState<string>("");

    const classes = useStyles();

    // const socket = getSocket();
    const socketio: any = getSocketIO();

    const handleOnMessageSocket = (event: any) => {
        if (event.data) {
            const result = JSON.parse(event.data);
            switch (result.type) {
                case 'TEXT':
                    const text = result.result;
                    setSttText(text);
                    break;
                case 'CLOSE_SEND':
                    // cleanUpMic();
                    setIsMicOn(false);
                    console.log('CLOSE_SEND');
                    break;
                case 'ACK':
                    ackCount += 1;
                    if (ackCount > 3000) {
                        ackCount = 0;
                        setIsMicOn(false);
                        getSocket().send(new Blob([END_OF_FILE]));
                    }
                    break;
                default:
                    break;
            }
        }
    }

    const handleOnEventSocketIO = (message: any) => {
        setSttText(message);
    }

    useEffect(() => {
        // socket.onmessage = handleOnMessageSocket;
        socketio.on("stt", handleOnEventSocketIO);
    }, [])

    useEffect(() => {
        if (!isMicOn){
            cleanUpMic();
        }
    }, [isMicOn])

    const handleStarMic = (event: any) => {
        setSttText("");
        navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        }).then(async (stream) => {
            setLocalAudioStream(stream);
            let recorder = new RecordRTC(stream, {
                type: "audio",
                mimeType: "audio/wav",
                recorderType: StereoAudioRecorder,
                disableLogs: true,
                timeSlice: 100,
                ondataavailable: async (blob: Blob) => {
                    // if (socket.readyState === WS_STATE.OPEN) {
                    //     socket.send(blob);
                    // }
                    if (socketio){
                        socketio.emit("stt", blob);
                    }
                },
                desiredSampRate: 16000,
                bitrate: 128000,
                bitsPerSecond: 128000,
                numberOfAudioChannels: 1,
            });
            recorder.startRecording();
            setRecorder(recorder);
        });
        setIsMicOn(true);
    }

    const handleStopMic = (event: any) => {
        cleanUpMic();
        setIsMicOn(false);
        // socket.send(new Blob([END_OF_FILE]));
    }

    const cleanUpMic = () => {
        console.log("clean mic")
        if (recorder){
            recorder.stopRecording(() => {
                console.log("stoped")
                let blob = recorder.getBlob();
                let reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    let base64String: any = reader.result;
                    if (base64String){
                        base64String = base64String.split(",")[1];
                        // try {
                        //     let res = await voiceAssistantService.stt(base64String);
                        //     console.log(res.data);
                        //     setSttText(res.data.text);
                        // } catch (e){
                        //     console.log("ERROR: " + e)
                        // }
                    }
                }
                let url = URL.createObjectURL(blob);
                console.log(url);
                setBlobURL(url);
            })
        }
        if (localAudioStream){
            console.log("remove local audio stream")
            // turn off the mic stream
            localAudioStream.getAudioTracks().forEach(function(track: any){track.stop();});
            localAudioStream = undefined;
        }
    }

    return (
        <Fragment>
            <h2>STT text: {sttText}</h2>
            <Box width="100%"
                 height="100vh"
                 display="flex"
                 flexDirection="column"
                 className={classes.root}>
                <Box width="100%" height="2%"></Box>
                <Box width="100%" height="20%"
                     display="flex"
                     justifyContent="center"
                     alignItems="center"
                     className={classes.micContainer}
                >
                    {!isMicOn && <MicIcon className={classes.mic} onClick={handleStarMic}></MicIcon>}
                    {isMicOn && <StopIcon className={classes.mic} onClick={handleStopMic}></StopIcon>}
                </Box>
            </Box>
        </Fragment>
    )
}

export default HomePage;