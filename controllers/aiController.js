import Product from "../models/Product.js";
import { getSkinRecommendations, chatWithBeautyAI } from "../services/geminiService.js";

export const recommendProducts = async (req, res) => {
  try {
    const { skinProblem } = req.body;

    if (!skinProblem || !skinProblem.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please describe your skin problem.",
      });
    }

    const products = await Product.find({
      category: "Skincare",
    }).lean();

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No skincare products are available.",
      });
    }

    const aiResult = await getSkinRecommendations(
      skinProblem,
      products
    );

    const recommendedIds = aiResult.recommendations.map(
      (item) => item.productId
    );

    const recommendedProducts = products.filter((product) =>
      recommendedIds.includes(product._id.toString())
    );

    const finalRecommendations = recommendedProducts.map(
      (product) => {
        const aiRecommendation =
          aiResult.recommendations.find(
            (item) =>
              item.productId === product._id.toString()
          );

        return {
          ...product,

          reason: aiRecommendation?.reason || "",
          matchScore: aiRecommendation?.matchScore || 0,
        };
      }
    );

    finalRecommendations.sort(
      (a, b) => b.matchScore - a.matchScore
    );

    res.status(200).json({
      success: true,
      message: aiResult.message,
      recommendations: finalRecommendations,
    });
  } catch (error) {
    console.error("AI Controller Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations.",
      error: error.message,
    });
  }
};
export const beautyChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    const reply = await chatWithBeautyAI(message);

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("AI Chat Controller Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get AI response.",
    });
  }
};

