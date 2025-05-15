import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const auctions = await prisma.auction.findMany();
        res.json(auctions);
    } else {
        res.status(405).json({message: 'Method Not Allowed'});
    }
}
/*
const [auctions, setAuctions] = useState([]);

useEffect(() => {
    const fetchData = async () => {
        const response = await fetch('/api/auction/getAllAuctions');
        const data = await response.json();
        setAuctions(data);
    };
    fetchData();
}, []);

*/
