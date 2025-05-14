export default (req, res) => {
    if (req.method === 'POST') {
        // Handle your POST request here
        res.status(200).json({ message: 'POST request received' });
    } else {
        res.status(404).json({ message: 'Route not found' });
    }
};