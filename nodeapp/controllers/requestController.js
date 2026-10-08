const Request = require('../models/requestModel.js');
const Feed = require('../models/feedModel');
const Medicine = require('../models/medicineModel');

async function getAllRequestsBySupplier(req, res) {
  try {
    const supplierId = req.user.userId;

    console.log("supplierId from token:", supplierId);
    console.log("supplierId type:", typeof supplierId);

    // Check ALL requests in DB to see what's there
    const allRequests = await Request.find({});
    console.log("Total requests in DB:", allRequests.length);
    console.log("All supplierIds in DB:", allRequests.map(r => r.supplierId?.toString()));
    console.log("Looking for supplierId:", supplierId?.toString());

    const requests = await Request.find({ supplierId })
      .populate('itemId')
      .populate('ownerId', 'userName email');

    console.log("requests found:", requests.length);

    return res.status(200).json(requests);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getRequestsByOwnerId(req, res) {
  try {
    const ownerId = req.user.userId;
    const requests = await Request.find({ ownerId })
      .populate('itemId');
    console.log('Requests for owner:', requests.map(r => ({
      _id: r._id,
      itemName: r.itemName,
      status: r.status,
      comment: r.comment,
      commentLength: r.comment ? r.comment.length : 0
    })));
    return res.status(200).json(requests);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// BACKEND: controllers/requestController.js - UPDATE addRequest
async function addRequest(req, res) {
  try {
    const { itemType, itemId, itemName, livestockName, quantity } = req.body;
    const ownerId = req.user.userId;

    let item;
    if (itemType === 'Feed') {
      item = await Feed.findById(itemId);
    } else if (itemType === 'Medicine') {
      item = await Medicine.findById(itemId);
    }

    if (!item) {
      return res.status(404).json({ message: `${itemType} not found` });
    }

    if (item.availableUnits < quantity) {
      return res.status(400).json({
        message: `Insufficient units available. Only ${item.availableUnits} units available.`
      });
    }

    // Grab supplierId from the item itself
    const supplierId = item.supplierId; // ← pull from the feed/medicine document

    const request = await Request.create({
      itemType,
      itemId,
      itemName,
      ownerId,
      supplierId,  // ← store it
      livestockName,
      quantity
    });

    return res.status(200).json({ message: 'Request Created Successfully', request });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function updateRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const request = await Request.findById(id).populate('itemId');
    
    if (!request) {
      return res.status(404).json({ message: `Cannot find any request with ID ${id}` });
    }

    if (status === 'Approved' && request.status === 'Pending') {
      const Model = request.itemType === 'Feed' ? Feed : Medicine;
      const item = await Model.findById(request.itemId);
      
      if (item.availableUnits < request.quantity) {
        return res.status(400).json({ 
          message: `Insufficient units available. Only ${item.availableUnits} units available.` 
        });
      }
      
      item.availableUnits -= request.quantity;
      await item.save();
    }

    request.status = status;
    request.comment = comment || '';
    await request.save();

    return res.status(200).json({ message: 'Request Status Updated Successfully', request });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function deleteRequest(req, res) {
  try {
    const { id } = req.params;
    const request = await Request.findByIdAndDelete(id);

    if (!request) {
      return res.status(404).json({ message: `Cannot find any request with ID ${id}` });
    }

    return res.status(200).json({ message: 'Request Deleted Successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAllRequestsBySupplier,
  getRequestsByOwnerId,
  addRequest,
  updateRequestStatus,
  deleteRequest
};