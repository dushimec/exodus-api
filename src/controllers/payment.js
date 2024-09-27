import User from "../models/user.js";
import Payment from "../models/payment.js";
import Post from "../models/post.js";

// payment
const makePayment = async (req, res) => {
  try {
    const userId = req.user.userId;

    const postId = req.params.postId;

    const { amount } = req.body;

    const post = await Post.findById(postId);
    
    const user = await User.findById(userId);

    if (!user || !post) {
      return res.status(404).json({ error: "User or Post not found" });
    }

    const payment = new Payment({ user: userId, post: postId, amount });
    await payment.save();

    user.payments.push(payment._id)
    user.save()

    post.payments.push(payment._id)
    post.save()

    res.status(201).json({ payment });
  } catch (error) {}
};

// Total ammounrt paid
const getTotalAmountPaid = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate("payments");
    const paymentDetails = await Payment.find({user: userId}).populate({
      path:"post",
      select: "title"
      
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const totalAmountPaid = user.payments.reduce(
      (total, payment) => total + payment.amount,
      0
    );
      const formattedPayments = paymentDetails.map((payment) =>({
        postTitle: payment.post.title,
        username: user.username,
        amountPaid: payment.amount,
      }));
      res.status(200).json({paymentDetails:formattedPayments, totalAmountPaid})
  } catch (error) {
    console.log("Error Calculating total amount paid", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getTotalAndRemainingAmount = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required" });
    }

    const totalAmountResult = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalAmountPaid: { $sum: "$amount" },
        },
      },
    ]);

    const totalAmountPaid = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmountPaid : 0;


    const paidPosts = await Payment.find().populate("post", "title");


    const formattedPaidPosts = paidPosts.map((payment) => ({
      postTitle: payment.post.title,
      amountPaid: payment.amount,
    }));

    res.status(200).json({
      totalAmountPaid,
      paidPosts: formattedPaidPosts,
    });
  } catch (error) {
    console.log("Error calculating total amount paid", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export { makePayment, getTotalAmountPaid, getTotalAndRemainingAmount };
