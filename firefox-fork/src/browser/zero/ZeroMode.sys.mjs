// ZERO platform servisi — aktif calisma modu yonetimi.
// Konum (fork icinde): browser/zero/ZeroMode.sys.mjs
// Kullanim: ChromeUtils.importESModule("resource://app/modules/zero/ZeroMode.sys.mjs")

const PREF_ACTIVE_MODE = "zero.mode.active";
const MODES = ["standard", "developer", "cyber", "privacy"];

export class ZeroMode {
  constructor() {
    this._prefs = Services.prefs;
  }

  /** Aktif mod id'si; bozuk degerde standard'a duser. */
  get active() {
    try {
      const v = this._prefs.getStringPref(PREF_ACTIVE_MODE, "standard");
      return MODES.includes(v) ? v : "standard";
    } catch {
      return "standard";
    }
  }

  set active(id) {
    if (!MODES.includes(id)) {
      throw new Components.Exception(`bilinmeyen mod: ${id}`, Cr.NS_ERROR_INVALID_ARG);
    }
    this._prefs.setStringPref(PREF_ACTIVE_MODE, id);
    Services.obs.notifyObservers(null, "zero-mode-changed", id);
  }

  static get validModes() {
    return [...MODES];
  }
}

export const ZeroModeService = new ZeroMode();
