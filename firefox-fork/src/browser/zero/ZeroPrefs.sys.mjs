// ZeroPrefs.sys.mjs - ayar <-> pref koprusu.
// newtab tarafi: settings/schema.ts (zero.settings.v1).
// Pref adlari: zero.mode.active, zero.tabs.position, zero.tabs.width, zero.tabs.hover.
const DEFAULTS = {
  "zero.mode.active": "standard",
  "zero.tabs.position": "left",
  "zero.tabs.width": "narrow",
  "zero.tabs.hover": true,
};

export const ZeroPrefs = {
  get(key) {
    try {
      if (typeof DEFAULTS[key] === "boolean") return Services.prefs.getBoolPref(key, DEFAULTS[key]);
      return Services.prefs.getStringPref(key, DEFAULTS[key]);
    } catch {
      return DEFAULTS[key];
    }
  },
  set(key, value) {
    if (!(key in DEFAULTS)) throw new Components.Exception("bilinmeyen pref: " + key, Cr.NS_ERROR_INVALID_ARG);
    if (typeof DEFAULTS[key] === "boolean") Services.prefs.setBoolPref(key, !!value);
    else {
      const s = String(value);
      if (key === "zero.mode.active" && !["standard", "developer", "cyber", "privacy"].includes(s)) {
        throw new Components.Exception("bilinmeyen mod: " + s, Cr.NS_ERROR_INVALID_ARG);
      }
      if (key === "zero.tabs.position" && !["left", "right"].includes(s)) {
        throw new Components.Exception("bilinmeyen konum: " + s, Cr.NS_ERROR_INVALID_ARG);
      }
      Services.prefs.setStringPref(key, s);
    }
  },
  snapshot() {
    return Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, this.get(k)]));
  },
};
