const express = require('express');
const app = express();
const twilio = require('twilio');
const bodyParser = require('body-parser');

const PORT = 3000;

const { urlencoded } = bodyParser;

app.use(urlencoded({ extended: false }));
app.use(express.json());

app.get('/ivr', (req, res) => {

  console.log(req.query);

  const customer = req.query.customer;

  if (!customer || !/^\d{10}$/.test(customer)) {
    return res.status(400).send('Invalid customer number');
  }

  const xml = `
    <response>
      <playtext type="ggl" quality="best" >Connecting you to the Runo Customer</playtext>
      <dial record="true" limittime="1000" timeout="30" moh="telco_ring" >${customer}</dial>
    </response>
  `;

  const hangup_xml = `
    <response>
      <hangup></hangup>
    </response>
  `;

  res.set('Content-Type', 'text/xml');


  if (req.query.event == "NewCall") {
    res.send(xml);
  } else if (req.query.event == "Dial" || (req.query.process == "dial" && req.query.event == "Hangup")) {
    res.send(hangup_xml);
  } else if (req.query.event == "Disconnect" || req.query.event == "Hangup") {
    console.log(req.params);
    res.send(hangup_xml);
  }

});

app.get('/ivr/inbound', (req, res) => {

  console.log(req.query);

  const called_number = req.query.called_number;

  const xml = `
    <response>
      <playtext type="ggl" quality="best" >Connecting you to the Runo Agent</playtext>
      <dial record="true" limittime="1000" timeout="30" moh="ring" >${called_number}</dial>
    </response>
  `;

  const hangup_xml = `
    <response>
      <hangup></hangup>
    </response>
  `;

  res.set('Content-Type', 'text/xml');

  if (req.query.event == "NewCall") {
    res.send(xml);
  } else {
    res.send(hangup_xml);
  }

});

// /customer-status
app.post('/customer-status', (req, res) => {
  console.log('[Customer Event]');
  console.log(JSON.stringify(req.body, null, 2));

  const event = req.body;
  const log = {
    callSid: event.CallSid,
    status: event.CallStatus,
    from: event.From,
    to: event.To,
    direction: event.Direction,
    timestamp: new Date().toISOString()
  };
  console.log('[Customer Log]', log);
  res.send('Customer Status Received');
});

// /agent-status
app.post('/agent-status', (req, res) => {
  console.log('[AGENT Event]');
  console.log(JSON.stringify(req.body, null, 2));

  const event = req.body;
  const log = {
    callSid: event.CallSid,
    status: event.CallStatus,
    from: event.From,
    to: event.To,
    direction: event.Direction,
    timestamp: new Date().toISOString()
  };
  console.log('[Agent Log]', log);
  res.send('Agent Status Received');
});

// /agent-bridge
app.post('/agent-bridge', (req, res) => {
  const customerNumber = req.query.customerNumber;
  console.log('=== Agent Bridge ===');
  console.log(JSON.stringify(req.query, null, 2));

  if (!customerNumber) {
    console.error('Missing customer number');
    return res.status(400).send('Customer number is required');
  }

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Connecting you to the customer.');

  const dial = twiml.dial({
    callerId: '+13167106323',
  });

  dial.number({
    statusCallback: `${process.env.RENDER_URL}/customer-status`,
    statusCallbackEvent: 'initiated ringing answered completed',
    statusCallbackMethod: 'POST',
  }, customerNumber);

  console.log('Dial TwiML:', twiml.toString());
  res.type('text/xml');
  res.send(twiml.toString());
});

app.get('/', (req, res) => {
  res.send('Runo X Ozonetel X Twilio');
});

app.listen(PORT, () => {
  console.log(`Runo custom IVR server listening on port ${PORT}`);
});
