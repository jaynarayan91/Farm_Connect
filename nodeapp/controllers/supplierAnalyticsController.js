// controllers/supplierAnalyticsController.js
const Request = require('../models/requestModel');
const Feed = require('../models/feedModel');
const Medicine = require('../models/medicineModel');

/**
 * GET /api/analytics/supplier
 * Returns all analytics data for the logged-in supplier's dashboard
 */
async function getSupplierAnalytics(req, res) {
  try {
    const supplierId = req.user.userId;

    // ── Fetch supplier's feeds and medicines ──
    const feeds    = await Feed.find({ supplierId }).lean();
    const medicines = await Medicine.find({ supplierId }).lean();

    const feedIds     = feeds.map(f => f._id.toString());
    const medicineIds = medicines.map(m => m._id.toString());

    // ── Fetch all requests for this supplier's products ──
    const allRequests = await Request.find({ supplierId }).lean();

    const approvedRequests = allRequests.filter(r => r.status === 'Approved');
    const pendingRequests  = allRequests.filter(r => r.status === 'Pending');
    const rejectedRequests = allRequests.filter(r => r.status === 'Rejected');

    // ─────────────────────────────────────────────────────
    // FR-4: SALES ANALYTICS
    // ─────────────────────────────────────────────────────

    // Total revenue = sum of (quantity * pricePerUnit) for approved requests
    let totalRevenue = 0;
    approvedRequests.forEach(req => {
      // Find matching item
      const item = req.itemType === 'Feed'
        ? feeds.find(f => f._id.toString() === req.itemId?.toString())
        : medicines.find(m => m._id.toString() === req.itemId?.toString());
      const price = item?.pricePerUnit || 0;
      totalRevenue += req.quantity * price;
    });
    totalRevenue = Math.round(totalRevenue * 100) / 100;

    // Conversion rate = approved / total * 100
    const totalOrders     = allRequests.length;
    const approvedCount   = approvedRequests.length;
    const pendingCount    = pendingRequests.length;
    const rejectedCount   = rejectedRequests.length;
    const conversionRate  = totalOrders > 0
      ? Math.round((approvedCount / totalOrders) * 100)
      : 0;

    // Orders per month (last 6 months)
    const monthlyOrdersMap = {};
    allRequests.forEach(req => {
      const date  = new Date(req.requestDate || req.createdAt);
      const key   = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      if (!monthlyOrdersMap[key]) monthlyOrdersMap[key] = { key, label, total: 0, approved: 0, revenue: 0 };
      monthlyOrdersMap[key].total += 1;
      if (req.status === 'Approved') {
        monthlyOrdersMap[key].approved += 1;
        const item = req.itemType === 'Feed'
          ? feeds.find(f => f._id.toString() === req.itemId?.toString())
          : medicines.find(m => m._id.toString() === req.itemId?.toString());
        monthlyOrdersMap[key].revenue += req.quantity * (item?.pricePerUnit || 0);
      }
    });

    const monthlyOrders = Object.values(monthlyOrdersMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6)
      .map(m => ({ ...m, revenue: Math.round(m.revenue * 100) / 100 }));

    // ─────────────────────────────────────────────────────
    // FR-5: TOP PRODUCTS
    // ─────────────────────────────────────────────────────

    // Best-selling products by quantity sold (approved only)
    const productSalesMap = {};
    approvedRequests.forEach(req => {
      const key  = req.itemId?.toString();
      const name = req.itemName || 'Unknown';
      const type = req.itemType;
      const item = type === 'Feed'
        ? feeds.find(f => f._id.toString() === key)
        : medicines.find(m => m._id.toString() === key);
      const price = item?.pricePerUnit || 0;
      if (!productSalesMap[key]) {
        productSalesMap[key] = { name, type, totalQuantity: 0, totalRevenue: 0, orderCount: 0 };
      }
      productSalesMap[key].totalQuantity += req.quantity;
      productSalesMap[key].totalRevenue  += req.quantity * price;
      productSalesMap[key].orderCount    += 1;
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 6)
      .map(p => ({ ...p, totalRevenue: Math.round(p.totalRevenue * 100) / 100 }));

    // Feed vs Medicine revenue split
    let feedRevenue = 0, medicineRevenue = 0;
    approvedRequests.forEach(req => {
      const item = req.itemType === 'Feed'
        ? feeds.find(f => f._id.toString() === req.itemId?.toString())
        : medicines.find(m => m._id.toString() === req.itemId?.toString());
      const amount = req.quantity * (item?.pricePerUnit || 0);
      if (req.itemType === 'Feed') feedRevenue += amount;
      else medicineRevenue += amount;
    });

    // ─────────────────────────────────────────────────────
    // FR-6: DEMAND HEATMAP (by location & category)
    // ─────────────────────────────────────────────────────

    // Demand by product category (type)
    const categoryDemandMap = {};
    allRequests.forEach(req => {
      // Get item type category
      const item = req.itemType === 'Feed'
        ? feeds.find(f => f._id.toString() === req.itemId?.toString())
        : medicines.find(m => m._id.toString() === req.itemId?.toString());
      const category = item?.type || req.itemType || 'Unknown';
      if (!categoryDemandMap[category]) categoryDemandMap[category] = { category, totalRequests: 0, totalQuantity: 0, approved: 0 };
      categoryDemandMap[category].totalRequests += 1;
      categoryDemandMap[category].totalQuantity += req.quantity;
      if (req.status === 'Approved') categoryDemandMap[category].approved += 1;
    });
    const demandByCategory = Object.values(categoryDemandMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity);

    // Demand by livestock (shows which livestock types need the most supplies)
    const livestockDemandMap = {};
    allRequests.forEach(req => {
      const name = req.livestockName || 'Unknown';
      if (!livestockDemandMap[name]) livestockDemandMap[name] = { livestock: name, totalRequests: 0, totalQuantity: 0 };
      livestockDemandMap[name].totalRequests += 1;
      livestockDemandMap[name].totalQuantity += req.quantity;
    });
    const demandByLivestock = Object.values(livestockDemandMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 8);

    // Weekly order trend (last 4 weeks)
    const now = new Date();
    const weeklyMap = {};
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - w * 7 - now.getDay());
      const label = `W${4 - w}`;
      weeklyMap[label] = { label, count: 0 };
    }
    allRequests.forEach(req => {
      const date = new Date(req.requestDate || req.createdAt);
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (diffDays <= 28) {
        const weekLabel = `W${4 - Math.floor(diffDays / 7)}`;
        if (weeklyMap[weekLabel]) weeklyMap[weekLabel].count += 1;
      }
    });
    const weeklyOrders = Object.values(weeklyMap);

    // ── Inventory Summary ──
    const totalFeedItems     = feeds.length;
    const totalMedItems      = medicines.length;
    const lowStockFeeds      = feeds.filter(f => f.availableUnits <= 10 && f.availableUnits > 0).length;
    const outOfStockFeeds    = feeds.filter(f => f.availableUnits === 0).length;
    const lowStockMeds       = medicines.filter(m => m.availableUnits <= 10 && m.availableUnits > 0).length;
    const outOfStockMeds     = medicines.filter(m => m.availableUnits === 0).length;
    const expiringMeds       = medicines.filter(m => {
      const diff = new Date(m.expiryDate) - now;
      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
    }).length;

    return res.status(200).json({
      // KPIs
      summary: {
        totalRevenue,
        totalOrders,
        approvedCount,
        pendingCount,
        rejectedCount,
        conversionRate,
        totalFeedItems,
        totalMedItems,
        lowStockFeeds,
        outOfStockFeeds,
        lowStockMeds,
        outOfStockMeds,
        expiringMeds,
        feedRevenue:     Math.round(feedRevenue * 100) / 100,
        medicineRevenue: Math.round(medicineRevenue * 100) / 100,
      },
      // FR-4
      monthlyOrders,
      weeklyOrders,
      // FR-5
      topProducts,
      // FR-6
      demandByCategory,
      demandByLivestock,
    });

  } catch (err) {
    console.error('Supplier analytics error:', err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { getSupplierAnalytics };