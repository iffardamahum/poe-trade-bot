const supabase = require('./supabaseclient');

async function getMyTrade() {
    const { data, error } = await supabase
        .from('bot_settings')
        .select('hideout_token, seller_name' )
        .single();


    if (error){
        console.error("error njir:", error.message);
    return null;

    }

return data;

    }



module.exports = {getMyTrade};