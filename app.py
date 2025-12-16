import pytesseract
import platform

if platform.system() == "Windows":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
else:
    pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"

from flask import Flask, render_template, request, jsonify
from PIL import Image
from models.braille_map import text_to_braille
import pyttsx3
import base64
from io import BytesIO
import threading

app = Flask(__name__)

# Initialize TTS engine
tts_engine = pyttsx3.init()
tts_engine.setProperty('rate', 150)

def speak(text):
    def run():
        tts_engine.say(text)
        tts_engine.runAndWait()
    threading.Thread(target=run).start()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/capture', methods=['POST'])
def capture():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'No image received'}), 400

        header, encoded = data['image'].split(",", 1)
        image_data = base64.b64decode(encoded)
        img = Image.open(BytesIO(image_data))

        text = pytesseract.image_to_string(img).strip()
        braille = text_to_braille(text)

        if text:
            speak(text)

        return jsonify({
            'text': text if text else '[No text found]',
            'braille': braille if braille else '[No braille]'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
