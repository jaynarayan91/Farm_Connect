const Feedback = require("../models/feedBackModel");

exports.addFeedback = async (req, res) => {
  try {
    const { requestId, itemName, itemType, livestock, title, description, rating } = req.body;

    const existingFeedback = await Feedback.findOne({ requestId, userId: req.user.userId });
    if (existingFeedback) {
      return res.status(400).json({ message: "Feedback already submitted" });
    }

    const feedback = new Feedback({
      userId: req.user.userId,
      requestId,
      itemName,
      itemType,
      livestock,
      title,
      description,
      rating,
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit feedback", error });
  }
};

exports.getFeedbackByItem = async (req, res) => {
  try {
    const { itemName } = req.params;
    const feedbacks = await Feedback.find({ itemName }).populate("userId", "userName");
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedbacks" });
  }
};

exports.getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.userId });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch my feedbacks" });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("userId", "userName");
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedbacks" });
  }
};
