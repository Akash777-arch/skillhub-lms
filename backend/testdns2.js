const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google DNS

dns.resolveSrv('_mongodb._tcp.akash007.ohyg3b1.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('SRV Error (Google DNS):', err);
  } else {
    console.log('SRV Addresses (Google DNS):', addresses);
  }
});

dns.resolve4('akash007.ohyg3b1.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('A Record Error (Google DNS):', err);
  } else {
    console.log('A Addresses (Google DNS):', addresses);
  }
});
