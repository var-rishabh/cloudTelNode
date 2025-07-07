const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/ivr', (req, res) => {

  console.log(req.query);

  const customer = req.query.customer;

  if (!customer || !/^\d{10}$/.test(customer)) {
    return res.status(400).send('Invalid customer number');
  }

  const xml = `
    <response>
      <playtext type="ggl" quality="best" >Connecting you to the Runo Customer</playtext>
      <dial record="true" limittime="1000" timeout="30" moh="ring" >${customer}</dial>
    </response>
  `;

  const hangup_xml = `
    <response>
      <hangup></hangup>
    </response>
  `;

  res.set('Content-Type', 'text/xml');
  // res.send(xml);


  if (req.query.event == "NewCall") {
    res.send(xml);
  } else if (req.query.event == "Dial" || (req.query.process == "dial" && req.query.event == "Hangup")) {
    res.send(hangup_xml);
  } else if (req.query.event == "Disconnect" || req.query.event == "Hangup") {
    console.log(req.params);
    res.send(hangup_xml);
  }

});

app.get('/', (req, res) => {
  res.send('Runo X Ozonetel');
});

app.listen(PORT, () => {
  console.log(`Runo custom IVR server listening on port ${PORT}`);
});
