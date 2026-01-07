import { examSimulator, summaryExam } from "../src/examSimulator.js";

describe("examSimulator", () => {
  it("returns one answer per question", () => {
    const exam = {
      questions: [
        {
          type: "multiple_choice",
          choices: [
            { text: "A", correct: true },
            { text: "B", correct: false },
          ],
        },
        {
          type: "true_false",
          answer: true,
        },
        {
          type: "numeric",
          answer: 5,
        },
        {
          type: "short_answer",
        },
        {
          type: "essay",
        },
        {
          type: "description",
          text: "Describe something",
        },
      ],
    };

    const answers = examSimulator(exam);
    expect(answers.length).toBe(exam.questions.length);
  });

  it("generates valid answers for matching questions", () => {
    const exam = {
      questions: [
        {
          type: "matching",
          pairs: [
            { left: "A", right: "1" },
            { left: "B", right: "2" },
          ],
        },
      ],
    };

    const answers = examSimulator(exam);

    expect(Array.isArray(answers)).toBeTrue();
    expect(answers.length).toBe(1);

    expect(Array.isArray(answers[0])).toBeTrue();
    expect(answers[0].length).toBe(2);

    expect(answers[0][0].left).toBeDefined();
    expect(answers[0][0].right).toBeDefined();
  });
});

describe("summaryExam", () => {
  it("returns undefined when answer length does not match questions", async () => {
    const exam = {
      questions: [{ type: "true_false", answer: true, text: "Q?" }],
    };

    const result = await summaryExam(exam, []);
    expect(result).toBeUndefined();
  });

  it("runs without throwing for a valid exam", async () => {
    const exam = {
      questions: [
        {
          type: "true_false",
          text: "Is JS cool?",
          answer: true,
        },
      ],
    };

    const answers = [true];

    await summaryExam(exam, answers);
    expect(true).toBeTrue();
  });
});
