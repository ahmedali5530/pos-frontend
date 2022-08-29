import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../button";
import React, {useEffect, useState} from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {Modal} from "../modal";

const SpeechSearch = () => {
  const {
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    finalTranscript,
    isMicrophoneAvailable
  } = useSpeechRecognition();
  const [modal, setModal] = useState(false);


  useEffect(() => {
    //request microphone permission
    if(!isMicrophoneAvailable) {
      navigator.mediaDevices.getUserMedia({
        audio: true
      });
    }
  }, [isMicrophoneAvailable]);

  const recognition = SpeechRecognition.getRecognition() as any;
  console.log();
  if (window.hasOwnProperty('webkitSpeechGrammarList')) {
    // @ts-ignore
    const speechRecognitionList = new webkitSpeechGrammarList();
    // Use speechRecognitionList
    const grammar = '#JSGF V1.0; grammar colors; public <color> = aqua | azure | beige | bisque | black | blue | brown | chocolate | coral | crimson | cyan | fuchsia | ghostwhite | gold | goldenrod | gray | green | indigo | ivory | khaki | lavender | lime | linen | magenta | maroon | moccasin | navy | olive | orange | orchid | peru | pink | plum | purple | red | salmon | sienna | silver | snow | tan | teal | thistle | tomato | turquoise | violet | white | yellow ;'
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  }

  console.log(SpeechRecognition.getRecognition());

  return (
    <>
      <Button variant="warning" onClick={() => setModal(true)}>
        <FontAwesomeIcon icon={faMicrophone} />
      </Button>

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Speech Search">
        {browserSupportsSpeechRecognition ? (
          <>Your browser supports speech recognition API</>
        ) : (
          <>Your browser do not supports speech recognition API</>
        )}
        <p>Microphone: {listening ? 'on' : 'off'}</p>
        <Button onClick={() => SpeechRecognition.startListening()}>Start</Button>
        <Button onClick={SpeechRecognition.stopListening}>Stop</Button>
        <Button onClick={resetTranscript}>Reset</Button>
        <p>{finalTranscript}</p>
      </Modal>
    </>
  );
};

export default SpeechSearch;
