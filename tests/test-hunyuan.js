const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

async function testHunyuanAPI() {
  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;

  console.log("🔍 Tencent Hunyuan API 测试");
  console.log("================================\n");

  // 1. 检查凭证
  console.log("1️⃣ 检查凭证配置...");
  if (!secretId || !secretKey) {
    console.error(
      "❌ 错误：TENCENT_SECRET_ID 或 TENCENT_SECRET_KEY 未配置"
    );
    console.error("   请在 .env.local 中设置这些变量");
    return false;
  }
  console.log("✅ 凭证已配置");
  console.log(`   SecretId: ${secretId.substring(0, 10)}...`);
  console.log(`   SecretKey: ${secretKey.substring(0, 10)}...\n`);

  // 2. 测试API调用
  console.log("2️⃣ 测试 API 调用...");
  try {
    const host = "hunyuan.tencentcloudapi.com";
    const service = "hunyuan";
    const action = "ChatPro";
    const version = "2023-09-01";
    const algorithm = "TC3-HMAC-SHA256";
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().split("T")[0];

    // Request body - 尝试没有 Model 字段，禁用流式响应
    const payload = {
      Messages: [
        {
          Role: "user",
          Content: "Respond with ONLY a JSON object: {\"priority\": \"MEDIUM\", \"dueDate\": null, \"reasoning\": \"test\"}",
        },
      ],
      Stream: false,
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
    console.log(`   发送请求到：${host}`);
    console.log(`   时间戳：${timestamp}\n`);

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

    console.log(`   响应状态：${response.status} ${response.statusText}`);

    const responseText = await response.text();
    console.log(`   响应大小：${responseText.length} 字节\n`);

    if (!response.ok) {
      console.error(`❌ API 请求失败`);
      console.error(`   状态码：${response.status}`);
      console.error(`   响应内容：${responseText.substring(0, 300)}`);
      return false;
    }

    // Parse response - handle both JSON and SSE (Server-Sent Events) formats
    let data;
    try {
      // First try direct JSON parsing (standard response)
      data = JSON.parse(responseText);
    } catch (e) {
      // If that fails, try parsing as SSE format: "data: {...}" lines
      const lines = responseText.split("\n").filter((line) => line.trim());
      const dataLine = lines.find((line) => line.startsWith("data:"));
      
      if (dataLine) {
        const jsonStr = dataLine.substring(5).trim(); // Remove "data:" prefix
        data = JSON.parse(jsonStr);
      } else {
        console.error(`❌ 无法解析响应格式`);
        console.error(`   原始响应：${responseText.substring(0, 300)}`);
        return false;
      }
    }

    if (data.Error) {
      console.error(`❌ API 返回错误`);
      console.error(`   错误代码：${data.Error.Code}`);
      console.error(`   错误信息：${data.Error.Message}`);
      return false;
    }

    // 3. 检查响应格式
    console.log("3️⃣ 检查响应格式...");
    console.log(`   完整API响应结构：`);
    console.log(`   ${JSON.stringify(data, null, 2)}\n`);
    
    const responseContent =
      data.Choices?.[0]?.Message?.Content ||
      data.Choices?.[0]?.Delta?.Content ||
      data.Response?.Choices?.[0]?.Message?.Content ||
      data.Response?.Choices?.[0]?.Delta?.Content ||
      "";

    if (!responseContent) {
      console.error(`❌ 响应为空`);
      console.error(`   完整响应：${JSON.stringify(data).substring(0, 500)}`);
      return false;
    }

    console.log("✅ 响应内容正常");
    console.log(`   内容长度：${responseContent.length} 字符`);
    console.log(`   内容预览：${responseContent.substring(0, 200)}...\n`);

    // 4. 检查是否能解析JSON
    console.log("4️⃣ 尝试解析 JSON 响应...");
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("✅ JSON 解析成功");
        console.log(`   内容：${JSON.stringify(parsed)}\n`);
      } else {
        console.warn("⚠️ 响应中没有找到 JSON 对象");
        console.log(`   原始内容：${responseContent.substring(0, 100)}...\n`);
      }
    } catch (e) {
      console.warn("⚠️ JSON 解析失败");
      console.log(`   错误：${e}\n`);
    }

    console.log("✅ 所有测试通过！API 连接正常\n");
    return true;
  } catch (error) {
    console.error("❌ 测试失败：");
    console.error(error);
    return false;
  }
}

// 运行测试
testHunyuanAPI().then((success) => {
  process.exit(success ? 0 : 1);
});
