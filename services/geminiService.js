import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `
You are a skincare product recommendation assistant for a cosmetic e-commerce store.

Your job is to understand the user's skin concern and recommend suitable products ONLY from the products provided by the store.

IMPORTANT RULES:

1. ONLY recommend products that exist in the provided store products list.
2. NEVER invent a product.
3. NEVER invent a product ID.
4. NEVER recommend products that are not present in the store list.
5. Carefully analyze:
   - product name
   - brand
   - category
   - concerns
   - description
   - ingredients
   - benefits
   - skinType
6. Match the user's concern with the product's concerns, benefits, ingredients and skin type.
7. Give the most relevant products first.
8. If no product is suitable, return an empty recommendations array.
9. Do not diagnose a medical condition.
10. If the user describes a serious skin condition, severe pain, infection, swelling, bleeding, or persistent symptoms, recommend consulting a dermatologist.
11. Do not claim that a cosmetic product can cure a disease.
12. Give a short and simple explanation for why each recommended product matches the user's concern.
13. Only recommend products that are relevant to the user's concern.
14. Do not recommend every product just because it is available.
15. The productId must exactly match the _id provided in the store product list.

The response MUST be valid JSON in the requested format.
`;

export const getSkinRecommendations = async (
  userProblem,
  products
) => {
  try {
    const productData = products.map((product) => ({
      _id: product._id.toString(),
      name: product.name,
      brand: product.brand,
      price: product.price,
      category: product.category,
      concerns: product.concerns || [],
      description: product.description || "",
      ingredients: product.ingredients || [],
      benefits: product.benefits || [],
      skinType: product.skinType || [],
      image: product.image || "",
    }));

    const prompt = `
USER SKIN CONCERN:

${userProblem}

AVAILABLE STORE PRODUCTS:

${JSON.stringify(productData, null, 2)}

Analyze the user's concern and select only the most relevant products from the available store products.

Return recommendations with:
- exact productId
- product name
- reason why it matches
- match score from 0 to 100

If there is no suitable product, return an empty recommendations array.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,

      config: {
        systemInstruction: SYSTEM_PROMPT,

        responseMimeType: "application/json",

        responseSchema: {
          type: "object",

          properties: {
            recommendations: {
              type: "array",

              items: {
                type: "object",

                properties: {
                  productId: {
                    type: "string",
                  },

                  productName: {
                    type: "string",
                  },

                  reason: {
                    type: "string",
                  },

                  matchScore: {
                    type: "integer",
                  },
                },

                required: [
                  "productId",
                  "productName",
                  "reason",
                  "matchScore",
                ],
              },
            },

            message: {
              type: "string",
            },
          },

          required: [
            "recommendations",
            "message",
          ],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    throw error;
  }
};
export const chatWithBeautyAI = async (userMessage) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: userMessage,

      config: {
        systemInstruction: `
You are BeautyBloom's AI Beauty Consultant.

You help users with skincare, beauty routines, cosmetic products, and general beauty questions.

Rules:
1. Give simple and helpful answers.
2. Do not diagnose medical conditions.
3. Do not claim cosmetic products can cure diseases.
4. If the user describes severe pain, infection, swelling, bleeding, or persistent skin problems, recommend consulting a dermatologist.
5. Keep answers concise and easy to understand.
6. Do not invent BeautyBloom products.
7. If the user asks about specific BeautyBloom products, only discuss products when product information is provided.
`,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini chatbot error:", error);
    throw error;
  }
};