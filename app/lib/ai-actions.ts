"use server";

import crypto from "crypto";
import { getCurrentUserId } from "./auth";

/**
 * 任务 7.1: Create getAISuggestions Server Action using Tencent Hunyuan
 * 生成针对任务标题和描述的 AI 建议 (使用腾讯元宝)
 */
export async function getAISuggestions(
  title: string,
  description?: string
) {
  // Task 7.2: Implement authentication check
  await getCurrentUserId();

  if (!title.trim()) {
    throw new Error("Title is required for AI suggestions");
  }

  const prompt = `You are a task management assistant. Based on the following task title and description, suggest:
1. A priority level (LOW, MEDIUM, or HIGH)
2. A suggested due date (in YYYY-MM-DD format, or null if not applicable)
3. Brief reasoning for your suggestions

Task Title: ${title}
${description ? `Task Description: ${description}` : ""}

Respond in JSON format like this:
{
  "priority": "MEDIUM",
  "dueDate": "2025-04-15",
  "reasoning": "This task seems moderately important and could be completed within the next week."
}

IMPORTANT: Return ONLY valid JSON, no additional text.`;
  console.log("Tencent Hunyuan API configured:", !!(process.env.TENCENT_SECRET_ID && process.env.TENCENT_SECRET_KEY));
  
  try {
    // Call Tencent Hunyuan API via HTTP
    const secretId = process.env.TENCENT_SECRET_ID || "";
    const secretKey = process.env.TENCENT_SECRET_KEY || "";
    
    if (!secretId || !secretKey) {
      throw new Error("Tencent Cloud credentials not configured");
    }

    const response = await callHunyuanAPI(prompt, secretId, secretKey);
    
    // Convert to ReadableStream for client-side consumption
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(response));
        controller.close();
      },
    });
  } catch (error) {
    console.error("Tencent Hunyuan API Error:", error);
    // Provide graceful fallback
    const fallbackResponse = JSON.stringify({
      priority: "MEDIUM",
      dueDate: null,
      reasoning: "AI service temporarily unavailable. Using default suggestions.",
    });
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(fallbackResponse));
        controller.close();
      },
    });
  }
}

/**
 * Call Tencent Hunyuan API with TC3-HMAC-SHA256 authentication
 */
async function callHunyuanAPI(
  prompt: string,
  secretId: string,
  secretKey: string
): Promise<string> {
  const host = "hunyuan.tencentcloudapi.com";
  const service = "hunyuan";
  const action = "ChatPro";
  const version = "2023-09-01";
  const algorithm = "TC3-HMAC-SHA256";
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().split("T")[0];

  // Request body - ChatPro 不需要 Model 参数
  const payload = {
    Messages: [
      {
        Role: "user",
        Content: prompt,
      },
    ],
  };

  const payloadStr = JSON.stringify(payload);
  const payloadHash = crypto
    .createHash("sha256")
    .update(payloadStr)
    .digest("hex");

  // CanonicalRequest
  const httpRequestMethod = "POST";
  const canonicalUri = "/";
  const canonicalQueryString = "";
  const canonicalHeaders = `content-type:application/json\nhost:${host}\n`;
  const signedHeaders = "content-type;host";

  const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // StringToSign
  const canonicalRequestHash = crypto
    .createHash("sha256")
    .update(canonicalRequest)
    .digest("hex");

  const credentialScope = `${date}/${service}/tc3_request`;
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${canonicalRequestHash}`;

  // Signature
  const secretDate = crypto
    .createHmac("sha256", `TC3${secretKey}`)
    .update(date)
    .digest();
  const secretService = crypto
    .createHmac("sha256", secretDate)
    .update(service)
    .digest();
  const secretSigning = crypto
    .createHmac("sha256", secretService)
    .update("tc3_request")
    .digest();
  const signature = crypto
    .createHmac("sha256", secretSigning)
    .update(stringToSign)
    .digest("hex");

  // Authorization header
  const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  // Make the API call
  const response = await fetch(`https://${host}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Host": host,
      "Authorization": authorization,
      "X-TC-Action": action,
      "X-TC-Timestamp": String(timestamp),
      "X-TC-Version": version,
    },
    body: payloadStr,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `Hunyuan API error: ${response.status} ${response.statusText}`,
      errorText
    );
    throw new Error(
      `Hunyuan API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  
  // Handle Response wrapper from Tencent API  
  const actualData = data.Response || data;
  
  // Check for API errors in response
  if (actualData.Error) {
    const errorCode = actualData.Error.Code;
    const errorMsg = actualData.Error.Message;
    console.error("Hunyuan API Error Response:", actualData.Error);
    
    // Provide helpful error messages
    if (errorCode === "AuthFailure.UnauthorizedOperation") {
      throw new Error(
        `Permission denied. Please check: 1) Sub-account has ChatPro permission 2) API key is active 3) Check CAM policies`
      );
    }
    if (errorCode.includes("UnknownParameter")) {
      throw new Error(
        `API parameter error: ${errorMsg}. This may be an API version issue.`
      );
    }
    throw new Error(`Hunyuan API Error: ${errorMsg}`);
  }
  
  // Extract response text
  const responseText = actualData.Choices?.[0]?.Message?.Content || 
    actualData.Choices?.[0]?.Delta?.Content || 
    "";
  
  if (!responseText) {
    console.warn("Empty response from Hunyuan API:", JSON.stringify(actualData).substring(0, 200));
  }
  
  return responseText;
}
