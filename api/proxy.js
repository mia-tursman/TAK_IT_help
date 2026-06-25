export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const { messages, system, model, max_tokens, airtable_record } = req.body;

  if (airtable_record) {
    const atRes = await fetch(`https://api.airtable.com/v0/appvNDBoDDGFshd5J/tblVudrEioL0al0co`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
      },
      body: JSON.stringify({
        records: [{
          fields: {
            'Submitter Name': airtable_record.name || '',
            'Submitter Email': airtable_record.email || '',
            'Department': airtable_record.department || '',
            'Request Type': airtable_record.requestType || '',
            'Request Description': airtable_record.description || '',
            'Urgency': airtable_record.urgency || '',
            'Input Channel': 'Web App',
            'Status': 'New',
            'Submitted At': new Date().toISOString()
          }
        }]
      })
    });
    const atData = await atRes.json();
    return res.status(atRes.status).json(atData);
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ messages, system, model, max_tokens })
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
