import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'EcoHaven Backend' });
});

if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
        console.log(`Backend service running on http://localhost:${port}`);
    });
}
