import { computeExamProfile, compareProfiles } from "../src/examProfiler.js";

describe("computeExamProfile", () => {
  it("computes correct profile for an exam", () => {
    const exam = {
      titre: "Test Exam",
      questions: [
        { type: "true_false" },
        { type: "true_false" },
        { type: "multiple_choice" },
        { type: "essay" },
      ],
    };

    const profile = computeExamProfile(exam);

    expect(profile.titre).toBe("Test Exam");
    expect(profile.total).toBe(4);

    expect(profile.type["true_false"]).toBe(2);
    expect(profile.type["multiple_choice"]).toBe(1);
    expect(profile.type["essay"]).toBe(1);

    // autoCorrection: true_false + multiple_choice
    expect(profile.autoCorrection).toBe(3);

    expect(profile.pourcentage["true_false"]).toBe("50.0%");
    expect(profile.pourcentage["multiple_choice"]).toBe("25.0%");
    expect(profile.pourcentage["essay"]).toBe("25.0%");
  });
});

describe("compareProfiles", () => {
  it("returns null if one profile is missing", () => {
    expect(compareProfiles(null, {})).toBeNull();
    expect(compareProfiles({}, null)).toBeNull();
  });

  it("computes differences between two profiles", () => {
    const examProfile = {
      type: {
        true_false: 2,
        numeric: 2,
      },
      pourcentage: {
        true_false: "50.0%",
        numeric: "50.0%",
      },
    };

    const corpusProfile = {
      type: {
        true_false: 1,
        numeric: 3,
      },
      pourcentage: {
        true_false: "25.0%",
        numeric: "75.0%",
      },
    };

    const result = compareProfiles(examProfile, corpusProfile);

    expect(result.divergence).toBe(50);

    expect(result.typeDifferent["true_false"].exam).toBe(50);
    expect(result.typeDifferent["true_false"].corpus).toBe(25);
    expect(result.typeDifferent["true_false"].diff).toBe(25);

    expect(result.typeDifferent["numeric"].exam).toBe(50);
    expect(result.typeDifferent["numeric"].corpus).toBe(75);
    expect(result.typeDifferent["numeric"].diff).toBe(-25);
  });
});
