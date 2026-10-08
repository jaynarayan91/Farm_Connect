const Request = require('../models/requestModel');
const Livestock = require('../models/liveStockModel');
const Feed = require('../models/feedModel');
const Medicine = require('../models/medicineModel');

async function getOwnerAnalytics(req, res) {
  try {
    const ownerId = req.user.userId;

    const allRequests = await Request.find({ ownerId })
      .populate('itemId')
      .lean();

    const approvedRequests = allRequests.filter(r => r.status === 'Approved');

    const monthlySpendingMap = {};
    approvedRequests.forEach(req => {
      const date = new Date(req.requestDate || req.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      const pricePerUnit = req.itemId?.pricePerUnit || 0;
      const spending = req.quantity * pricePerUnit;
      if (!monthlySpendingMap[key]) monthlySpendingMap[key] = { key, label, spending: 0 };
      monthlySpendingMap[key].spending += spending;
    });

    const monthlySpending = Object.values(monthlySpendingMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);

    const totalOrders = allRequests.length;
    const pendingOrders = allRequests.filter(r => r.status === 'Pending').length;
    const approvedOrders = approvedRequests.length;
    const rejectedOrders = allRequests.filter(r => r.status === 'Rejected').length;

    const productMap = {};
    approvedRequests.forEach(req => {
      const name = req.itemName || 'Unknown';
      const type = req.itemType;
      if (!productMap[name]) productMap[name] = { name, type, totalQuantity: 0, orderCount: 0 };
      productMap[name].totalQuantity += req.quantity;
      productMap[name].orderCount += 1;
    });
    const mostPurchased = Object.values(productMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    const orderFrequencyMap = {};
    allRequests.forEach(req => {
      const date = new Date(req.requestDate || req.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      if (!orderFrequencyMap[key]) orderFrequencyMap[key] = { key, label, count: 0 };
      orderFrequencyMap[key].count += 1;
    });
    const orderFrequency = Object.values(orderFrequencyMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);

    const feedOrders = allRequests.filter(r => r.itemType === 'Feed').length;
    const medicineOrders = allRequests.filter(r => r.itemType === 'Medicine').length;
    const livestock = await Livestock.find({ ownerId }).lean();

    const healthMap = {};
    livestock.forEach(animal => {
      const condition = animal.healthCondition || 'Unknown';
      healthMap[condition] = (healthMap[condition] || 0) + 1;
    });
    const healthDistribution = Object.entries(healthMap).map(([condition, count]) => ({ condition, count }));
    const speciesMedMap = {};
    approvedRequests
      .filter(r => r.itemType === 'Medicine')
      .forEach(req => {
        const livestockName = req.livestockName || 'Unknown';
        // Try to find species from livestock array
        const animal = livestock.find(l => l.name === livestockName);
        const species = animal?.species || livestockName;
        if (!speciesMedMap[species]) speciesMedMap[species] = 0;
        speciesMedMap[species] += req.quantity;
      });
    const medicineBySpecies = Object.entries(speciesMedMap)
      .map(([species, quantity]) => ({ species, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);

  
    const animalMedCount = {};
    approvedRequests
      .filter(r => r.itemType === 'Medicine')
      .forEach(req => {
        const name = req.livestockName || 'Unknown';
        animalMedCount[name] = (animalMedCount[name] || 0) + 1;
      });
    const frequentTreatments = Object.entries(animalMedCount)
      .filter(([, count]) => count >= 2)
      .map(([animal, count]) => ({ animal, count }))
      .sort((a, b) => b.count - a.count);

    const totalLivestock = livestock.length;
    const healthyCount = livestock.filter(l =>
      l.healthCondition?.toLowerCase().includes('healthy') ||
      l.healthCondition?.toLowerCase().includes('excellent')
    ).length;
    const needsAttention = totalLivestock - healthyCount;
    const totalSpending = approvedRequests.reduce((sum, req) => {
      return sum + req.quantity * (req.itemId?.pricePerUnit || 0);
    }, 0);

    return res.status(200).json({
      // KPIs
      summary: {
        totalOrders,
        approvedOrders,
        pendingOrders,
        rejectedOrders,
        totalSpending: Math.round(totalSpending * 100) / 100,
        totalLivestock,
        healthyCount,
        needsAttention,
        feedOrders,
        medicineOrders,
      },
      // FR-1
      monthlySpending,
      // FR-2
      mostPurchased,
      orderFrequency,
      // FR-3
      healthDistribution,
      medicineBySpecies,
      frequentTreatments,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { getOwnerAnalytics };