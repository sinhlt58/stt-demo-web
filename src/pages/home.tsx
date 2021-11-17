import { Box } from "@material-ui/core";
import MicIcon from '@material-ui/icons/Mic';
import StopIcon from '@material-ui/icons/Stop';
import { Fragment, useEffect, useState } from "react";
import RecordRTC, {StereoAudioRecorder} from 'recordrtc'
import { getSocketIO } from "../services/socketio";
import { useStyles } from "./home.style";

const ROOM_NAME = "demo_stt"
enum JoinRoomStatus {
    IDLE = "idle",
    CHOSE_NAME = "choose_name",
    JOIND_ROOM = "joind_room",
}
const DEMO_MODE_TAKE_NOTE = "Taking note"
const DEMO_MODE_LONG_CHAT = "Long chat"

const HomePage = () => {
    const [isMicOn, setIsMicOn] = useState(false);
    const [recorder, setRecorder] = useState<any>(undefined);
    const [localAudioStream, setLocalAudioStream] = useState<any>(undefined);
    const [blobURL, setBlobURL] = useState<any>(undefined);
    const [sttNote, setSttNote] = useState<string>("");
    const [joinRoomStatus, setJoinRoomStatus] = useState<string>("idle");
    const [userName, setUserName] = useState<string>("");
    const [roomMessages, setRoomMessages] = useState<string[]>([]);
    const [previousUser, setPreviousUser] = useState<string>("");

    const classes = useStyles();

    const socketio: any = getSocketIO();

    useEffect(() => {
        const onSocketIOSTTTakeNote = (message: any) => {
            const {stt_text, is_stop} = message;
            setSttNote(`${sttNote}, ${stt_text}`)
            if (is_stop){
                setIsMicOn(false);
            }
        }
        socketio.on("api_stt_take_note", onSocketIOSTTTakeNote);

        const onSocketIOSTTRoom = (data: any) => {
            const {username, message} = data;
            if (username !== previousUser){
                setRoomMessages([...roomMessages, `${username}: ${message}`]);
                setPreviousUser(username);
            } else {
                setRoomMessages([...roomMessages, message]);
            }
            
        }
        socketio.on("stt_room", onSocketIOSTTRoom);

        return () => {
            socketio.off("stt_room", onSocketIOSTTRoom);
            socketio.off("api_stt_take_note", onSocketIOSTTTakeNote);
        }
    }, [socketio, sttNote, previousUser, roomMessages]);

    useEffect(() => {
        if (!isMicOn){
            cleanUpMic();
        }
    }, [isMicOn]);

    const handleStarMic = (event: any) => {
        setSttNote("");
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
                    if (socketio){
                        if (joinRoomStatus === JoinRoomStatus.JOIND_ROOM){
                            socketio.emit("api_stt_long_chat", blob);
                        } else {
                            socketio.emit("api_stt_take_note", blob);
                        }
                    }
                },
                desiredSampRate: 16000,
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
        console.log("clean mic")
        if (recorder){
            recorder.stopRecording(() => {
                console.log("stoped")
                let blob = recorder.getBlob();
                let reader = new FileReader();
                if (socketio){
                    // socketio.emit("stt", blob);
                    console.log("sent!")
                }
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    let base64String: any = reader.result;
                    if (base64String){
                        base64String = base64String.split(",")[1];
                        // socketio.emit("stt", base64String)
                        // try {
                        //     let res = await voiceAssistantService.stt(base64String);
                        //     console.log(res.data);
                        //     // setSttText(res.data.text);
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
            setLocalAudioStream(undefined);
        }
    }

    const handleNameChanged = (e: any) => {
        setUserName(e.target.value as string);
    }

    const joinRoom = () => {
        socketio.emit("join", {
            username: userName,
            room: ROOM_NAME,
        });
        setJoinRoomStatus(JoinRoomStatus.JOIND_ROOM);
    }

    const leaveRoom = () => {
        console.log("leave")
        socketio.emit("leave", {
            username: userName,
            room: ROOM_NAME,
        });
        setJoinRoomStatus(JoinRoomStatus.IDLE);
        setRoomMessages([]);
        setIsMicOn(false);
    }

    return (
        <Fragment>
            {
                joinRoomStatus !== JoinRoomStatus.JOIND_ROOM &&
                <>
                    <h2>Demo usecase: {DEMO_MODE_TAKE_NOTE}</h2>
                </>
            }
            {
                joinRoomStatus === JoinRoomStatus.JOIND_ROOM &&
                <>
                    <h2>Demo usecase: {DEMO_MODE_LONG_CHAT}</h2>
                    <span>Room: {ROOM_NAME}</span>
                </>
            }
            <Box width="100%"
                 height="100vh"
                 display="flex"
                 flexDirection="column"
                 className={classes.root}>
                <Box width="100%" height="2%"></Box>
                <Box width="100%" height="20%"
                     display="flex"
                     flexDirection="column"
                     justifyContent="center"
                     alignItems="center"
                     className={classes.micContainer}
                >
                    {!isMicOn && <MicIcon className={classes.mic} onClick={handleStarMic}></MicIcon>}
                    {isMicOn && <StopIcon className={classes.mic} onClick={handleStopMic}></StopIcon>}
                </Box>
                {
                    joinRoomStatus !== JoinRoomStatus.JOIND_ROOM &&
                    <h2>STT note text: {sttNote}</h2>
                }
                <Box width="100%" height="2rem">
                    {
                        (joinRoomStatus === JoinRoomStatus.IDLE && !isMicOn) &&
                        <button style={{width: "8rem", height: "2rem"}}
                            onClick={() => setJoinRoomStatus(JoinRoomStatus.CHOSE_NAME)}
                        >
                            JOIN ROOM NOW
                        </button>
                    }
                    {
                        joinRoomStatus === JoinRoomStatus.CHOSE_NAME &&
                        <div>
                            <input
                                placeholder="Enter your name"
                                onChange={handleNameChanged}
                                value={userName}
                            />
                            <button
                                style={{marginLeft: "1rem"}}
                                onClick={joinRoom}
                            >
                                Let's go
                            </button>
                        </div>
                    }
                    {
                        joinRoomStatus === JoinRoomStatus.JOIND_ROOM &&
                        <div>
                            <button style={{marginLeft: "1rem"}}
                                onClick={leaveRoom}
                            >
                                Leave room
                            </button>
                        </div>
                    }
                </Box>
                {
                    joinRoomStatus === JoinRoomStatus.JOIND_ROOM &&
                    roomMessages.map((m, index) => {
                        return (
                            <div key={index}>
                                <span key={index}>
                                    {m}
                                </span>
                            </div>
                        )
                    })
                }
            </Box>
        </Fragment>
    )
}

export default HomePage;
