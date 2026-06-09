import { Router } from 'express';
const router = Router();
// ACoolAPI_Auth Scaffolding
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    // Scaffolding: In a real sprint, we validate against DB
    if (email === 'iam@acoolcollector.com' && password === 'acoolpass') {
        res.json({
            token: 'acool-jwt-token-scaffold',
            user: {
                email,
                role: 'Collector',
                displayName: 'ACoolNERD'
            }
        });
    }
    else {
        res.status(401).json({ error: 'Unauthorized: Invalid DNA sequence' });
    }
});
router.get('/validate', (req, res) => {
    res.json({ valid: true, identity: 'ACoolCOLLECTOR' });
});
export default router;
