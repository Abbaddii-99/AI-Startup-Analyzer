/**
 * Wraps user input in XML-style delimiters so AI prompts can
 * distinguish between data and instructions.
 */
export function wrapUserInput(input: string): string {
  return `<user_idea>\n${input}\n</user_idea>`;
}
