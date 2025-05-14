import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name } = req.body;
    try {
      const newProvenance = await prisma.provenance.create({
        data: { name },
      });
      res.status(200).json(newProvenance);
    } catch (error) {
      res.status(400).json({ error: 'Error creating Provenance' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    try {
      await prisma.provenance.delete({
        where: { id: parseInt(id) },
      });
      res.status(200).json({ message: 'Provenance deleted' });
    } catch (error) {
      res.status(400).json({ error: 'Error deleting Provenance' });
    }
  }else if (req.method === 'GET') {
    // Handle GET request: Fetch all Types
    try {
      const types = await prisma.provenance.findMany();
      res.status(200).json(types);
    } catch (error) {
      res.status(400).json({ error: 'Error fetching Types' });
    }
  }
}