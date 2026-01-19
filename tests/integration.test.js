const axios = require('axios');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:80';

describe('Integration Tests', () => {
  // Increase timeout for integration tests as network requests might take time
  jest.setTimeout(30000); 

  test('Frontend should be accessible', async () => {
    try {
      const response = await axios.get(BASE_URL);
      expect(response.status).toBe(200);
      // Check for something specific in the frontend HTML, e.g., the title
      expect(response.data).toContain('<title>Prompt Save</title>');
    } catch (error) {
      // Fail with a clear message if connection is refused or other error
      throw new Error(`Failed to connect to Frontend at ${BASE_URL}: ${error.message}`);
    }
  });

  test('Backend API Status should be reachable via Nginx', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/status`);
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ dbConnected: true });
    } catch (error) {
       throw new Error(`Failed to connect to Backend API at ${BASE_URL}/api/status: ${error.message}`);
    }
  });

  test('Full Flow: Create and Fetch Prompt', async () => {
    const uniqueContent = `Integration Test Prompt ${Date.now()}`;
    
    // 1. Create a prompt
    const createResponse = await axios.post(`${BASE_URL}/api/prompts`, {
      content: uniqueContent
    });
    expect(createResponse.status).toBe(201);
    expect(createResponse.data.content).toBe(uniqueContent);
    const newId = createResponse.data.id;

    // 2. Fetch all prompts and verify the new one is there
    const fetchResponse = await axios.get(`${BASE_URL}/api/prompts`);
    expect(fetchResponse.status).toBe(200);
    const found = fetchResponse.data.find(p => p.id === newId);
    expect(found).toBeDefined();
    expect(found.content).toBe(uniqueContent);

    // 3. Clean up (Delete the prompt)
    const deleteResponse = await axios.delete(`${BASE_URL}/api/prompts/${newId}`);
    expect(deleteResponse.status).toBe(204);
  });
});
