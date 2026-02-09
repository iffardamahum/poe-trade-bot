// 1. Panggil library yang dibutuhin
require('dotenv').config(); // Biar Node.js bisa baca file .env
const supabase = require('./supabaseclient');
console.log("URL:", supabase.supabaseUrl);
const WebSocket = require('ws');
const { getMyItem } = require('./Item');
const axios = require('axios');


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
let globalItem = null;

async function data() {
  globalCookie = await getMyCookie()
  globalItem = await getMyItem()
  console.log(globalCookie);
  console.log(globalItem);
  // console.log(globalType);
}
data();

let globalqueryID = "";
let lastToken = "";

const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
// const { start } = require('repl');
// const { link } = require('fs');
// const { error } = require('console');


// 2. Bikin Object Bot (Inisialisasi)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

async function sendToOverlay(sellerName, hideoutToken) {
  const { error } = await supabase
    .from('trade') // Nama tabel sesuai screenshot 
    .insert([
      { seller_name: sellerName, hideout_token: hideoutToken }
    ]);

  if (error) console.log("Gagal lapor ke Supabase:", error.message);
  else console.log(` Sinyal dikirim ke Overlay, Seller: ${sellerName}`);
};


// 3. Event: Pas Bot berhasil Online

client.once('ready', () => {
  console.log(`Bot ${client.user.tag} ready`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    message.reply('PONG!');
  }

  if (message.content === '9') {
    const WebSocket = require('ws');
    message.reply(' Lagi nyari barang di Path of Exile 2 Trade...');
    try {
      let response = await fetch("https://www.pathofexile.com/api/trade2/search/poe2/Fate%20of%20the%20Vaal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Cookie": globalCookie.POESESSID
        },
        body: JSON.stringify({
          "query": {
            "status": { "option": "securable" },
            "name": `${globalItem.itemName}`,
            "type": `${globalItem.itemType}`,
            "filters": {
              "trade_filters": {
                "filters": {}
              }
            }
          },
        })
      });


      const data = await response.json();
      if (data.result && data.result.length > 0) {
        globalqueryID = data.id;
        console.log("globalquery= ", globalqueryID);
        const league = encodeURIComponent("Fate of the Vaal");
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel('Cek di Browser 🚀')
              .setURL(`https://www.pathofexile.com/trade2/search/poe2/${league}/${globalqueryID}`)
              .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
              .setLabel('Livesearch')
              .setURL(`https://www.pathofexile.com/trade2/search/poe2/${league}/${globalqueryID}/live`)
              .setStyle(ButtonStyle.Link),
          );

        message.reply({
          content: ` Ketemu! Query ID: \`${globalqueryID}\`\nSilakan klik tombol di bawah buat liat harganya:`,
          components: [row]
        });
      } else {
        message.reply(' Gak nemu barangnya, coba cek lagi filter lo.');
      }
    } catch (error) {
      console.error(error);
      message.reply('ERR: Gagal nembak API. Cek terminal');
    }
  }


  //////////////////////////////////////
  //////////////////////////////////////
  //////////////////////////////////////
  //////////////////////////////////////
  //////////////////////////////////////
  //////////////////////////////////////
  //////////////////////////////////////
  //////////////////////////////////////
  //////////////////////////////////////


  if (message.content === '7') {
    message.reply('🔍 Lagi nyari barang di Path of Exile 2 Trade...');
    let URL = `wss://www.pathofexile.com/api/trade2/live/poe2/Fate%20of%20the%20Vaal/${globalqueryID}`;
    console.log(globalCookie);
    try {
      const WebSocket = require('ws'); // Pastikan dideklarasi
      let ws = new WebSocket(URL, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Origin": "https://www.pathofexile.com",
          "Cookie": `POESESSID=${globalCookie.POESESSID}`
        },
      });

      ws.on('open', () => {
        console.log('Live search ok, lagi mantengin');
      });

      ws.on('message', async (data) => {
        try {
          const response = JSON.parse(data);
          if (response.result) {
            const itemTicket = response.result;
            const fetchURL = `https://www.pathofexile.com/api/trade2/fetch/${itemTicket}?query=${globalqueryID}`;

            const detailRes = await fetch(fetchURL, {
              method: 'GET',
              headers: {
                "Cookie": `POESESSID=${globalCookie.POESESSID}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": `https://www.pathofexile.com/trade/search/poe2/${globalqueryID}`
              }
            });

            const detailData = await detailRes.json();
            const item = detailData.result[0];

            if (item) {
              const sellerName = item.listing.account.name;
              const priceAmount = item.listing.price.amount;
              const priceCurrency = item.listing.price.currency;
              const itemDisplayName = item.item.name || item.item.typeLine;
              const hideoutToken = item.listing.hideout_token;
              await sendToOverlay(sellerName, hideoutToken);

              lastToken = hideoutToken;

              // Console log biar lo tau barangnya masuk
              console.log(`Barang Masuk: ${itemDisplayName} - ${priceAmount} ${priceCurrency}`);

              // const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

              // Di dalem if (item)
              // const row = new ActionRowBuilder()
              //   .addComponents(
              //     new ButtonBuilder()
              //       .setCustomId('gas_loncat') // Kita titip tokennya di sini
              //       .setLabel(` TRAVEL TO ${sellerName}`)
              //       .setStyle(ButtonStyle.Primary), // Pake tombol biru biasa, bukan Link
              //   );

              // message.channel.send({ content: `Ketemu barang!`, components: [row] });

              // await message.channel.send({
              //   content: ` **barang masuk**\n` +
              //    `Seller: \`${sellerName}\`\n` +
              //    `Harga: ${item.listing.price.amount} ${item.listing.price.currency}\n\n` +
              //    `**KLIK LINK DI BAWAH BUAT TP:**\n` +
              //    `<${tpLink}>` // Pake kurung siku biar gak jadi embed biru yang aneh
              // })
            }
          }
        } catch (err) {
          console.error("Gagal unboxing:", err);
        }
      });

      ws.on('error', (err) => console.error('WS Error:', err));

    } catch (error) {
      console.error("Init Error:", error);
    }
  }
}),
  // client.on('interactionCreate', async (interaction) => {
  //     if (!interaction.isButton()) return;

  //     if (interaction.customId === 'gas_loncat') {
  //         // Biar Discord gak 'Interaction Failed'
  //         await interaction.deferUpdate().catch(() => {});

  //         if (!lastToken) return console.log("Token kosong!");

  //         // Tembak ke Python Jembatan
  //         try {
  //             const response = await axios.post('http://127.0.0.1:5000/tp', {
  //                 token: lastToken
  //             });
  //             console.log(" respon:", response.data.status);
  //         } catch (err) {
  //             console.log(" Gagal kontak Python! Pastiin bridge.py udah jalan.");
  //         }
  //     }

  // Taruh di baris paling bawah index.js


  // });

  client.login(process.env.DISCORD_TOKEN);