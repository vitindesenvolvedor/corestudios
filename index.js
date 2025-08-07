// backend/index.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Substitua pelo seu webhook do Discord
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1402807086844215507/RS1gsyz-yjXQZb9VABbqlKt2CFf5XsIpENWlXZcELk2RbBfvzs3-Q-h0ung8z7WQ_t2h';

// Rota de envio do formulário
app.post('/contato', async (req, res) => {
  const { name, _replyto, message } = req.body;

  if (!name || !_replyto || !message) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // 1. Enviar notificação para o Discord
  try {
    await axios.post(DISCORD_WEBHOOK_URL, {
      embeds: [
        {
          title: '📨 Novo Contato via Site',
          color: 0x9146ff,
          fields: [
            { name: '👤 Nome', value: name, inline: true },
            { name: '📧 Email', value: _replyto, inline: true },
            { name: '💬 Mensagem', value: message }
          ],
          timestamp: new Date()
        }
      ]
    });
  } catch (err) {
    console.error('Erro ao enviar para o Discord:', err.message);
  }

  // 2. Salvar em JSON local (simulação de banco de dados)
  const contatosPath = path.join(__dirname, 'contatos.json');
  let contatos = [];

  try {
    if (fs.existsSync(contatosPath)) {
      contatos = JSON.parse(fs.readFileSync(contatosPath));
    }
    contatos.push({ name, email: _replyto, message, date: new Date() });
    fs.writeFileSync(contatosPath, JSON.stringify(contatos, null, 2));
  } catch (err) {
    console.error('Erro ao salvar contato:', err.message);
  }

  // 3. Resposta para o frontend
  res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado em http://localhost:${PORT}`);
});
