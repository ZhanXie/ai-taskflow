// Simple test for AI suggestions flow
const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

async function testAISuggestionsFlow() {
  console.log("🧪 Testing AI Suggestions Flow");
  console.log("=====================================\n");

  // Simulate the API call that getAISuggestions makes
  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;

  if (!secretId || !secretKey) {
    console.error("❌ Credentials not configured");
    return false;
  }

  try {
    const host = "hunyuan.tencentcloudapi.com";
    const service = "hunyuan";
    const action = "ChatPro";
    const version = "2023-09-01";
    const algorithm = "TC3-HMAC-SHA256";
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().split("T")[0];

    // Simulate the actual prompt
    const prompt = `You are a task management assistant. Based on the following task title and description, suggest:
1. A priority level (LOW, MEDIUM, or HIGH)
2. A suggested due date (in YYYY-MM-DD format, or null if not applicable)
3. Brief reasoning for your suggestions

Task Title: Complete project report
Task Description: Write the final quarterly report

Respond in JSON format like this:
{
  "priority": "MEDIUM",
  "dueDate": "2025-04-15",
  "reasoning": "This task seems moderately important and could be completed within the next week."
}

IMPORTANT: Return ONLY valid JSON, no additional text.`;

    const payload = {
      Messages: [
        {
          Role: "user",
          Content: prompt,
        },
      ],
      Stream: false,
    };

    const payloadStr = JSON.stringify(payload);
    const payloadHash = crypto
      .createHash("sha256")
      .update(payloadStr)
      .digest("hex");

    const httpRequestMethod = "POST";
    const canonicalUri = "/";
    const canonicalQueryString = "";
    const canonicalHeaders = `content-type:application/json\nhost:${host}\n`;
    const signedHeaders = "content-type;host";

    const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const canonicalRequestHash = crypto
      .createHash("sha256")
      .update(canonicalRequest)
      .digest("hex");

    const credentialScope = `${date}/${service}/tc3_request`;
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${canonicalRequestHash}`;

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

    const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    console.log("1️⃣ Making API call...");
    const response = await fetch(`https://${host}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: host,
        Authorization: authorization,
        "X-TC-Action": action,
        "X-TC-Timestamp": String(timestamp),
        "X-TC-Version": version,
      },
      body: payloadStr,
    });

    if (!response.ok) {
      console.error(`❌ API request failed: ${response.status}`);
      return false;
    }

    console.log("✅ Got API response\n");

    const rawResponseText = await response.text();
    let data;

    try {
      data = JSON.parse(rawResponseText);
    } catch (e) {
      console.error("❌ Failed to parse response as JSON");
      return false;
    }

    const actualData = data.Response || data;

    if (actualData.Error) {
      console.error(`❌ API error: ${actualData.Error.Message}`);
      return false;
    }

    // Extract response text (same logic as in ai-actions.ts)
    const responseTextFromAPI =
      actualData.Choices?.[0]?.Message?.Content ||
      actualData.Choices?.[0]?.Delta?.Content ||
      "";

    if (!responseTextFromAPI) {
      console.error("❌ No content in API response");
      console.error(`Response: ${JSON.stringify(actualData)}`);
      return false;
    }

    console.log("2️⃣ API returned content:");
    console.log(`   ${responseTextFromAPI}\n`);

    // Now test parsing (same logic as parseAISuggestions in ai-utils.ts)
    console.log("3️⃣ Parsing AI suggestions...");
    try {
      const jsonMatch = responseTextFromAPI.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("❌ No JSON found in response");
        return false;
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      if (
        !parsed.priority ||
        !["LOW", "MEDIUM", "HIGH"].includes(parsed.priority)
      ) {
        console.error("❌ Invalid priority in response");
        return false;
      }

      console.log("✅ Successfully parsed AI suggestions:");
      console.log(`   Priority: ${parsed.priority}`);
      console.log(`   Due Date: ${parsed.dueDate || "(none)"}`);
      console.log(`   Reasoning: ${parsed.reasoning}\n`);

      return true;
    } catch (parseError) {
      console.error(`❌ Failed to parse suggestions: ${parseError.message}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    return false;
  }
}

testAISuggestionsFlow().then((success) => {
  if (success) {
    console.log("✅ All tests passed!");
  }
  process.exit(success ? 0 : 1);
});
