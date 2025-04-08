const User = require("../../models/userSchema");

const customerInfo = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    const limit = 10;
    const userData = await User.find({
      isAdmin: false,
      $or: [
        { name: { $regex: ".*" + search + ".*" } },
        { email: { $regex: ".*" + search + ".*" } },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.find({
      isAdmin: false,
      $or: [
        { name: { $regex: ".*" + search + ".*" } },
        { email: { $regex: ".*" + search + ".*" } },
      ],
    }).countDocuments();

    res.render("customers", {
      data: userData,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {}
};

const blockUser = async (req, res) => {
  try {
    
    const { userId } = req.body;
    
    await User.updateOne({ _id: userId }, { $set: { isBlocked: true } });
    
    res.json({ success: true, message: "User blocked successfully" });
    
  } catch (error) {

    res.json({ success: false, message: error });
  }
};

const unblockUser = async (req, res) => {
  try {
    
    const { userId } = req.body;

    await User.updateOne({ _id: userId }, { $set: { isBlocked: false } });
   
    res.json({ success: true, message: "User unblocked successfully" });
  }
   catch (error) {

    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  customerInfo,
  blockUser,
  unblockUser,
};
