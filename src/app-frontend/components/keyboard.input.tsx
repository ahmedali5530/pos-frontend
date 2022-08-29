import {Keyboard, KeyboardProps} from "./keyboard";
import {FC} from "react";
import {Input} from "./input";

interface KeyboardInputProps extends KeyboardProps{
  inputSize?: "lg"
  selectable?: boolean;
  innerRef?: any;
  focus?: boolean;
}

export const KeyboardInput: FC<KeyboardInputProps> = (props) => {

  //disable keyboard input for now
  return <Input {...props} />;

  if(props.hideKeyboard){
    return <Input {...props} />
  }else {
    return <Keyboard {...props} />
  }
};
