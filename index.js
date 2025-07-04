const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/ivr', (req, res) => {

  console.log(req);

  const customer = req.query.customer;

  if (!customer || !/^\d{10}$/.test(customer)) {
    return res.status(400).send('Invalid customer number');
  }

  const xml = `
    <response>
      <playtext>Connecting you to the Runo Customer</playtext>
      <dial>${customer}</dial>
    </response>
  `;

  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

app.get('/', (req, res) => {
  res.send('Runo X Ozonetel');
});

app.listen(PORT, () => {
  console.log(`Runo custom IVR server listening on port ${PORT}`);
});
