import { Button } from "../../app-common/components/input/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faQuestionCircle, faArrowDown, faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "antd";
import { Modal } from "../../app-common/components/modal/modal";
import React, { useMemo, useState } from "react";
import { Shortcut } from "../../app-common/components/input/shortcut";
import { Switch } from "../../app-common/components/input/switch";
import { useAtom } from "jotai";
import { defaultData, defaultState } from "../../store/jotai";

export const Shortcuts = () => {
  const [defaultOptions, setDefaultOptions] = useAtom(defaultData);
  const {
    displayShortcuts,
    enableShortcuts,
  } = defaultOptions;

  const [modal, setModal] = useState(false);
  const [q, setQ] = useState('');

  const shortcutsList = useMemo(() => {
    return [
      {title: 'Open help', shortcut: ['?']},
      {title: 'Focus search', shortcut: ['/']},
      {title: 'Open search', shortcut: ['ctrl', 'f']},
      {title: 'Move in cart controls', shortcut: [
          'ctrl', '+',
          <FontAwesomeIcon icon={faArrowUp} />, <FontAwesomeIcon icon={faArrowDown} />, <FontAwesomeIcon icon={faArrowLeft} />
          , <FontAwesomeIcon icon={faArrowRight} />
        ]
      },
      {title: 'Focus payment', shortcut: ['ctrl', 'enter']},
      {title: 'Add payment (while in payment field)', shortcut: ['ctrl', 'enter']},
      {title: 'Settle order', shortcut: ['ctrl', 's']},
      {title: 'Clear/Cancel order', shortcut: ['ctrl', 'x']},
      {title: 'Open expenses', shortcut: ['ctrl', 'e']},
      {title: 'Open history', shortcut: ['ctrl', 'h']},
      {title: 'Open taxes', shortcut: ['ctrl', 'shift', 'q']},
      {title: 'Open discount', shortcut: ['ctrl', 'shift', 'd']},
      {title: 'Open customers', shortcut: ['ctrl', 'shift', 'c']},
    ].filter(item => item.title.indexOf(q) !== -1);
  }, [q]);

  return (
    <>
      <Tooltip title="Help">
        <Button variant="secondary" size="lg" iconButton onClick={() => setModal(true)}>
          <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
          <Shortcut shortcut="?" handler={() => setModal(true)} />
        </Button>
      </Tooltip>

      <Modal
        title="Help"
        open={modal}
        onClose={() => {
          setModal(!modal)
        }}
      >
        <div className="flex gap-3 mb-3">
          <Switch
            checked={enableShortcuts}
            onChange={(value) => {
              setDefaultOptions((prev) => ({
                ...prev,
                enableShortcuts: value.target.checked,
              }));
            }}>
            Enable shortcuts?
          </Switch>

          {enableShortcuts && (
            <Switch
              checked={displayShortcuts}
              onChange={(value) => {
                setDefaultOptions((prev) => ({
                  ...prev,
                  displayShortcuts: value.target.checked,
                }));
              }}>
              Display shortcut texts?
            </Switch>
          )}
        </div>

        <input
          type="search"
          className="form-control search-field w-full mb-3"
          autoFocus={true}
          onChange={(event) => setQ(event.target.value)}
        />
        {shortcutsList.map((shortcut, key) => (
          <div className="grid grid-cols-2 hover:bg-gray-100 p-3" key={key}>
            <div>{shortcut.title}</div>
            <div>
              {shortcut.shortcut.map((btn, i) => (
                <span className="shortcut-btn" key={i}>{btn}</span>
              ))}
            </div>
          </div>
        ))}
    </Modal>
    </>
  );
}
