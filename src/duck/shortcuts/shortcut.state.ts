export interface ShortcutState {
  shortcut?: boolean;
}

export const INITIAL_STATE: ShortcutState = {
  shortcut: false
};

export interface DisplayShortcutState {
  display?: boolean;
}

export const DISPLAY_INITIAL_STATE: DisplayShortcutState = {
  display: false
}
