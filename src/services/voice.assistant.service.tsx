import { REACT_APP_VOICE_ASSISTANT_API_URL } from '../constants/constants'
import axios from 'axios'

class VoiceAssistantService {
    async stt(base64Audio: any){
        return axios.post(`${REACT_APP_VOICE_ASSISTANT_API_URL}/api/v1/stt`, {base64_audio: base64Audio})
    }
}

export const voiceAssistantService = new VoiceAssistantService()
