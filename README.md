# Furigana Reader (ふりがなリーダー)

A lightweight Google Chrome extension that automatically generates furigana (hiragana readings) above Japanese Kanji to assist with reading web pages.

**Developed by:** R Sai Sudarshan

## Features
* **100% Local Processing:** Uses Kuromoji and Kuroshiro within the browser. No data is sent to external cloud APIs, ensuring complete privacy and fast loading times.
* **Dynamic Toggle:** Instantly enable or disable the parsing engine via the extension popup. 
* **Custom UI:** Clean, modern, card-based interface with active/inactive visual states.

## Installation (Unpacked)
Since this extension is not published on the Chrome Web Store, you can install it manually using Developer Mode.

1. Clone or download this repository as a `.zip` file and extract it.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Toggle on **Developer mode** in the top right corner.
4. Click the **Load unpacked** button in the top left corner.
5. Select the extracted `furigana-reader` directory.
6. Pin the extension to your toolbar to easily toggle it on and off!

## Tech Stack
* **HTML/CSS/JS:** Vanilla web technologies for the popup interface.
* **[Kuroshiro](https://github.com/hexenq/kuroshiro):** Japanese NLP library for converting Kanji.
* **[Kuromoji.js](https://github.com/takuyaa/kuromoji.js):** Morphological analyzer underlying the conversion engine.
