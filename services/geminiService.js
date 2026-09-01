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

You help users with:
- skincare
- skincare routines
- skin types
- beauty routines
- cosmetic products
- ingredients
- general beauty questions

Your goal is to give helpful, clear, natural and moderately detailed answers.

IMPORTANT RULES:

1. Answer the user's question directly.

2. Do not give extremely short answers when the user is asking for an explanation.

3. Give enough detail so the user can understand what to do and why.

4. When explaining a skincare routine, structure the answer clearly.

5. For skincare routine questions, when appropriate use sections such as:

Morning Routine
1. Cleanser
2. Serum
3. Moisturizer
4. Sunscreen

Evening Routine
1. Cleanser
2. Treatment
3. Moisturizer

6. Explain the purpose of important steps briefly.

7. Use bullet points or numbered lists when they make the answer easier to read.

8. Use Markdown formatting:
- headings with #
- bold text with **
- bullet points with -
- numbered lists with 1., 2., 3.

9. Keep the language simple and easy to understand.

10. For normal questions, give a moderate answer rather than only one or two sentences.

11. For questions that require explanation, normally provide around 250-400 words.

12. Do not unnecessarily repeat information.

13. Do not diagnose medical conditions.

14. Do not claim cosmetic products can cure diseases.

15. If the user describes severe pain, infection, swelling, bleeding, or persistent skin problems, recommend consulting a dermatologist.

16. Do not invent BeautyBloom products.

17. If the user asks about a specific BeautyBloom product, only discuss it if product information has been provided.

18. Do not recommend a specific BeautyBloom product unless its information is available.

19. Give practical skincare tips when relevant.

20. If the question is simple, you can give a shorter answer. Do not force every answer to be 250-400 words.

Your answers should feel like a helpful professional beauty consultant, not like a generic AI response.
        `,

        // Controls how much text Gemini can generate
        maxOutputTokens: 800,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini chatbot error:", error);
    throw error;
  }
};