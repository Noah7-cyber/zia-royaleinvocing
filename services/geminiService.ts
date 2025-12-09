import { GoogleGenAI } from "@google/genai";
import { Invoice, InvoiceStatus } from "../types";

export const analyzeBusinessHealth = async (invoices: Invoice[]): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "API Key is missing. Please check your environment configuration.";
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare data summary for the AI
  const totalRevenue = invoices
    .filter(i => i.status === InvoiceStatus.PAID)
    .reduce((sum, i) => sum + i.total, 0);
  
  const pendingAmount = invoices
    .filter(i => i.status === InvoiceStatus.PENDING || i.status === InvoiceStatus.DRAFT)
    .reduce((sum, i) => sum + i.total, 0);

  const monthlyData = invoices.reduce((acc, inv) => {
    const month = new Date(inv.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) acc[month] = 0;
    acc[month] += inv.total;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
    You are a senior financial analyst for a boutique business named "Zia's Royalle".
    Analyze the following financial data and provide a concise, encouraging, and strategic summary (max 3 sentences).
    
    Data:
    - Total Paid Revenue: ${totalRevenue}
    - Outstanding/Pending: ${pendingAmount}
    - Monthly Trend: ${JSON.stringify(monthlyData)}
    - Total Invoices: ${invoices.length}

    Focus on cash flow and growth. Use a professional but warm tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return "Unable to generate insights at this time. Please check your network connection.";
  }
};