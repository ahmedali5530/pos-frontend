import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../app-common/components/input/button";
import React, {useEffect} from "react";
import SpeechRecognition , { useSpeechRecognition } from 'react-speech-recognition';

interface Props{
  setQ: (term: string) => void;
  setQuantity: (q: number) => void;
}

const SpeechSearch = ({setQ, setQuantity}: Props) => {
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
    const numbersRegex = /\d+/;

    const quantity = finalTranscript.match(numbersRegex);

    if(quantity !== null){
      setQuantity(Number(quantity));
    }

    const stringsRegex = /[A-Za-z]+/;
    const str = finalTranscript.match(stringsRegex);

    if(str !== null){
      setQ(String(str));
    }
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
