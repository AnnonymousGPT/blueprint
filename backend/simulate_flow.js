const BASE_URL = 'http://127.0.0.1:5000/api';

async function main() {
  console.log('1. Logging in as Client (8888888881)...');
  await fetch(`${BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '8888888881' })
  });
  
  const clientLoginRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '8888888881', otp: '123456' })
  });
  const clientLogin = await clientLoginRes.json();
  const clientToken = clientLogin.token;
  console.log('Client Token obtained.');

  console.log('2. Fetching Experts...');
  const expertsRes = await fetch(`${BASE_URL}/experts`);
  const expertsData = await expertsRes.json();
  const rajesh = expertsData.data.find((e) => e.name.includes('Rajesh'));
  console.log('Found Expert:', rajesh.name, 'ID:', rajesh.id);

  console.log('3. Client creating a Service Request...');
  const reqRes = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${clientToken}`
    },
    body: JSON.stringify({
      serviceName: 'Test ITR Filing',
      assignedExpertId: rajesh.id,
      amount: 1500
    })
  });
  const reqData = await reqRes.json();
  console.log('Service Request created:', reqData.data?.id);
  
  console.log('4. Client booking an appointment...');
  const bookRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${clientToken}`
    },
    body: JSON.stringify({
      expertId: rajesh.id,
      requestId: reqData.data.id,
      date: '2026-07-09',
      time: '11:00 AM',
      type: 'VIDEO'
    })
  });
  const bookData = await bookRes.json();
  console.log('Booking created:', bookData.data?.id);

  console.log('5. Logging in as Expert Rajesh (8888888882)...');
  await fetch(`${BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '8888888882' })
  });
  const expertLoginRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '8888888882', otp: '123456' })
  });
  const expertLogin = await expertLoginRes.json();
  const expertToken = expertLogin.token;
  console.log('Expert Token obtained.');

  console.log('6. Expert fetching requests...');
  const getReqRes = await fetch(`${BASE_URL}/requests`, {
    headers: { 'Authorization': `Bearer ${expertToken}` }
  });
  const expertRequests = await getReqRes.json();
  console.log('Expert requests found:', expertRequests.data?.length);
  
  if (expertRequests.data?.length > 0) {
    const recentReq = expertRequests.data[0];
    console.log('✅ SUCCESS! Expert sees request:', recentReq.serviceName, 'Status:', recentReq.status, 'Client:', recentReq.client.name);
    console.log('Bookings attached:', recentReq.bookings?.length);
  } else {
    console.log('❌ FAILED! Expert dashboard is empty.');
  }
}

main().catch(console.error);
