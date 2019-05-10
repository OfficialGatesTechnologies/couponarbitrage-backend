if (process.env.NODE_ENV !== 'test') process.env.NODE_ENV = 'dev';

const LOCAL_DB_URL = `mongodb://localhost:27017/couponarbitrage`;
const DB_URL = 'mongodb://un:pw@host:39841/db';

 
const secret = 'XX4478HDNDnsndHHGK238ma';
const site_name = 'Couponarbitrage';
const base_url = 'http://localhost:3000/';
const site_base_url = 'http://localhost:3002/';
const logo_path = 'https://couponarbitrage.com/assets/images/logo.png';
 
module.exports = {
    LOCAL_DB_URL: LOCAL_DB_URL,
    secret: secret,
    site_name: site_name,
    base_url: base_url,
    logo_path: logo_path,
    site_base_url:site_base_url,
};