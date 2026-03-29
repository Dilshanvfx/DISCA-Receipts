import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory array for simplicity (in production, use a database)
const receipts = [];

// Get all receipts
app.get('/api/receipts', (req, res) => {
    res.json(receipts);
});

// Save a new receipt
app.post('/api/receipts', (req, res) => {
    try {
        const {
            academyAddress, academyPhone, academyEmail,
            receiptNo, date, studentName, studentId, batch,
            month, feeAmount, otherFees, otherAmount,
            paymentMethod, transactionRef
        } = req.body;

        const newReceipt = {
            id: receipts.length + 1,
            academyAddress, academyPhone, academyEmail,
            receiptNo, date, studentName, studentId, batch,
            month, feeAmount, otherFees, otherAmount,
            paymentMethod, transactionRef,
            createdAt: new Date().toISOString()
        };

        receipts.push(newReceipt);
        res.status(201).json({ message: 'Receipt saved successfully', receipt: newReceipt });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 DISCA Backend API running on http://localhost:${PORT}`);
});
