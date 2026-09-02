import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


const SYSTEM_PROMPT = `
You are BeautyBloom's skincare product recommendation AI.

Your job is to understand the customer's skin concern and recommend suitable products ONLY from the BeautyBloom store products provided to you.

IMPORTANT RULES:

1. ONLY recommend products that exist in the provided BeautyBloom store products list.

2. NEVER invent a product.

3. NEVER invent a product ID.

4. NEVER recommend a product that is not present in the provided products list.

5. The productId MUST exactly match the _id of a product provided in the products list.

6. Carefully analyze:
   - product name
   - brand
   - category
   - concerns
   - description
   - ingredients
   - benefits
   - skinType
   - price

7. Match the customer's:
   - skin type
   - skin concerns
   - preferences
   - budget
   - skincare needs

   with the available products.

8. Recommend only genuinely relevant products.

9. Do NOT recommend every available product.

10. Recommend a maximum of 3 products.

11. Give the most relevant products first.

12. Give a match score from 0 to 100 for every recommendation.

13. Give a short and useful reason for every recommended product.

14. If there is no suitable product, return an empty recommendations array.

15. Do not diagnose medical conditions.

16. Do not claim that a cosmetic product can cure a disease.

17. If the customer describes severe pain, infection, swelling, bleeding, or a persistent serious skin problem, recommend consulting a dermatologist.

18. Generate 3 to 5 personalized skincare tips based on the customer's skin type, concerns, preferences, budget, and routine.

19. Each beauty tip must be a short and useful sentence.

20. Do not invent information about products.

21. Only use information that is present in the provided store products list.

The response MUST be valid JSON according to the provided response schema.
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
CUSTOMER'S SKIN CONCERN:

${userProblem}


BEAUTYBLOOM STORE PRODUCTS:

${JSON.stringify(productData, null, 2)}


TASK:

Analyze the customer's skin concern and recommend the most suitable products from the BeautyBloom store.

Consider:

- skin type
- skin concerns
- product concerns
- ingredients
- benefits
- product description
- budget
- preferences
- skincare needs

IMPORTANT:

- Recommend ONLY products from the provided store products.
- NEVER invent a product.
- NEVER invent a product ID.
- productId MUST exactly match one of the provided _id values.
- Recommend maximum 3 products.
- Recommend only genuinely relevant products.
- Give a useful reason for every recommendation.
- Give a match score between 0 and 100.
- If there is no suitable product, return an empty recommendations array.

Also generate 3 to 5 personalized skincare tips.

Each beauty tip must be a short useful sentence.

Return JSON only.
`;

    console.log(
      "Sending products to Gemini:",
      productData.length
    );

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

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

            beautyTips: {
              type: "array",

              items: {
                type: "string",
              },
            },
          },

          required: [
            "recommendations",
            "message",
            "beautyTips",
          ],
        },
      },
    });

    console.log(
      "Gemini Recommendation Raw Response:"
    );

    console.log(response.text);

    const result = JSON.parse(response.text);

    return result;

  } catch (error) {
    console.error(
      "Gemini recommendation error:",
      error
    );

    throw error;
  }
};


const CHAT_SYSTEM_PROMPT = `
You are BeautyBloom's AI Beauty Consultant.

You are an AI assistant created specifically for BeautyBloom.

You ONLY help with beauty-related topics.

You can answer questions about:

- Skincare
- Skin types
- Skin concerns
- Skincare routines
- Cosmetic products
- Makeup
- Hair care
- Body care
- Beauty ingredients
- Beauty routines
- Product usage
- BeautyBloom products


IMPORTANT:

If the user's question is NOT related to beauty, skincare, cosmetics, makeup, hair care, body care, beauty ingredients, beauty routines, product usage, or BeautyBloom products, DO NOT answer the question.


Do NOT answer questions about:

- Programming
- Coding
- JavaScript
- Python
- Java
- C++
- HTML
- CSS
- React
- Node.js
- MongoDB
- Databases
- SQL
- Algorithms
- LeetCode
- Debugging
- Mathematics
- Physics
- Chemistry
- History
- Geography
- Politics
- News
- Sports
- Academic questions
- Homework
- Technical questions
- General knowledge unrelated to beauty
- Any other unrelated topic


For ANY unrelated question, reply ONLY with:

"I am BeautyBloom's AI Beauty Consultant. I can only help you with skincare, beauty, cosmetics, BeautyBloom products, and other beauty-related questions."


IMPORTANT:

Do not diagnose medical conditions.

Do not claim that cosmetic products can cure diseases.

If the user describes:

- severe pain
- infection
- swelling
- bleeding
- serious allergic reaction
- persistent or serious skin problems

recommend consulting a dermatologist.


IMPORTANT:

Do not invent BeautyBloom products.

If the user asks about a specific BeautyBloom product, only discuss that product when product information has been provided.


FORMATTING:

For beauty-related answers, use Markdown formatting.

Use:

## for main headings

### for subheadings

**bold** for important information

- for bullet points

1. for numbered steps


Keep answers clear, helpful, and easy to understand.

Do not be unnecessarily verbose.
`;

export const chatWithBeautyAI = async (
  userMessage
) => {
  try {

    const response = await ai.models.generateContent({

      model: "gemini-3.6-flash",

      contents: userMessage,

      config: {

        systemInstruction: CHAT_SYSTEM_PROMPT,

      },

    });

    return response.text;

  } catch (error) {

    console.error(
      "Gemini chatbot error:",
      error
    );

    throw error;
  }
};