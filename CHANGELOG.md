# Change Log

[Click here to download the historical version](https://marketplace.visualstudio.com/items?itemName=samge.vscode-samge-translate&ssr=false#version-history)

### 0.0.9 - 2025-03-24

Add two switch configuration items:
- `samge.translate.enableQuickPickSelector`: whether to display the shortcut drop-down option at the top after translation, default:true
- `samge.translate.enableRightNotify`: whether to display the result pop-up window in the lower right corner default:true.

### 0.0.8 - 2024-05-08

Add the functions mentioned in the [issues](https://github.com/Samge0/vscode-samge-translate/issues/3)：
- Provide additional optional operation menus after outputting the translation（Replace / Append & Select）.
- After translating multiple lines of text retain the line breaks in the translated text.

### 0.0.7 - 2024-02-03

- Add the feature to convert consecutive Chinese characters to English on the left side of the cursor(This feature is not enabled by default; it needs to be activated by selecting the option within the plugin settings.).
- Add keyboard shortcut triggers for all "zh2var" methods, allowing for usage upon configuration of custom shortcuts.

### 0.0.6 - 2024-01-29

- Add deepl translate engine support

### 0.0.5 - 2024-01-29

- Add volcano translate engine support
- Add youdao translate engine support

### 0.0.4 - 2024-01-28

- Add alibaba translate engine support
- Change the cache configured by the translation engine to encrypted access

### 0.0.3 - 2024-01-28

- Add tencent translate engine support
- Add translate engine config cache

### 0.0.2 - 2024-01-27

- Add icon

### 0.0.1 - 2024-01-27

- Added translation features using the Baidu translation engine.
- Support for translation from English to Chinese.
- Support for translation from Chinese to English.
- Added a feature for converting Chinese text to variable names.
- The Chinese to variable name conversion supports multiple naming conventions:
  - `camelCase`
  - `capitalCase`
  - `constantCase`
  - `dotCase`
  - `headerCase`
  - `noCase`
  - `paramCase`
  - `pascalCase`
  - `pathCase`
  - `snakeCase`