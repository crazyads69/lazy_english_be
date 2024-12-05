// schemas/word_schema.ts
import { z } from "zod";

const wordSchema = z.object({
  name: z.string(),
  ipa: z.string(),
  meaning: z.string(),
  example: z.string(),
});

const wordListSchema = z.object({
  words: z.array(wordSchema),
});

export type Word = z.infer<typeof wordSchema>;
export type WordList = z.infer<typeof wordListSchema>;

export { wordSchema, wordListSchema };
