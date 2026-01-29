// 1. Panggil library yang dibutuhin
require('dotenv').config(); // Biar Node.js bisa baca file .env
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// 1. Tambahin ini di deretan paling atas (destructuring)

// 2. Bikin Object Bot (Inisialisasi)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 3. Event: Pas Bot berhasil Online
client.once('ready', () => {
  console.log(`Mantap Bro! Bot ${client.user.tag} udah bangun!`);
});

client.on('messageCreate', async (message) => { // Tambahin 'async' di sini
  if (message.author.bot) return;

  if (message.content === '!ping') {
    message.reply('PONG! Bot lo udah idup nih!');
  }

  if (message.content === '9') {
    message.reply('🔍 Lagi nyari barang di Path of Exile 2 Trade...');

    try {
      // Data body ini didapet dari trik "Copy as cURL" di dokumen tadi
      // Contoh ini nyari item secara umum di league Standard/Current
      const response = await fetch("https://www.pathofexile.com/api/trade2/search/poe2/Fate%20of%20the%20Vaal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Cookie": "POESESSID=00747a354e03c22e816a5447f2ec3c5e" // <-- Pastikan ini POESESSID terbaru dari browser lo!
        },
        body: JSON.stringify({
          "query": {
            "status": { "option": "online" },
            "name": "The Vertex",
            "type": "Tribal Mask",
            "filters": {
              "misc_filters": {
                "filters": {
                  // "identified": { "option": "true" },
                  // "desecrated": { "option": "false" },
                  // "corrupted": { "option": "false" },


                }
              }
            }
          },

        })
      });

      const data = await response.json();
      if (data.result && data.result.length > 0) {
        const queryId = data.id;
        const league = encodeURIComponent("Fate of the Vaal");
       // const itemIds = data.result.slice(0, 5).join('\n');
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel('Cek di Browser 🚀')
              .setURL(`https://www.pathofexile.com/trade2/search/poe2/${league}/${queryId}`)
              .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
              .setLabel('Livesearch')
              .setURL(`https://www.pathofexile.com/trade2/search/poe2/${league}/${queryId}/live`)
              .setStyle(ButtonStyle.Link)
          );

        message.reply({
          content: `✅ Ketemu! Query ID: \`${queryId}\`\nSilakan klik tombol di bawah buat liat harganya:`,
          components: [row]
        });
      } else {
        message.reply('❌ Gak nemu barangnya, coba cek lagi filter lo.');
      }
    } catch (error) {
      console.error(error);
      message.reply('ERR: Gagal nembak API. Cek terminal lo!');
    }
  }
});

// ... (client.login tetep sama)
//


// 5. Login pake token yang ada di .env
client.login(process.env.DISCORD_TOKEN);