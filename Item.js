const supabase = require('./supabaseclient');

async function getMyItem() {
    const { data, error } = await supabase
        .from('Item')
        .select('itemName, itemType')
        .single();
  

    if (error){
        console.error("error njir:", error.message);
    return null;

    }

return data;

    }

    
module.exports = {getMyItem};

