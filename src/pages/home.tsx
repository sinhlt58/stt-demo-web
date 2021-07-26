import { Box } from "@material-ui/core";
import MicIcon from '@material-ui/icons/Mic';
import StopIcon from '@material-ui/icons/Stop';
import { Fragment, useState } from "react";
import RecordRTC, {StereoAudioRecorder} from 'recordrtc'
import { voiceAssistantService } from "../services/voice.assistant.service";

import { useStyles } from "./home.style";


const HomePage = () => {
    let [isMicOn, setIsMicOn] = useState(false);
    let [recorder, setRecorder] = useState<any>(undefined);
    let [localAudioStream, setLocalAudioStream] = useState<any>(undefined);
    let [blobURL, setBlobURL] = useState<any>(undefined);
    let [sttText, setSttText] = useState<string>("");

    const classes = useStyles();

    const handleStarMic = (event: any) => {
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

                timeSlice: 500,
                ondataavailable: async (blob: Blob) => {
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
    }

    const cleanUpMic = () => {
        if (recorder){
            console.log("WTF")
            recorder.stopRecording(() => {
                console.log("stoped")
                let blob = recorder.getBlob();
                let reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    let base64String: any = reader.result;
                    if (base64String){
                        base64String = base64String.split(",")[1];
                        try {
                            let res = await voiceAssistantService.stt(base64String);
                            console.log(res.data);
                            setSttText(res.data.text);
                        } catch (e){
                            console.log("ERROR: " + e)
                        }
                    }
                }
                let url = URL.createObjectURL(blob);
                console.log(url);
                setBlobURL(url);
            })
        }
        if (localAudioStream){
            // turn off the mic stream
            localAudioStream.getAudioTracks().forEach(function(track: any){track.stop();});
            localAudioStream = undefined;
        }
    }

    return (
        <Fragment>
            <p>STT text: {sttText}</p>
            <Box width="100%"
                 height="100vh"
                 display="flex"
                 flexDirection="column"
                 className={classes.root}>
                <Box width="100%" height="80%"></Box>
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