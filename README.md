# Chat Online em Tempo Real com Python e Socket.IO

Este é um projeto de um chat web completo e funcional, construído do zero para demonstrar competências em desenvolvimento full-stack, comunicação em tempo real e design de interfaces interativas. A aplicação permite que múltiplos utilizadores conversem em tempo real, partilhando texto, imagens e áudio.

### ✨ [Acesse a Demo Ao Vivo Aqui!](https://chat-online-u4n7.onrender.com) ✨

![Screenshot do Chat Online](https://i.imgur.com/f95418.png)

---

## 🚀 Funcionalidades Principais

Este projeto não é apenas um chat de texto simples. Ele inclui uma vasta gama de funcionalidades modernas:

* **Comunicação em Tempo Real:** Mensagens instantâneas usando WebSockets.
* **Chat Multimédia:** Envio de mensagens de texto, imagens e ficheiros de áudio.
* **Gravação de Áudio:** Gravação e envio de mensagens de voz diretamente do navegador, como no WhatsApp.
* **Perfis de Utilizador:** Os utilizadores podem definir um nome e uma foto de perfil ao entrar.
* **Notificações de Presença:** Avisos em tempo real quando um utilizador entra, sai ou está a digitar.
* **Moderação de Conteúdo:** Filtro de palavrões customizável e inteligente usando Expressões Regulares (RegEx).
* **Validação de Dados:** Impede a entrada de utilizadores com nomes duplicados.
* **Gestão de Ficheiros:** Upload e exclusão automática de todos os ficheiros (avatares, imagens, áudios) quando o utilizador se desconecta.
* **Interface Moderna:**
    * Tema Claro / Escuro com persistência da escolha do utilizador.
    * Design totalmente responsivo, adaptável a computadores e telemóveis.
    * Animações e micro-interações para uma experiência de utilizador mais fluida.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com um conjunto de tecnologias modernas e padrão de mercado, divididas entre o Backend e o Frontend.

### Backend

* **Python:** A linguagem de programação principal para toda a lógica do servidor.
* **Flask:** Um micro-framework web leve e poderoso, usado para criar a estrutura base da aplicação e servir a página inicial.
* **Flask-SocketIO:** A biblioteca que integra o Socket.IO com o Flask, permitindo a comunicação bidirecional e em tempo real via WebSockets.
* **Gunicorn & Eventlet:** Servidor de produção WSGI e worker assíncrono utilizados para o deploy, garantindo que as conexões em tempo real funcionem de forma estável e escalável.

### Frontend

* **HTML5:** Para a estruturação semântica de todas as páginas e componentes.
* **CSS3:** Para toda a estilização, incluindo:
    * **Flexbox** para a criação de layouts complexos e alinhamento.
    * **Variáveis CSS** para a fácil implementação do tema claro/escuro.
    * **Media Queries** para garantir um design totalmente responsivo.
    * **Animações com `@keyframes`** para uma interface mais dinâmica.
* **JavaScript (Vanilla):** Utilizado para toda a interatividade do lado do cliente, incluindo:
    * Manipulação do DOM para exibir mensagens e notificações.
    * Comunicação com o servidor via `Socket.IO Client`.
    * Uso de APIs do navegador como `FileReader` (para pré-visualização de imagens) e `MediaRecorder` (para gravação de áudio).
    * Gestão de estado e eventos para a interface do utilizador.

---

## ⚙️ Como Executar Localmente

Para executar este projeto na sua própria máquina, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SEU-NOME-DE-UTILIZADOR/NOME-DO-SEU-REPOSITORIO.git](https://github.com/SEU-NOME-DE-UTILIZADOR/NOME-DO-SEU-REPOSITORIO.git)
    cd NOME-DO-SEU-REPOSITORIO
    ```

2.  **Crie e ative um ambiente virtual:**
    ```bash
    # Criar o ambiente
    python -m venv venv

    # Ativar no Windows
    .\venv\Scripts\activate

    # Ativar no macOS/Linux
    source venv/bin/activate
    ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    python app.py
    ```

5.  Abra o seu navegador e aceda a `http://127.0.0.1:5000`.

---

## 🔮 Melhorias Futuras

* Implementação de salas de chat múltiplas.
* Adição de mensagens privadas entre utilizadores.
* Criação de um sistema de autenticação com base de dados para guardar utilizadores e histórico de mensagens.
* Suporte para emojis.
