import os
import re
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'huwmit-jyzwo8-wEjzaw'
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')
socketio = SocketIO(app, cors_allowed_origins="*")

users = {} 
bad_word_patterns = [r'm\W*e\W*r\W*d\W*a', r'c\W*a\W*r\W*a\W*l\W*h\W*o', r'p\W*o\W*r\W*r\W*a', r'p\W*u\W*t\W*a', r'f\W*o\W*d\W*e\W*r', r'c\W*u']
DEFAULT_PFP_URL = 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg'

def censor_message(text):
    censored_text = text;
    for pattern in bad_word_patterns: censored_text = re.sub(pattern, '****', censored_text, flags=re.IGNORECASE)
    return censored_text

@app.route('/')
def index(): return render_template('index.html')

@socketio.on('user_join')
def handle_user_join(data):
    username = data['username']; sid = request.sid
    if username in [user['username'] for user in users.values()]: emit('username_taken_error', {'message': 'Este nome de utilizador já está em uso.'})
    else:
        pfp_url = DEFAULT_PFP_URL
        if 'image_data' in data and data['image_data']:
            try:
                image_data = data['image_data']; filename = secure_filename(f"{sid}_{data['image_name']}")
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                with open(filepath, 'wb') as f: f.write(image_data)
                pfp_url = f'/static/uploads/{filename}'
            except Exception as e: print(f"Erro ao guardar imagem de perfil: {e}")
        users[sid] = {'username': username, 'pfp': pfp_url, 'files': []}
        print(f"Utilizador {username} entrou com a foto {pfp_url}.")
        emit('user_joined_notification', {'msg': f'{username} entrou no chat.'}, broadcast=True)

@socketio.on('new_message')
def handle_new_message(data):
    sid = request.sid
    if sid in users:
        user_info = users[sid]; original_message = data['msg']; censored_message = censor_message(original_message)
        message_to_send = {'username': user_info['username'], 'pfp': user_info['pfp'], 'msg': censored_message}
        print(f"Mensagem de {user_info['username']}: {message_to_send['msg']}")
        emit('chat_message_update', message_to_send, broadcast=True)

@socketio.on('new_attachment')
def handle_new_attachment(data):
    sid = request.sid
    if sid in users:
        user_info = users[sid]; file_type = data.get('file_type', 'unknown')
        try:
            file_data = data['file_data']; file_ext = os.path.splitext(data['file_name'])[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"; filename = secure_filename(unique_filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            with open(filepath, 'wb') as f: f.write(file_data)
            file_url = f'/static/uploads/{filename}'
            print(f"Anexo ({file_type}) de {user_info['username']} guardado em {file_url}")
            users[sid]['files'].append(filepath)
            message_to_send = {'username': user_info['username'], 'pfp': user_info['pfp']}
            if file_type == 'image': message_to_send['image_url'] = file_url
            elif file_type == 'audio': message_to_send['audio_url'] = file_url
            emit('chat_message_update', message_to_send, broadcast=True)
        except Exception as e: print(f"Erro ao guardar anexo: {e}")

@socketio.on('start_typing')
def handle_start_typing():
    sid = request.sid
    if sid in users:
        username = users[sid]['username']
        emit('user_is_typing', {'username': username}, broadcast=True, include_self=False)

@socketio.on('stop_typing')
def handle_stop_typing():
    sid = request.sid
    if sid in users:
        username = users[sid]['username']
        emit('user_stopped_typing', {'username': username}, broadcast=True, include_self=False)

@socketio.on('disconnect')
def handle_disconnect( ):
    sid = request.sid
    if sid in users:
        user_info = users.pop(sid); username = user_info['username']; pfp_url = user_info['pfp']
        print(f"Utilizador {username} saiu."); emit('user_left_notification', {'msg': f'{username} saiu do chat.'}, broadcast=True)
        
        # Apaga a foto de perfil APENAS se não for o URL padrão
        if pfp_url != DEFAULT_PFP_URL:
            try:
                filepath = os.path.join(app.root_path, pfp_url.lstrip('/')); os.remove(filepath)
                print(f"Imagem de perfil {filepath} removida.")
            except Exception as e: print(f"Erro ao remover imagem de perfil {filepath}: {e}")
        
        for filepath in user_info.get('files', []):
            try:
                os.remove(filepath)
                print(f"Ficheiro de anexo {filepath} removido.")
            except Exception as e: print(f"Erro ao remover anexo {filepath}: {e}")

if __name__ == '__main__': socketio.run(app, debug=True)