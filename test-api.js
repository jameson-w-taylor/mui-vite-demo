// Quick test of the API
async function testApi() {
  try {
    const response = await fetch('https://user-api.builder-io.workers.dev/api/users?page=1&perPage=5');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('API Response:', data);
    console.log('Found users:', data.data.length);
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testApi();
