import request from 'supertest';
import { app } from './index';

describe('GET /api/health', () => {
    it('should return 200 and ok status', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 'ok',
            service: 'EcoHaven Backend'
        });
    });
});
