const { app, BrowserWindow, shell, ipcMain, session } = require('electron');
require('dotenv').config();

const supabase = require('./supabaseclient');
const { getMyCookie } = require('./dbService');
console.log("URL:", supabase.supabaseUrl);


let win;
let globalCookie;



async function createWindow() {
    win = new BrowserWindow({
        width: 400,
        height: 300,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
    globalCookie = await getMyCookie();
    if (globalCookie) {
        const myCookie = {
            url: 'https://www.pathofexile.com',
            name: 'POESESSID',
            cookie: globalCookie, // Kita paksa jadi string & hapus spasi nyelip
            domain: '.pathofexile.com',
            path: '/',
            secure: true,
            httpOnly: true,
            expirationDate: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) // 30 hari
        }

        try {
            await session.defaultSession.cookies.set(myCookie);
            console.log("🍪 Cookie injected ke session!");
            console.log(myCookie);
        } catch (error) {
            console.error("Gagal inject cookie:", error);
        }
    };
    // Listener Supabase ditaruh di SINI (di dalam createWindow)
    supabase
        .channel('trade-updates') // Kasih nama bebas
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trade' }, (payload) => {
            console.log('--- DATA MASUK DARI SUPABASE ---'); // Tambahin ini buat cek di terminal
            console.log('Seller:', payload.new.seller_name);

            // Kirim ke HTML
            if (win) {
                win.webContents.send('update-trade', {
                    seller: payload.new.seller_name,
                    token: payload.new.hideout_token
                });
            }
        })
        .subscribe((status) => {
            console.log('Status Realtime:', status); // Kalau muncul "SUBSCRIBED", berarti aman
        });
}
app.whenReady().then(createWindow);