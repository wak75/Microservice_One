const request = require('supertest');
const nock = require('nock');
const { app, server } = require('./server');

const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL || 'http://localhost:3001';

describe('Microservice One - API Gateway', () => {
  afterAll((done) => {
    server.close(done);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('microservice-one');
    });
  });

  describe('GET /', () => {
    it('should return welcome message with endpoints', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('Welcome');
      expect(Array.isArray(res.body.endpoints)).toBe(true);
    });
  });

  describe('GET /api/users', () => {
    it('should fetch users from microservice-two', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' }
      ];

      nock(DATA_SERVICE_URL)
        .get('/api/users')
        .reply(200, { success: true, data: mockUsers });

      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockUsers);
    });

    it('should handle errors from microservice-two', async () => {
      nock(DATA_SERVICE_URL)
        .get('/api/users')
        .replyWithError('Connection failed');

      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should fetch a specific user from microservice-two', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' };

      nock(DATA_SERVICE_URL)
        .get('/api/users/1')
        .reply(200, { success: true, data: mockUser });

      const res = await request(app).get('/api/users/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockUser);
    });

    it('should handle 404 from microservice-two', async () => {
      nock(DATA_SERVICE_URL)
        .get('/api/users/9999')
        .reply(404, { success: false, message: 'User not found' });

      const res = await request(app).get('/api/users/9999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    it('should create a user via microservice-two', async () => {
      const newUser = { name: 'Test User', email: 'test@example.com', role: 'user' };
      const createdUser = { id: 4, ...newUser };

      nock(DATA_SERVICE_URL)
        .post('/api/users', newUser)
        .reply(201, { success: true, data: createdUser });

      const res = await request(app)
        .post('/api/users')
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(createdUser);
    });

    it('should handle validation errors from microservice-two', async () => {
      nock(DATA_SERVICE_URL)
        .post('/api/users')
        .reply(400, { success: false, message: 'Name and email are required' });

      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Test' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user via microservice-two', async () => {
      const updates = { name: 'Updated Name' };
      const updatedUser = { id: 1, name: 'Updated Name', email: 'john@example.com', role: 'admin' };

      nock(DATA_SERVICE_URL)
        .put('/api/users/1', updates)
        .reply(200, { success: true, data: updatedUser });

      const res = await request(app)
        .put('/api/users/1')
        .send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(updatedUser);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user via microservice-two', async () => {
      nock(DATA_SERVICE_URL)
        .delete('/api/users/1')
        .reply(200, { success: true, message: 'User deleted successfully' });

      const res = await request(app).delete('/api/users/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/users/:id/profile', () => {
    it('should generate enhanced user profile', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' };

      nock(DATA_SERVICE_URL)
        .get('/api/users/1')
        .reply(200, { success: true, data: mockUser });

      const res = await request(app).get('/api/users/1/profile');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.displayName).toBe('JOHN DOE');
      expect(res.body.data.emailDomain).toBe('example.com');
      expect(res.body.data.isAdmin).toBe(true);
      expect(res.body.data.timestamp).toBeDefined();
    });

    it('should handle errors when generating profile', async () => {
      nock(DATA_SERVICE_URL)
        .get('/api/users/9999')
        .reply(404, { success: false, message: 'User not found' });

      const res = await request(app).get('/api/users/9999/profile');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
