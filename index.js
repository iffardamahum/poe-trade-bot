// 1. Panggil library yang dibutuhin
require('dotenv').config(); // Biar Node.js bisa baca file .env
const supabase = require('./supabaseclient');
console.log("URL:", supabase.supabaseUrl);

const { getMyItem } = require('./Item');
// // async function testitem(){
// //   const Itemgww = await getMyItem();
// //   console.log("nama item: ", Itemgww.itemName);
// //   console.log("nama type: ", Itemgww.itemType);
// // }
// testitem();

const { getMyCookie } = require('./dbService');
// async function C1() {
//   const Cookie = await getMyCookie();
//   console.log("isi Cookie Dari DB:", Cookie);
// }
// // //console.log("URL yang dipake:", process.env.SUPABASE_URL);
// C1();

let globalCookie = null;
let globalItem, globalType = null;

async function data() {
  globalCookie = await getMyCookie()
  globalItem = await getMyItem()
  globalType = await getMyItem()
  console.log(globalCookie);
  console.log(globalItem);
  // console.log(globalType);

}
data();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');



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

    // const myCookie = await getMyCookie();
    // console.log("POESESSID: ", myCookie);

    // if (!myCookie) {
    //   return message.reply("gagal");
    // }

    // const Itemgw = await getMyItem();
    // console.log("Nama Item Yang diambil: ", Itemgw.itemName);
    // console.log("Nama Type Yang diambil: ", Itemgw.itemType);


    // if (!Itemgw) {
    //   return message.reply("gagal ambil item dari database.")
    // }

    message.reply('🔍 Lagi nyari barang di Path of Exile 2 Trade...');
    try {
      let response = await fetch("https://www.pathofexile.com/api/trade2/search/poe2/Fate%20of%20the%20Vaal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Cookie": `${globalCookie}` // <-- Pastikan ini POESESSID terbaru dari browser lo!
        },
        body: JSON.stringify({
          "query": {
            "status": { "option": "online" },
            "name": `${globalItem.itemName}`,
            "type": `${globalItem.itemType}`,
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