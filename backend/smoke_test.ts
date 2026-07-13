import http from 'http';

const targetUrl = process.argv[2] || 'http://localhost:5000';
console.log(`Starting Smoke Test against target: ${targetUrl}`);

function checkEndpoint(urlPath: string): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, targetUrl);
    const req = http.get(url.href, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

async function runTests() {
  let failed = false;

  // Test 1: Root endpoint
  try {
    const res = await checkEndpoint('/');
    console.log(`[PASS] Root endpoint returned status ${res.statusCode}`);
    if (res.statusCode !== 200) {
      console.error(`[FAIL] Root status is not 200 (was ${res.statusCode})`);
      failed = true;
    }
  } catch (err: any) {
    console.error(`[FAIL] Root endpoint request failed: ${err.message}`);
    failed = true;
  }

  // Test 2: Health endpoint
  try {
    const res = await checkEndpoint('/health');
    console.log(`[PASS] Health endpoint returned status ${res.statusCode}`);
    const json = JSON.parse(res.body);
    console.log('Health details:', json);
    if (json.status !== 'ok' || json.database !== 'connected') {
      console.error('[FAIL] Health details are not OK/connected');
      failed = true;
    }
  } catch (err: any) {
    console.error(`[FAIL] Health endpoint request failed: ${err.message}`);
    failed = true;
  }

  if (failed) {
    console.error('--- Smoke Test Failed ---');
    process.exit(1);
  } else {
    console.log('--- Smoke Test Passed Successfully ---');
    process.exit(0);
  }
}

runTests();
