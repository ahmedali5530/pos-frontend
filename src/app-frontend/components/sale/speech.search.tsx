import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../button";
import React, {useEffect} from "react";
import SpeechRecognition , { useSpeechRecognition } from 'react-speech-recognition';

interface Props{
  setQ: (term: string) => void;
}

const SpeechSearch = ({setQ}: Props) => {
  const {
    listening,
    browserSupportsSpeechRecognition,
    finalTranscript,
    isMicrophoneAvailable
  } = useSpeechRecognition();


  useEffect(() => {
    //request microphone permission
    if(browserSupportsSpeechRecognition && !isMicrophoneAvailable) {
      navigator.mediaDevices.getUserMedia({
        audio: true
      });
    }
  }, [isMicrophoneAvailable, browserSupportsSpeechRecognition]);

  useEffect(() => {
    setQ(finalTranscript);
  }, [finalTranscript]);

  if(!browserSupportsSpeechRecognition){
    return (<></>);
  }

  const toggleListening = async () => {
    if(listening){
      SpeechRecognition.stopListening();
    }else{
      await SpeechRecognition.startListening({
        language: 'en-US'
      });
    }
  };

  return (
    <>
      <Button variant={
        listening ? 'success' : 'warning'
      } onClick={toggleListening}>
        <FontAwesomeIcon icon={faMicrophone} />
      </Button>
    </>
  );
};

export default SpeechSearch;
