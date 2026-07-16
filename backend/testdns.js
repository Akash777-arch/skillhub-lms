const dns = require('dns');

dns.resolveSrv('_mongodb._tcp.akash007.ohyg3b1.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('SRV Error:', err);
  } else {
    console.log('SRV Addresses:', addresses);
  }
});

dns.lookup('akash007.ohyg3b1.mongodb.net', (err, address, family) => {
  if (err) {
    console.error('Lookup Error:', err);
  } else {
    console.log('Lookup Address:', address);
  }
});
