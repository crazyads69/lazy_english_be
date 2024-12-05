import wordlistJson from "../../../wordlist.json";
import { WordList, wordListSchema } from "../../schemas/wordlist_schemas";

// Load word list from JSON file
const wordListData: WordList = wordListSchema.parse(wordlistJson);

export { wordListData };
