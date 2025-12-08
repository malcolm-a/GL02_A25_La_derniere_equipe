import { parseGift } from "../src/questionBank.js";

describe("GIFT Parser", () => {

    it("parse une question true/false", () => {
        const gift = `
::Q1:: This is a test question {T}
        `;
        const res = parseGift(gift);

        expect(res.length).toBe(1);
        expect(res[0].id).toBe("Q1");
        expect(res[0].type).toBe("true_false");
        expect(res[0].answer).toBe(true);
    });

    it("parse une question QCM simple", () => {
        const gift = `
::Q2:: What is 2+2? {
=4
~3
~5
}
        `;

        const res = parseGift(gift);
        expect(res.length).toBe(1);

        const q = res[0];
        expect(q.type).toBe("multiple_choice");
        expect(q.choices.length).toBe(3);

        expect(q.choices[0].correct).toBe(true);
        expect(q.choices[0].text).toBe("4");
    });

    it("parse une réponse courte", () => {
        const gift = `
::Q3:: Complete: The capital of France is {=Paris =PARIS}
        `;
        const res = parseGift(gift);

        expect(res.length).toBe(1);

        const q = res[0];
        expect(q.type).toBe("short_answer");
        expect(q.answers.length).toBe(2);
        expect(q.answers[0].text).toBe("Paris");
    });

});

it("parse une question matching", () => {
    const gift = `
::Q4:: Match the capitals {
=France -> Paris
=Spain -> Madrid
}
    `;
    const res = parseGift(gift);

    expect(res[0].type).toBe("matching");
    expect(res[0].pairs.length).toBe(2);
});

it("parse une question numérique avec marge", () => {
    const gift = `
::Q5:: PI is approximately {#3.14:0.01}
    `;
    const res = parseGift(gift);

    expect(res[0].type).toBe("numeric");
    expect(res[0].answer).toBeCloseTo(3.14, 2);
    expect(res[0].margin).toBeCloseTo(0.01, 2);
});

it("parse une question description", () => {
    const gift = `
::Q6:: Write a paragraph about your school {}
    `;
    const res = parseGift(gift);

    expect(res[0].type).toBe("essay");
});
