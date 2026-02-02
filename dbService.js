const supabase = require('./supabaseclient');

async function getMyCookie() {
    const { data, error } = await supabase
        .from('bot_settings')
        .select('POESESSID')
        .single();


    if (error){
        console.error("error njir:", error.message);
    return null;

    }

return data;

    }



module.exports = {getMyCookie};