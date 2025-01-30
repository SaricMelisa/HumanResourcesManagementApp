const pool = require('./config/db');

async function testConnection(){
    try{
        const res = await pool.query('SELECT NOW() AS tren');
        console.log("Povezano na bazu, trenutno vrijeme: ", res.rows[0].tren)}
     catch (err){
        console.error("Greska pri povezivanju", err);
    }
    
}
testConnection();