"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import WebFxScan from "@/lib/scan";
import styles from "./page.module.css";

const DEFAULT_CONNECTION = {
  ip: "127.0.0.1",
  port: "17778",
};

const DEFAULT_SCANNER_FORM = {
  deviceName: "",
  source: "",
  resolution: "150",
  resizeDpi: "150",
  mode: "color",
  paperSize: "Auto",
  imageFmt: "jpg",
  photo: "true",
  brightness: "0",
  contrast: "0",
  gamma: "1",
  colorDropout: "None",
  rotate: "0",
  swcrop: "true",
  swdeskew: "true",
  autoRotate: "false",
  duplexMergeType: "2",
  autoScan: "false",
  density: "false",
  borderFill: "false",
  removePunchHole: "false",
  removeBackground: "false",
  denoise: "false",
  charEnhance: "false",
  base64enc: "true",
};

const IMAGE_FORMAT_OPTIONS = [
  "bmp",
  "jpg",
  "png",
  "tif",
  "pdf",
  "spdf",
  "txt",
  "rtf",
  "xls",
  "pnm",
  "ofd",
  "sofd",
];

const PAPER_ORIENTATION_OPTIONS = ["portrait", "landscape"];
const DEFAULT_LOCAL_MERGE = {
  enabled: true,
  orientation: "vertical",
};

const CORE_SCANNER_FIELDS = [
  "deviceName",
  "source",
  "resolution",
  "mode",
  "paperSize",
  "swcrop",
  "autoRotate",
  "removeBlankPage",
  "removeBlackEdges",
];

const FIELD_GROUPS = [
  {
    title: "Device & Source",
    fields: [
      "deviceName",
      "source",
      "paperSize",
      "paperOrientation",
      "resolution",
      "resizeDpi",
      "mode",
      "imageFmt",
    ],
  },
  {
    title: "Image Cleanup",
    fields: [
      "swcrop",
      "swdeskew",
      "swcropBgMin",
      "swcropBgMax",
      "crop",
      "multicrop",
      "uiRectNum",
      "multiCropRect",
      "innerCutted",
      "removeBlankPage",
      "removeBlankpageSensitivity",
      "removeBlackEdges",
      "removeBackground",
      "removeBackgroundFillcolor",
      "removeBackgroundWeight",
      "removeBackgroundRadius",
      "removePunchHole",
      "borderFill",
      "fillEdgeColor",
      "hasBlackImage",
    ],
  },
  {
    title: "Image Enhancement",
    fields: [
      "brightness",
      "contrast",
      "quality",
      "bgSensitivity",
      "gamma",
      "saturationShift",
      "colorDropout",
      "autoEnhance",
      "autoRotate",
      "rotate",
      "sharpen",
      "denoise",
      "density",
      "charEnhance",
      "redTypeEnhance",
      "applyColorProfile",
      "colorProfileGamma",
    ],
  },
  {
    title: "Feed & Transport",
    fields: [
      "duplexBackFlip",
      "duplexMergeType",
      "paperDetectFreq",
      "scanCount",
      "autoScan",
      "apAutoScan",
      "softwareSensor",
      "frontEject",
      "manualEject",
      "backwardEject",
      "multifeedDetect",
      "multiFeed",
      "scanSpeed",
      "fejectSpeed",
      "bejectSpeed",
      "bottomUp",
      "thumbNail",
    ],
  },
  {
    title: "Recognition & OCR",
    fields: [
      "recognizeType",
      "recognizeLang",
      "fullTextType",
      "omrParm",
      "gridArea",
      "gridSensitivity",
      "barcodeAreas",
      "barcodeType",
    ],
  },
  {
    title: "Output & Metadata",
    fields: [
      "savePath",
      "filenameFormat",
      "filenameBeginindex",
      "imageCustomInfo",
      "imgSoftware",
      "imgArtist",
      "photo",
      "watermark",
      "jpegXfer",
      "orig",
      "rawData",
      "base64enc",
      "log",
      "ciphersnBase64key",
      "ciphersnCompanykey",
      "convertImgMode",
      "sensorAlign",
      "extCapturetype",
      "uvSecurity",
      "td2",
    ],
  },
];

const FIELD_CONFIG = {
  deviceName: { type: "string", sdkKey: "device-name" },
  source: { type: "string", sdkKey: "source" },
  paperSize: { type: "string", sdkKey: "paper-size" },
  paperOrientation: { type: "string", sdkKey: "paper-orientation" },
  resolution: { type: "number", sdkKey: "resolution" },
  resizeDpi: { type: "number", sdkKey: "resizedpi" },
  mode: { type: "string", sdkKey: "mode" },
  imageFmt: { type: "string", sdkKey: "imagefmt" },
  swcrop: { type: "boolean", sdkKey: "swcrop" },
  swdeskew: { type: "boolean", sdkKey: "swdeskew" },
  swcropBgMin: { type: "number", sdkKey: "swcropbgmin" },
  swcropBgMax: { type: "number", sdkKey: "swcropbgmax" },
  crop: { type: "string", sdkKey: "crop", multiline: true },
  multicrop: { type: "number", sdkKey: "multicrop" },
  uiRectNum: { type: "number", sdkKey: "uirectnum" },
  multiCropRect: { type: "string", sdkKey: "multicroprect", multiline: true },
  innerCutted: { type: "string", sdkKey: "innercutted", multiline: true },
  removeBlankPage: { type: "boolean", sdkKey: "remove-blankpage" },
  removeBlankpageSensitivity: {
    type: "number",
    sdkKey: "remove-blankpage-sensitivity",
  },
  removeBlackEdges: { type: "boolean", sdkKey: "remove-blackedges" },
  removeBackground: { type: "boolean", sdkKey: "remove-background" },
  removeBackgroundFillcolor: {
    type: "number",
    sdkKey: "remove-background-fillcolor",
  },
  removeBackgroundWeight: {
    type: "number",
    sdkKey: "remove-background-weight",
  },
  removeBackgroundRadius: {
    type: "number",
    sdkKey: "remove-background-radius",
  },
  removePunchHole: { type: "boolean", sdkKey: "remove-punchhole" },
  borderFill: { type: "boolean", sdkKey: "borderfill" },
  fillEdgeColor: { type: "string", sdkKey: "filledgecolor" },
  hasBlackImage: { type: "boolean", sdkKey: "hasblackimage" },
  brightness: { type: "number", sdkKey: "brightness" },
  contrast: { type: "number", sdkKey: "contrast" },
  quality: { type: "number", sdkKey: "quality" },
  bgSensitivity: { type: "number", sdkKey: "bgsensitivity" },
  gamma: { type: "number", sdkKey: "gamma" },
  saturationShift: { type: "number", sdkKey: "saturationshift" },
  colorDropout: { type: "string", sdkKey: "colordropout" },
  autoEnhance: { type: "boolean", sdkKey: "autoenhance" },
  autoRotate: { type: "boolean", sdkKey: "autorotate" },
  rotate: { type: "number", sdkKey: "rotate" },
  sharpen: { type: "boolean", sdkKey: "sharpen" },
  denoise: { type: "boolean", sdkKey: "denoise" },
  density: { type: "boolean", sdkKey: "density" },
  charEnhance: { type: "boolean", sdkKey: "charenhance" },
  redTypeEnhance: { type: "boolean", sdkKey: "redtypeenhance" },
  applyColorProfile: { type: "string", sdkKey: "applycolorprofile" },
  colorProfileGamma: { type: "number", sdkKey: "colorprofilegamma" },
  duplexBackFlip: { type: "boolean", sdkKey: "duplexbackflip" },
  duplexMergeType: { type: "number", sdkKey: "duplexmergetype" },
  paperDetectFreq: { type: "number", sdkKey: "paperdetectfreq" },
  scanCount: { type: "number", sdkKey: "scancount" },
  autoScan: { type: "boolean", sdkKey: "autoscan" },
  apAutoScan: { type: "boolean", sdkKey: "apautoscan" },
  softwareSensor: { type: "boolean", sdkKey: "softwaresensor" },
  frontEject: { type: "boolean", sdkKey: "frontEject" },
  manualEject: { type: "boolean", sdkKey: "manualEject" },
  backwardEject: { type: "boolean", sdkKey: "backward-eject" },
  multifeedDetect: { type: "boolean", sdkKey: "multifeedDetect" },
  multiFeed: { type: "boolean", sdkKey: "multifeed" },
  scanSpeed: { type: "string", sdkKey: "scan-speed" },
  fejectSpeed: { type: "string", sdkKey: "feject-speed" },
  bejectSpeed: { type: "string", sdkKey: "beject-speed" },
  bottomUp: { type: "boolean", sdkKey: "bottomup" },
  thumbNail: { type: "boolean", sdkKey: "thumbnail" },
  recognizeType: { type: "string", sdkKey: "recognize-type" },
  recognizeLang: { type: "string", sdkKey: "recognize-lang" },
  fullTextType: { type: "string", sdkKey: "fulltext-type" },
  omrParm: { type: "string", sdkKey: "omr-parm", multiline: true },
  gridArea: { type: "string", sdkKey: "gridarea", multiline: true },
  gridSensitivity: { type: "number", sdkKey: "grid-sensitivity" },
  barcodeAreas: { type: "string", sdkKey: "barcodeareas", multiline: true },
  barcodeType: { type: "boolean", sdkKey: "barcode-type" },
  savePath: { type: "string", sdkKey: "savepath" },
  filenameFormat: { type: "string", sdkKey: "filename-format" },
  filenameBeginindex: { type: "number", sdkKey: "filename-beginindex" },
  imageCustomInfo: { type: "boolean", sdkKey: "imagecustominfo" },
  imgSoftware: { type: "string", sdkKey: "imgsoftware" },
  imgArtist: { type: "string", sdkKey: "imgartist" },
  photo: { type: "boolean", sdkKey: "photo" },
  watermark: { type: "string", sdkKey: "watermark" },
  jpegXfer: { type: "boolean", sdkKey: "jpegxfer" },
  orig: { type: "boolean", sdkKey: "orig" },
  rawData: { type: "boolean", sdkKey: "rawdata" },
  base64enc: {
    type: "boolean",
    sdkKey: "base64enc",
    readOnly: true,
  },
  log: { type: "boolean", sdkKey: "log" },
  ciphersnBase64key: { type: "string", sdkKey: "ciphersn-base64key" },
  ciphersnCompanykey: { type: "string", sdkKey: "ciphersn-companykey" },
  convertImgMode: { type: "string", sdkKey: "convertimgmode" },
  sensorAlign: { type: "string", sdkKey: "sensor-align" },
  extCapturetype: { type: "string", sdkKey: "ext-capturetype" },
  uvSecurity: { type: "boolean", sdkKey: "uvsecurity" },
  td2: { type: "boolean", sdkKey: "td2" },
};

const FIELD_HELP_OVERRIDES = {
  deviceName:
    "Scanner model name returned by the local WebFXScan service. This decides which device receives your saved properties.",
  source:
    "Paper source used for capture, such as front ADF, duplex ADF, flatbed, or sheetfed. Duplex-capable sources allow front and back capture in one pass.",
  paperSize:
    "Paper profile used by the SDK when it calculates page dimensions and cropping. Some devices also expose an Auto source or paper mode.",
  resolution:
    "Capture resolution in DPI. Higher values improve detail but increase scan time, memory use, and output file size.",
  brightness:
    "Brightness shifts the image lighter or darker before output. Negative values darken the page, positive values brighten it.",
  contrast:
    "Contrast increases or decreases separation between light and dark areas. Higher contrast makes text edges stronger but can lose subtle detail.",
  quality:
    "Compression or output quality setting used by the SDK. Higher values usually preserve more detail at a larger file size.",
  swcrop:
    "Software crop trims the scanned image based on detected content boundaries after acquisition.",
  swdeskew:
    "Software deskew rotates a tilted page so the content is more square to the output frame.",
  autoRotate:
    "Automatic rotation lets the SDK detect page orientation and rotate the result to a readable direction.",
  duplexMergeType:
    "Controls how front and back pages are combined during duplex workflows. The current app originally used 2 to keep pages separate.",
  removeBlankPage:
    "Blank-page removal analyzes captured pages and drops those considered empty. The sensitivity field adjusts how aggressive the detection is.",
  removeBlackEdges:
    "Edge cleanup attempts to remove dark frame artifacts created by scanning near paper borders or rollers.",
  recognizeType:
    "OCR or recognition mode. The SDK exposes a small built-in list in scan.js, and some values trigger text extraction or barcode processing.",
  recognizeLang:
    "Language pack used by OCR processing. Better language selection usually improves recognition quality.",
  fullTextType:
    "Output format for full-text OCR results when OCR is enabled.",
  savePath:
    "Target save location used by the SDK when it writes files on the WebFXScan side.",
  imageFmt:
    "Requested output file format for the scan result or merged export.",
  base64enc:
    "Base64 return flag. The local wrapper forces this on internally so previews can be shown in the browser.",
};

const FIELD_EFFECT_OVERRIDES = {
  brightness:
    "Changing brightness shifts page luminance before the result is returned, which can help faint originals or over-dark scans.",
  contrast:
    "Changing contrast alters separation between text and background, often affecting OCR readability and cleanup behavior.",
  quality:
    "Changing quality usually affects final file size and compression strength.",
  swcrop:
    "Enabling this makes the SDK try to trim page borders after capture; disabling keeps the full acquired frame.",
  swdeskew:
    "Enabling this lets the SDK correct tilted pages; disabling preserves the raw capture angle.",
  autoRotate:
    "Enabling this lets the SDK rotate pages automatically based on detected orientation.",
  duplexMergeType:
    "Different values change whether duplex sides stay separate or are merged into a combined result, depending on the device and format.",
  paperDetectFreq:
    "A lower or higher detection frequency changes how often the hardware checks for paper presence during feed operations.",
  recognizeType:
    "Changing this changes whether the service extracts OCR text, reads barcodes, or skips recognition.",
  imageFmt:
    "Changing this changes the returned file type and can also affect whether merge files are produced during scanning.",
};

function humanizeLabel(fieldKey) {
  return fieldKey
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}

function normalizeOptionValues(optionGroup) {
  if (!optionGroup || !Array.isArray(optionGroup.value)) {
    return [];
  }

  return optionGroup.value.map((value) => String(value));
}

function pickPreferredValue(values, preferredValues = [], fallback = "") {
  for (const preferredValue of preferredValues) {
    if (values.includes(preferredValue)) {
      return preferredValue;
    }
  }

  return values[0] ?? fallback;
}

function getPreferredSource(sourceValues) {
  const preferredSource =
    sourceValues.find((value) => value === "Sheetfed-Duplex") ??
    sourceValues.find((value) => value === "ADF-Duplex");

  if (preferredSource) {
    return preferredSource;
  }

  const duplexSource = sourceValues.find((value) =>
    value.toLowerCase().includes("duplex")
  );

  return duplexSource ?? sourceValues[0] ?? "";
}

function syncFormForDevice(deviceOptions, deviceName, currentForm) {
  const selectedDevice =
    deviceOptions.find((device) => device.deviceName === deviceName) ?? null;

  if (!selectedDevice) {
    return {
      ...currentForm,
      deviceName,
      source: "",
    };
  }

  const sourceValues = normalizeOptionValues(selectedDevice.source);
  const modeValues = normalizeOptionValues(selectedDevice.mode);
  const paperSizeValues = normalizeOptionValues(selectedDevice.paperSize);
  const resolutionValues = normalizeOptionValues(selectedDevice.resolution);

  return {
    ...currentForm,
    deviceName,
    source: sourceValues.includes(currentForm.source)
      ? currentForm.source
      : getPreferredSource(sourceValues),
    mode: modeValues.includes(String(currentForm.mode ?? ""))
      ? String(currentForm.mode)
      : pickPreferredValue(modeValues, ["color", "gray", "lineart"], "color"),
    paperSize: paperSizeValues.includes(String(currentForm.paperSize ?? ""))
      ? String(currentForm.paperSize)
      : pickPreferredValue(paperSizeValues, ["Auto", "A4"], "Auto"),
    resolution: resolutionValues.includes(String(currentForm.resolution ?? ""))
      ? String(currentForm.resolution)
      : pickPreferredValue(resolutionValues, ["150", "200", "300"], "150"),
  };
}

function getFieldMeta(fieldKey, currentDevice, deviceOptions) {
  const fieldConfig = FIELD_CONFIG[fieldKey] ?? { type: "string", sdkKey: fieldKey };
  const deviceFieldMeta =
    currentDevice &&
    typeof currentDevice[fieldKey] === "object" &&
    currentDevice[fieldKey] !== null &&
    "type" in currentDevice[fieldKey]
      ? currentDevice[fieldKey]
      : null;

  let control = "text";
  let options = [];
  let range = null;

  if (fieldKey === "deviceName") {
    control = "select";
    options = deviceOptions.map((device) => String(device.deviceName));
  } else if (fieldKey === "paperOrientation") {
    control = "select";
    options = PAPER_ORIENTATION_OPTIONS;
  } else if (fieldKey === "imageFmt") {
    control = "select";
    options = IMAGE_FORMAT_OPTIONS;
  } else if (deviceFieldMeta?.type === "list") {
    control = "select";
    options = normalizeOptionValues(deviceFieldMeta);
  } else if (deviceFieldMeta?.type === "range") {
    control = "number";
    range = {
      min: Number(deviceFieldMeta.value[0]),
      max: Number(deviceFieldMeta.value[1]),
    };
  } else if (deviceFieldMeta?.type === "switch") {
    control = "boolean";
  } else if (fieldConfig.type === "boolean") {
    control = "boolean";
  } else if (fieldConfig.type === "number") {
    control = "number";
  } else if (fieldConfig.multiline) {
    control = "textarea";
  }

  return {
    key: fieldKey,
    label: humanizeLabel(fieldKey),
    sdkKey: fieldConfig.sdkKey,
    type: fieldConfig.type,
    control,
    options,
    range,
    readOnly: Boolean(fieldConfig.readOnly),
  };
}

function getFieldDescription(meta) {
  if (FIELD_HELP_OVERRIDES[meta.key]) {
    return FIELD_HELP_OVERRIDES[meta.key];
  }

  if (meta.control === "select") {
    return "List-based parameter exposed by the SDK. The dropdown values come from the scan.js option tables or the selected device capability response.";
  }

  if (meta.control === "boolean") {
    return "Boolean parameter sent to WebFXScan. Use Default to omit it, Enabled to send true, or Disabled to send false.";
  }

  if (meta.control === "number" && meta.range) {
    return "Numeric parameter with a range provided by scan.js for the selected device or option table.";
  }

  if (meta.control === "number") {
    return "Numeric parameter passed directly to the WebFXScan service when properties are saved.";
  }

  return "Free-form text parameter passed directly to the WebFXScan service when properties are saved.";
}

function getFieldEffect(meta) {
  if (FIELD_EFFECT_OVERRIDES[meta.key]) {
    return FIELD_EFFECT_OVERRIDES[meta.key];
  }

  if (meta.control === "boolean") {
    return "Changing this decides whether the saved request explicitly enables or disables this SDK behavior, or leaves it at the service default.";
  }

  if (meta.control === "select") {
    return "Changing this switches the discrete value sent through setScanner(...), which can alter how the SDK captures, cleans, or exports pages.";
  }

  if (meta.control === "number") {
    return "Changing this sends a different numeric value to the SDK, which can affect capture detail, cleanup thresholds, or output handling.";
  }

  return "Changing this sends a different text value to the SDK, which can affect capture rules, export naming, or advanced processing behavior.";
}

function getPossibleValuesText(meta) {
  if (meta.key === "base64enc") {
    return "Forced to true by the wrapper so browser previews can be returned as data URLs.";
  }

  if (meta.control === "boolean") {
    return "Default / Enabled / Disabled";
  }

  if (meta.options.length > 0) {
    return meta.options.join(", ");
  }

  if (meta.range) {
    return `${meta.range.min} to ${meta.range.max}`;
  }

  return "Free-form input";
}

function formatCurrentValue(meta, value) {
  if (value === undefined || value === null || value === "") {
    return "Default / omitted from save request";
  }

  if (meta.control === "boolean") {
    if (value === "true") {
      return "Enabled (true)";
    }

    if (value === "false") {
      return "Disabled (false)";
    }
  }

  return String(value);
}

function buildScannerPayload(
  scannerForm,
  fieldOrder,
  currentDevice,
  deviceOptions,
  dirtyFields
) {
  const payload = {};

  fieldOrder.forEach((fieldKey) => {
    if (fieldKey === "base64enc") {
      return;
    }

    if (!CORE_SCANNER_FIELDS.includes(fieldKey) && !dirtyFields[fieldKey]) {
      return;
    }

    const meta = getFieldMeta(fieldKey, currentDevice, deviceOptions);
    const rawValue = scannerForm[fieldKey];

    if (rawValue === undefined || rawValue === null || rawValue === "") {
      return;
    }

    if (meta.control === "boolean") {
      payload[fieldKey] = rawValue === "true";
      return;
    }

    if (meta.control === "number") {
      const parsed = Number(rawValue);
      if (!Number.isNaN(parsed)) {
        payload[fieldKey] = parsed;
      }
      return;
    }

    payload[fieldKey] = rawValue;
  });

  return payload;
}

function formatSdkError(error, fallbackLabel = "Error") {
  const code = error?.error;
  const rawMessage = error?.message;
  const message =
    typeof rawMessage === "string"
      ? rawMessage
      : rawMessage
        ? JSON.stringify(rawMessage)
        : "";

  if (code && message) {
    return `${fallbackLabel}: ${code} (${message})`;
  }

  if (code) {
    return `${fallbackLabel}: ${code}`;
  }

  if (message) {
    return `${fallbackLabel}: ${message}`;
  }

  return `${fallbackLabel}: unknown exception`;
}

function loadImageFromDataUrl(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load scanned image."));
    image.src = src;
  });
}

async function mergeImageFilesVertically(files) {
  const rasterFiles = files.filter(
    (file) => typeof file?.base64 === "string" && file.base64.startsWith("data:image/")
  );

  if (rasterFiles.length < 2) {
    return files;
  }

  const loadedImages = await Promise.all(
    rasterFiles.map(async (file) => ({
      file,
      image: await loadImageFromDataUrl(file.base64),
    }))
  );

  const width = Math.max(...loadedImages.map(({ image }) => image.width));
  const height = loadedImages.reduce((sum, { image }) => sum + image.height, 0);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return files;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  let offsetY = 0;
  loadedImages.forEach(({ image }) => {
    context.drawImage(image, 0, offsetY);
    offsetY += image.height;
  });

  return [
    {
      fileName: `merged_vertical_${Date.now()}.jpg`,
      base64: canvas.toDataURL("image/jpeg", 0.92),
      ocrText: loadedImages
        .map(({ file }) => file.ocrText)
        .filter(Boolean)
        .join("\n\n"),
      md5: "",
    },
  ];
}

export default function Home() {
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState(
    "Disconnected. Connect to the local WebFXScan service to begin."
  );
  const [connection, setConnection] = useState(DEFAULT_CONNECTION);
  const [scannerForm, setScannerForm] = useState(DEFAULT_SCANNER_FORM);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [dirtyFields, setDirtyFields] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [activeFieldKey, setActiveFieldKey] = useState(null);
  const [localMerge] = useState(DEFAULT_LOCAL_MERGE);

  const scanAppRef = useRef(null);
  const activityRef = useRef("idle");

  const fieldOrder = useMemo(
    () => FIELD_GROUPS.flatMap((group) => group.fields),
    []
  );

  useEffect(() => {
    scanAppRef.current = new WebFxScan();

    return () => {
      if (scanAppRef.current) {
        scanAppRef.current.close().catch(() => {});
      }
    };
  }, []);

  const currentDevice =
    deviceOptions.find((device) => device.deviceName === scannerForm.deviceName) ??
    null;

  const activeFieldMeta = activeFieldKey
    ? getFieldMeta(activeFieldKey, currentDevice, deviceOptions)
    : null;

  const isBusy = isConnecting || isSaving || isScanning || isCalibrating;
  activityRef.current = isScanning
    ? "scan"
    : isSaving
      ? "save"
      : isCalibrating
        ? "calibrate"
        : isConnecting
          ? "connect"
          : "idle";

  const handleConnectionChange = (event) => {
    const { name, value } = event.target;
    setConnection((current) => ({ ...current, [name]: value }));
  };

  const markFormDirty = () => {
    setIsReady(false);
  };

  const handleDeviceChange = (event) => {
    const nextDeviceName = event.target.value;
    setScannerForm((current) =>
      syncFormForDevice(deviceOptions, nextDeviceName, current)
    );
    markFormDirty();
  };

  const handleScannerFieldChange = (event) => {
    const { name, value } = event.target;
    setScannerForm((current) => ({
      ...current,
      [name]: value,
    }));
    setDirtyFields((current) => ({ ...current, [name]: true }));
    markFormDirty();
  };

  const resetScannerState = (message) => {
    setIsConnected(false);
    setIsReady(false);
    setIsSaving(false);
    setIsScanning(false);
    setIsCalibrating(false);
    setDeviceOptions([]);
    setDirtyFields({});
    setScannerForm(DEFAULT_SCANNER_FORM);
    setActiveFieldKey(null);
    setStatus(message);
  };

  const handleConnect = async () => {
    if (!scanAppRef.current || isBusy) {
      return;
    }

    if (isConnected) {
      try {
        setIsConnecting(true);
        setStatus("Disconnecting from WebFXScan service...");
        await scanAppRef.current.close();
        resetScannerState("Disconnected from WebFXScan service.");
      } catch (error) {
        console.warn(error);
        setStatus(formatSdkError(error, "Disconnect error"));
      } finally {
        setIsConnecting(false);
      }

      return;
    }

    try {
      setIsConnecting(true);
      setStatus("Connecting to WebFXScan service...");

      await scanAppRef.current.connect({
        ip: connection.ip.trim(),
        port: connection.port.trim(),
        errorCallback: () => {
          const contextMessage =
            activityRef.current === "scan"
              ? "Scanner connection error during scan. Try reconnecting and saving only the core defaults first."
              : "Scanner connection error. Connect again to continue.";
          resetScannerState(contextMessage);
        },
        closeCallback: () => {
          const contextMessage =
            activityRef.current === "scan"
              ? "Scanner connection closed during scan. This usually means the service rejected part of the active scan configuration."
              : "Scanner connection closed.";
          resetScannerState(contextMessage);
        },
      });

      await scanAppRef.current.setAutoScanCallback({
        callback: (file, errCode) => {
          if (errCode === 0) {
            setImages((current) => [...current, file]);
          } else {
            setStatus(`Scanner reported an automatic scan error: ${errCode}`);
          }
          setIsScanning(false);
        },
      });

      await scanAppRef.current.setBeforeAutoScanCallback({
        callback: () => {
          setIsScanning(true);
          setStatus("Scanner triggered an automatic capture.");
        },
      });

      setStatus("Initializing scanner service...");
      await scanAppRef.current.init();

      const { data: optionData } = await scanAppRef.current.getDeviceList();
      const options = optionData?.options ?? [];

      setIsConnected(true);
      setDeviceOptions(options);

      if (options.length < 1) {
        setStatus("Connected to service, but no scanner was detected.");
        return;
      }

      const firstDeviceName = options[0].deviceName ?? "";
      const syncedForm = syncFormForDevice(
        options,
        firstDeviceName,
        DEFAULT_SCANNER_FORM
      );

      setScannerForm(syncedForm);
      setDirtyFields({});
      setStatus(
        `Connected to ${firstDeviceName}. Review properties, use the info icons if needed, then save to enable scanning.`
      );
    } catch (error) {
      console.warn(error);
      resetScannerState("Connection failed. Verify the WebFXScan service is running.");
      setStatus(formatSdkError(error, "Connection failed"));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveProperties = async () => {
    if (!scanAppRef.current || !isConnected || isBusy) {
      return;
    }

    if (!scannerForm.deviceName || !scannerForm.source) {
      setStatus("Select a detected device and source before saving properties.");
      return;
    }

    try {
      setIsSaving(true);
      setStatus("Saving scanner properties...");

      const payload = buildScannerPayload(
        scannerForm,
        fieldOrder,
        currentDevice,
        deviceOptions,
        dirtyFields
      );

      await scanAppRef.current.setScanner(payload);
      setIsReady(true);
      setDirtyFields({});
      setStatus(`Properties saved for ${scannerForm.deviceName}. Ready to scan.`);
    } catch (error) {
      console.warn(error);
      setStatus(formatSdkError(error, "Save failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleScan = async () => {
    if (!scanAppRef.current || !isReady || isBusy) {
      return;
    }

    try {
      setIsScanning(true);
      setImages([]);
      setStatus("Scanning document...");

      const { result, data, error } = await scanAppRef.current.scan({
        timeout: 120000,
        callback: ({ page, status: scanStatus }) => {
          if (scanStatus === "scanning") {
            setStatus(`Scanning document... captured page ${page}.`);
          }
        },
      });

      if (result) {
        const finalImages =
          localMerge.enabled && localMerge.orientation === "vertical"
            ? await mergeImageFilesVertically(data)
            : data;

        setImages(finalImages);
        setStatus(
          finalImages.length === 1 && data.length > 1 && localMerge.enabled
            ? `Successfully scanned ${data.length} page(s) and merged them vertically into one image.`
            : `Successfully scanned ${finalImages.length} document(s).`
        );
      } else {
        setStatus(`Scan failed: ${error}`);
      }
    } catch (error) {
      console.warn(error);
      setStatus(formatSdkError(error, "Scan error"));
    } finally {
      setIsScanning(false);
    }
  };

  const handleCalibrate = async () => {
    if (!scanAppRef.current || !isReady || isBusy) {
      return;
    }

    try {
      setIsCalibrating(true);
      setStatus("Calibrating scanner. This can take a moment...");

      const { result, error } = await scanAppRef.current.calibrate();

      if (result) {
        setStatus("Calibration complete. Ready to scan.");
      } else {
        setStatus(`Calibration failed: ${error || "hardware rejected calibration"}`);
      }
    } catch (error) {
      console.warn(error);
      setStatus(formatSdkError(error, "Calibration error"));
    } finally {
      setIsCalibrating(false);
    }
  };

  const renderField = (fieldKey) => {
    const meta = getFieldMeta(fieldKey, currentDevice, deviceOptions);
    const value = scannerForm[fieldKey] ?? "";
    const isDisabled =
      meta.readOnly ||
      !isConnected ||
      isBusy ||
      (fieldKey !== "deviceName" && !scannerForm.deviceName && fieldKey !== "source");

    return (
      <label key={fieldKey} className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>{meta.label}</span>
          <button
            type="button"
            className={styles.infoButton}
            onClick={() => setActiveFieldKey(fieldKey)}
            aria-label={`Show information for ${meta.label}`}
          >
            i
          </button>
        </div>

        {fieldKey === "deviceName" ? (
          <select
            className={styles.select}
            name="deviceName"
            value={value}
            onChange={handleDeviceChange}
            disabled={!isConnected || isBusy || meta.options.length === 0}
          >
            <option value="">Select device</option>
            {meta.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : meta.control === "select" ? (
          <select
            className={styles.select}
            name={fieldKey}
            value={value}
            onChange={handleScannerFieldChange}
            disabled={isDisabled}
          >
            <option value="">
              {meta.readOnly ? "Read only" : "Default / not set"}
            </option>
            {meta.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : meta.control === "boolean" ? (
          <select
            className={styles.select}
            name={fieldKey}
            value={value}
            onChange={handleScannerFieldChange}
            disabled={isDisabled}
          >
            <option value="">Default / not set</option>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        ) : meta.control === "number" ? (
          <input
            className={styles.input}
            name={fieldKey}
            type="number"
            min={meta.range?.min}
            max={meta.range?.max}
            value={value}
            onChange={handleScannerFieldChange}
            disabled={isDisabled}
          />
        ) : meta.control === "textarea" ? (
          <textarea
            className={styles.textarea}
            name={fieldKey}
            value={value}
            onChange={handleScannerFieldChange}
            disabled={isDisabled}
          />
        ) : (
          <input
            className={styles.input}
            name={fieldKey}
            value={value}
            onChange={handleScannerFieldChange}
            disabled={isDisabled}
          />
        )}

        <span className={styles.fieldHint}>
          {meta.range
            ? `Range: ${meta.range.min} to ${meta.range.max}`
            : meta.options.length > 0
              ? `${meta.options.length} possible values`
              : meta.control === "boolean"
                ? "Boolean field"
                : "Free-form value"}
        </span>
      </label>
    );
  };

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <p className={styles.eyebrow}>Plustek SDK</p>
          <h1 className={styles.title}>Scanner Control</h1>
          <p className={styles.description}>
            Connect to the local WebFXScan service, review every supported scanner
            property from the SDK map, then save and scan.
          </p>
        </div>

        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2>Connection</h2>
            <span className={isConnected ? styles.badgeReady : styles.badgeIdle}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <div className={styles.fieldLabelRow}>
                <span>IP Address</span>
              </div>
              <input
                className={styles.input}
                name="ip"
                value={connection.ip}
                onChange={handleConnectionChange}
                disabled={isBusy || isConnected}
              />
            </label>

            <label className={styles.field}>
              <div className={styles.fieldLabelRow}>
                <span>Port</span>
              </div>
              <input
                className={styles.input}
                name="port"
                value={connection.port}
                onChange={handleConnectionChange}
                disabled={isBusy || isConnected}
              />
            </label>
          </div>

          <button
            className={styles.primaryButton}
            onClick={handleConnect}
            disabled={isBusy}
          >
            {isConnecting
              ? "Working..."
              : isConnected
                ? "Disconnect Scanner"
                : "Connect Scanner"}
          </button>
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2>Scanner Properties</h2>
            <span className={isReady ? styles.badgeReady : styles.badgeIdle}>
              {isReady ? "Saved" : "Unsaved"}
            </span>
          </div>

          <div className={styles.groupList}>
            {FIELD_GROUPS.map((group) => (
              <details key={group.title} className={styles.group} open>
                <summary className={styles.groupSummary}>
                  <span>{group.title}</span>
                  <span>{group.fields.length} fields</span>
                </summary>
                <div className={styles.groupFields}>
                  {group.fields.map((fieldKey) => renderField(fieldKey))}
                </div>
              </details>
            ))}
          </div>

          <button
            className={styles.secondaryButton}
            onClick={handleSaveProperties}
            disabled={!isConnected || isBusy || deviceOptions.length === 0}
          >
            {isSaving ? "Saving..." : "Save Properties"}
          </button>
        </section>
      </aside>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Current Status</p>
          </div>
          <p className={styles.status}>{status}</p>
        </section>

        <section className={styles.actions}>
          <button
            className={styles.utilityButton}
            onClick={handleCalibrate}
            disabled={!isReady || isBusy}
          >
            {isCalibrating ? "Calibrating..." : "Calibrate Scanner"}
          </button>

          <button
            className={styles.scanButton}
            onClick={handleScan}
            disabled={!isReady || isBusy}
          >
            {isScanning ? "Scanning..." : "Scan Document"}
          </button>
        </section>

        <section className={styles.resultsPanel}>
          <div className={styles.sectionHeader}>
            <h2>Scanned Results</h2>
            <span className={styles.countPill}>{images.length} files</span>
          </div>

          {images.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No scanned images yet.</p>
              <span>Connect, save properties, then start a scan.</span>
            </div>
          ) : (
            <div className={styles.imageList}>
              {images.map((image, index) => (
                <figure key={`${image.fileName}-${index}`} className={styles.imageCard}>
                  <figcaption className={styles.imageMeta}>
                    <span>{image.fileName || `Page ${index + 1}`}</span>
                    <span>{image.ocrText ? "OCR data available" : "Image only"}</span>
                  </figcaption>
                  {/* Scanner previews are returned as data URLs, so next/image adds no value here. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.base64}
                    alt={`Scanned document ${index + 1}`}
                    className={styles.preview}
                  />
                </figure>
              ))}
            </div>
          )}
        </section>
      </main>

      {activeFieldMeta ? (
        <div className={styles.modalOverlay} onClick={() => setActiveFieldKey(null)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Field Info</p>
                <h3 className={styles.modalTitle}>{activeFieldMeta.label}</h3>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setActiveFieldKey(null)}
                aria-label="Close field information"
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <span className={styles.infoLabel}>UI key</span>
                  <strong>{activeFieldMeta.key}</strong>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoLabel}>SDK key</span>
                  <strong>{activeFieldMeta.sdkKey}</strong>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoLabel}>Control type</span>
                  <strong>{activeFieldMeta.control}</strong>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoLabel}>Current value</span>
                  <strong>
                    {formatCurrentValue(
                      activeFieldMeta,
                      scannerForm[activeFieldMeta.key]
                    )}
                  </strong>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h4>What this field is</h4>
                <p>{getFieldDescription(activeFieldMeta)}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>Possible values</h4>
                <p>{getPossibleValuesText(activeFieldMeta)}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>How changing it affects scanning</h4>
                <p>{getFieldEffect(activeFieldMeta)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
