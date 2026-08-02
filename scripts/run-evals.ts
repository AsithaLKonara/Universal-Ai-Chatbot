import fs from "fs";
import path from "path";
import { groq } from "../src/lib/groq";
import { assembleSystemPrompt } from "../src/lib/prompts";
import { EvalService } from "../src/lib/intelligence/evaluator";

const DATASET_PATH = path.join(__dirname, "golden_dataset.json");
const REQUIRED_AVERAGE_SCORE = 0.85;

async function runEvaluations() {
    console.log("🚀 Starting Automated Prompt Regression Suite...");
    
    if (!process.env.GROQ_API_KEY) {
        console.warn("⚠️ GROQ_API_KEY not found. Skipping live LLM regression test.");
        process.exit(0);
    }

    const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, "utf-8"));
    console.log(`Loaded ${dataset.length} test cases.\n`);

    const systemPrompt = assembleSystemPrompt({ channel: "web" });
    
    let totalScore = 0;
    let failCount = 0;

    for (const testCase of dataset) {
        console.log(`Testing [${testCase.id}]: ${testCase.description}`);
        console.log(`Input: "${testCase.input}"`);

        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: testCase.input }
                ],
                max_completion_tokens: 150,
                temperature: 0.1
            });

            const responseText = completion.choices[0]?.message?.content || "";
            
            // Score the response
            const score = await EvalService.evaluateResponse(
                testCase.input, 
                responseText, 
                testCase.expectedIntent
            );

            // A basic composite score logic
            const composite = (score.goalAlignment + (1 - score.hallucinationRisk) + score.safety) / 3;
            totalScore += composite;

            console.log(`↳ Score: ${(composite * 100).toFixed(1)}% | Goal: ${score.goalAlignment} | Hallucination Risk: ${score.hallucinationRisk}`);
            
            if (composite < 0.6) {
                console.error(`❌ FAILED. Response: ${responseText}\n`);
                failCount++;
            } else {
                console.log(`✅ PASSED.\n`);
            }
        } catch (err) {
            console.error(`❌ ERROR testing ${testCase.id}:`, err);
            failCount++;
        }
    }

    const avgScore = totalScore / dataset.length;
    console.log(`\n======================================`);
    console.log(`Final Average Score: ${(avgScore * 100).toFixed(1)}%`);
    console.log(`Threshold Required:  ${(REQUIRED_AVERAGE_SCORE * 100).toFixed(1)}%`);
    console.log(`Failed Cases:        ${failCount} / ${dataset.length}`);
    console.log(`======================================`);

    if (avgScore < REQUIRED_AVERAGE_SCORE || failCount > 0) {
        console.error("\n❌ REGRESSION DETECTED: AI quality fell below acceptable thresholds.");
        process.exit(1);
    } else {
        console.log("\n🎉 ALL TESTS PASSED: Prompt and model logic are stable.");
        process.exit(0);
    }
}

runEvaluations().catch(err => {
    console.error("Fatal evaluation error:", err);
    process.exit(1);
});
