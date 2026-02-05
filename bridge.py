from flask import Flask, request
import pyautogui
import pygetwindow as gw
import pyperclip
import time

app = Flask(__name__)

@app.route('/tp', methods=['POST'])
def travel():
    data = request.json
    token = data.get('token')
    
    if token:
        print(f"🚀 Perintah Masuk! Token: {token[:10]}...")
        
        try:
            # 1. Copy perintah ke clipboard duluan
            pyperclip.copy(f"/join_hideout {token}")
            
            # 2. Kasih jeda 2 detik biar lo sempet Alt-Tab manual ke game
            # ATAU lo pastiin posisi lo udah di dalem game pas klik Discord
            print("⏳ Standby... Pindah ke game SEKARANG!")
            time.sleep(0.5) 
            
            # 3. Langsung hajar ngetik tanpa nunggu fokus jendela
            pyautogui.press('enter')
            time.sleep(0.1)
            pyautogui.hotkey('ctrl', 'v')
            time.sleep(0.1)
            pyautogui.press('enter')
            
            print("✅ Perintah diketik!")
            return {"status": "Success"}, 200
        except Exception as e:
            print(f"❌ Error: {e}")
            return {"status": "Internal Error"}, 500
            
    return {"status": "No token"}, 400

if __name__ == '__main__':
    # Jalan di localhost port 5000
    app.run(host='127.0.0.1', port=5000)