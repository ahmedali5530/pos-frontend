import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  inputRef: HTMLInputElement | null;
}

export const TrapFocus = (props: Props) => {
  const trap = (event: any) => {
    if (document.body.classList.contains("ReactModal__Body--open")) return; // skip in modal

    const inputNodes = ["INPUT", "SELECT", "TEXTAREA"];
    const inputClasses = [
      'rs-__input', 'rs-__input-container', 'rs-__control--is-focused', 'rs-__placeholder', 'rs-__single-value'
    ];

    const oneOfClasses = () => {
      for(const inputCls of inputClasses){
        if(event.target.classList.contains(inputCls)){

          return true;
        }
      }
      return false;
    }

    if(oneOfClasses()){
      return;
    }

    if (
      event.target !== props.inputRef &&
      (oneOfClasses() || inputNodes.includes(event.target.nodeName))
    ) {
      return;
    }

    if (props.inputRef !== null) {
      props.inputRef.select();
    }
  };

  return (
    <div className="trap-container" onClick={trap}>
      {props.children}
    </div>
  );
};
